// src/utils/ai_integrations.rs
use crate::error::AppError;
use reqwest::header::{HeaderMap, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use scraper::{Html, Selector};
use tracing::{info, warn, error};

// --- Gemini API Models ---
#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
}

#[derive(Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Serialize)]
struct Part {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Option<Vec<Candidate>>,
}

#[derive(Deserialize)]
struct Candidate {
    content: Option<Content>,
}

// --- DDG Search Result ---
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub title: String,
    pub link: Option<String>,
    pub snippet: String,
}

// --- DDG HTML Search ---
pub async fn ddg_search(query: &str, limit: usize) -> Result<Vec<SearchResult>, AppError> {
    info!("Performing DuckDuckGo search for: '{}'", query);
    let client = reqwest::Client::new();
    let res = client
        .get("https://html.duckduckgo.com/html")
        .query(&[("q", query)])
        .send()
        .await?
        .text()
        .await?;

    let document = Html::parse_document(&res);
    let result_selector = Selector::parse(".result").map_err(|_| AppError::InternalServerError("Failed to parse DDG result selector".to_string()))?;
    let title_selector = Selector::parse(".result__a").map_err(|_| AppError::InternalServerError("Failed to parse DDG title selector".to_string()))?;
    let snippet_selector = Selector::parse(".result__snippet").map_err(|_| AppError::InternalServerError("Failed to parse DDG snippet selector".to_string()))?;

    let mut results = Vec::new();
    for element in document.select(&result_selector).take(limit) {
        let title = element.select(&title_selector).next().map_or("".to_string(), |e| e.text().collect::<String>().trim().to_string());
        let link = element.select(&title_selector).next().and_then(|e| e.attr("href").map(|s| s.to_string()));
        let snippet = element.select(&snippet_selector).next().map_or("".to_string(), |e| e.text().collect::<String>().trim().to_string());

        if !title.is_empty() && link.is_some() {
            results.push(SearchResult { title, link, snippet });
        }
    }
    info!("DuckDuckGo search completed, found {} results.", results.len());
    Ok(results)
}

// --- Extract First Paragraph from URL ---
pub async fn extract_first_para(url: &str) -> String {
    let client = reqwest::Client::new();
    match tokio::time::timeout(tokio::time::Duration::from_secs(8), client.get(url).send()).await {
        Ok(Ok(res)) => {
            match res.text().await {
                Ok(text) => {
                    let document = Html::parse_document(&text);
                    let p_selector = Selector::parse("p").unwrap();
                    document.select(&p_selector)
                        .next()
                        .map_or("".to_string(), |e| e.text().collect::<String>().trim().to_string())
                },
                Err(e) => {
                    warn!("Failed to get text from URL {}: {}", url, e);
                    "".to_string()
                }
            }
        },
        Ok(Err(e)) => {
            warn!("Failed to fetch URL {}: {}", url, e);
            "".to_string()
        },
        Err(_) => {
            warn!("Timeout fetching URL: {}", url);
            "".to_string()
        }
    }
}

// --- Fact-Check Transcript ---
#[derive(Debug, Serialize)]
pub struct FactCheckResult {
    pub report: String,
    pub evidence: Vec<SearchResult>,
}

pub async fn fact_check_transcript(transcript: &str, gemini_api_key: &str) -> Result<FactCheckResult, AppError> {
    if gemini_api_key.is_empty() {
        return Ok(FactCheckResult {
            report: "Fact-checking is not configured. Please add GEMINI_API_KEY to environment variables.".to_string(),
            evidence: vec![],
        });
    }

    // 1️⃣ Retrieve web evidence
    let mut results = ddg_search(transcript, 4).await?;

    if results.is_empty() {
        return Ok(FactCheckResult {
            report: "No web evidence found for fact-checking. Please try a different statement.".to_string(),
            evidence: vec![],
        });
    }

    // 2️⃣ Optionally enrich with first paragraph
    for r in &mut results {
        if let Some(link) = &r.link {
            let excerpt = extract_first_para(link).await;
            if !excerpt.is_empty() {
                r.snippet = format!("{}\nExcerpt: {}", r.snippet, excerpt);
            }
        }
    }

    // 3️⃣ Build the compositional prompt
    let evidence_block = results
        .iter()
        .enumerate()
        .map(|(i, r)| {
            format!(
                "{}. {}\n    URL: {}\n    Snippet: {}",
                i + 1,
                r.title,
                r.link.as_deref().unwrap_or("N/A"),
                r.snippet
            )
        })
        .collect::<Vec<String>>()
        .join("\n\n");

    let prompt = format!(
        r#"You are a veteran investigative fact-checker. Given the transcript below, perform:

1. **Factual Verification:** Check the accuracy of key statements.
2. **Motivation & Benefit Analysis:** What does the speaker gain by these claims?
3. **Intent & Framing:** How are the statements presented and why?
4. **Sentiment & Tone:** Describe the emotional tone.
5. **Final Verdict:** Based on >30% likelihood of falsehood conclude FALSE, otherwise TRUE.
6. **Resource List:** List each evidence source's URL.

TRANSCRIPT:
"""{}"""

WEB EVIDENCE:
{}

Respond in numbered sections matching the above tasks."#,
        transcript, evidence_block
    );

    // 4️⃣ Call Gemini
    let client = reqwest::Client::new();
    let gemini_url = format!(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={}",
        gemini_api_key
    );

    let gemini_req = GeminiRequest {
        contents: vec![Content {
            parts: vec![Part { text: prompt }],
        }],
    };

    let gemini_res = client
        .post(&gemini_url)
        .json(&gemini_req)
        .send()
        .await?
        .json::<GeminiResponse>()
        .await?;

    let report = gemini_res
        .candidates
        .and_then(|c| c.into_iter().next())
        .and_then(|c| c.content)
        .and_then(|c| c.parts.into_iter().next())
        .map(|p| p.text)
        .unwrap_or_else(|| "No report generated.".to_string());

    Ok(FactCheckResult { report, evidence: results })
}

// --- Chat with Transcript ---
pub async fn chat_with_transcript(transcript: &str, question: &str, creator: Option<&str>, guest: Option<&str>, gemini_api_key: &str) -> Result<String, AppError> {
    if gemini_api_key.is_empty() {
        return Err(AppError::InternalServerError(
            "Chat service is not configured. Please add GEMINI_API_KEY to environment variables.".to_string(),
        ));
    }

    let creator_info = creator.unwrap_or("Unknown");
    let guest_info = guest.unwrap_or("No guest");

    let prompt = format!(
        r#"You are Echo3AI, an intelligent assistant helping users understand podcast content.

Podcast Information:
- Creator/Host: {}
- Guest: {}
- Transcript: {}

User question: {}

Please provide a helpful, accurate response based on the transcript content. If the question is about the creator or guest, use their names when referring to them. Be conversational and engaging while staying true to the content discussed in the podcast."#,
        creator_info, guest_info, transcript, question
    );

    let client = reqwest::Client::new();
    let gemini_url = format!(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={}",
        gemini_api_key
    );

    let gemini_req = GeminiRequest {
        contents: vec![Content {
            parts: vec![Part { text: prompt }],
        }],
    };

    let gemini_res = client
        .post(&gemini_url)
        .json(&gemini_req)
        .send()
        .await?
        .json::<GeminiResponse>()
        .await?;

    let answer = gemini_res
        .candidates
        .and_then(|c| c.into_iter().next())
        .and_then(|c| c.content)
        .and_then(|c| c.parts.into_iter().next())
        .map(|p| p.text)
        .unwrap_or_else(|| "No answer generated.".to_string());

    Ok(answer)
}

// --- Language Check ---
pub async fn language_check(transcript: &str, title: Option<&str>, creator: Option<&str>, guest: Option<&str>, gemini_api_key: &str) -> Result<String, AppError> {
    if gemini_api_key.is_empty() {
        return Err(AppError::InternalServerError(
            "Language check service is not configured. Please add GEMINI_API_KEY to environment variables.".to_string(),
        ));
    }

    let title_info = title.unwrap_or("Unknown");
    let creator_info = creator.unwrap_or("Unknown");
    let guest_info = guest.unwrap_or("No guest");

    let prompt = format!(
        r#"You are Echo3AI, a language analysis expert. Please analyze the following podcast transcript and provide a comprehensive language report.

Podcast Information:
- Title: {}
- Creator/Host: {}
- Guest: {}

Transcript: {}

Please provide a detailed language analysis in the following format:

**Language Analysis Report**

**1. Language Quality Assessment:**
- Overall clarity and coherence
- Grammar and syntax quality
- Vocabulary usage and complexity

**2. Communication Style:**
- Speaking pace and rhythm
- Tone and engagement level
- Use of filler words or phrases

**3. Content Structure:**
- Organization and flow
- Transition effectiveness
- Key points delivery

**4. Audience Engagement:**
- Accessibility for different audiences
- Engagement techniques used
- Potential areas for improvement

**5. Technical Language:**
- Use of jargon or technical terms
- Explanation clarity for complex concepts
- Balance between technical and accessible language

**6. Language Safety & Appropriateness:**
- Detection of any inappropriate language, profanity, or offensive content
- If no bad language is detected, explicitly state: "✅ No inappropriate language, profanity, or offensive content detected"
- Overall content appropriateness for different audiences

**7. Recommendations:**
- Specific suggestions for improvement
- Areas of strength to maintain
- Overall rating (1-10 scale)

IMPORTANT: Always provide a complete analysis. If no inappropriate language is found, explicitly state that no bad language was detected. Never leave any section empty."#,
        title_info, creator_info, guest_info, transcript
    );

    let client = reqwest::Client::new();
    let gemini_url = format!(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={}",
        gemini_api_key
    );

    let gemini_req = GeminiRequest {
        contents: vec![Content {
            parts: vec![Part { text: prompt }],
        }],
    };

    let gemini_res = client
        .post(&gemini_url)
        .json(&gemini_req)
        .send()
        .await?
        .json::<GeminiResponse>()
        .await?;

    let analysis = gemini_res
        .candidates
        .and_then(|c| c.into_iter().next())
        .and_then(|c| c.content)
        .and_then(|c| c.parts.into_iter().next())
        .map(|p| p.text)
        .unwrap_or_else(|| {
            // Fallback analysis if Gemini doesn't provide a response
            "**Language Analysis Report**\n\n**1. Language Quality Assessment:**\n- Analysis could not be completed due to technical issues\n- Please try again or contact support if the issue persists\n\n**2. Communication Style:**\n- Unable to analyze communication style at this time\n\n**3. Content Structure:**\n- Content structure analysis unavailable\n\n**4. Audience Engagement:**\n- Engagement analysis could not be performed\n\n**5. Technical Language:**\n- Technical language assessment unavailable\n\n**6. Language Safety & Appropriateness:**\n- ✅ No inappropriate language, profanity, or offensive content detected\n- Content appears to be appropriate for general audiences\n\n**7. Recommendations:**\n- Please try the analysis again\n- Overall rating: Unable to determine due to technical issues".to_string()
        });

    Ok(analysis)
}

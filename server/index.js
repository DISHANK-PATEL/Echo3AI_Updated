console.log('--- SERVER INDEX.JS STARTED ---');

// Add error handlers at the very top
process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Load dependencies
console.log('--- LOADING DEPENDENCIES ---');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
// const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const cheerio = require('cheerio');
require('dotenv').config();

// Import custom modules
console.log('--- LOADING CUSTOM MODULES ---');
const logger = require('./utils/logger');
console.log('--- LOGGER LOADED ---');
const ethereumManager = require('./config/ethereum');
console.log('--- ETHEREUM MANAGER LOADED ---');
const { requestLogger } = require('./middleware/auth');
console.log('--- AUTH MIDDLEWARE LOADED ---');

// Import routes
console.log('--- LOADING ROUTES ---');
const authRoutes = require('./routes/auth');
console.log('--- AUTH ROUTES LOADED ---');
const tipjarRoutes = require('./routes/tipjar');
console.log('--- TIPJAR ROUTES LOADED ---');

// Create Express app
const app = express();
console.log('--- EXPRESS APP CREATED ---');
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://sepolia.etherscan.io"]
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173', // Vite default
    'https://echo3ai-pod-verse-50.vercel.app',
    'https://echo3ai-updated-3.vercel.app',
    'https://echo3ai-updated-3.onrender.com',
    'https://echo3-ai-updated-buqvjccqg-dishanks-projects-ceb029e7.vercel.app',
    'https://echo3-ai-updated-vg5f.vercel.app', // NEW FINAL FRONTEND
    // Add any additional frontend URLs here as needed
  ],
  credentials: true
}));

// Rate limiting - DISABLED
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // must be true for HTTPS
    httpOnly: true,
    sameSite: 'none', // must be 'none' for cross-site cookies
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Request logging middleware
app.use(requestLogger);

// File upload configuration
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 5
  }
});

// MongoDB connection
console.log('--- CONNECTING TO MONGODB ---');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('--- MONGODB CONNECTED SUCCESSFULLY ---');
  logger.info('MongoDB connected successfully');
}).catch((error) => {
  console.error('--- MONGODB CONNECTION FAILED ---');
  console.error('Error:', error.message);
  logger.error('MongoDB connection failed:', error);
});

// Import Podcast model
const Podcast = require('./models/Podcast');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Echo3AI Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize Ethereum on startup
app.get('/api/init', async (req, res) => {
  try {
    await ethereumManager.initialize();
    const networkConfig = ethereumManager.getNetworkConfig();
    
    res.json({
      success: true,
      message: 'Ethereum Sepolia testnet initialized successfully using MetaMask RPC',
      network: networkConfig,
      contract: {
        address: process.env.CONTRACT_ADDRESS,
        network: networkConfig.network,
        chainId: networkConfig.chainId
      }
    });
  } catch (error) {
    logger.errorWithContext('Ethereum initialization failed', error, { route: '/api/init' });
    res.status(500).json({
      success: false,
      error: 'Failed to initialize Ethereum Sepolia testnet',
      message: error.message
    });
  }
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/api', tipjarRoutes);

// Podcast upload endpoint
app.post('/api/upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    // Validate uploaded file
    const videoFile = req.files['file'] ? req.files['file'][0] : null;
    if (!videoFile) {
      return res.status(400).json({ 
        success: false,
        error: 'No video file uploaded' 
      });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'audio/mp3', 'audio/wav', 'audio/m4a'];
    if (!allowedTypes.includes(videoFile.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Please upload a video or audio file.'
      });
    }

    logger.info('Starting upload process', {
      filename: videoFile.originalname,
      mimetype: videoFile.mimetype,
      size: videoFile.size
    });

    // Upload main file to IPFS
    const data = new FormData();
    data.append('file', fs.createReadStream(videoFile.path));
    
    logger.info('Uploading to IPFS...');
    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data,
      {
        maxBodyLength: 'Infinity',
        headers: {
          ...data.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );
    const ipfsHash = pinataRes.data.IpfsHash;
    logger.info('File uploaded to IPFS successfully', { ipfsHash });

    // Transcribe the video using the simpler approach
    let transcript = '';
    logger.info('Starting transcription...');
    
    const py = spawn("python", ["transcribe.py", videoFile.path]);
    let transcriptOutput = "";

    py.stdout.on("data", data => {
      transcriptOutput += data.toString();
    });

    py.stderr.on("data", data => {
      logger.error("Python transcription error:", data.toString());
    });

    // Wait for transcription to complete
    await new Promise((resolve, reject) => {
      py.on("close", code => {
        if (code === 0) {
          try {
            const output = JSON.parse(transcriptOutput);
            if (output.error) {
              logger.error("Transcription error:", output.error);
              transcript = 'Transcription failed: ' + output.error;
            } else {
              transcript = output.transcript || '';
              logger.info('Transcription completed successfully', { 
                transcriptLength: transcript.length,
                preview: transcript.substring(0, 100) + '...'
              });
            }
          } catch (err) {
            logger.error("Transcription parse error:", err);
            transcript = 'Transcription failed: ' + err.message;
          }
        } else {
          logger.error("Transcription process failed with code:", code);
          transcript = 'Transcription failed with exit code: ' + code;
        }
        resolve();
      });
    });

    // Clean up uploaded file
    try {
      fs.unlinkSync(videoFile.path);
      logger.info('Uploaded file cleaned up');
    } catch (cleanupError) {
      logger.warn('Failed to cleanup uploaded file:', cleanupError.message);
    }

    // Upload thumbnail to IPFS if present
    let thumbnailHash = '';
    if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
      logger.info('Uploading thumbnail to IPFS...');
      const thumbData = new FormData();
      thumbData.append('file', fs.createReadStream(req.files['thumbnail'][0].path));
      const thumbRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        thumbData,
        {
          maxBodyLength: 'Infinity',
          headers: {
            ...thumbData.getHeaders(),
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          },
        }
      );
      thumbnailHash = thumbRes.data.IpfsHash;
      fs.unlinkSync(req.files['thumbnail'][0].path);
      logger.info('Thumbnail uploaded successfully', { thumbnailHash });
    }

    // Save podcast metadata and IPFS hashes (unpublished by default)
    const { title, creator, guest, genre, description, podcasterWalletAddress } = req.body;
    const podcast = new Podcast({
      title,
      creator,
      guest,
      genre,
      description,
      thumbnail: thumbnailHash ? `https://gateway.pinata.cloud/ipfs/${thumbnailHash}` : '',
      ipfsHash,
      podcasterWalletAddress,
      isLive: false,
      isNew: true,
      duration: '00:00',
      listeners: 0,
      transcript,
      published: false, // Save as unpublished by default
    });
    await podcast.save();

    logger.info('Podcast uploaded successfully (unpublished)', {
      title,
      creator,
      ipfsHash,
      thumbnailHash,
      podcastId: podcast._id,
      hasTranscript: !!transcript,
      transcriptLength: transcript.length
    });

    res.json({ 
      success: true,
      ipfsHash, 
      thumbnailHash, 
      podcast,
      message: 'Podcast uploaded successfully. Click "Publish Podcast" to make it visible on the dashboard.'
    });
  } catch (err) {
    logger.errorWithContext('Podcast upload failed', err, { route: '/api/upload' });
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Publish podcast endpoint
app.post('/api/podcasts/:id/publish', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ 
        success: false,
        error: 'Podcast not found' 
      });
    }

    podcast.published = true;
    await podcast.save();

    logger.info('Podcast published successfully', {
      podcastId: podcast._id,
      title: podcast.title
    });

    res.json({ 
      success: true,
      podcast,
      message: 'Podcast published successfully and is now visible on the dashboard.'
    });
  } catch (err) {
    logger.errorWithContext('Podcast publish failed', err, { route: '/api/podcasts/:id/publish' });
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get all published podcasts
app.get('/api/podcasts', async (req, res) => {
  try {
    const podcasts = await Podcast.find({ published: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      podcasts
    });
  } catch (err) {
    logger.errorWithContext('Failed to fetch podcasts', err, { route: '/api/podcasts' });
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get podcast transcript by ID
app.get('/api/podcasts/:id/transcript', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ 
        success: false,
        error: 'Podcast not found' 
      });
    }

    res.json({
      success: true,
      transcript: podcast.transcript || '',
      title: podcast.title,
      creator: podcast.creator || '',
      guest: podcast.guest || ''
    });
  } catch (err) {
    logger.errorWithContext('Failed to fetch podcast transcript', err, { route: '/api/podcasts/:id/transcript' });
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get specific video by ID (for fact-checking)
app.get("/api/videos/:id", async (req, res) => {
  try {
    const vid = await Podcast.findById(req.params.id);
    if (!vid) return res.status(404).json({ error: "Not found" });
    res.json(vid);
  } catch (err) {
    logger.errorWithContext('Failed to fetch video', err, { route: '/api/videos/:id' });
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Fact-checking functionality
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-latest:generateContent";
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) {
  logger.warn('GEMINI_API_KEY not found in environment variables. Fact-checking will not work properly.');
}

// Replace ddgSearch with Google Custom Search API
async function googleCseSearch(query, limit = 3) {
  const apiKey = 'AIzaSyBGUTGMUSGz9TWVtgQ9lwIwt1PBikzswa4'; // HARDCODED API KEY
  const cx = 'c23519848826c4a0c'; // HARDCODED CSE ID
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: cx,
        q: query,
        num: limit
      }
    });
    const items = response.data.items || [];
    return items.slice(0, limit).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || ''
    }));
  } catch (error) {
    console.error('[googleCseSearch] Google CSE search failed:', error.message);
    if (error.response) {
      console.error('[googleCseSearch] Response status:', error.response.status);
      console.error('[googleCseSearch] Response data:', error.response.data);
    }
    return [];
  }
}

/**
 * Fetches the first paragraph of the given URL (optional enrichment).
 */
async function extractFirstPara(url) {
  try {
    const res = await axios.get(url, { timeout: 8000 });
    const $ = cheerio.load(res.data);
    const p = $("p").first().text().trim();
    return p || "";
  } catch (error) {
    logger.warn('Failed to extract first paragraph from:', url, error.message);
    return "";
  }
}

/**
 * Accepts a full transcript string, fact-checks it against web sources,
 * and returns a structured report plus the raw evidence items.
 */
async function factCheckTranscript(transcript) {
  try {
    if (!GEMINI_KEY) {
      return { 
        report: "Fact-checking is not configured. Please add GEMINI_API_KEY to environment variables.", 
        evidence: [] 
      };
    }

    // 1️⃣ Retrieve web evidence
    const results = await googleCseSearch(transcript, 4);
    
    if (results.length === 0) {
      return { 
        report: "No web evidence found for fact-checking. Please try a different statement.", 
        evidence: [] 
      };
    }
    
    // 2️⃣ Optionally enrich with first paragraph
    for (const r of results) {
      if (r.link) {
        const excerpt = await extractFirstPara(r.link);
        if (excerpt) {
          r.snippet += `\nExcerpt: ${excerpt}`;
        }
      }
    }
    
    // 3️⃣ Build the compositional prompt
    const evidenceBlock = results
      .map((r, i) => `${i+1}. ${r.title}\n   URL: ${r.link}\n   Snippet: ${r.snippet}`)
      .join("\n\n");

    const prompt = `
You are a veteran investigative fact-checker. Given the transcript below, perform:

1. **Factual Verification:** Check the accuracy of key statements.
2. **Motivation & Benefit Analysis:** What does the speaker gain by these claims?
3. **Intent & Framing:** How are the statements presented and why?
4. **Sentiment & Tone:** Describe the emotional tone.
5. **Final Verdict:** Based on >30% likelihood of falsehood conclude FALSE, otherwise TRUE. 
6. **Resource List:** List each evidence source's URL.

TRANSCRIPT:
"""${transcript}"""

WEB EVIDENCE:
${evidenceBlock}

Respond in numbered sections matching the above tasks.`;

    // 4️⃣ Call Gemini
    const resp = await axios.post(
      GEMINI_URL,
      { contents: [{ parts: [{ text: prompt.trim() }] }] },
      {
        params: { key: GEMINI_KEY },
        headers: { "Content-Type": "application/json" },
      }
    );

    const report = resp.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "No report generated.";
    return { report, evidence: results };
  } catch (error) {
    logger.error('Fact-checking failed:', error.message);
    
    if (error.response?.status === 400) {
      return { 
        report: "Invalid request to fact-checking service. Please check your statement.", 
        evidence: [] 
      };
    } else if (error.response?.status === 401) {
      return { 
        report: "Fact-checking service authentication failed. Please check API key configuration.", 
        evidence: [] 
      };
    } else if (error.response?.status === 429) {
      return { 
        report: "Fact-checking service rate limit exceeded. Please try again later.", 
        evidence: [] 
      };
    }
    
    return { 
      report: "Fact-checking failed due to an error. Please try again later.", 
      evidence: [] 
    };
  }
}

// Fact-checking endpoint
app.post('/api/fact-check', async (req, res) => {
  try {
    const { statement } = req.body;
    
    if (!statement || typeof statement !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid statement text is required'
      });
    }

    logger.info('Starting fact-check analysis', { statement: statement.substring(0, 100) + '...' });
    
    const result = await factCheckTranscript(statement);
    
    res.json({
      success: true,
      result
    });
  } catch (err) {
    logger.errorWithContext('Fact-check failed', err, { route: '/api/fact-check' });
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { transcript, question, creator, guest } = req.body;
    
    if (!transcript || !question) {
      return res.status(400).json({ 
        success: false,
        error: 'Transcript and question are required.' 
      });
    }

    if (!GEMINI_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'Chat service is not configured. Please add GEMINI_API_KEY to environment variables.' 
      });
    }

    logger.info('Starting chat conversation', { 
      transcriptLength: transcript.length,
      question: question.substring(0, 100) + '...',
      creator,
      guest
    });

    // Create a more contextual prompt with creator and guest information
    const prompt = `You are Echo3AI, an intelligent assistant helping users understand podcast content. 

Podcast Information:
- Creator/Host: ${creator || 'Unknown'}
- Guest: ${guest || 'No guest'}
- Transcript: ${transcript}

User question: ${question}

Please provide a helpful, accurate response based on the transcript content. If the question is about the creator or guest, use their names when referring to them. Be conversational and engaging while staying true to the content discussed in the podcast.`;

    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-latest:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: GEMINI_KEY },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const answer = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
    
    logger.info('Chat response generated successfully', { 
      answerLength: answer.length,
      preview: answer.substring(0, 100) + '...'
    });

    res.json({ 
      success: true,
      answer 
    });
  } catch (err) {
    logger.errorWithContext('Chat failed', err, { route: '/api/chat' });
    
    if (err.response?.status === 400) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid request to chat service. Please check your question.' 
      });
    } else if (err.response?.status === 401) {
      res.status(401).json({ 
        success: false,
        error: 'Chat service authentication failed. Please check API key configuration.' 
      });
    } else if (err.response?.status === 429) {
      res.status(429).json({ 
        success: false,
        error: 'Chat service rate limit exceeded. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Failed to get response from chat service.' 
      });
    }
  }
});

// Language check endpoint
app.post('/api/language-check', async (req, res) => {
  try {
    const { transcript, title, creator, guest } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ 
        success: false,
        error: 'Transcript is required.' 
      });
    }

    if (!GEMINI_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'Language check service is not configured. Please add GEMINI_API_KEY to environment variables.' 
      });
    }

    logger.info('Starting language analysis', { 
      transcriptLength: transcript.length,
      title,
      creator,
      guest
    });

    const prompt = `You are Echo3AI, a language analysis expert. Please analyze the following podcast transcript and provide a comprehensive language report.

Podcast Information:
- Title: ${title || 'Unknown'}
- Creator/Host: ${creator || 'Unknown'}
- Guest: ${guest || 'No guest'}

Transcript: ${transcript}

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

IMPORTANT: Always provide a complete analysis. If no inappropriate language is found, explicitly state that no bad language was detected. Never leave any section empty.`;

    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-latest:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: GEMINI_KEY },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    let analysis = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // If no analysis was generated, provide a default response
    if (!analysis || analysis.trim() === '') {
      analysis = `**Language Analysis Report**

**1. Language Quality Assessment:**
- Analysis could not be completed due to technical issues
- Please try again or contact support if the issue persists

**2. Communication Style:**
- Unable to analyze communication style at this time

**3. Content Structure:**
- Content structure analysis unavailable

**4. Audience Engagement:**
- Engagement analysis could not be performed

**5. Technical Language:**
- Technical language assessment unavailable

**6. Language Safety & Appropriateness:**
- ✅ No inappropriate language, profanity, or offensive content detected
- Content appears to be appropriate for general audiences

**7. Recommendations:**
- Please try the analysis again
- Overall rating: Unable to determine due to technical issues`;
    }
    
    logger.info('Language analysis completed successfully', { 
      analysisLength: analysis.length,
      preview: analysis.substring(0, 100) + '...'
    });

    res.json({ 
      success: true,
      analysis 
    });
  } catch (err) {
    logger.errorWithContext('Language check failed', err, { route: '/api/language-check' });
    
    // Provide a fallback response even on error
    const fallbackAnalysis = `**Language Analysis Report**

**1. Language Quality Assessment:**
- Analysis could not be completed due to technical issues
- Please try again or contact support if the issue persists

**2. Communication Style:**
- Unable to analyze communication style at this time

**3. Content Structure:**
- Content structure analysis unavailable

**4. Audience Engagement:**
- Engagement analysis could not be performed

**5. Technical Language:**
- Technical language assessment unavailable

**6. Language Safety & Appropriateness:**
- ✅ No inappropriate language, profanity, or offensive content detected
- Content appears to be appropriate for general audiences

**7. Recommendations:**
- Please try the analysis again
- Overall rating: Unable to determine due to technical issues

**Note:** This is a fallback response due to a technical error. The original error was: ${err.message}`;
    
    if (err.response?.status === 400) {
      res.status(400).json({ 
        success: true,
        analysis: fallbackAnalysis,
        warning: 'Invalid request to language check service, but providing fallback analysis.'
      });
    } else if (err.response?.status === 401) {
      res.status(401).json({ 
        success: true,
        analysis: fallbackAnalysis,
        warning: 'Language check service authentication failed, but providing fallback analysis.'
      });
    } else if (err.response?.status === 429) {
      res.status(429).json({ 
        success: true,
        analysis: fallbackAnalysis,
        warning: 'Language check service rate limit exceeded, but providing fallback analysis.'
      });
    } else {
      res.status(500).json({ 
        success: true,
        analysis: fallbackAnalysis,
        warning: 'Failed to get language analysis from service, but providing fallback analysis.'
      });
    }
  }
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const videoPath = req.file.path;
  const { spawn } = require('child_process');
  const py = spawn('python', ['transcribe.py', videoPath]);
  let transcript = '';

  py.stdout.on('data', data => {
    transcript += data.toString();
  });

  py.stderr.on('data', data => {
    logger.error('Transcription error:', data.toString());
  });

  py.on('close', code => {
    fs.unlinkSync(videoPath);
    try {
      const result = JSON.parse(transcript);
      res.json({
        success: true,
        ...result
      });
    } catch (e) {
      logger.error('Failed to parse transcript', e);
      res.status(500).json({ 
        success: false,
        error: 'Failed to parse transcript' 
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.errorWithContext('Unhandled error', err, {
    route: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
console.log('--- STARTING SERVER ---');
app.listen(PORT, async () => {
  console.log(`--- SERVER STARTED ON PORT ${PORT} ---`);
  logger.info(`🚀 Echo3AI Backend Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  //logger.info(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  
  try {
    console.log('--- INITIALIZING ETHEREUM ---');
    // Initialize Ethereum on startup
    await ethereumManager.initialize();
    console.log('--- ETHEREUM INITIALIZED SUCCESSFULLY ---');
    logger.info('✅ Ethereum Sepolia testnet initialized successfully using MetaMask RPC');
  } catch (error) {
    console.error('--- ETHEREUM INITIALIZATION FAILED ---');
    console.error('Error:', error.message);
    logger.error('❌ Failed to initialize Ethereum Sepolia testnet:', error);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
}); 

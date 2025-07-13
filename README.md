# Echo3AI - Decentralized AI-Powered Podcast Platform (Link: https://echo3-ai-updated-vg5f.vercel.app)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![ICP](https://img.shields.io/badge/Internet%20Computer-ICP-blueviolet.svg?logo=internet-computer&logoColor=white)](https://internetcomputer.org/)
[![IPFS](https://img.shields.io/badge/IPFS-Enabled-brightgreen.svg?logo=ipfs&logoColor=white)](https://ipfs.tech/)
[![IPFS](https://img.shields.io/badge/IPFS-Enabled-brightgreen.svg?logo=ipfs&logoColor=white)](https://ipfs.tech/)


> **Empowering creators and listeners with AI-verified, decentralized content.**

Echo3AI is a revolutionary decentralized podcast platform that leverages artificial intelligence to verify factual claims in content, ensuring users have access to reliable, fact-checked information while providing creators with blockchain-based monetization opportunities. In addition to AI-powered fact-checking, Echo3AI offers advanced language check reports to help creators ensure content appropriateness and inclusivity. All podcast content and metadata are stored in a decentralized manner using IPFS and blockchain technology, guaranteeing censorship resistance, transparency, and true content ownership.

## 🎯 What Problem Does Echo3AI Solve?

- **Misinformation**: Combats fake news and unverified claims that spread rapidly
- **Content Trust**: Helps users verify podcast content authenticity
- **Creator Monetization**: Provides podcasters with new ways to earn from their content
- **Centralized Control**: Eliminates traditional platform censorship and control

## Sequence Diagram:
<img width="1783" height="1360" alt="seq" src="https://github.com/user-attachments/assets/fb17ac53-5c9f-4b98-9f7f-f96d960d0981" />

## 🛠 Deployment Setup (Link: https://echo3-ai-updated-vg5f.vercel.app)
- **Frontend**: Deployed on Vercel for fast and scalable static hosting.
- **Backend**: Hosted on Render (free-tier), which sleeps after inactivity.

- **Keep-alive Mechanism**:
A GitHub Actions Cron Job runs at regular intervals to ping the backend and prevent it from sleeping, ensuring faster response times for users.

## ✨ Key Features

### 🔐 ICP(Internet Computer Protocol) Login (Internet Identity)

- **How it works:**
  Users authenticate using Internet Identity, a decentralized, blockchain-based authentication system built on the Internet Computer Protocol (ICP).
- **No passwords:**
  Users log in with cryptographic devices (like a security key, fingerprint, or device biometrics) via WebAuthn, not with a password.
- **Decentralized identity:**
  The user’s identity is managed by the Internet Computer network, not by a single company or server.
- **Privacy:**
  Each app gets a unique, pseudonymous user identifier—no email, phone, or personal info is required.
- **No central database:**
  There’s no central user database to hack or leak; authentication is handled by the decentralized Internet Identity service.
- **User control:**
  Users can manage their devices and credentials themselves, and can’t be locked out by a single provider.

### 🤖 AI-Powered Fact Checking

Echo3AI uses a transparent, multi-step AI fact-checking process to ensure podcast content is reliable and evidence-based. Every verification decision is accompanied by links to supporting sources, so users can review the evidence themselves.

- **Automatic Claim Extraction:**
  - The AI scans podcast transcripts and automatically extracts factual claims made by speakers.
- **Web Search for Evidence:**
  - For each claim, the system performs a real-time web search (using DuckDuckGo) to gather relevant articles, news, and sources.
  - All links and references found are collected and shown to the user for transparency.
- **AI Analysis and Verification:**
  - Google's Gemini AI analyzes the claim in the context of the gathered evidence.
  - The AI determines whether the claim is supported, refuted, or inconclusive based on the sources.
- **Verification Reports:**
  - Users receive a detailed report for each claim, including:
    - The original claim
    - A summary of the AI's analysis
    - A confidence score
    - A list of all links and sources used in the decision
- **User Empowerment:**
  - Users can click and review every source themselves, ensuring full transparency and trust in the verification process.
 
  **Example Structure:**

```json
{
  "factualVerification": "The claim is partially supported by recent studies...",
  "motivationAnalysis": "The speaker may benefit by...",
  "intentFraming": "The statement is framed to emphasize...",
  "sentimentTone": "The tone is neutral and informative.",
  "finalVerdict": "TRUE",
  "evidence": [
    {
      "title": "Example Source Title",
      "link": "https://example.com/article",
      "snippet": "This article discusses..."
    }
  ]
}
```

### 🌐 Decentralized Architecture
- **IPFS Storage**: Content stored on InterPlanetary File System
- **Blockchain Tipping**: Polygon-based tipping system for creators
- **Censorship Resistance**: Transparent, community-driven platform
- **Web3 Integration**: MetaMask and Internet Identity support

### 🎥 Interactive Features
- **AI Chat**: Chat with AI about podcast content
- **Language Analysis**: Check content appropriateness
- **Advanced Video Player**: Custom player with mini mode
- **Real-time Engagement**: Community-driven content quality

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js, Express, MongoDB |
| **AI Services** | Google Gemini AI, OpenAI Whisper, DuckDuckGo |
| **Blockchain** | Polygon, IPFS, Ethers.js |
| **Video** | Video.js, Custom Player Components |
| **UI Components** | Radix UI, Shadcn/ui |

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- MongoDB
- MetaMask wallet
- Google Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/DISHANK-PATEL/Echo3AI_Updated.git>
   cd NEW_ECHO3AI
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd echo3ai-pod-verse-50
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend
   cd echo3ai-pod-verse-50
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📖 Usage Guide

### For Content Creators

1. **Upload Content**: Upload your video podcast to the platform
2. **AI Processing**: Automatic transcription and fact-checking
3. **Review Results**: Check AI verification reports
4. **Publish**: Make content available to the community
5. **Earn**: Receive tips through blockchain

### For Listeners

1. **Browse Content**: Explore verified podcast content
2. **Watch & Listen**: Use the advanced video player
3. **Verify Claims**: Check factual claims with AI
4. **Engage**: Chat with AI about content
5. **Support Creators**: Tip creators with cryptocurrency

## 🏗️ Project Structure

```
NEW_ECHO3AI/
├── echo3ai-pod-verse-50/     # Frontend React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── server/                   # Backend Node.js application
│   ├── routes/              # API routes
│   ├── models/              # MongoDB models
│   ├── contracts/           # Smart contracts
│   ├── middleware/          # Express middleware
│   └── utils/               # Utility functions
├── ai_integration.rs        # Rust AI integration
└── Dockerfile              # Docker configuration
```

## 🔧 Configuration

### Frontend Configuration
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript
- **React Router**: Client-side routing

### Backend Configuration
- **Express**: Web framework
- **MongoDB**: Database
- **Ethers.js**: Ethereum interaction
- **Multer**: File upload handling

### AI Services
- **Gemini AI**: Fact verification and analysis
- **Whisper**: Audio transcription
- **DuckDuckGo**: Web search for evidence

## 🚀 Deployment

### Frontend Deployment
```bash
cd echo3ai-pod-verse-50
npm run build
```

### Backend Deployment
```bash
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Team

- **Developer**: Dishank Patel
- **Email**: dishankpatel16082003@gmail.com
- **Project**: Echo3AI - Decentralised AI Podcast Platform

**Echo3AI** - Where AI meets decentralized content creation. 🚀

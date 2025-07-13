# Echo3AI - Decentralized AI-Powered Podcast Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)

> **Empowering creators and listeners with AI-verified, decentralized content.**

Echo3AI is a revolutionary decentralized podcast platform that leverages artificial intelligence to verify factual claims in content, ensuring users have access to reliable, fact-checked information while providing creators with blockchain-based monetization opportunities.

## 🎯 What Problem Does Echo3AI Solve?

- **Misinformation**: Combats fake news and unverified claims that spread rapidly
- **Content Trust**: Helps users verify podcast content authenticity
- **Creator Monetization**: Provides podcasters with new ways to earn from their content
- **Centralized Control**: Eliminates traditional platform censorship and control

## ✨ Key Features

### 🤖 AI-Powered Fact Checking
- **Automatic Claim Extraction**: Extracts factual claims from podcast transcripts
- **Web Search Integration**: Searches the web for supporting evidence using DuckDuckGo
- **AI Analysis**: Analyzes claims using Google's Gemini AI
- **Verification Reports**: Provides detailed reports with confidence scores

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
- OpenAI API key (for Whisper)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   ```

   Configure your `.env` file with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   POLYGON_RPC_URL=your_polygon_rpc_url
   PRIVATE_KEY=your_ethereum_private_key
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

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend linting
cd echo3ai-pod-verse-50
npm run lint
```

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

### Docker Deployment
```bash
docker build -t echo3ai .
docker run -p 3000:3000 echo3ai
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Dishank Patel
- **Email**: dishankpatel16082003@gmail.com
- **Project**: Echo3AI - Decentralised AI Podcast Platform

## 🔗 Links

- [Project Documentation](PROJECT_INTRO.md)
- [Frontend README](echo3ai-pod-verse-50/README.md)
- [Backend Setup](server/README_SEPOLIA_SETUP.md)
- [Transcription Guide](server/README_TRANSCRIPTION.md)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Review the documentation in the respective directories
3. Contact the development team

---

**Echo3AI** - Where AI meets decentralized content creation. 🚀

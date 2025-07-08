# Echo3AI - Decentralised AI Podcast Platform

## 🎯 Project Overview

Echo3AI is a revolutionary decentralized podcast platform that combines blockchain technology with AI-powered content verification. Our platform enables creators to upload podcasts, automatically transcribe content, and verify factual claims using advanced AI systems.

## ✨ Key Features

### 🎙️ **Podcast Management**
- Upload and store podcasts on IPFS (InterPlanetary File System)
- Automatic transcription using Whisper AI
- Genre categorization and metadata management
- Publish/unpublish workflow for content control

### 🤖 **AI-Powered Fact Checking**
- Real-time fact verification using DuckDuckGo search
- Gemini AI analysis of factual claims
- Detailed verification reports with evidence sources
- Confidence scoring for each claim

### 💬 **Interactive Features**
- Chat with AI about podcast content using transcripts
- Language appropriateness checking
- Community engagement through tipping system
- Real-time chat with podcast content

### 🔗 **Blockchain Integration**
- Polygon blockchain for secure transactions
- Smart contract-based tipping system
- Decentralized content storage on IPFS
- Transparent and immutable transaction history

### 🎥 **Advanced Video Player**
- Mini player mode for focused viewing
- Custom controls and playback options
- Responsive design for all devices
- High-quality streaming from IPFS

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Video.js** for video playback
- **Ethers.js** for blockchain interaction

### Backend
- **Node.js** with Express
- **MongoDB** for data storage
- **Python** with Whisper for transcription
- **Gemini AI API** for content analysis

### Blockchain & Storage
- **Polygon** network for transactions
- **IPFS** for decentralized storage
- **Pinata** for IPFS gateway
- **Hardhat** for smart contract development

### AI Services
- **Google Gemini 2.5 Flash** for fact checking
- **DuckDuckGo API** for web search
- **OpenAI Whisper** for audio transcription

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- MongoDB
- MetaMask wallet
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NEW_ECHO3AI
   ```

2. **Install frontend dependencies**
   ```bash
   cd echo3ai-pod-verse-50
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp env.example .env
   
   # Add your API keys and configuration
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   POLYGON_RPC_URL=your_polygon_rpc_url
   ```

6. **Deploy smart contracts**
   ```bash
   cd server
   npx hardhat compile
   npx hardhat deploy --network polygon
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd echo3ai-pod-verse-50
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📱 How to Use

### For Content Creators
1. **Upload Podcast**: Click "Add Podcast" and upload your video file
2. **IPFS Storage**: Your content is automatically stored on IPFS
3. **Transcription**: AI automatically transcribes your audio
4. **Publish**: Make your podcast available to the community
5. **Earn Tips**: Receive tips from listeners through blockchain

### For Listeners
1. **Browse Content**: Explore podcasts by genre and creator
2. **Watch & Listen**: Use the advanced video player with mini mode
3. **Fact Check**: Verify claims using AI-powered fact checking
4. **Chat with AI**: Ask questions about podcast content
5. **Tip Creators**: Support creators with cryptocurrency tips

## 🔍 AI Features Explained

### Fact Checking Process
1. **Claim Extraction**: AI identifies factual claims from transcript
2. **Web Search**: DuckDuckGo searches for supporting evidence
3. **AI Analysis**: Gemini analyzes search results and provides verdict
4. **Report Generation**: Detailed report with confidence scores

### Language Analysis
- Detects inappropriate language
- Provides content warnings
- Ensures community guidelines compliance

### Chat with AI
- Context-aware conversations about podcast content
- Personalized responses using creator and guest information
- Real-time interaction with transcript data

## 💡 Use Cases

### Content Creators
- **Podcasters**: Upload and monetize content
- **Educators**: Create educational content with fact verification
- **Journalists**: Publish news with AI fact checking
- **Influencers**: Engage audience with interactive features

### Listeners
- **Students**: Learn with verified educational content
- **News Consumers**: Access fact-checked information
- **Researchers**: Find reliable sources and claims
- **General Users**: Discover quality content with transparency

## 🔐 Security & Privacy

- **Decentralized Storage**: Content stored on IPFS, not centralized servers
- **Blockchain Security**: Immutable transaction records
- **AI Privacy**: No personal data stored in AI analysis
- **Content Verification**: Transparent fact-checking process

## 🌟 Why Echo3AI?

### For the Web3 Ecosystem
- **Decentralized**: No single point of failure
- **Transparent**: All transactions and verifications are public
- **Censorship Resistant**: Content stored on IPFS
- **Community Driven**: Tipping system rewards quality content

### For Content Quality
- **AI Verification**: Automated fact checking
- **Community Trust**: Transparent verification process
- **Quality Control**: Language and content moderation
- **Educational Value**: Reliable information sources

## 📈 Future Roadmap

- [ ] **Mobile App**: iOS and Android applications
- [ ] **Live Streaming**: Real-time podcast broadcasting
- [ ] **NFT Integration**: Podcast NFTs for collectors
- [ ] **DAO Governance**: Community-driven platform decisions
- [ ] **Multi-language Support**: Global content accessibility
- [ ] **Advanced Analytics**: Creator and listener insights

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

- **Developer**: Dishank Patel
- **Email**: dishankpatel16082003@gmail.com
- **Project**: Echo3AI - Decentralised AI Podcast Platform

---

**Built with ❤️ for the decentralized future of content creation and verification.** 
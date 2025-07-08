# Echo3AI - Ethereum Sepolia Testnet Setup Guide

This guide will help you set up your Echo3AI project to use Ethereum Sepolia testnet with MetaMask's built-in RPC.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Update your `.env` file with the following required values:

```env
# Ethereum Sepolia Testnet Configuration (Using MetaMask's Built-in RPC)
ETHEREUM_NETWORK=sepolia
ETHEREUM_CHAIN_ID=11155111
ETHEREUM_EXPLORER_URL=https://sepolia.etherscan.io

# Contract Configuration
CONTRACT_ADDRESS=your-deployed-contract-address
CONTRACT_ABI_PATH=./contracts/TipJar.json

# MetaMask Configuration (Auto-configured for Sepolia)
METAMASK_NETWORK_ID=11155111
METAMASK_CHAIN_ID=0xaa36a7
METAMASK_CHAIN_NAME=Sepolia Testnet
METAMASK_CURRENCY_SYMBOL=ETH
METAMASK_CURRENCY_DECIMALS=18

# Deployment Configuration (for contract deployment)
PRIVATE_KEY=your-private-key-for-deployment
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### 3. Get Sepolia Testnet ETH

You'll need Sepolia testnet ETH to interact with the contract. Get it from these faucets:

- **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
- **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

### 4. Deploy the TipJar Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

After deployment, update your `.env` file with the contract address.

### 5. Start the Server

```bash
npm run dev
```

## 🔧 Configuration Details

### MetaMask Setup (Simplified)

1. **Install MetaMask** browser extension
2. **Create or import a wallet**
3. **Switch to Sepolia testnet**:
   - Click the network dropdown in MetaMask
   - Select "Sepolia testnet" (it's pre-configured)
   - If not visible, click "Add network" and MetaMask will auto-detect Sepolia

4. **Get Sepolia ETH** from a faucet (see step 3 above)

**No manual RPC configuration needed!** MetaMask automatically handles the Sepolia connection.

### Etherscan API Key (Optional)

1. Go to [Etherscan](https://etherscan.io/) and create an account
2. Go to your profile and get your API key
3. Add it to your `.env` file for contract verification

## 📋 API Endpoints

### Authentication
- `POST /auth/metamask/login` - Authenticate with MetaMask
- `GET /auth/nonce` - Get nonce for signature verification
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout user

### TipJar Contract
- `POST /api/tip` - Send a tip to a podcaster
- `POST /api/withdraw` - Withdraw accumulated tips
- `GET /api/balance/:address` - Get tip balance for an address
- `GET /api/history/:address` - Get tip history for an address
- `GET /api/stats` - Get contract statistics
- `GET /api/contract-info` - Get contract information

## 🔍 Testing the Setup

### 1. Test Authentication

```bash
# Get nonce
curl http://localhost:5001/auth/nonce

# Login with MetaMask (requires frontend integration)
# This will be handled by your frontend application
```

### 2. Test Contract Interaction

```bash
# Get contract info
curl http://localhost:5001/api/contract-info

# Get contract stats
curl http://localhost:5001/api/stats
```

### 3. Test Tipping (requires authentication)

```bash
# Send a tip (requires MetaMask authentication)
curl -X POST http://localhost:5001/api/tip \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "recipientAddress": "0x...",
    "amount": "0.001",
    "message": "Great podcast!"
  }'
```

## 🛠️ Development Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network hardhat

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 🔒 Security Notes

1. **Never commit your `.env` file** - it contains sensitive information
2. **Use testnet private keys only** - never use mainnet private keys for testing
3. **Keep your private keys secure** - store them in environment variables
4. **Use HTTPS in production** - enable secure cookies and CORS

## 🐛 Troubleshooting

### Common Issues

1. **"MetaMask not installed" error**
   - Install MetaMask browser extension
   - Ensure you're on a supported browser

2. **"Wrong network" error**
   - Switch to Sepolia testnet in MetaMask
   - MetaMask will auto-configure the network

3. **"Insufficient balance" error**
   - Get more Sepolia ETH from a faucet
   - Check your account balance

4. **"Contract not found" error**
   - Verify the contract address is correct
   - Ensure the contract is deployed to Sepolia

### Getting Help

- Check the console logs for detailed error messages
- Verify your environment variables are set correctly
- Test with a simple transaction first
- Use Sepolia Etherscan to verify contract deployment

## 🎯 Benefits of Using MetaMask's Built-in RPC

- ✅ **No API keys required** - MetaMask handles RPC access
- ✅ **Auto-configuration** - Sepolia is pre-configured
- ✅ **Better security** - No need to store RPC URLs
- ✅ **Simplified setup** - Less configuration required
- ✅ **Reliable connection** - MetaMask manages the connection

## 📚 Additional Resources

- [Sepolia Testnet Documentation](https://sepolia.dev/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Etherscan API Documentation](https://docs.etherscan.io/)

## 🎯 Next Steps

1. Deploy your contract to Sepolia testnet
2. Test all functionality with MetaMask
3. Integrate with your frontend application
4. Deploy to mainnet when ready (with proper security audits) 
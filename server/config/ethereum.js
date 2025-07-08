const { ethers } = require('ethers');
const logger = require('../utils/logger');

/**
 * Ethereum Sepolia Testnet Configuration and Connection Manager
 * Uses JsonRpcProvider for server-side operations
 */
class EthereumManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Ethereum connection with JsonRpcProvider for server-side
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return this;
      }

      // Use JsonRpcProvider for server-side operations
      // This will be used for read-only operations on the server
      this.provider = new ethers.JsonRpcProvider("https://sepolia.drpc.org");
      
      logger.info('Ethereum connection initialized successfully using JsonRpcProvider');
      this.isInitialized = true;

      return this;
    } catch (error) {
      logger.error('Failed to initialize Ethereum connection:', error);
      throw new Error(`Ethereum initialization failed: ${error.message}`);
    }
  }

  /**
   * Get the current provider
   * @returns {JsonRpcProvider} Ethereum provider instance
   */
  getProvider() {
    if (!this.provider) {
      throw new Error('Ethereum not initialized. Call initialize() first.');
    }
    return this.provider;
  }

  /**
   * Set the signer (for client-side operations)
   * @param {Object} ethereum - MetaMask ethereum object from client
   * @returns {JsonRpcSigner} Ethereum signer instance
   */
  async setSigner(ethereum) {
    try {
      if (!this.provider) {
        await this.initialize();
      }

      // Create BrowserProvider for client-side operations
      const browserProvider = new ethers.BrowserProvider(ethereum);
      this.signer = await browserProvider.getSigner();
      return this.signer;
    } catch (error) {
      logger.error('Failed to set signer:', error);
      throw new Error(`Failed to set signer: ${error.message}`);
    }
  }

  /**
   * Get the current signer
   * @returns {JsonRpcSigner|null} Current signer or null
   */
  getSigner() {
    return this.signer;
  }

  /**
   * Check if user is connected
   * @returns {boolean} True if user is connected
   */
  isConnected() {
    return this.signer !== null;
  }

  /**
   * Get the current account address
   * @returns {Promise<string|null>} Account address or null
   */
  async getAccountAddress() {
    if (!this.signer) {
      return null;
    }

    try {
      return await this.signer.getAddress();
    } catch (error) {
      logger.error('Failed to get account address:', error);
      return null;
    }
  }

  /**
   * Get account balance
   * @param {string} address - Account address to check balance for
   * @returns {Promise<string>} Balance in wei
   */
  async getAccountBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      logger.error('Failed to get account balance:', error);
      throw new Error(`Failed to get balance for ${address}: ${error.message}`);
    }
  }

  /**
   * Convert ETH to wei
   * @param {string|number} ethAmount - Amount in ETH
   * @returns {string} Amount in wei
   */
  ethToWei(ethAmount) {
    return ethers.parseEther(ethAmount.toString());
  }

  /**
   * Convert wei to ETH
   * @param {string} weiAmount - Amount in wei
   * @returns {string} Amount in ETH
   */
  weiToEth(weiAmount) {
    return ethers.formatEther(weiAmount);
  }

  /**
   * Get Ethereum network configuration
   * @returns {Object} Network configuration
   */
  getNetworkConfig() {
    return {
      network: process.env.ETHEREUM_NETWORK || 'sepolia',
      chainId: process.env.ETHEREUM_CHAIN_ID || '11155111',
      explorerUrl: process.env.ETHEREUM_EXPLORER_URL || 'https://sepolia.etherscan.io',
      contractAddress: process.env.CONTRACT_ADDRESS,
      rpcProvider: 'JsonRpcProvider (Server-side)'
    };
  }

  /**
   * Create contract instance
   * @param {string} contractAddress - Contract address
   * @param {Array} abi - Contract ABI
   * @returns {Contract} Contract instance
   */
  createContract(contractAddress, abi) {
    if (!this.provider) {
      throw new Error('Ethereum not initialized. Call initialize() first.');
    }

    return new ethers.Contract(contractAddress, abi, this.signer || this.provider);
  }

  /**
   * Generate a unique transaction ID
   * @returns {string} Unique transaction ID
   */
  generateTransactionId() {
    return ethers.randomBytes(32).toString('hex');
  }

  /**
   * Get gas price
   * @returns {Promise<string>} Current gas price in wei
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice.toString();
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      return process.env.DEFAULT_GAS_PRICE || '20000000000';
    }
  }

  /**
   * Estimate gas for a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<string>} Estimated gas limit
   */
  async estimateGas(transaction) {
    try {
      const gasLimit = await this.provider.estimateGas(transaction);
      return gasLimit.toString();
    } catch (error) {
      logger.error('Failed to estimate gas:', error);
      return process.env.DEFAULT_GAS_LIMIT || '100000';
    }
  }

  /**
   * Check if MetaMask is installed (client-side only)
   * @returns {boolean} True if MetaMask is available
   */
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  }

  /**
   * Request account access (client-side only)
   * @returns {Promise<Array>} Array of account addresses
   */
  async requestAccounts() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      return await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      logger.error('Failed to request accounts:', error);
      throw new Error(`Failed to request accounts: ${error.message}`);
    }
  }

  /**
   * Switch to Sepolia network (client-side only)
   * @returns {Promise<void>}
   */
  async switchToSepolia() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
      });
    } catch (switchError) {
      // If Sepolia is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'Sepolia Ether',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.drpc.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      } else {
        throw switchError;
      }
    }
  }
}

// Create singleton instance
const ethereumManager = new EthereumManager();

module.exports = ethereumManager; 
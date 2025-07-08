const { connect, keyStores, WalletConnection, keyPairFromString } = require('near-api-js');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * NEAR Protocol Configuration and Connection Manager
 * Handles wallet connections, account management, and contract interactions
 */
class NEARManager {
  constructor() {
    this.near = null;
    this.walletConnection = null;
    this.account = null;
    this.contract = null;
    this.isInitialized = false;
  }

  /**
   * Initialize NEAR connection with environment configuration
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return this;
      }

      const config = {
        networkId: process.env.NEAR_NETWORK || 'testnet',
        nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
        walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.testnet.near.org',
        helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
        explorerUrl: process.env.NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org',
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        headers: {}
      };

      this.near = await connect(config);
      logger.info('NEAR connection initialized successfully');
      this.isInitialized = true;

      return this;
    } catch (error) {
      logger.error('Failed to initialize NEAR connection:', error);
      throw new Error(`NEAR initialization failed: ${error.message}`);
    }
  }

  /**
   * Create a new wallet connection for a user
   * @param {string} appName - Application name for the wallet connection
   * @returns {WalletConnection} NEAR wallet connection instance
   */
  createWalletConnection(appName = 'Echo3AI') {
    if (!this.near) {
      throw new Error('NEAR not initialized. Call initialize() first.');
    }

    this.walletConnection = new WalletConnection(this.near, appName);
    return this.walletConnection;
  }

  /**
   * Get the current wallet connection
   * @returns {WalletConnection|null} Current wallet connection or null
   */
  getWalletConnection() {
    return this.walletConnection;
  }

  /**
   * Check if user is signed in
   * @returns {boolean} True if user is signed in
   */
  isSignedIn() {
    return this.walletConnection ? this.walletConnection.isSignedIn() : false;
  }

  /**
   * Get the current account ID
   * @returns {string|null} Account ID or null if not signed in
   */
  getAccountId() {
    return this.walletConnection ? this.walletConnection.getAccountId() : null;
  }

  /**
   * Get the current account object
   * @returns {Account|null} NEAR account object or null
   */
  async getAccount() {
    if (!this.walletConnection || !this.isSignedIn()) {
      return null;
    }

    try {
      this.account = this.walletConnection.account();
      return this.account;
    } catch (error) {
      logger.error('Failed to get account:', error);
      return null;
    }
  }

  /**
   * Sign out the current user
   */
  signOut() {
    if (this.walletConnection) {
      this.walletConnection.signOut();
      this.account = null;
      logger.info('User signed out successfully');
    }
  }

  /**
   * Request sign in from the user
   * @param {string} contractId - Contract ID to request access to
   * @param {string} title - Title for the sign-in request
   * @param {string} successUrl - URL to redirect to on success
   * @param {string} failureUrl - URL to redirect to on failure
   */
  requestSignIn(contractId, title = 'Echo3AI', successUrl = null, failureUrl = null) {
    if (!this.walletConnection) {
      throw new Error('Wallet connection not initialized');
    }

    const defaultSuccessUrl = process.env.WALLET_SUCCESS_URL || 'http://localhost:3000/dashboard';
    const defaultFailureUrl = process.env.WALLET_FAILURE_URL || 'http://localhost:3000/login';

    this.walletConnection.requestSignIn({
      contractId: contractId,
      title: title,
      successUrl: successUrl || defaultSuccessUrl,
      failureUrl: failureUrl || defaultFailureUrl
    });
  }

  /**
   * Get account balance
   * @param {string} accountId - Account ID to check balance for
   * @returns {Promise<string>} Balance in yoctoNEAR
   */
  async getAccountBalance(accountId) {
    try {
      const account = await this.near.account(accountId);
      const balance = await account.getAccountBalance();
      return balance.total;
    } catch (error) {
      logger.error('Failed to get account balance:', error);
      throw new Error(`Failed to get balance for ${accountId}: ${error.message}`);
    }
  }

  /**
   * Convert NEAR to yoctoNEAR
   * @param {string|number} nearAmount - Amount in NEAR
   * @returns {string} Amount in yoctoNEAR
   */
  nearToYocto(nearAmount) {
    const near = require('near-api-js').utils.format.parseNearAmount;
    return near(nearAmount.toString());
  }

  /**
   * Convert yoctoNEAR to NEAR
   * @param {string} yoctoAmount - Amount in yoctoNEAR
   * @returns {string} Amount in NEAR
   */
  yoctoToNear(yoctoAmount) {
    const near = require('near-api-js').utils.format.formatNearAmount;
    return near(yoctoAmount);
  }

  /**
   * Generate a unique transaction ID
   * @returns {string} Unique transaction ID
   */
  generateTransactionId() {
    return uuidv4();
  }

  /**
   * Get NEAR network configuration
   * @returns {Object} Network configuration
   */
  getNetworkConfig() {
    return {
      networkId: process.env.NEAR_NETWORK || 'testnet',
      nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
      walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.testnet.near.org',
      helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
      explorerUrl: process.env.NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org',
      contractName: process.env.CONTRACT_NAME || 'your-contract.testnet'
    };
  }
}

// Create singleton instance
const nearManager = new NEARManager();

module.exports = nearManager; 
const express = require('express');
// const { body, validationResult } = require('express-validator');
const ethereumManager = require('../config/ethereum');
const logger = require('../utils/logger');
const router = express.Router();

/**
 * @route   POST /auth/metamask/login
 * @desc    Authenticate with MetaMask
 * @access  Public
 */
router.post('/metamask/login', async (req, res) => {
  try {
    // Basic validation without express-validator
    const { address, signature, message } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Address, signature, and message are required'
      });
    }
    
    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }
    
    // Verify the signature
    const ethers = require('ethers');
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      logger.walletLogger('metamask_verification_failed', { address, recoveredAddress });
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }
    
    // Store session data
    req.session.accountId = address;
    req.session.isAuthenticated = true;
    req.session.walletType = 'metamask';
    req.session.chainId = req.body.chainId || '11155111'; // Sepolia chain ID
    
    logger.walletLogger('metamask_login_successful', {
      address,
      chainId: req.session.chainId
    });
    
    res.json({
      success: true,
      message: 'MetaMask authentication successful',
      accountId: address,
      walletType: 'metamask',
      network: 'sepolia'
    });
  } catch (error) {
    logger.errorWithContext('MetaMask login failed', error, { route: '/auth/metamask/login' });
    res.status(500).json({
      success: false,
      error: 'MetaMask authentication failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /auth/nonce
 * @desc    Get a nonce for MetaMask signature verification
 * @access  Public
 */
router.get('/nonce', (req, res) => {
  try {
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Sign this message to authenticate with Echo3AI on Sepolia testnet. Nonce: ${nonce}`;
    
    // Store nonce in session for verification
    req.session.authNonce = nonce;
    req.session.authMessage = message;
    
    res.json({
      success: true,
      nonce,
      message
    });
  } catch (error) {
    logger.errorWithContext('Nonce generation failed', error, { route: '/auth/nonce' });
    res.status(500).json({
      success: false,
      error: 'Failed to generate nonce'
    });
  }
});

/**
 * @route   GET /auth/status
 * @desc    Get current authentication status
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const isAuthenticated = req.session.isAuthenticated || false;
    const accountId = req.session.accountId || null;
    const walletType = req.session.walletType || null;
    
    let ethereumStatus = null;
    
    // Check Ethereum wallet status if applicable
    if (walletType === 'metamask') {
      await ethereumManager.initialize();
      const signer = ethereumManager.getSigner();
      if (signer) {
        const address = await ethereumManager.getAccountAddress();
        ethereumStatus = {
          isConnected: ethereumManager.isConnected(),
          address: address,
          network: 'sepolia'
        };
      }
    }
    
    res.json({
      success: true,
      isAuthenticated,
      accountId,
      walletType,
      ethereumStatus
    });
  } catch (error) {
    logger.errorWithContext('Status check failed', error, { route: '/auth/status' });
    res.status(500).json({
      success: false,
      error: 'Failed to check authentication status',
      message: error.message
    });
  }
});

/**
 * @route   POST /auth/logout
 * @desc    Logout user and clear session
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    const walletType = req.session.walletType;
    
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        logger.errorWithContext('Session destruction failed', err, { route: '/auth/logout' });
        return res.status(500).json({
          success: false,
          error: 'Failed to logout'
        });
      }
      
      logger.walletLogger('logout_successful', { walletType });
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    logger.errorWithContext('Logout failed', error, { route: '/auth/logout' });
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /auth/icp
 * @desc    Authenticate with Internet Identity (ICP)
 */
router.post('/icp', async (req, res) => {
  try {
    const { principal } = req.body;
    if (!principal) {
      return res.status(400).json({ error: 'Principal is required' });
    }
    // Store session data
    req.session.accountId = principal;
    req.session.isAuthenticated = true;
    req.session.walletType = 'icp';
    return res.json({ message: 'Internet Identity authentication successful', principal });
  } catch (error) {
    logger.errorWithContext('ICP login failed', error, { route: '/auth/icp' });
    return res.status(500).json({ error: 'Internet Identity authentication failed' });
  }
});

module.exports = router; 
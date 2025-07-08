const express = require('express');
const { body, validationResult } = require('express-validator');
const ethereumManager = require('../config/ethereum');
const TipJarContract = require('../contracts/TipJarContract');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const router = express.Router();

// Podcast model (import from models)
const Podcast = require('../models/Podcast');

/**
 * @route   POST /api/tip
 * @desc    Send a tip to a podcaster using Ethereum
 * @access  Private
 */
router.post('/tip', [
  body('recipientAddress').isEthereumAddress().withMessage('Invalid recipient address'),
  body('amount').isFloat({ min: 0.001 }).withMessage('Amount must be at least 0.001 ETH'),
  body('message').optional().isString().withMessage('Message must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { recipientAddress, amount, message = '' } = req.body;
    const senderAddress = req.session.accountId;

    if (!senderAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Initialize Ethereum
    await ethereumManager.initialize();
    
    // Get signer
    const signer = ethereumManager.getSigner();
    if (!signer) {
      return res.status(401).json({
        success: false,
        error: 'MetaMask wallet not connected'
      });
    }

    // Create contract instance
    const contract = new TipJarContract(
      ethereumManager.getProvider(),
      process.env.CONTRACT_ADDRESS,
      signer
    );

    // Send tip
    const result = await contract.tip(recipientAddress, message, amount, {
      gasLimit: process.env.DEFAULT_GAS_LIMIT || 100000
    });

    logger.info('Tip sent successfully', {
      from: senderAddress,
      to: recipientAddress,
      amount: amount,
      transactionHash: result.transaction.hash
    });

    res.json({
      success: true,
      message: 'Tip sent successfully',
      transaction: result.transaction,
      amount: result.amountEth,
      recipient: recipientAddress,
      message: message
    });

  } catch (error) {
    logger.errorWithContext('Tip failed', error, {
      route: '/api/tip',
      sender: req.session.accountId,
      recipient: req.body.recipientAddress,
      amount: req.body.amount
    });

    res.status(500).json({
      success: false,
      error: 'Failed to send tip',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/withdraw
 * @desc    Withdraw accumulated tips
 * @access  Private
 */
router.post('/withdraw', async (req, res) => {
  try {
    const senderAddress = req.session.accountId;

    if (!senderAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Initialize Ethereum
    await ethereumManager.initialize();
    
    // Get signer
    const signer = ethereumManager.getSigner();
    if (!signer) {
      return res.status(401).json({
        success: false,
        error: 'MetaMask wallet not connected'
      });
    }

    // Create contract instance
    const contract = new TipJarContract(
      ethereumManager.getProvider(),
      process.env.CONTRACT_ADDRESS,
      signer
    );

    // Withdraw tips
    const result = await contract.withdraw({
      gasLimit: process.env.DEFAULT_GAS_LIMIT || 100000
    });

    logger.info('Withdrawal successful', {
      address: senderAddress,
      transactionHash: result.transaction.hash
    });

    res.json({
      success: true,
      message: 'Withdrawal successful',
      transaction: result.transaction
    });

  } catch (error) {
    logger.errorWithContext('Withdrawal failed', error, {
      route: '/api/withdraw',
      address: req.session.accountId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to withdraw tips',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/balance/:address
 * @desc    Get tip balance for a specific address
 * @access  Public
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    // Initialize Ethereum
    await ethereumManager.initialize();
    
    // Create contract instance
    const contract = new TipJarContract(
      ethereumManager.getProvider(),
      process.env.CONTRACT_ADDRESS
    );

    // Get balance
    const balance = await contract.getBalance(address);
    const balanceEth = ethereumManager.weiToEth(balance);

    res.json({
      success: true,
      address,
      balance: balance,
      balanceEth: balanceEth,
      currency: 'ETH'
    });

  } catch (error) {
    logger.errorWithContext('Balance check failed', error, {
      route: '/api/balance/:address',
      address: req.params.address
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get balance',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/history/:address
 * @desc    Get tip history for a specific address
 * @access  Public
 */
router.get('/history/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    // Initialize Ethereum
    await ethereumManager.initialize();
    
    // Create contract instance
    const contract = new TipJarContract(
      ethereumManager.getProvider(),
      process.env.CONTRACT_ADDRESS
    );

    // Get tip history
    const history = await contract.getTipHistory(address, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      address,
      history: history,
      total: history.length
    });

  } catch (error) {
    logger.errorWithContext('History retrieval failed', error, {
      route: '/api/history/:address',
      address: req.params.address
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get tip history',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/stats
 * @desc    Get contract statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Initialize Ethereum
    await ethereumManager.initialize();
    
    // Create contract instance
    const contract = new TipJarContract(
      ethereumManager.getProvider(),
      process.env.CONTRACT_ADDRESS
    );

    // Get stats
    const stats = await contract.getStats();

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    logger.errorWithContext('Stats retrieval failed', error, {
      route: '/api/stats'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get contract statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/contract-info
 * @desc    Get contract information and configuration
 * @access  Public
 */
router.get('/contract-info', async (req, res) => {
  try {
    const networkConfig = ethereumManager.getNetworkConfig();
    
    res.json({
      success: true,
      contract: {
        address: process.env.CONTRACT_ADDRESS,
        network: networkConfig.network,
        chainId: networkConfig.chainId,
        explorerUrl: networkConfig.explorerUrl
      },
      gas: {
        defaultLimit: process.env.DEFAULT_GAS_LIMIT,
        defaultPrice: process.env.DEFAULT_GAS_PRICE
      }
    });

  } catch (error) {
    logger.errorWithContext('Contract info retrieval failed', error, {
      route: '/api/contract-info'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get contract information',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/tip-podcaster/validate
 * @desc    Validate tip request and get recipient address
 * @access  Private
 */
router.post('/tip-podcaster/validate', [
  body('podcastId').isMongoId().withMessage('Invalid podcast ID'),
  body('amount').isFloat({ min: 0.001 }).withMessage('Amount must be at least 0.001 ETH'),
  body('message').optional().isString().withMessage('Message must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { podcastId, amount, message = '' } = req.body;
    const senderAddress = req.session.accountId;

    if (!senderAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Find the podcast and get podcaster's wallet address
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }

    if (!podcast.podcasterWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Podcaster wallet address not found for this podcast'
      });
    }

    const recipientAddress = podcast.podcasterWalletAddress;

    // Check for self-transfer (sending to same address)
    if (senderAddress.toLowerCase() === recipientAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send tip to yourself',
        message: 'You cannot send a tip to your own wallet address. Please use a different account or contact the podcaster to update their wallet address.'
      });
    }

    res.json({
      success: true,
      recipientAddress: recipientAddress,
      podcastTitle: podcast.title,
      podcasterName: podcast.creator,
      amount: amount,
      message: message
    });

  } catch (error) {
    logger.errorWithContext('Tip validation failed', error, {
      route: '/api/tip-podcaster/validate',
      sender: req.session.accountId,
      podcastId: req.body.podcastId,
      amount: req.body.amount
    });

    res.status(500).json({
      success: false,
      error: 'Failed to validate tip request',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/tip-podcaster/record
 * @desc    Record a completed tip transaction
 * @access  Private
 */
router.post('/tip-podcaster/record', [
  body('podcastId').isMongoId().withMessage('Invalid podcast ID'),
  body('amount').isFloat({ min: 0.001 }).withMessage('Amount must be at least 0.001 ETH'),
  body('message').optional().isString().withMessage('Message must be a string'),
  body('transactionHash').isString().notEmpty().withMessage('Transaction hash is required'),
  body('recipientAddress').isEthereumAddress().withMessage('Invalid recipient address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { podcastId, amount, message, transactionHash, recipientAddress } = req.body;
    const senderAddress = req.session.accountId;

    if (!senderAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Find the podcast
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }

    logger.info('Tip transaction recorded successfully', {
      from: senderAddress,
      to: recipientAddress,
      podcastId: podcastId,
      podcastTitle: podcast.title,
      amount: amount,
      transactionHash: transactionHash
    });

    res.json({
      success: true,
      message: 'Tip transaction recorded successfully',
      transaction: {
        hash: transactionHash,
        amount: amount,
        recipient: recipientAddress,
        podcastTitle: podcast.title,
        podcasterName: podcast.creator,
        message: message
      }
    });

  } catch (error) {
    logger.errorWithContext('Tip recording failed', error, {
      route: '/api/tip-podcaster/record',
      sender: req.session.accountId,
      podcastId: req.body.podcastId,
      transactionHash: req.body.transactionHash
    });

    res.status(500).json({
      success: false,
      error: 'Failed to record tip transaction',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/tip-podcaster
 * @desc    Send a tip to a podcaster using podcast ID (legacy - now handled client-side)
 * @access  Private
 */
router.post('/tip-podcaster', [
  body('podcastId').isMongoId().withMessage('Invalid podcast ID'),
  body('amount').isFloat({ min: 0.001 }).withMessage('Amount must be at least 0.001 ETH'),
  body('message').optional().isString().withMessage('Message must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { podcastId, amount, message = '' } = req.body;
    const senderAddress = req.session.accountId;

    if (!senderAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Find the podcast and get podcaster's wallet address
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }

    if (!podcast.podcasterWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Podcaster wallet address not found for this podcast'
      });
    }

    const recipientAddress = podcast.podcasterWalletAddress;

    // Check for self-transfer (sending to same address)
    if (senderAddress.toLowerCase() === recipientAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send tip to yourself',
        message: 'You cannot send a tip to your own wallet address. Please use a different account or contact the podcaster to update their wallet address.'
      });
    }

    // Initialize Ethereum
    await ethereumManager.initialize();
    
    // Get signer
    const signer = ethereumManager.getSigner();
    if (!signer) {
      return res.status(401).json({
        success: false,
        error: 'MetaMask wallet not connected'
      });
    }

    // Create contract instance
    const contract = new TipJarContract(
      ethereumManager.getProvider(),
      process.env.CONTRACT_ADDRESS,
      signer
    );

    // Send tip
    const result = await contract.tip(recipientAddress, message, amount, {
      gasLimit: process.env.DEFAULT_GAS_LIMIT || 100000
    });

    logger.info('Tip sent to podcaster successfully', {
      from: senderAddress,
      to: recipientAddress,
      podcastId: podcastId,
      podcastTitle: podcast.title,
      amount: amount,
      transactionHash: result.transaction.hash
    });

    res.json({
      success: true,
      message: 'Tip sent to podcaster successfully',
      transaction: result.transaction,
      amount: result.amountEth,
      recipient: recipientAddress,
      podcastTitle: podcast.title,
      podcasterName: podcast.creator,
      message: message
    });

  } catch (error) {
    logger.errorWithContext('Tip to podcaster failed', error, {
      route: '/api/tip-podcaster',
      sender: req.session.accountId,
      podcastId: req.body.podcastId,
      amount: req.body.amount
    });

    res.status(500).json({
      success: false,
      error: 'Failed to send tip to podcaster',
      message: error.message
    });
  }
});

module.exports = router; 
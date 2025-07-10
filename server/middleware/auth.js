const logger = require('../utils/logger');

/**
 * Middleware to require authentication
 * Ensures user is authenticated with any supported wallet
 */
const requireAuth = (req, res, next) => {
  try {
    if (!req.session || !req.session.isAuthenticated) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Add authentication info to request
    req.accountId = req.session.accountId;
    req.walletType = req.session.walletType;
    req.chainId = req.session.chainId;

    logger.info('Authentication middleware passed', {
      accountId: req.accountId,
      walletType: req.walletType,
      route: req.originalUrl
    });

    next();
  } catch (error) {
    logger.errorWithContext('Authentication middleware error', error, {
      route: req.originalUrl
    });
    
    res.status(500).json({
      success: false,
      error: 'Authentication check failed',
      message: error.message
    });
  }
};

/**
 * Middleware to require MetaMask authentication
 * Ensures user is authenticated with MetaMask specifically
 */
const requireMetaMaskAuth = (req, res, next) => {
  try {
    // Check session authentication
    if (!req.session || !req.session.isAuthenticated) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Check if wallet type is MetaMask
    if (req.session.walletType !== 'metamask') {
      return res.status(403).json({
        success: false,
        error: 'MetaMask wallet required',
        message: 'This operation requires MetaMask wallet authentication'
      });
    }

    // Add MetaMask-specific info to request
    req.accountId = req.session.accountId;
    req.walletType = 'metamask';
    req.chainId = req.session.chainId;

    logger.info('MetaMask authentication middleware passed', {
      accountId: req.accountId,
      chainId: req.chainId,
      route: req.originalUrl
    });

    next();
  } catch (error) {
    logger.errorWithContext('MetaMask authentication middleware error', error, {
      route: req.originalUrl
    });
    
    res.status(500).json({
      success: false,
      error: 'MetaMask authentication check failed',
      message: error.message
    });
  }
};

/**
 * Middleware to validate Ethereum amount format
 * Ensures amount is in valid ETH format
 */
const validateETHAmount = (req, res, next) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount required',
        message: 'Amount is required'
      });
    }

    const amountNum = parseFloat(amount);
    
    // Check if it's a valid number
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    // Check minimum amount (0.001 ETH)
    if (amountNum < 0.001) {
      return res.status(400).json({
        success: false,
        error: 'Amount too small',
        message: 'Amount must be at least 0.001 ETH'
      });
    }

    // Convert to wei for consistency
    const ethereumManager = require('../config/ethereum');
    req.weiAmount = ethereumManager.ethToWei(amountNum);
    req.ethAmount = amountNum;

    next();
  } catch (error) {
    logger.errorWithContext('ETH amount validation error', error, {
      route: req.originalUrl,
      amount: req.body.amount
    });
    
    res.status(400).json({
      success: false,
      error: 'Amount validation failed',
      message: error.message
    });
  }
};

/**
 * Middleware to check minimum balance requirement
 * Ensures user has sufficient balance for the operation
 */
const requireBalance = (minAmount) => {
  return async (req, res, next) => {
    try {
      const accountId = req.session.accountId;
      
      if (!accountId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }

      // Initialize Ethereum
      const ethereumManager = require('../config/ethereum');
      await ethereumManager.initialize();
      
      // Get account balance
      const balance = await ethereumManager.getAccountBalance(accountId);
      const balanceEth = ethereumManager.weiToEth(balance);
      
      // Convert minimum amount to wei if needed
      const minWei = minAmount.includes('000000000000000000') 
        ? minAmount 
        : ethereumManager.ethToWei(minAmount);

      if (BigInt(balance) < BigInt(minWei)) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          message: `Insufficient balance. Required: ${ethereumManager.weiToEth(minWei)} ETH, Available: ${balanceEth} ETH`
        });
      }

      req.accountBalance = balance;
      req.accountBalanceEth = balanceEth;

      next();
    } catch (error) {
      logger.errorWithContext('Balance check error', error, {
        route: req.originalUrl,
        accountId: req.session.accountId,
        minAmount
      });
      
      res.status(500).json({
        success: false,
        error: 'Balance check failed',
        message: error.message
      });
    }
  };
};

/**
 * Middleware to validate Ethereum address format
 * Ensures address is a valid Ethereum address
 */
const validateEthereumAddress = (req, res, next) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address required',
        message: 'Ethereum address is required'
      });
    }

    // Basic Ethereum address validation
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethereumAddressRegex.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address',
        message: 'Please provide a valid Ethereum address'
      });
    }

    next();
  } catch (error) {
    logger.errorWithContext('Ethereum address validation error', error, {
      route: req.originalUrl,
      address: req.body.address
    });
    
    res.status(400).json({
      success: false,
      error: 'Address validation failed',
      message: error.message
    });
  }
};

/**
 * Middleware to add request logging
 * Logs all API requests for debugging and monitoring
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      accountId: req.session?.accountId || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('API Request', logData);
    } else {
      logger.info('API Request', logData);
    }
  });
  
  next();
};

module.exports = {
  requireAuth,
  requireMetaMaskAuth,
  validateETHAmount,
  requireBalance,
  validateEthereumAddress,
  requestLogger
}; 
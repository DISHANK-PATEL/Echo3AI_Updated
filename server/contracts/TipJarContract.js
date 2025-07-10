// TipJar Smart Contract for Ethereum Sepolia Testnet
// JavaScript wrapper for the Solidity TipJar contract

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class TipJarContract {
  constructor(provider, contractAddress, signer = null) {
    this.provider = provider;
    this.contractAddress = contractAddress;
    this.signer = signer;
    
    // Load contract ABI
    this.abi = this.loadContractABI();
    
    // Initialize contract
    this.contract = new ethers.Contract(
      contractAddress,
      this.abi,
      signer || provider
    );
  }

  /**
   * Load contract ABI from JSON file
   * @returns {Array} Contract ABI
   */
  loadContractABI() {
    try {
      const abiPath = path.join(__dirname, 'TipJar.json');
      if (fs.existsSync(abiPath)) {
        const abiData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        return abiData.abi || abiData;
      }
      
      // Fallback ABI if file doesn't exist
      return [
        "function tip(address _recipient, string memory _message) external payable",
        "function withdraw() external",
        "function getBalance(address _address) external view returns (uint256)",
        "function getTipHistory(address _address, uint256 _limit, uint256 _offset) external view returns (tuple(address from, uint256 amount, string message, uint256 timestamp)[])",
        "function getStats() external view returns (uint256 _totalTips, uint256 _totalAmount, uint256 _contractBalance)",
        "function getTotalTipsReceived(address _address) external view returns (uint256)",
        "function getTipCount(address _address) external view returns (uint256)",
        "event TipSent(address indexed from, address indexed to, uint256 amount, string message, uint256 timestamp)",
        "event TipWithdrawn(address indexed recipient, uint256 amount, uint256 timestamp)"
      ];
    } catch (error) {
      console.error('Failed to load contract ABI:', error);
      throw new Error('Contract ABI not found');
    }
  }

  /**
   * Send a tip to a podcaster
   * @param {string} recipientAddress - The address of the podcaster
   * @param {string} message - Optional message with the tip
   * @param {string} amount - Amount in ETH (will be converted to wei)
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction result
   */
  async tip(recipientAddress, message, amount, options = {}) {
    try {
      // Convert ETH to wei
      const weiAmount = ethers.parseEther(amount.toString());
      
      // Prepare transaction
      const tx = await this.contract.tip(recipientAddress, message, {
        value: weiAmount,
        gasLimit: options.gasLimit || 100000,
        gasPrice: options.gasPrice || await this.provider.getFeeData().then(fee => fee.gasPrice)
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transaction: {
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice.toString()
        },
        amount: weiAmount.toString(),
        amountEth: amount,
        recipient: recipientAddress,
        message: message
      };
    } catch (error) {
      throw new Error(`Tip failed: ${error.message}`);
    }
  }

  /**
   * Withdraw accumulated tips
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction result
   */
  async withdraw(options = {}) {
    try {
      // Prepare transaction
      const tx = await this.contract.withdraw({
        gasLimit: options.gasLimit || 100000,
        gasPrice: options.gasPrice || await this.provider.getFeeData().then(fee => fee.gasPrice)
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transaction: {
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice.toString()
        }
      };
    } catch (error) {
      throw new Error(`Withdraw failed: ${error.message}`);
    }
  }

  /**
   * Get tip balance for an address
   * @param {string} address - The address to check
   * @returns {Promise<string>} Balance in wei
   */
  async getBalance(address) {
    try {
      const balance = await this.contract.getBalance(address);
      return balance.toString();
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get tip history for an address
   * @param {string} address - The address to check
   * @param {number} limit - Number of records to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of tip records
   */
  async getTipHistory(address, limit = 50, offset = 0) {
    try {
      const history = await this.contract.getTipHistory(address, limit, offset);
      
      // Convert BigInt values to strings for JSON serialization
      return history.map(tip => ({
        from: tip.from,
        amount: tip.amount.toString(),
        amountEth: ethers.formatEther(tip.amount),
        message: tip.message,
        timestamp: tip.timestamp.toString(),
        date: new Date(Number(tip.timestamp) * 1000).toISOString()
      }));
    } catch (error) {
      throw new Error(`Failed to get tip history: ${error.message}`);
    }
  }

  /**
   * Get overall contract statistics
   * @returns {Promise<Object>} Contract statistics
   */
  async getStats() {
    try {
      const stats = await this.contract.getStats();
      return {
        totalTips: stats[0].toString(),
        totalAmount: stats[1].toString(),
        totalAmountEth: ethers.formatEther(stats[1]),
        contractBalance: stats[2].toString(),
        contractBalanceEth: ethers.formatEther(stats[2])
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Get total tips received by an address
   * @param {string} address - The address to check
   * @returns {Promise<string>} Total tips received in wei
   */
  async getTotalTipsReceived(address) {
    try {
      const total = await this.contract.getTotalTipsReceived(address);
      return total.toString();
    } catch (error) {
      throw new Error(`Failed to get total tips received: ${error.message}`);
    }
  }

  /**
   * Get tip count for an address
   * @param {string} address - The address to check
   * @returns {Promise<number>} Number of tips received
   */
  async getTipCount(address) {
    try {
      const count = await this.contract.getTipCount(address);
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get tip count: ${error.message}`);
    }
  }

  /**
   * Listen for TipSent events
   * @param {Function} callback - Callback function for events
   * @returns {EventFilter} Event filter
   */
  onTipSent(callback) {
    return this.contract.on('TipSent', callback);
  }

  /**
   * Listen for TipWithdrawn events
   * @param {Function} callback - Callback function for events
   * @returns {EventFilter} Event filter
   */
  onTipWithdrawn(callback) {
    return this.contract.on('TipWithdrawn', callback);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

module.exports = TipJarContract; 
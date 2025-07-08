// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TipJar
 * @dev A smart contract for tipping podcasters on Ethereum Sepolia testnet
 */
contract TipJar {
    // Events
    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    
    event TipWithdrawn(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    // Structs
    struct Tip {
        address from;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    // State variables
    mapping(address => uint256) public balances;
    mapping(address => Tip[]) public tipHistory;
    mapping(address => uint256) public totalTipsReceived;
    
    uint256 public totalTips;
    uint256 public totalAmountTipped;

    /**
     * @dev Send a tip to a podcaster
     * @param _recipient The address of the podcaster
     * @param _message Optional message with the tip
     */
    function tip(address _recipient, string memory _message) external payable {
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(_recipient != msg.sender, "Cannot tip yourself");

        // Update balances
        balances[_recipient] += msg.value;
        totalTipsReceived[_recipient] += msg.value;
        
        // Update global stats
        totalTips++;
        totalAmountTipped += msg.value;

        // Store tip in history
        Tip memory newTip = Tip({
            from: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        });
        
        tipHistory[_recipient].push(newTip);

        // Emit event
        emit TipSent(msg.sender, _recipient, msg.value, _message, block.timestamp);
    }

    /**
     * @dev Withdraw accumulated tips
     */
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No tips to withdraw");

        // Reset balance before transfer to prevent reentrancy
        balances[msg.sender] = 0;

        // Transfer the tips
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit TipWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Get tip balance for an address
     * @param _address The address to check
     * @return The balance in wei
     */
    function getBalance(address _address) external view returns (uint256) {
        return balances[_address];
    }

    /**
     * @dev Get tip history for an address
     * @param _address The address to get history for
     * @param _limit Number of tips to return
     * @param _offset Offset for pagination
     * @return Array of tip structs
     */
    function getTipHistory(
        address _address, 
        uint256 _limit, 
        uint256 _offset
    ) external view returns (Tip[] memory) {
        Tip[] storage history = tipHistory[_address];
        uint256 totalTips = history.length;
        
        if (_offset >= totalTips) {
            return new Tip[](0);
        }
        
        uint256 endIndex = _offset + _limit;
        if (endIndex > totalTips) {
            endIndex = totalTips;
        }
        
        uint256 resultLength = endIndex - _offset;
        Tip[] memory result = new Tip[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = history[_offset + i];
        }
        
        return result;
    }

    /**
     * @dev Get contract statistics
     * @return _totalTips Total number of tips sent
     * @return _totalAmount Total amount tipped in wei
     * @return _contractBalance Current contract balance
     */
    function getStats() external view returns (
        uint256 _totalTips,
        uint256 _totalAmount,
        uint256 _contractBalance
    ) {
        return (totalTips, totalAmountTipped, address(this).balance);
    }

    /**
     * @dev Get total tips received by an address
     * @param _address The address to check
     * @return Total tips received in wei
     */
    function getTotalTipsReceived(address _address) external view returns (uint256) {
        return totalTipsReceived[_address];
    }

    /**
     * @dev Get tip count for an address
     * @param _address The address to check
     * @return Number of tips received
     */
    function getTipCount(address _address) external view returns (uint256) {
        return tipHistory[_address].length;
    }

    // Fallback function to receive ETH
    receive() external payable {
        // Allow direct ETH transfers to the contract
    }
} 
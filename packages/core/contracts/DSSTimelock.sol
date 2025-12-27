// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DSSAccessControl.sol";

/**
 * @title DSSTimelock
 * @notice Governance timelock for strategy upgrades
 * @dev Implements DSS-10.1 (Upgrade & Governance Security) requirements
 * @dev Enforces minimum delay for critical operations
 */
contract DSSTimelock is DSSAccessControl {
    // ============ State Variables ============
    
    uint256 public constant MINIMUM_DELAY = 48 hours;
    uint256 public constant MAXIMUM_DELAY = 30 days;
    uint256 public constant GRACE_PERIOD = 14 days;
    
    mapping(bytes32 => bool) public queuedTransactions;
    
    // ============ Events ============
    
    event TransactionQueued(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        bytes data,
        uint256 eta
    );
    
    event TransactionExecuted(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        bytes data
    );
    
    event TransactionCancelled(bytes32 indexed txHash);
    
    // ============ Constructor ============
    
    constructor() DSSAccessControl() {}
    
    // ============ External Functions ============
    
    /**
     * @notice Queue a transaction for future execution
     * @param target Contract address to call
     * @param value ETH value to send
     * @param data Calldata for the transaction
     * @param eta Earliest time for execution (timestamp)
     * @return txHash Hash identifying this transaction
     * @dev Only callable by ADMIN_ROLE or higher
     */
    function queueTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 eta
    ) external onlyAdmin returns (bytes32) {
        require(
            eta >= block.timestamp + MINIMUM_DELAY,
            "DSSTimelock: delay too short"
        );
        require(
            eta <= block.timestamp + MAXIMUM_DELAY,
            "DSSTimelock: delay too long"
        );
        
        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));
        queuedTransactions[txHash] = true;
        
        emit TransactionQueued(txHash, target, value, data, eta);
        return txHash;
    }
    
    /**
     * @notice Execute a queued transaction
     * @param target Contract address to call
     * @param value ETH value to send
     * @param data Calldata for the transaction
     * @param eta Scheduled execution time
     * @return result Return data from the call
     * @dev Only callable by ADMIN_ROLE or higher
     */
    function executeTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 eta
    ) external onlyAdmin returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));
        
        require(queuedTransactions[txHash], "DSSTimelock: not queued");
        require(block.timestamp >= eta, "DSSTimelock: not ready");
        require(block.timestamp <= eta + GRACE_PERIOD, "DSSTimelock: expired");
        
        queuedTransactions[txHash] = false;
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "DSSTimelock: execution failed");
        
        emit TransactionExecuted(txHash, target, value, data);
        return result;
    }
    
    /**
     * @notice Cancel a queued transaction
     * @param target Contract address
     * @param value ETH value
     * @param data Calldata
     * @param eta Scheduled execution time
     * @dev Only callable by OWNER_ROLE or higher
     */
    function cancelTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 eta
    ) external onlyOwner {
        bytes32 txHash = keccak256(abi.encode(target, value, data, eta));
        
        require(queuedTransactions[txHash], "DSSTimelock: not queued");
        
        queuedTransactions[txHash] = false;
        
        emit TransactionCancelled(txHash);
    }
}


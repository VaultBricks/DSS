// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDSSPausable
 * @notice Interface for emergency pause functionality
 * @dev Implements DSS-4 (Risk Management) emergency system requirements
 */
interface IDSSPausable {
    // ============ Events ============
    
    /// @notice Emitted when the contract is paused
    event Paused(address indexed account, uint256 timestamp);
    
    /// @notice Emitted when the contract is unpaused
    event Unpaused(address indexed account, uint256 timestamp);
    
    // ============ View Functions ============
    
    /**
     * @notice Returns whether the contract is currently paused
     * @return isPaused True if paused, false otherwise
     */
    function paused() external view returns (bool isPaused);
    
    // ============ State-Changing Functions ============
    
    /**
     * @notice Pauses all pausable functions
     * @dev Only callable by GUARDIAN_ROLE or higher
     * @dev Required for DSS-4 (Risk Management)
     */
    function pause() external;
    
    /**
     * @notice Unpauses all pausable functions
     * @dev Only callable by ADMIN_ROLE or higher
     * @dev Required for DSS-4 (Risk Management)
     */
    function unpause() external;
}




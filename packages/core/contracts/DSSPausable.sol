// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IDSSPausable.sol";
import "./DSSAccessControl.sol";

/**
 * @title DSSPausable
 * @notice Emergency pause functionality for DSS strategies
 * @dev Implements DSS-4 (Risk Management) emergency system requirements
 * @dev Guardians can pause, but only admins can unpause
 */
abstract contract DSSPausable is IDSSPausable, DSSAccessControl {
    // ============ State Variables ============
    
    bool private _paused;
    
    // ============ Constructor ============
    
    constructor() {
        _paused = false;
    }
    
    // ============ Modifiers ============
    
    modifier whenNotPaused() {
        require(!_paused, "DSSPausable: paused");
        _;
    }
    
    modifier whenPaused() {
        require(_paused, "DSSPausable: not paused");
        _;
    }
    
    // ============ View Functions ============
    
    /// @inheritdoc IDSSPausable
    function paused() public view override returns (bool) {
        return _paused;
    }
    
    // ============ External Functions ============
    
    /// @inheritdoc IDSSPausable
    function pause() external override onlyGuardian whenNotPaused {
        _paused = true;
        emit Paused(msg.sender, block.timestamp);
    }
    
    /// @inheritdoc IDSSPausable
    function unpause() external override onlyAdmin whenPaused {
        _paused = false;
        emit Unpaused(msg.sender, block.timestamp);
    }
}


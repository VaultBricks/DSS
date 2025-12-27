// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDSSAccessControl
 * @notice Interface for DSS role-based access control
 * @dev Implements DSS-9 (Operational Security) requirements
 */
interface IDSSAccessControl {
    // ============ Events ============
    
    /// @notice Emitted when a role is granted
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    
    /// @notice Emitted when a role is revoked
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    
    // ============ View Functions ============
    
    /**
     * @notice Checks if an account has a specific role
     * @param role Role identifier (keccak256 hash)
     * @param account Address to check
     * @return hasRole True if account has the role
     */
    function hasRole(bytes32 role, address account) external view returns (bool hasRole);
    
    /**
     * @notice Returns the admin role for a given role
     * @param role Role identifier
     * @return adminRole Role that can grant/revoke the given role
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32 adminRole);
    
    // ============ State-Changing Functions ============
    
    /**
     * @notice Grants a role to an account
     * @param role Role identifier
     * @param account Address to grant role to
     * @dev Only callable by role admin
     */
    function grantRole(bytes32 role, address account) external;
    
    /**
     * @notice Revokes a role from an account
     * @param role Role identifier
     * @param account Address to revoke role from
     * @dev Only callable by role admin
     */
    function revokeRole(bytes32 role, address account) external;
    
    /**
     * @notice Renounces a role (self-revoke)
     * @param role Role identifier
     * @dev Caller renounces their own role
     */
    function renounceRole(bytes32 role) external;
}


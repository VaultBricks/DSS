// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IDSSAccessControl.sol";

/**
 * @title DSSAccessControl
 * @notice Implementation of role-based access control for DSS strategies
 * @dev Implements DSS-9.2 (Key & Access Management) requirements
 * @dev Provides predefined roles: OWNER, ADMIN, KEEPER, GUARDIAN
 */
abstract contract DSSAccessControl is IDSSAccessControl {
    // ============ State Variables ============
    
    /// @notice Role identifiers
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    /// @notice Default admin role (can grant/revoke all roles)
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    
    /// @notice Mapping from role to accounts that have that role
    mapping(bytes32 => mapping(address => bool)) private _roles;
    
    /// @notice Mapping from role to its admin role
    mapping(bytes32 => bytes32) private _roleAdmins;
    
    // ============ Constructor ============
    
    constructor() {
        // Grant deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Set up role hierarchy
        _setRoleAdmin(OWNER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ADMIN_ROLE, OWNER_ROLE);
        _setRoleAdmin(KEEPER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(GUARDIAN_ROLE, ADMIN_ROLE);
        
        // Grant deployer owner role
        _grantRole(OWNER_ROLE, msg.sender);
    }
    
    // ============ Modifiers ============
    
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "DSSAccessControl: unauthorized");
        _;
    }
    
    modifier onlyOwner() {
        require(
            hasRole(OWNER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "DSSAccessControl: not owner"
        );
        _;
    }
    
    modifier onlyAdmin() {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            hasRole(OWNER_ROLE, msg.sender) || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "DSSAccessControl: not admin"
        );
        _;
    }
    
    modifier onlyKeeper() {
        require(hasRole(KEEPER_ROLE, msg.sender), "DSSAccessControl: not keeper");
        _;
    }
    
    modifier onlyGuardian() {
        require(
            hasRole(GUARDIAN_ROLE, msg.sender) ||
            hasRole(ADMIN_ROLE, msg.sender) ||
            hasRole(OWNER_ROLE, msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "DSSAccessControl: not guardian"
        );
        _;
    }
    
    // ============ View Functions ============
    
    /// @inheritdoc IDSSAccessControl
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return _roles[role][account];
    }
    
    /// @inheritdoc IDSSAccessControl
    function getRoleAdmin(bytes32 role) public view override returns (bytes32) {
        return _roleAdmins[role];
    }
    
    // ============ External Functions ============
    
    /// @inheritdoc IDSSAccessControl
    function grantRole(bytes32 role, address account) external override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }
    
    /// @inheritdoc IDSSAccessControl
    function revokeRole(bytes32 role, address account) external override onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }
    
    /// @inheritdoc IDSSAccessControl
    function renounceRole(bytes32 role) external override {
        _revokeRole(role, msg.sender);
    }
    
    // ============ Internal Functions ============
    
    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }
    
    function _revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
    
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal {
        _roleAdmins[role] = adminRole;
    }
}




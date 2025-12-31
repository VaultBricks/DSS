// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDSSRegistry
 * @notice Interface for the DSS Strategy Registry
 * @dev Allows discovery and verification of DSS-certified strategies
 * @dev Related to Issue #4: Create Public Registry of DSS-Certified Strategies
 */
interface IDSSRegistry {
    // ============ Structs ============
    
    /// @notice Certification levels as per DSS specification
    enum CertificationLevel {
        None,       // Not certified
        Bronze,     // >80% coverage, basic tests
        Silver,     // >95% coverage, audits, stress testing  
        Gold        // >98% coverage, formal verification, bug bounties
    }
    
    /// @notice Strategy metadata
    struct StrategyInfo {
        address strategyAddress;
        string name;
        string version;
        CertificationLevel level;
        uint256 certifiedAt;
        string auditReport;
        bool isActive;
    }
    
    // ============ Events ============
    
    /// @notice Emitted when a strategy is registered
    event StrategyRegistered(
        address indexed strategy,
        string name,
        CertificationLevel level,
        uint256 timestamp
    );
    
    /// @notice Emitted when certification level is updated
    event CertificationUpdated(
        address indexed strategy,
        CertificationLevel oldLevel,
        CertificationLevel newLevel
    );
    
    /// @notice Emitted when a strategy is deactivated
    event StrategyDeactivated(address indexed strategy, string reason);
    
    // ============ View Functions ============
    
    /**
     * @notice Returns information about a registered strategy
     * @param strategy Address of the strategy contract
     * @return info Complete strategy information
     */
    function getStrategyInfo(address strategy) 
        external 
        view 
        returns (StrategyInfo memory info);
    
    /**
     * @notice Returns all strategies with a specific certification level
     * @param level Certification level to filter by
     * @return strategies Array of strategy addresses
     */
    function getStrategiesByLevel(CertificationLevel level) 
        external 
        view 
        returns (address[] memory strategies);
    
    /**
     * @notice Checks if a strategy is DSS-certified
     * @param strategy Address of the strategy contract
     * @return isCertified True if strategy has Bronze+ certification
     */
    function isCertified(address strategy) external view returns (bool isCertified);
    
    /**
     * @notice Returns the total number of registered strategies
     * @return count Total count of registered strategies
     */
    function getStrategyCount() external view returns (uint256 count);
    
    // ============ Admin Functions ============
    
    /**
     * @notice Registers a new strategy in the registry
     * @param strategy Address of the strategy contract
     * @param name Human-readable name
     * @param version Version string
     * @param level Certification level
     * @param auditReport IPFS/Arweave link to audit report
     * @dev Only callable by authorized certifiers
     */
    function registerStrategy(
        address strategy,
        string calldata name,
        string calldata version,
        CertificationLevel level,
        string calldata auditReport
    ) external;
    
    /**
     * @notice Updates the certification level of a strategy
     * @param strategy Address of the strategy contract  
     * @param newLevel New certification level
     * @dev Only callable by authorized certifiers
     */
    function updateCertification(
        address strategy,
        CertificationLevel newLevel
    ) external;
    
    /**
     * @notice Deactivates a strategy (e.g., after security incident)
     * @param strategy Address of the strategy contract
     * @param reason Reason for deactivation
     * @dev Only callable by governance
     */
    function deactivateStrategy(
        address strategy,
        string calldata reason
    ) external;
}




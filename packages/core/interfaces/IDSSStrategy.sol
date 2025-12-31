// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDSSStrategy
 * @notice Core interface that all DSS-compliant strategies must implement
 * @dev This interface defines the minimum requirements for DSS certification (DSS-1 to DSS-11)
 */
interface IDSSStrategy {
    // ============ Events ============
    
    /// @notice Emitted when strategy is rebalanced
    /// @param timestamp Time of rebalance
    /// @param oldWeights Previous asset weights
    /// @param newWeights New asset weights
    event Rebalanced(uint256 indexed timestamp, uint256[] oldWeights, uint256[] newWeights);
    
    /// @notice Emitted when an asset is added or removed
    /// @param asset Address of the asset
    /// @param added True if added, false if removed
    event AssetUpdated(address indexed asset, bool added);
    
    // ============ View Functions ============
    
    /**
     * @notice Returns the list of supported assets
     * @return assets Array of asset addresses
     * @dev Required for DSS-5 (Integration Tests)
     */
    function getAssets() external view returns (address[] memory assets);
    
    /**
     * @notice Calculates target weights for each asset
     * @return weights Array of weights in basis points (sum must equal 10000)
     * @dev Required for DSS-1 (Core Strategy Tests)
     * @dev Required for DSS-2 (Economic Invariants): sum(weights) == 10000
     */
    function calculateWeights() external view returns (uint256[] memory weights);
    
    /**
     * @notice Returns the timestamp of the last rebalance
     * @return timestamp Unix timestamp of last rebalance
     * @dev Required for DSS-3 (Trigger & Timing Tests)
     */
    function lastRebalance() external view returns (uint256 timestamp);
    
    /**
     * @notice Returns the minimum interval between rebalances
     * @return interval Minimum rebalance interval in seconds
     * @dev Required for DSS-3 (Trigger & Timing Tests)
     */
    function rebalanceInterval() external view returns (uint256 interval);
    
    /**
     * @notice Checks if strategy should be rebalanced based on trigger conditions
     * @return shouldRebalance True if rebalance is needed
     * @dev Required for DSS-3 (Trigger & Timing Tests)
     */
    function shouldRebalance() external view returns (bool shouldRebalance);
    
    // ============ State-Changing Functions ============
    
    /**
     * @notice Executes rebalancing to match target weights
     * @dev Required for DSS-5 (Integration Tests)
     * @dev Must respect cooldown period (DSS-3)
     * @dev Must enforce slippage limits (DSS-4)
     * @dev Must emit Rebalanced event
     */
    function rebalance() external;
}




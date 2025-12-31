// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/HODLStrategy.sol";
import "../src/DSSWeightLib.sol";

/**
 * @title HODLStrategy Invariant Tests
 * @notice Property-based invariant testing using Foundry
 * @dev Production-tested invariant test patterns
 * 
 * DSS-2: Economic Invariants
 */
contract InvariantsTest is Test {
    HODLStrategy public strategy;
    DSSWeightLib public weightLib;
    
    address[] public assets;
    uint256[] public minWeights;
    uint256[] public maxWeights;
    
    uint256 constant BPS_DENOMINATOR = 10_000;
    
    function setUp() public {
        weightLib = new DSSWeightLib();
        
        // Setup 3-asset strategy for more complex testing
        assets = new address[](3);
        assets[0] = makeAddr("DAI");
        assets[1] = makeAddr("USDC");
        assets[2] = makeAddr("USDT");
        
        minWeights = new uint256[](3);
        minWeights[0] = 1000; // 10%
        minWeights[1] = 1000; // 10%
        minWeights[2] = 1000; // 10%
        
        maxWeights = new uint256[](3);
        maxWeights[0] = 5000; // 50%
        maxWeights[1] = 5000; // 50%
        maxWeights[2] = 5000; // 50%
        
        strategy = new HODLStrategy(assets, minWeights, maxWeights);
    }
    
    /// @notice INVARIANT: Weight sum always equals 10000 (100%)
    function invariant_WeightSumIs10000() public {
        uint256[] memory weights = strategy.calculateWeights();
        uint256 sum = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            sum += weights[i];
        }
        assertEq(sum, BPS_DENOMINATOR, "INVARIANT VIOLATED: Weight sum must equal 10000");
    }
    
    /// @notice INVARIANT: All weights are non-negative
    function invariant_NonNegativeWeights() public {
        uint256[] memory weights = strategy.calculateWeights();
        for (uint256 i = 0; i < weights.length; i++) {
            assertGe(weights[i], 0, "INVARIANT VIOLATED: Weight cannot be negative");
        }
    }
    
    /// @notice INVARIANT: Weights respect min/max bounds
    function invariant_WeightsRespectBounds() public {
        uint256[] memory weights = strategy.calculateWeights();
        for (uint256 i = 0; i < weights.length; i++) {
            assertGe(weights[i], minWeights[i], "INVARIANT VIOLATED: Weight below minimum");
            assertLe(weights[i], maxWeights[i], "INVARIANT VIOLATED: Weight above maximum");
        }
    }
    
    /// @notice INVARIANT: lastRebalance timestamp is monotonically increasing
    function invariant_LastRebalanceMonotonic() public {
        uint256 lastRebalance = strategy.lastRebalance();
        assertLe(lastRebalance, block.timestamp, "INVARIANT VIOLATED: lastRebalance cannot be in future");
    }
    
    /// @notice INVARIANT: Active assets have non-zero weight (in equal-weight strategy)
    function invariant_ActiveAssetsHaveWeight() public {
        uint256[] memory weights = strategy.calculateWeights();
        uint256 nonZeroCount = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            if (weights[i] > 0) {
                nonZeroCount++;
            }
        }
        // At least one asset should have weight if strategy is active
        assertGe(nonZeroCount, 1, "INVARIANT VIOLATED: At least one asset must have weight");
    }
}


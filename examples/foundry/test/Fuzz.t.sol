// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/HODLStrategy.sol";
import "../src/DSSWeightLib.sol";

/**
 * @title HODLStrategy Fuzz Tests
 * @notice Fuzz testing using Foundry's built-in fuzzer
 * @dev Production-tested fuzzing patterns
 * 
 * DSS-7: Stress Tests & Fuzzing
 */
contract FuzzTest is Test {
    DSSWeightLib public weightLib;
    
    uint256 constant BPS_DENOMINATOR = 10_000;
    uint256 constant MAX_ASSETS = 10;
    
    function setUp() public {
        weightLib = new DSSWeightLib();
    }
    
    /// @notice Fuzz test: Weight sum invariant holds for any valid asset count
    function testFuzz_WeightSumInvariant(uint8 assetCount) public {
        // Bound to reasonable range
        assetCount = uint8(bound(assetCount, 2, MAX_ASSETS));
        
        // Generate assets
        address[] memory assets = new address[](assetCount);
        uint256[] memory minWeights = new uint256[](assetCount);
        uint256[] memory maxWeights = new uint256[](assetCount);
        
        for (uint256 i = 0; i < assetCount; i++) {
            assets[i] = makeAddr(string(abi.encodePacked("asset", i)));
            minWeights[i] = 0;
            maxWeights[i] = BPS_DENOMINATOR;
        }
        
        HODLStrategy strategy = new HODLStrategy(assets, minWeights, maxWeights);
        uint256[] memory weights = strategy.calculateWeights();
        
        // INVARIANT: Sum must equal 10000
        uint256 sum = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            sum += weights[i];
        }
        assertEq(sum, BPS_DENOMINATOR, "Fuzz: Weight sum must equal 10000");
    }
    
    /// @notice Fuzz test: Weights respect random min/max bounds
    function testFuzz_BoundsRespected(
        uint16 minWeight1,
        uint16 maxWeight1,
        uint16 minWeight2,
        uint16 maxWeight2
    ) public {
        // Ensure min <= max for each asset
        minWeight1 = uint16(bound(minWeight1, 0, 3000));
        maxWeight1 = uint16(bound(maxWeight1, minWeight1, BPS_DENOMINATOR));
        
        minWeight2 = uint16(bound(minWeight2, 0, 3000));
        maxWeight2 = uint16(bound(maxWeight2, minWeight2, BPS_DENOMINATOR));
        
        // Create strategy
        address[] memory assets = new address[](2);
        assets[0] = makeAddr("asset1");
        assets[1] = makeAddr("asset2");
        
        uint256[] memory minWeights = new uint256[](2);
        minWeights[0] = minWeight1;
        minWeights[1] = minWeight2;
        
        uint256[] memory maxWeights = new uint256[](2);
        maxWeights[0] = maxWeight1;
        maxWeights[1] = maxWeight2;
        
        HODLStrategy strategy = new HODLStrategy(assets, minWeights, maxWeights);
        uint256[] memory weights = strategy.calculateWeights();
        
        // INVARIANT: Weights respect bounds
        assertGe(weights[0], minWeights[0], "Fuzz: Weight 0 below min");
        assertLe(weights[0], maxWeights[0], "Fuzz: Weight 0 above max");
        assertGe(weights[1], minWeights[1], "Fuzz: Weight 1 below min");
        assertLe(weights[1], maxWeights[1], "Fuzz: Weight 1 above max");
        
        // INVARIANT: Sum equals 10000
        assertEq(weights[0] + weights[1], BPS_DENOMINATOR, "Fuzz: Sum must equal 10000");
    }
    
    /// @notice Fuzz test: Rebalance interval updates are valid
    function testFuzz_RebalanceIntervalUpdate(uint32 interval) public {
        // Bound to valid range (1 hour to 30 days)
        interval = uint32(bound(interval, 1 hours, 30 days));
        
        address[] memory assets = new address[](2);
        assets[0] = makeAddr("asset1");
        assets[1] = makeAddr("asset2");
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = 0;
        weights[1] = 0;
        
        uint256[] memory maxWeights = new uint256[](2);
        maxWeights[0] = BPS_DENOMINATOR;
        maxWeights[1] = BPS_DENOMINATOR;
        
        HODLStrategy strategy = new HODLStrategy(assets, weights, maxWeights);
        strategy.setRebalanceInterval(interval);
        
        assertEq(strategy.rebalanceInterval(), interval, "Fuzz: Interval should update");
    }
    
    /// @notice Fuzz test: Time-based rebalance trigger works correctly
    function testFuzz_RebalanceTrigger(uint32 timeElapsed) public {
        timeElapsed = uint32(bound(timeElapsed, 0, 60 days));
        
        address[] memory assets = new address[](2);
        assets[0] = makeAddr("asset1");
        assets[1] = makeAddr("asset2");
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = 0;
        weights[1] = 0;
        
        uint256[] memory maxWeights = new uint256[](2);
        maxWeights[0] = BPS_DENOMINATOR;
        maxWeights[1] = BPS_DENOMINATOR;
        
        HODLStrategy strategy = new HODLStrategy(assets, weights, maxWeights);
        uint256 interval = strategy.rebalanceInterval();
        
        vm.warp(block.timestamp + timeElapsed);
        
        bool should = strategy.shouldRebalance();
        
        if (timeElapsed >= interval) {
            assertTrue(should, "Fuzz: Should rebalance after interval");
        } else {
            assertFalse(should, "Fuzz: Should not rebalance before interval");
        }
    }
}


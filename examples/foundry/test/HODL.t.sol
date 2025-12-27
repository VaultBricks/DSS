// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/HODLStrategy.sol";
import "../src/DSSWeightLib.sol";

/**
 * @title HODLStrategy Foundry Tests
 * @notice Core functionality tests using Foundry test framework
 * @dev Adapted from BOLD-APEX testing patterns
 * 
 * DSS-1: Core Strategy Tests
 */
contract HODLTest is Test {
    HODLStrategy public strategy;
    DSSWeightLib public weightLib;
    
    address public owner;
    address public keeper;
    address public user;
    
    address[] public assets;
    uint256[] public minWeights;
    uint256[] public maxWeights;
    
    uint256 constant BPS_DENOMINATOR = 10_000;
    
    function setUp() public {
        owner = address(this);
        keeper = makeAddr("keeper");
        user = makeAddr("user");
        
        // Deploy library
        weightLib = new DSSWeightLib();
        
        // Setup 2-asset strategy
        assets = new address[](2);
        assets[0] = makeAddr("DAI");
        assets[1] = makeAddr("USDC");
        
        minWeights = new uint256[](2);
        minWeights[0] = 2000; // 20%
        minWeights[1] = 3000; // 30%
        
        maxWeights = new uint256[](2);
        maxWeights[0] = 6000; // 60%
        maxWeights[1] = 7000; // 70%
        
        strategy = new HODLStrategy(assets, minWeights, maxWeights);
    }
    
    // ========== Deployment Tests ==========
    
    function test_DeploymentSuccess() public {
        address[] memory retrievedAssets = strategy.getAssets();
        assertEq(retrievedAssets.length, 2);
        assertEq(retrievedAssets[0], assets[0]);
        assertEq(retrievedAssets[1], assets[1]);
    }
    
    function testFail_DeploymentNoAssets() public {
        address[] memory emptyAssets = new address[](0);
        uint256[] memory emptyWeights = new uint256[](0);
        new HODLStrategy(emptyAssets, emptyWeights, emptyWeights);
    }
    
    function testFail_DeploymentMismatchedArrays() public {
        address[] memory a = new address[](2);
        uint256[] memory w1 = new uint256[](2);
        uint256[] memory w2 = new uint256[](1); // Wrong length
        new HODLStrategy(a, w1, w2);
    }
    
    // ========== Weight Calculation Tests ==========
    
    function test_CalculateEqualWeights() public {
        uint256[] memory weights = strategy.calculateWeights();
        
        // Should be 50/50 split
        assertEq(weights[0], 5000, "First asset should be 50%");
        assertEq(weights[1], 5000, "Second asset should be 50%");
        
        // Sum should equal 100%
        uint256 sum = weights[0] + weights[1];
        assertEq(sum, BPS_DENOMINATOR, "Weight sum must equal 10000");
    }
    
    function test_WeightSumInvariant() public {
        uint256[] memory weights = strategy.calculateWeights();
        uint256 sum = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            sum += weights[i];
        }
        assertEq(sum, BPS_DENOMINATOR, "INVARIANT: Weight sum must equal 10000");
    }
    
    function test_NonNegativeWeights() public {
        uint256[] memory weights = strategy.calculateWeights();
        for (uint256 i = 0; i < weights.length; i++) {
            assertGe(weights[i], 0, "INVARIANT: All weights must be non-negative");
        }
    }
    
    function test_RespectMinMaxBounds() public {
        uint256[] memory weights = strategy.calculateWeights();
        assertGe(weights[0], minWeights[0], "Weight 0 below minimum");
        assertLe(weights[0], maxWeights[0], "Weight 0 above maximum");
        assertGe(weights[1], minWeights[1], "Weight 1 below minimum");
        assertLe(weights[1], maxWeights[1], "Weight 1 above maximum");
    }
    
    // ========== Access Control Tests ==========
    
    function test_AdminCanDeactivateAsset() public {
        strategy.setAssetActive(1, false);
        
        uint256[] memory weights = strategy.calculateWeights();
        assertEq(weights[0], BPS_DENOMINATOR, "First asset should get 100%");
        assertEq(weights[1], 0, "Second asset should be 0%");
    }
    
    function testFail_NonAdminCannotDeactivateAsset() public {
        vm.prank(user);
        strategy.setAssetActive(1, false);
    }
    
    function test_AdminCanUpdateRebalanceInterval() public {
        uint256 newInterval = 12 hours;
        strategy.setRebalanceInterval(newInterval);
        assertEq(strategy.rebalanceInterval(), newInterval);
    }
    
    // ========== Rebalance Timing Tests (DSS-3) ==========
    
    function test_ShouldNotRebalanceImmediately() public {
        bool should = strategy.shouldRebalance();
        assertFalse(should, "Should not allow immediate rebalance");
    }
    
    function test_ShouldRebalanceAfterCooldown() public {
        // Fast forward 24 hours + 1 second
        vm.warp(block.timestamp + 24 hours + 1);
        
        bool should = strategy.shouldRebalance();
        assertTrue(should, "Should allow rebalance after cooldown");
    }
    
    function testFail_RebalanceBeforeCooldown() public {
        strategy.grantKeeperRole(keeper);
        
        vm.prank(keeper);
        strategy.rebalance(); // Should fail
    }
    
    function test_RebalanceAfterCooldown() public {
        strategy.grantKeeperRole(keeper);
        
        vm.warp(block.timestamp + 24 hours + 1);
        
        vm.prank(keeper);
        strategy.rebalance(); // Should succeed
        
        assertEq(strategy.lastRebalance(), block.timestamp, "lastRebalance should update");
    }
    
    // ========== Pause Tests (DSS-4) ==========
    
    function test_PausePreventRebalance() public {
        strategy.grantGuardianRole(owner);
        strategy.grantKeeperRole(keeper);
        
        strategy.pause();
        
        vm.warp(block.timestamp + 24 hours + 1);
        
        vm.prank(keeper);
        vm.expectRevert("Pausable: paused");
        strategy.rebalance();
    }
    
    function test_UnpauseAllowsRebalance() public {
        strategy.grantGuardianRole(owner);
        strategy.grantKeeperRole(keeper);
        
        strategy.pause();
        strategy.unpause();
        
        vm.warp(block.timestamp + 24 hours + 1);
        
        vm.prank(keeper);
        strategy.rebalance(); // Should succeed
    }
}


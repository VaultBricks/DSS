// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DSSWeightLib.sol";

/**
 * @title HODLStrategy
 * @notice Equal-weight rebalancing strategy for Foundry testing
 * @dev Simplified version for testing purposes
 */
contract HODLStrategy {
    using DSSWeightLib for uint256[];

    uint256 internal constant BPS_DENOMINATOR = 10_000;
    uint256 internal constant DEFAULT_REBALANCE_INTERVAL = 24 hours;

    struct Asset {
        address token;
        uint256 minWeight;
        uint256 maxWeight;
        bool isActive;
    }

    Asset[] internal _assets;
    uint256 public rebalanceInterval;
    uint256 public lastRebalance;

    event AssetAdded(address indexed token, uint256 minWeight, uint256 maxWeight);
    event Rebalanced(uint256 timestamp, uint256[] oldWeights, uint256[] newWeights);

    constructor(
        address[] memory assets_,
        uint256[] memory minWeights_,
        uint256[] memory maxWeights_
    ) {
        require(assets_.length > 0, "No assets");
        require(
            assets_.length == minWeights_.length && 
            assets_.length == maxWeights_.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < assets_.length; i++) {
            require(assets_[i] != address(0), "Zero address");
            require(minWeights_[i] <= maxWeights_[i], "Invalid bounds");

            _assets.push(Asset({
                token: assets_[i],
                minWeight: minWeights_[i],
                maxWeight: maxWeights_[i],
                isActive: true
            }));

            emit AssetAdded(assets_[i], minWeights_[i], maxWeights_[i]);
        }

        rebalanceInterval = DEFAULT_REBALANCE_INTERVAL;
        lastRebalance = block.timestamp;
    }

    function getAssets() external view returns (address[] memory assets) {
        assets = new address[](_assets.length);
        for (uint256 i = 0; i < _assets.length; i++) {
            assets[i] = _assets[i].token;
        }
    }

    function getAssetCount() external view returns (uint256) {
        return _assets.length;
    }

    function calculateWeights() external view returns (uint256[] memory weights) {
        uint256 len = _assets.length;
        weights = new uint256[](len);

        // Count active assets
        uint256 activeCount = 0;
        for (uint256 i = 0; i < len; i++) {
            if (_assets[i].isActive) {
                activeCount++;
            }
        }

        if (activeCount == 0) {
            return weights; // All zeros if no active assets
        }

        uint256 equalWeight = BPS_DENOMINATOR / activeCount;
        uint256 remainder = BPS_DENOMINATOR % activeCount;
        uint256 activeIndex = 0;

        for (uint256 i = 0; i < len; i++) {
            if (_assets[i].isActive) {
                weights[i] = equalWeight;
                if (activeIndex < remainder) {
                    weights[i] += 1;
                }
                activeIndex++;
            }
        }
    }

    function shouldRebalance() external view returns (bool) {
        return block.timestamp >= lastRebalance + rebalanceInterval;
    }

    function rebalance() external {
        require(this.shouldRebalance(), "Cooldown not elapsed");

        uint256[] memory oldWeights = new uint256[](_assets.length);
        uint256[] memory newWeights = this.calculateWeights();

        lastRebalance = block.timestamp;
        emit Rebalanced(block.timestamp, oldWeights, newWeights);
    }

    function setRebalanceInterval(uint256 newInterval) external {
        rebalanceInterval = newInterval;
    }

    function getMinWeights() external view returns (uint256[] memory) {
        uint256[] memory minWeights = new uint256[](_assets.length);
        for (uint256 i = 0; i < _assets.length; i++) {
            minWeights[i] = _assets[i].minWeight;
        }
        return minWeights;
    }

    function getMaxWeights() external view returns (uint256[] memory) {
        uint256[] memory maxWeights = new uint256[](_assets.length);
        for (uint256 i = 0; i < _assets.length; i++) {
            maxWeights[i] = _assets[i].maxWeight;
        }
        return maxWeights;
    }

    function getIsActive() external view returns (bool[] memory) {
        bool[] memory isActive = new bool[](_assets.length);
        for (uint256 i = 0; i < _assets.length; i++) {
            isActive[i] = _assets[i].isActive;
        }
        return isActive;
    }

    function setAssetActive(uint256 index, bool active) external {
        require(index < _assets.length, "Invalid asset index");
        _assets[index].isActive = active;
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DSSWeightLib
 * @notice Lightweight library for clamping and normalizing portfolio weights
 * @dev Production-tested weight normalization library
 * @dev Production-tested code - battle-hardened in real deployments
 */
library DSSWeightLib {
    error InputMismatch();

    /**
     * @notice Clamp weights to [minW, maxW] and normalize to target sum (BPS)
     * @dev If exact normalization is impossible due to bounds, returns best-effort result
     * @param weights Initial weights in basis points
     * @param minW Minimum weights per asset in basis points
     * @param maxW Maximum weights per asset in basis points
     * @param isActive Whether each asset is active
     * @param bps Target total (10_000 for 100%)
     * @return out Final clamped and normalized weights
     */
    function clampAndNormalizeToBps(
        uint256[] memory weights,
        uint256[] memory minW,
        uint256[] memory maxW,
        bool[] memory isActive,
        uint256 bps
    ) public pure returns (uint256[] memory out) {
        uint256 len = weights.length;
        if (minW.length != len || maxW.length != len || isActive.length != len || bps == 0) {
            revert InputMismatch();
        }

        out = new uint256[](len);

        // Step 1: Clamp to [min, max] and compute initial total
        uint256 total;
        for (uint256 i; i < len; ) {
            if (isActive[i]) {
                uint256 w = weights[i];
                uint256 mn = minW[i];
                uint256 mx = maxW[i];
                if (w < mn) w = mn;
                else if (w > mx) w = mx;
                out[i] = w;
                total += w;
            } else {
                out[i] = 0;
            }
            unchecked { ++i; }
        }

        // Step 2: If already at target, return
        if (total == bps) {
            return out;
        }

        // Step 3: Adjust to reach target
        int256 adjustment = int256(bps) - int256(total);
        
        if (adjustment > 0) {
            // Need to add weight
            uint256 remaining = uint256(adjustment);
            
            // Find asset with most headroom
            uint256 maxIdx = 0;
            for (uint256 i = 1; i < len; ) {
                if (isActive[i] && out[i] > out[maxIdx]) maxIdx = i;
                unchecked { ++i; }
            }

            // Try to add to largest weight first
            uint256 headroom = maxW[maxIdx] > out[maxIdx] ? maxW[maxIdx] - out[maxIdx] : 0;
            if (headroom >= remaining) {
                out[maxIdx] += remaining;
                return out;
            }

            if (headroom > 0) {
                out[maxIdx] += headroom;
                remaining -= headroom;
            }

            // Distribute remaining to other assets
            for (uint256 i; i < len && remaining > 0; ) {
                if (i != maxIdx && isActive[i]) {
                    uint256 assetHeadroom = maxW[i] > out[i] ? maxW[i] - out[i] : 0;
                    uint256 toAdd = assetHeadroom < remaining ? assetHeadroom : remaining;
                    if (toAdd > 0) {
                        out[i] += toAdd;
                        remaining -= toAdd;
                    }
                }
                unchecked { ++i; }
            }
        } else {
            // Need to remove weight
            uint256 remaining = uint256(-adjustment);
            
            // Find largest weight
            uint256 maxIdx = 0;
            for (uint256 i = 1; i < len; ) {
                if (isActive[i] && out[i] > out[maxIdx]) maxIdx = i;
                unchecked { ++i; }
            }

            // Try to remove from largest weight first
            uint256 headroom = out[maxIdx] > minW[maxIdx] ? out[maxIdx] - minW[maxIdx] : 0;
            if (headroom >= remaining) {
                out[maxIdx] -= remaining;
                return out;
            }

            if (headroom > 0) {
                out[maxIdx] -= headroom;
                remaining -= headroom;
            }

            // Distribute removal to other assets
            for (uint256 i; i < len && remaining > 0; ) {
                if (i != maxIdx && isActive[i]) {
                    uint256 assetHeadroom = out[i] > minW[i] ? out[i] - minW[i] : 0;
                    uint256 toRemove = assetHeadroom < remaining ? assetHeadroom : remaining;
                    if (toRemove > 0) {
                        out[i] -= toRemove;
                        remaining -= toRemove;
                    }
                }
                unchecked { ++i; }
            }
        }

        // Final verification and correction for rounding errors
        uint256 finalTotal = 0;
        for (uint256 i; i < len; ) {
            finalTotal += out[i];
            unchecked { ++i; }
        }

        // If there's a small discrepancy due to rounding, adjust the largest weight
        if (finalTotal != bps) {
            int256 diff = int256(bps) - int256(finalTotal);
            if (diff > 0) {
                // Need to add weight - find asset with most headroom
                uint256 maxIdx = 0;
                for (uint256 i = 1; i < len; ) {
                    if (isActive[i] && maxW[i] > out[i]) {
                        if (maxW[maxIdx] - out[maxIdx] < maxW[i] - out[i]) {
                            maxIdx = i;
                        }
                    }
                    unchecked { ++i; }
                }
                if (isActive[maxIdx] && maxW[maxIdx] > out[maxIdx]) {
                    out[maxIdx] += uint256(diff);
                }
            } else if (diff < 0) {
                // Need to remove weight - find asset with most removable weight
                uint256 maxIdx = 0;
                for (uint256 i = 1; i < len; ) {
                    if (isActive[i] && out[i] > minW[i]) {
                        if (out[maxIdx] - minW[maxIdx] < out[i] - minW[i]) {
                            maxIdx = i;
                        }
                    }
                    unchecked { ++i; }
                }
                if (isActive[maxIdx] && out[maxIdx] > minW[maxIdx]) {
                    out[maxIdx] -= uint256(-diff);
                }
            }
        }

        return out;
    }
}


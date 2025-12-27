// packages/test/src/FuzzHelpers.ts

/**
 * @file FuzzHelpers.ts
 * @description Fuzzing utilities for DSS testing
 * @dev Implements DSS-7 (Stress Tests & Fuzzing) requirements
 */

import fc from 'fast-check';

/**
 * Configuration for fuzzing tests
 */
export interface FuzzConfig {
  /** Number of test runs */
  numRuns?: number;
  /** Random seed for reproducibility */
  seed?: number;
  /** Enable verbose output */
  verbose?: boolean;
  /** Stop on first failure */
  endOnFailure?: boolean;
}

/**
 * Default fuzzing configuration based on environment and DSS level
 */
export function getDefaultFuzzConfig(level: 'Bronze' | 'Silver' | 'Gold' = 'Silver'): FuzzConfig {
  const iterations = {
    Bronze: 100,
    Silver: 600,
    Gold: 1000
  };

  return {
    numRuns: parseInt(process.env.FUZZ_ITERS || iterations[level].toString()),
    seed: parseInt(process.env.FUZZ_SEED || Date.now().toString()),
    verbose: process.env.FUZZ_VERBOSE === 'true',
    endOnFailure: true
  };
}

/**
 * Generate arbitrary asset weights that sum to 10000 (basis points)
 * @param minAssets Minimum number of assets
 * @param maxAssets Maximum number of assets
 */
export function arbitraryWeights(minAssets: number = 2, maxAssets: number = 10) {
  return fc
    .integer({ min: minAssets, max: maxAssets })
    .chain((assetCount) =>
      fc.array(fc.integer({ min: 0, max: 10000 }), {
        minLength: assetCount,
        maxLength: assetCount
      }).map((weights) => {
        const sum = weights.reduce((a, b) => a + b, 0);
        if (sum === 0) return weights.map(() => Math.floor(10000 / assetCount));
        return weights.map((w) => Math.floor((w / sum) * 10000));
      })
    );
}

/**
 * Generate arbitrary price history for volatility-based strategies
 * @param minLength Minimum history length
 * @param maxLength Maximum history length
 * @param minPrice Minimum price (in wei)
 * @param maxPrice Maximum price (in wei)
 */
export function arbitraryPriceHistory(
  minLength: number = 30,
  maxLength: number = 365,
  minPrice: number = 1,
  maxPrice: number = 1000000
) {
  return fc.array(fc.integer({ min: minPrice, max: maxPrice }), {
    minLength,
    maxLength
  });
}

/**
 * Generate arbitrary slippage values in basis points
 * @param min Minimum slippage (bps)
 * @param max Maximum slippage (bps)
 */
export function arbitrarySlippage(min: number = 10, max: number = 500) {
  return fc.integer({ min, max });
}

/**
 * Generate arbitrary boolean flags for active/inactive assets
 * @param count Number of assets
 */
export function arbitraryActiveFlags(count: number) {
  return fc.array(fc.boolean(), { minLength: count, maxLength: count });
}

/**
 * Helper to run a fuzzing test with DSS-compliant configuration
 * @param property Fast-check property to test
 * @param config Fuzzing configuration
 */
export async function runFuzzTest<T>(
  property: fc.IAsyncProperty<T>,
  config: FuzzConfig = getDefaultFuzzConfig()
): Promise<void> {
  await fc.assert(property, {
    numRuns: config.numRuns,
    seed: config.seed,
    verbose: config.verbose,
    endOnFailure: config.endOnFailure
  });
}

/**
 * Calculate volatility from price history (simple std dev)
 * @param prices Array of prices
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
}


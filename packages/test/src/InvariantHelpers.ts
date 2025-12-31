/**
 * Invariant Testing Helpers
 * 
 * Production-tested invariant testing utilities
 * Provides common invariant checks for DSS strategies
 * 
 * @module InvariantHelpers
 */

/**
 * Check value conservation (with slippage tolerance)
 * 
 * @param before - Portfolio value before operation
 * @param after - Portfolio value after operation
 * @param slippageBps - Maximum allowed slippage in basis points (default: 50 = 0.5%)
 * @throws {Error} If value loss exceeds slippage tolerance
 */
export function checkValueConservation(
  before: bigint,
  after: bigint,
  slippageBps: bigint = 50n
): void {
  const BPS_DENOMINATOR = 10_000n;
  
  if (after > before) {
    // Value increased - this is fine (could be yield or price appreciation)
    return;
  }
  
  const loss = before - after;
  const lossPercentage = (loss * BPS_DENOMINATOR) / before;
  
  if (lossPercentage > slippageBps) {
    throw new Error(
      `Value conservation violated: Lost ${lossPercentage} bps, max allowed: ${slippageBps} bps. ` +
      `Before: ${before}, After: ${after}, Loss: ${loss}`
    );
  }
}

/**
 * Check share price monotonicity
 * 
 * Share price should never decrease (except for slippage during rebalances)
 * 
 * @param prices - Array of share prices over time
 * @param allowedDecreaseBps - Maximum allowed decrease in bps (default: 10 = 0.1%)
 * @throws {Error} If price decrease exceeds threshold
 */
export function checkSharePriceMonotonicity(
  prices: bigint[],
  allowedDecreaseBps: bigint = 10n
): void {
  const BPS_DENOMINATOR = 10_000n;
  
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const curr = prices[i];
    
    if (curr >= prev) {
      // Price increased or stayed same - OK
      continue;
    }
    
    // Price decreased - check if within tolerance
    const decrease = prev - curr;
    const decreasePercentage = (decrease * BPS_DENOMINATOR) / prev;
    
    if (decreasePercentage > allowedDecreaseBps) {
      throw new Error(
        `Share price monotonicity violated at index ${i}: ` +
        `Decreased by ${decreasePercentage} bps, max allowed: ${allowedDecreaseBps} bps. ` +
        `Previous: ${prev}, Current: ${curr}`
      );
    }
  }
}

/**
 * Check weight sum invariant
 * 
 * @param weights - Array of weights in basis points
 * @param expectedSum - Expected sum (default: 10000 = 100%)
 * @throws {Error} If weight sum does not equal expected value
 */
export function checkWeightSum(
  weights: bigint[],
  expectedSum: bigint = 10_000n
): void {
  const sum = weights.reduce((acc, w) => acc + w, 0n);
  
  if (sum !== expectedSum) {
    throw new Error(
      `Weight sum invariant violated: Sum is ${sum}, expected ${expectedSum}. ` +
      `Weights: [${weights.join(', ')}]`
    );
  }
}

/**
 * Check that all weights are non-negative
 * 
 * @param weights - Array of weights
 * @throws {Error} If any weight is negative
 */
export function checkNonNegativeWeights(weights: bigint[]): void {
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] < 0n) {
      throw new Error(
        `Non-negative weight invariant violated at index ${i}: ` +
        `Weight is ${weights[i]} (negative)`
      );
    }
  }
}

/**
 * Check that weights respect min/max bounds
 * 
 * @param weights - Array of weights
 * @param minWeights - Array of minimum weights
 * @param maxWeights - Array of maximum weights
 * @throws {Error} If any weight violates bounds
 */
export function checkWeightBounds(
  weights: bigint[],
  minWeights: bigint[],
  maxWeights: bigint[]
): void {
  if (weights.length !== minWeights.length || weights.length !== maxWeights.length) {
    throw new Error('Array length mismatch in weight bounds check');
  }
  
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] < minWeights[i]) {
      throw new Error(
        `Weight bounds violated at index ${i}: ` +
        `Weight ${weights[i]} is below minimum ${minWeights[i]}`
      );
    }
    
    if (weights[i] > maxWeights[i]) {
      throw new Error(
        `Weight bounds violated at index ${i}: ` +
        `Weight ${weights[i]} is above maximum ${maxWeights[i]}`
      );
    }
  }
}

/**
 * Check timestamp monotonicity
 * 
 * @param timestamps - Array of timestamps
 * @throws {Error} If any timestamp is not monotonically increasing
 */
export function checkTimestampMonotonicity(timestamps: bigint[]): void {
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] < timestamps[i - 1]) {
      throw new Error(
        `Timestamp monotonicity violated at index ${i}: ` +
        `Current timestamp ${timestamps[i]} is less than previous ${timestamps[i - 1]}`
      );
    }
  }
}

/**
 * Check that total shares equals sum of individual user shares
 * 
 * @param totalShares - Total shares in strategy
 * @param userShares - Array of individual user share balances
 * @throws {Error} If total does not match sum
 */
export function checkShareAccountingInvariant(
  totalShares: bigint,
  userShares: bigint[]
): void {
  const sum = userShares.reduce((acc, s) => acc + s, 0n);
  
  if (sum !== totalShares) {
    throw new Error(
      `Share accounting invariant violated: ` +
      `Total shares ${totalShares} does not match sum of user shares ${sum}`
    );
  }
}

/**
 * Seedable PRNG (Mulberry32)
 * Seedable PRNG for reproducible random testing
 * 
 * @param seed - Initial seed value (default: from env or Date.now())
 * @returns Function that generates random numbers in [0, 1)
 */
export function makeRng(seed?: number): () => number {
  let state = seed ?? (process.env.RANDOM_SEED ? parseInt(process.env.RANDOM_SEED) : Date.now());
  
  return function mulberry32() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


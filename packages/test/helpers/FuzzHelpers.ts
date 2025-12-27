import fc from 'fast-check';

/**
 * Fuzzing Helpers for DSS Testing
 * 
 * Adapted from BOLD-APEX fuzzing utilities
 * Provides arbitraries for property-based testing
 * 
 * @module FuzzHelpers
 */

/**
 * Generate arbitrary asset count
 * 
 * @param min - Minimum number of assets (default: 1)
 * @param max - Maximum number of assets (default: 10)
 * @returns fast-check arbitrary for asset count
 */
export function arbitraryAssetCount(min: number = 1, max: number = 10) {
  return fc.integer({ min, max });
}

/**
 * Generate arbitrary weight bounds (min/max)
 * Ensures min <= max
 * 
 * @returns fast-check arbitrary for weight bounds
 */
export function arbitraryWeightBounds() {
  return fc
    .record({
      minWeight: fc.integer({ min: 0, max: 3000 }), // 0-30%
      maxWeight: fc.integer({ min: 0, max: 10000 }) // 0-100%
    })
    .filter(({ minWeight, maxWeight }) => minWeight <= maxWeight);
}

/**
 * Generate arbitrary weight bounds array
 * 
 * @param length - Number of assets
 * @returns fast-check arbitrary for array of weight bounds
 */
export function arbitraryWeightBoundsArray(length: number) {
  return fc.array(arbitraryWeightBounds(), { minLength: length, maxLength: length });
}

/**
 * Generate arbitrary price (positive, reasonable range)
 * 
 * @param minPrice - Minimum price in wei (default: 1e15 = 0.001 ETH)
 * @param maxPrice - Maximum price in wei (default: 1e21 = 1000 ETH)
 * @returns fast-check arbitrary for price
 */
export function arbitraryPrice(
  minPrice: bigint = 1_000_000_000_000_000n, // 0.001 ETH
  maxPrice: bigint = 1_000_000_000_000_000_000_000n // 1000 ETH
) {
  return fc.bigInt({ min: minPrice, max: maxPrice });
}

/**
 * Generate arbitrary price sequence (for backtesting/simulation)
 * Simulates realistic price movements with volatility
 * 
 * Adapted from BOLD-APEX meanreversion.fuzz.spec.ts
 * 
 * @param length - Number of price points
 * @param startPrice - Starting price (default: 1e18 = 1 USD)
 * @param volatility - Daily volatility (default: 0.1 = 10%)
 * @returns fast-check arbitrary for price sequence
 */
export function arbitraryPriceSequence(
  length: number,
  startPrice: number = 1e18,
  volatility: number = 0.1
) {
  return fc.array(fc.integer({ min: -100, max: 100 }), { minLength: length, maxLength: length })
    .map((returns) => {
      const prices: bigint[] = [BigInt(Math.floor(startPrice))];
      
      for (let i = 0; i < returns.length; i++) {
        // Convert return percentage to price change
        const returnPct = (returns[i] / 100) * volatility; // Scale to volatility
        const prevPrice = Number(prices[i]);
        const newPrice = prevPrice * (1 + returnPct);
        
        // Ensure price stays positive
        prices.push(BigInt(Math.floor(Math.max(newPrice, 1))));
      }
      
      return prices;
    });
}

/**
 * Generate arbitrary amount (for deposits/withdrawals)
 * 
 * @param minAmount - Minimum amount (default: 1e6 = 1 USDC)
 * @param maxAmount - Maximum amount (default: 1e24 = 1M tokens with 18 decimals)
 * @returns fast-check arbitrary for amount
 */
export function arbitraryAmount(
  minAmount: bigint = 1_000_000n, // 1 USDC
  maxAmount: bigint = 1_000_000_000_000_000_000_000_000n // 1M tokens
) {
  return fc.bigInt({ min: minAmount, max: maxAmount });
}

/**
 * Generate arbitrary time interval (seconds)
 * 
 * @param minSeconds - Minimum interval (default: 1 hour)
 * @param maxSeconds - Maximum interval (default: 30 days)
 * @returns fast-check arbitrary for time interval
 */
export function arbitraryTimeInterval(
  minSeconds: number = 3600, // 1 hour
  maxSeconds: number = 2_592_000 // 30 days
) {
  return fc.integer({ min: minSeconds, max: maxSeconds });
}

/**
 * Generate arbitrary slippage tolerance (basis points)
 * 
 * @param minBps - Minimum slippage (default: 1 = 0.01%)
 * @param maxBps - Maximum slippage (default: 500 = 5%)
 * @returns fast-check arbitrary for slippage
 */
export function arbitrarySlippageBps(
  minBps: number = 1,
  maxBps: number = 500
) {
  return fc.integer({ min: minBps, max: maxBps });
}

/**
 * Generate arbitrary address (valid Ethereum address)
 * 
 * @returns fast-check arbitrary for Ethereum address
 */
export function arbitraryAddress() {
  return fc.hexaString({ minLength: 40, maxLength: 40 })
    .map(hex => `0x${hex}`);
}

/**
 * Generate arbitrary boolean array (for active/inactive assets)
 * Ensures at least one true value
 * 
 * @param length - Array length
 * @returns fast-check arbitrary for boolean array with at least one true
 */
export function arbitraryActiveArray(length: number) {
  return fc.array(fc.boolean(), { minLength: length, maxLength: length })
    .filter(arr => arr.some(v => v)); // At least one active asset
}

/**
 * Generate arbitrary operation sequence for state machine testing
 * 
 * @param operations - Array of possible operations
 * @param minLength - Minimum sequence length (default: 1)
 * @param maxLength - Maximum sequence length (default: 20)
 * @returns fast-check arbitrary for operation sequence
 */
export function arbitraryOperationSequence<T>(
  operations: T[],
  minLength: number = 1,
  maxLength: number = 20
) {
  return fc.array(
    fc.constantFrom(...operations),
    { minLength, maxLength }
  );
}

/**
 * Generate arbitrary gas price (in gwei)
 * 
 * @param minGwei - Minimum gas price (default: 1 gwei)
 * @param maxGwei - Maximum gas price (default: 500 gwei)
 * @returns fast-check arbitrary for gas price
 */
export function arbitraryGasPrice(
  minGwei: number = 1,
  maxGwei: number = 500
) {
  return fc.integer({ min: minGwei, max: maxGwei })
    .map(gwei => BigInt(gwei) * 1_000_000_000n); // Convert to wei
}

/**
 * Generate arbitrary percentage (0-100%)
 * 
 * @returns fast-check arbitrary for percentage in basis points
 */
export function arbitraryPercentageBps() {
  return fc.integer({ min: 0, max: 10_000 });
}

/**
 * Generate arbitrary timestamp (Unix timestamp)
 * 
 * @param minTimestamp - Minimum timestamp (default: 2020-01-01)
 * @param maxTimestamp - Maximum timestamp (default: 2030-01-01)
 * @returns fast-check arbitrary for timestamp
 */
export function arbitraryTimestamp(
  minTimestamp: number = 1577836800, // 2020-01-01
  maxTimestamp: number = 1893456000  // 2030-01-01
) {
  return fc.integer({ min: minTimestamp, max: maxTimestamp });
}


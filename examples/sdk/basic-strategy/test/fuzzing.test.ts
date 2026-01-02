import { expect } from "chai";
import { ethers } from "hardhat";
import fc from "fast-check";

/**
 * HODLStrategy Fuzzing Tests
 * 
 * Property-based fuzzing tests
 * Tests weight calculation invariants across random inputs
 * 
 * DSS-7: Stress Tests & Fuzzing
 */
describe("HODLStrategy - Fuzzing Tests (DSS-7)", function () {
  this.timeout(600_000); // 10 minutes

  const FUZZ_ITERATIONS = process.env.FUZZ_ITERS ? parseInt(process.env.FUZZ_ITERS) : 200;
  const BPS_DENOMINATOR = 10_000;

  let HODLStrategy: any;

  before(async function () {
    this.timeout(120_000); // 2 minutes for deployment

    // Get HODLStrategy factory
    // DSSWeightLib is a library, no need to deploy separately
    HODLStrategy = await ethers.getContractFactory("HODLStrategy");
  });

  // Test 1-10 assets for comprehensive coverage
  for (const assetCount of [1, 2, 3, 5, 10]) {
    it(`should maintain weight sum = 10000 for ${assetCount} active asset(s)`, async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({
            minWeight: fc.integer({ min: 0, max: 3000 }),
            maxWeight: fc.integer({ min: 0, max: 10000 })
          }), { minLength: assetCount, maxLength: assetCount }),
          async (assetConfigs) => {
            // Ensure min <= max for each asset
            for (const config of assetConfigs) {
              if (config.minWeight > config.maxWeight) {
                [config.minWeight, config.maxWeight] = [config.maxWeight, config.minWeight];
              }
            }

            // Generate mock asset addresses
            const assets = assetConfigs.map((_, i) =>
              ethers.Wallet.createRandom().address
            );
            const minWeights = assetConfigs.map((c) => c.minWeight);
            const maxWeights = assetConfigs.map((c) => c.maxWeight);

            // Deploy strategy
            const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
            await strategy.waitForDeployment();

            // Calculate weights
            const weights = await strategy.calculateWeights();

            // Invariant 1: Weights sum to 10000
            const sum = weights.reduce((acc: bigint, w: bigint) => acc + w, 0n);
            expect(sum).to.equal(BPS_DENOMINATOR, "Weight sum must equal 10000");

            // Invariant 2: All weights are non-negative
            for (let i = 0; i < weights.length; i++) {
              expect(weights[i]).to.be.gte(0, `Weight ${i} must be non-negative`);
            }

            // Invariant 3: Weights respect min/max bounds
            for (let i = 0; i < weights.length; i++) {
              expect(weights[i]).to.be.gte(minWeights[i], `Weight ${i} below min`);
              expect(weights[i]).to.be.lte(maxWeights[i], `Weight ${i} above max`);
            }

            // Invariant 4: Active assets have non-zero weight
            // (In equal-weight strategy, all active assets should have weight > 0)
            const activeCount = assetConfigs.length;
            const nonZeroCount = weights.filter((w: bigint) => w > 0n).length;
            expect(nonZeroCount).to.equal(activeCount, "All active assets should have weight");
          }
        ),
        { numRuns: FUZZ_ITERATIONS }
      );
    });
  }

  it("should handle edge case: single asset with tight bounds", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 8000, max: 10000 }),
        fc.integer({ min: 10000, max: 10000 }),
        async (minWeight, maxWeight) => {
          const assets = [ethers.Wallet.createRandom().address];
          const minWeights = [minWeight];
          const maxWeights = [maxWeight];

          const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
          await strategy.waitForDeployment();

          const weights = await strategy.calculateWeights();

          // Single asset should get 100% (or as close as bounds allow)
          expect(weights[0]).to.equal(BPS_DENOMINATOR);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should distribute weights evenly across equal-constraint assets", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 10 }),
        async (assetCount) => {
          // All assets have same min=0, max=10000
          const assets = Array(assetCount).fill(0).map(() =>
            ethers.Wallet.createRandom().address
          );
          const minWeights = Array(assetCount).fill(0);
          const maxWeights = Array(assetCount).fill(10000);

          const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
          await strategy.waitForDeployment();

          const weights = await strategy.calculateWeights();

          // With equal constraints, should get equal (or near-equal) weights
          const expectedWeight = Math.floor(BPS_DENOMINATOR / assetCount);
          for (let i = 0; i < weights.length; i++) {
            // Allow small deviation due to remainder distribution
            expect(Number(weights[i])).to.be.closeTo(expectedWeight, 10);
          }
        }
      ),
      { numRuns: FUZZ_ITERATIONS }
    );
  });
});


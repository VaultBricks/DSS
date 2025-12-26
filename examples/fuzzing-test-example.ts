// test/fuzz/strategy.fuzz.spec.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import fc from "fast-check";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Strategy Fuzzing", () => {
  const FUZZ_ITERS = parseInt(process.env.FUZZ_ITERS || "600");

  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();
    const Diamond = await ethers.getContractFactory("Diamond");
    const diamond = await Diamond.deploy(owner.address);

    // Add strategy facet
    const HODLFacet = await ethers.getContractFactory("HODLFacet");
    const hodlFacet = await HODLFacet.deploy();
    await addFacet(diamond, hodlFacet);

    return { diamond, owner, user };
  }

  describe("Weight Calculation Properties", () => {
    it("FUZZ: weights always sum to 10000", async () => {
      const { diamond } = await loadFixture(deployFixture);

      await fc.assert(
        fc.asyncProperty(
          // Generate random asset configurations
          fc.array(
            fc.record({
              active: fc.boolean(),
              minWeight: fc.integer({ min: 0, max: 1000 }),
              maxWeight: fc.integer({ min: 5000, max: 10000 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (assetConfigs) => {
            // Setup assets
            for (let i = 0; i < assetConfigs.length; i++) {
              await diamond.configureAsset(i, assetConfigs[i]);
            }

            // Calculate weights
            const weights = await diamond.calculateInverseVolatilityWeights();

            // Property: sum equals 10000
            const sum = weights.reduce(
              (a: bigint, b: bigint) => a + b,
              BigInt(0)
            );

            return sum === BigInt(10000);
          }
        ),
        {
          numRuns: FUZZ_ITERS,
          verbose: process.env.FUZZ_VERBOSE === 'true'
        }
      );
    });

    it("FUZZ: inactive assets have zero weight", async () => {
      const { diamond } = await loadFixture(deployFixture);

      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.boolean(), { minLength: 2, maxLength: 10 }),
          async (activeFlags) => {
            // Setup assets with random active states
            for (let i = 0; i < activeFlags.length; i++) {
              await diamond.setAssetActive(i, activeFlags[i]);
            }

            const weights = await diamond.calculateInverseVolatilityWeights();

            // Property: inactive assets have zero weight
            for (let i = 0; i < activeFlags.length; i++) {
              if (!activeFlags[i] && weights[i] !== BigInt(0)) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: FUZZ_ITERS }
      );
    });
  });
});





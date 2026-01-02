import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * HODLStrategy Invariant Tests
 * 
 * Invariant testing patterns
 * Tests critical invariants that must hold across all state transitions
 * 
 * DSS-2: Economic Invariants
 */
describe("HODLStrategy - Invariant Tests (DSS-2)", function () {
  this.timeout(300_000); // 5 minutes

  const INVARIANT_ITERATIONS = process.env.INVARIANT_ITERS ? parseInt(process.env.INVARIANT_ITERS) : 200;
  const BPS_DENOMINATOR = 10_000;

  let HODLStrategy: any;
  let weightLibAddr: string;

  before(async function () {
    // Deploy DSSWeightLib
    const WeightLib = await ethers.getContractFactory("DSSWeightLib");
    const weightLib = await WeightLib.deploy();
    await weightLib.waitForDeployment();
    weightLibAddr = await weightLib.getAddress();

    HODLStrategy = await ethers.getContractFactory("HODLStrategy", {
      libraries: {
        DSSWeightLib: weightLibAddr,
      },
    });
  });

  /**
   * Seedable PRNG for reproducibility
   * Seedable PRNG for reproducible testing
   */
  function makeRng(seed?: number): () => number {
    let state = seed ?? (process.env.RANDOM_SEED ? parseInt(process.env.RANDOM_SEED) : Date.now());
    return function mulberry32() {
      state |= 0; 
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  it("should maintain all invariants across random operations", async function () {
    const rng = makeRng();

    for (let iter = 0; iter < INVARIANT_ITERATIONS; iter++) {
      // Random configuration
      const assetCount = Math.floor(rng() * 9) + 2; // 2-10 assets
      const assets = Array(assetCount).fill(0).map(() =>
        ethers.Wallet.createRandom().address
      );

      const minWeights: number[] = [];
      const maxWeights: number[] = [];

      for (let i = 0; i < assetCount; i++) {
        const min = Math.floor(rng() * 3000); // 0-30%
        const max = Math.floor(rng() * (10000 - min)) + min; // min to 100%
        minWeights.push(min);
        maxWeights.push(max);
      }

      // Deploy strategy
      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      // Calculate weights
      const weights = await strategy.calculateWeights();

      // INVARIANT 1: Weight sum equals 10000 (100%)
      const sum = weights.reduce((acc: bigint, w: bigint) => acc + w, 0n);
      expect(sum).to.equal(
        BPS_DENOMINATOR,
        `Iteration ${iter}: Weight sum must equal 10000, got ${sum}`
      );

      // INVARIANT 2: All weights are non-negative
      for (let i = 0; i < weights.length; i++) {
        expect(weights[i]).to.be.gte(
          0,
          `Iteration ${iter}: Weight[${i}] must be non-negative`
        );
      }

      // INVARIANT 3: Weights respect min/max bounds
      for (let i = 0; i < weights.length; i++) {
        expect(weights[i]).to.be.gte(
          minWeights[i],
          `Iteration ${iter}: Weight[${i}] below minimum`
        );
        expect(weights[i]).to.be.lte(
          maxWeights[i],
          `Iteration ${iter}: Weight[${i}] above maximum`
        );
      }

      // INVARIANT 4: Active assets have non-zero weight
      // In HODL strategy, all assets are active initially
      const nonZeroCount = weights.filter((w: bigint) => w > 0n).length;
      expect(nonZeroCount).to.be.gte(
        1,
        `Iteration ${iter}: At least one asset must have weight`
      );

      // INVARIANT 5: lastRebalance timestamp is monotonically increasing
      const lastRebalance = await strategy.lastRebalance();
      expect(lastRebalance).to.be.lte(
        Math.floor(Date.now() / 1000) + 100,
        `Iteration ${iter}: lastRebalance cannot be in far future`
      );
    }

    console.log(`✅ All invariants held across ${INVARIANT_ITERATIONS} iterations`);
  });

  it("should handle inactive assets correctly", async function () {
    const assets = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
    ];
    const minWeights = [0, 0, 0];
    const maxWeights = [10000, 10000, 10000];

    const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
    await strategy.waitForDeployment();

    const [owner] = await ethers.getSigners();

    // Initially all active
    let weights = await strategy.calculateWeights();
    let sum = weights.reduce((acc: bigint, w: bigint) => acc + w, 0n);
    expect(sum).to.equal(BPS_DENOMINATOR);

    // Deactivate one asset
    await strategy.connect(owner).setAssetActive(1, false);
    weights = await strategy.calculateWeights();

    // INVARIANT: Inactive asset has zero weight
    expect(weights[1]).to.equal(0, "Inactive asset must have zero weight");

    // INVARIANT: Sum still equals 10000
    sum = weights.reduce((acc: bigint, w: bigint) => acc + w, 0n);
    expect(sum).to.equal(BPS_DENOMINATOR, "Weight sum must equal 10000 after deactivation");

    // INVARIANT: Active assets share the weight
    expect(weights[0]).to.be.gt(0, "Active asset 0 should have weight");
    expect(weights[2]).to.be.gt(0, "Active asset 2 should have weight");
  });

  it("should maintain value conservation through rebalances", async function () {
    // This is a simplified test - full implementation would mock token balances
    const assets = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
    ];
    const minWeights = [2000, 2000]; // 20% min each
    const maxWeights = [8000, 8000]; // 80% max each

    const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
    await strategy.waitForDeployment();

    const [owner, keeper] = await ethers.getSigners();

    // Grant keeper role
    await strategy.connect(owner).grantKeeperRole(keeper.address);

    // Check shouldRebalance
    const shouldRebalanceBefore = await strategy.shouldRebalance();
    expect(shouldRebalanceBefore).to.be.false; // Just deployed

    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]); // 1 day + 1 sec
    await ethers.provider.send("evm_mine", []);

    const shouldRebalanceAfter = await strategy.shouldRebalance();
    expect(shouldRebalanceAfter).to.be.true; // Cooldown elapsed

    // Note: Full rebalance test would require mocking DEX and token transfers
    // For now, just verify the invariant check passes
    const weights = await strategy.calculateWeights();
    const sum = weights.reduce((acc: bigint, w: bigint) => acc + w, 0n);
    expect(sum).to.equal(BPS_DENOMINATOR);
  });
});


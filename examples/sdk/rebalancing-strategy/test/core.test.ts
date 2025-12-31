import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Fixed6040Strategy Core Tests
 * 
 * DSS-1: Core Strategy Tests
 */
describe("Fixed6040Strategy - Core Tests (DSS-1)", function () {
  let Fixed6040Strategy: any;
  let weightLibAddr: string;
  let owner: any;
  let keeper: any;

  beforeEach(async function () {
    [owner, keeper] = await ethers.getSigners();

    // Deploy DSSWeightLib
    const WeightLib = await ethers.getContractFactory(
      "contracts/libraries/DSSWeightLib.sol:DSSWeightLib"
    );
    const weightLib = await WeightLib.deploy();
    await weightLib.waitForDeployment();
    weightLibAddr = await weightLib.getAddress();

    Fixed6040Strategy = await ethers.getContractFactory("Fixed6040Strategy", {
      libraries: {
        DSSWeightLib: weightLibAddr,
      },
    });
  });

  describe("Deployment", function () {
    it("should deploy with 2 assets (60/40 split)", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [5000, 3000]; // 50%, 30%
      const maxWeights = [7000, 5000]; // 70%, 50%

      const strategy = await Fixed6040Strategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const weights = await strategy.calculateWeights();
      
      // Should respect bounds: 60% clamped to 70% max, 40% clamped to 50% max
      expect(weights[0]).to.equal(6000); // 60% for first asset
      expect(weights[1]).to.equal(4000); // 40% for second asset
    });

    it("should reject deployment with less than 2 assets", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [0];
      const maxWeights = [10000];

      await expect(
        Fixed6040Strategy.deploy(assets, minWeights, maxWeights)
      ).to.be.revertedWith("Need at least 2 assets");
    });
  });

  describe("Weight Calculation", function () {
    it("should allocate 60/40 to first two assets", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0];
      const maxWeights = [10000, 10000];

      const strategy = await Fixed6040Strategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const weights = await strategy.calculateWeights();

      expect(weights[0]).to.equal(6000); // 60%
      expect(weights[1]).to.equal(4000); // 40%
    });

    it("should ignore third asset in 60/40 allocation", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0, 0];
      const maxWeights = [10000, 10000, 10000];

      const strategy = await Fixed6040Strategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const weights = await strategy.calculateWeights();

      expect(weights[0]).to.equal(6000); // 60%
      expect(weights[1]).to.equal(4000); // 40%
      expect(weights[2]).to.equal(0);    // 0% (not used)
    });

    it("should allocate 100% if only one active asset", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0];
      const maxWeights = [10000, 10000];

      const strategy = await Fixed6040Strategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      // Deactivate second asset
      await strategy.connect(owner).setAssetActive(1, false);

      const weights = await strategy.calculateWeights();

      expect(weights[0]).to.equal(10000); // 100%
      expect(weights[1]).to.equal(0);     // 0% (inactive)
    });

    it("should respect min/max constraints", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [7000, 0]; // First asset min 70% (forces >60%)
      const maxWeights = [10000, 3000]; // Second asset max 30% (forces <40%)

      const strategy = await Fixed6040Strategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const weights = await strategy.calculateWeights();

      // Should clamp to 70/30 due to constraints
      expect(weights[0]).to.equal(7000); // Clamped up from 60%
      expect(weights[1]).to.equal(3000); // Clamped down from 40%
    });
  });

  describe("Rebalance Timing (DSS-3)", function () {
    it("should use weekly rebalance interval by default", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0];
      const maxWeights = [10000, 10000];

      const strategy = await Fixed6040Strategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const interval = await strategy.rebalanceInterval();
      expect(interval).to.equal(7 * 24 * 60 * 60); // 7 days
    });

    it("should enforce cooldown before rebalance", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0];
      const maxWeights = [10000, 10000];

      const strategy = await Fixed6040Strategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      await strategy.connect(owner).grantKeeperRole(keeper.address);

      // Should not allow immediate rebalance
      await expect(
        strategy.connect(keeper).rebalance()
      ).to.be.revertedWith("Cooldown not elapsed");
    });
  });
});




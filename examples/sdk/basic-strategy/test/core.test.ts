import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * HODLStrategy Core Tests
 * 
 * Basic functionality and DSS-1 compliance tests
 * 
 * DSS-1: Core Strategy Tests
 */
describe("HODLStrategy - Core Tests (DSS-1)", function () {
  let HODLStrategy: any;
  let weightLibAddr: string;
  let owner: any;
  let keeper: any;
  let user: any;

  beforeEach(async function () {
    [owner, keeper, user] = await ethers.getSigners();

    // Deploy DSSWeightLib
    const WeightLib = await ethers.getContractFactory(
      "contracts/libraries/DSSWeightLib.sol:DSSWeightLib"
    );
    const weightLib = await WeightLib.deploy();
    await weightLib.waitForDeployment();
    weightLibAddr = await weightLib.getAddress();

    HODLStrategy = await ethers.getContractFactory("HODLStrategy", {
      libraries: {
        DSSWeightLib: weightLibAddr,
      },
    });
  });

  describe("Deployment", function () {
    it("should deploy with valid configuration", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [2000, 3000]; // 20%, 30%
      const maxWeights = [6000, 7000]; // 60%, 70%

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const retrievedAssets = await strategy.getAssets();
      expect(retrievedAssets).to.deep.equal(assets);
    });

    it("should reject deployment with no assets", async function () {
      await expect(
        HODLStrategy.deploy([], [], [])
      ).to.be.revertedWith("No assets");
    });

    it("should reject deployment with mismatched arrays", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [1000];
      const maxWeights = [5000, 6000]; // Wrong length

      await expect(
        HODLStrategy.deploy(assets, minWeights, maxWeights)
      ).to.be.revertedWith("Length mismatch");
    });

    it("should reject deployment with invalid bounds", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [6000]; // Min > Max
      const maxWeights = [3000];

      await expect(
        HODLStrategy.deploy(assets, minWeights, maxWeights)
      ).to.be.revertedWith("Invalid bounds");
    });
  });

  describe("Weight Calculation", function () {
    it("should calculate equal weights for 2 assets", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0];
      const maxWeights = [10000, 10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const weights = await strategy.calculateWeights();

      expect(weights[0]).to.equal(5000); // 50%
      expect(weights[1]).to.equal(5000); // 50%
    });

    it("should handle odd number of assets", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0, 0];
      const maxWeights = [10000, 10000, 10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const weights = await strategy.calculateWeights();

      // 10000 / 3 = 3333.33... → [3334, 3333, 3333] (remainder to first)
      expect(weights[0]).to.equal(3334);
      expect(weights[1]).to.equal(3333);
      expect(weights[2]).to.equal(3333);

      const sum = weights.reduce((acc: bigint, w: bigint) => acc + w, 0n);
      expect(sum).to.equal(10000);
    });

    it("should respect min/max constraints", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [6000, 0]; // First asset must be >= 60%
      const maxWeights = [10000, 4000]; // Second asset max 40%

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const weights = await strategy.calculateWeights();

      // Should clamp to 60/40 split
      expect(weights[0]).to.equal(6000);
      expect(weights[1]).to.equal(4000);
    });
  });

  describe("Access Control", function () {
    it("should allow admin to update asset status", async function () {
      const assets = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];
      const minWeights = [0, 0];
      const maxWeights = [10000, 10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      // Initially both active (50/50)
      let weights = await strategy.calculateWeights();
      expect(weights[0]).to.equal(5000);
      expect(weights[1]).to.equal(5000);

      // Deactivate second asset
      await strategy.connect(owner).setAssetActive(1, false);

      weights = await strategy.calculateWeights();
      expect(weights[0]).to.equal(10000); // 100% to first asset
      expect(weights[1]).to.equal(0);
    });

    it("should prevent non-admin from updating asset status", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [0];
      const maxWeights = [10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      await expect(
        strategy.connect(user).setAssetActive(0, false)
      ).to.be.reverted; // Should fail without admin role
    });

    it("should allow admin to update rebalance interval", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [0];
      const maxWeights = [10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      const newInterval = 12 * 60 * 60; // 12 hours
      await strategy.connect(owner).setRebalanceInterval(newInterval);

      const interval = await strategy.rebalanceInterval();
      expect(interval).to.equal(newInterval);
    });
  });

  describe("Rebalance Timing (DSS-3)", function () {
    it("should enforce rebalance cooldown", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [0];
      const maxWeights = [10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      await strategy.connect(owner).grantKeeperRole(keeper.address);

      // Should not allow rebalance immediately
      const shouldRebalance = await strategy.shouldRebalance();
      expect(shouldRebalance).to.be.false;

      await expect(
        strategy.connect(keeper).rebalance()
      ).to.be.revertedWith("Cooldown not elapsed");
    });

    it("should allow rebalance after cooldown", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [0];
      const maxWeights = [10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      await strategy.connect(owner).grantKeeperRole(keeper.address);

      // Fast forward 24 hours + 1 second
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      const shouldRebalance = await strategy.shouldRebalance();
      expect(shouldRebalance).to.be.true;

      // Note: Full rebalance would require token mocks
      // For now, just verify it doesn't revert on timing check
    });
  });

  describe("Emergency Pause (DSS-4)", function () {
    it("should prevent rebalance when paused", async function () {
      const assets = [ethers.Wallet.createRandom().address];
      const minWeights = [0];
      const maxWeights = [10000];

      const strategy = await HODLStrategy.deploy(assets, minWeights, maxWeights);
      await strategy.waitForDeployment();

      await strategy.connect(owner).grantKeeperRole(keeper.address);
      await strategy.connect(owner).grantGuardianRole(owner.address);

      // Pause the strategy
      await strategy.connect(owner).pause();

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // Should revert even though cooldown elapsed
      await expect(
        strategy.connect(keeper).rebalance()
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});




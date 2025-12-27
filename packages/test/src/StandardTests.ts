// packages/test/src/StandardTests.ts

/**
 * @file StandardTests.ts
 * @description Pre-built test suites for common DSS requirements
 * @dev Provides standard tests for ERC-4626, Access Control, etc.
 */

import { expect } from 'chai';
import { Contract } from 'ethers';

/**
 * Standard test suite for DSS-1 (Core Strategy Tests)
 * Validates basic strategy functionality
 */
export async function runCoreStrategyTests(strategy: Contract) {
  describe("DSS-1: Core Strategy Tests", () => {
    it("returns valid assets array", async () => {
      const assets = await strategy.getAssets();
      expect(assets.length).to.be.gte(1);
      
      for (const asset of assets) {
        expect(asset).to.be.properAddress;
      }
    });

    it("weight sum equals 10000", async () => {
      const weights = await strategy.calculateWeights();
      const sum = weights.reduce((a: bigint, b: bigint) => a + b, 0n);
      expect(sum).to.equal(10000n);
    });

    it("all weights are non-negative", async () => {
      const weights = await strategy.calculateWeights();
      for (const weight of weights) {
        expect(weight).to.be.gte(0);
      }
    });
  });
}

/**
 * Standard test suite for DSS-9.2 (Access Control)
 * Validates role-based access control
 */
export async function runAccessControlTests(
  contract: Contract,
  owner: any,
  admin: any,
  keeper: any,
  user: any
) {
  describe("DSS-9.2: Access Control Tests", () => {
    it("owner has OWNER_ROLE", async () => {
      const OWNER_ROLE = await contract.OWNER_ROLE();
      expect(await contract.hasRole(OWNER_ROLE, owner.address)).to.be.true;
    });

    it("non-owner cannot call owner functions", async () => {
      await expect(
        contract.connect(user).grantRole(await contract.KEEPER_ROLE(), user.address)
      ).to.be.revertedWith("DSSAccessControl:");
    });

    it("keeper can trigger rebalance", async () => {
      await expect(
        contract.connect(keeper).rebalance()
      ).to.not.be.reverted;
    });

    it("non-keeper cannot trigger rebalance", async () => {
      await expect(
        contract.connect(user).rebalance()
      ).to.be.revertedWith("DSSAccessControl:");
    });
  });
}

/**
 * Standard test suite for DSS-4 (Emergency Pause)
 * Validates pausable functionality
 */
export async function runPausableTests(
  contract: Contract,
  guardian: any,
  admin: any,
  user: any
) {
  describe("DSS-4: Emergency Pause Tests", () => {
    it("guardian can pause", async () => {
      await expect(contract.connect(guardian).pause())
        .to.emit(contract, "Paused");
      
      expect(await contract.paused()).to.be.true;
    });

    it("operations fail when paused", async () => {
      await contract.connect(guardian).pause();
      
      await expect(
        contract.connect(user).deposit(1000)
      ).to.be.revertedWith("DSSPausable: paused");
    });

    it("only admin can unpause", async () => {
      await contract.connect(guardian).pause();
      
      await expect(
        contract.connect(guardian).unpause()
      ).to.be.revertedWith("DSSAccessControl:");
      
      await expect(contract.connect(admin).unpause())
        .to.emit(contract, "Unpaused");
    });
  });
}

/**
 * Run all standard DSS test suites
 */
export async function runStandardDSSTests(
  strategy: Contract,
  roles: {
    owner: any;
    admin: any;
    keeper: any;
    guardian: any;
    user: any;
  }
) {
  await runCoreStrategyTests(strategy);
  await runAccessControlTests(strategy, roles.owner, roles.admin, roles.keeper, roles.user);
  await runPausableTests(strategy, roles.guardian, roles.admin, roles.user);
}


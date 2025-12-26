// test/invariants/portfolio.invariant.spec.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Portfolio Invariants", () => {
  const INVARIANT_ITERS = parseInt(process.env.INVARIANT_ITERS || "200");

  // Seedable PRNG for reproducibility
  class Mulberry32 {
    constructor(private seed: number) {}

    next(): number {
      let t = this.seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    nextInt(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    }
  }

  async function deployFixture() {
    const [owner, ...users] = await ethers.getSigners();
    const vault = await deployVault(owner);
    return { vault, owner, users };
  }

  it("INVARIANT: share price never decreases", async () => {
    const { vault, users } = await loadFixture(deployFixture);
    const seed = parseInt(process.env.INVARIANT_SEED || Date.now().toString());
    const rng = new Mulberry32(seed);

    console.log(`Running with seed: ${seed}`);

    let previousPrice = await vault.sharePrice();

    for (let i = 0; i < INVARIANT_ITERS; i++) {
      // Random action
      const action = rng.nextInt(0, 2);
      const user = users[rng.nextInt(0, users.length - 1)];
      const amount = ethers.parseEther(rng.nextInt(1, 100).toString());

      try {
        switch (action) {
          case 0: // Deposit
            await vault.connect(user).deposit(amount);
            break;
          case 1: // Withdraw
            const shares = await vault.balanceOf(user.address);
            if (shares > 0) {
              await vault.connect(user).withdraw(shares / 2n);
            }
            break;
          case 2: // Rebalance
            await vault.rebalance();
            break;
        }
      } catch {
        // Some actions may revert - that's expected
      }

      // Check invariant
      const currentPrice = await vault.sharePrice();
      expect(currentPrice).to.be.gte(previousPrice);
      previousPrice = currentPrice;
    }
  });

  it("INVARIANT: total shares equals sum of user shares", async () => {
    const { vault, users } = await loadFixture(deployFixture);
    const seed = parseInt(process.env.INVARIANT_SEED || Date.now().toString());
    const rng = new Mulberry32(seed);

    for (let i = 0; i < INVARIANT_ITERS; i++) {
      // Random deposits/withdrawals
      const user = users[rng.nextInt(0, users.length - 1)];
      const amount = ethers.parseEther(rng.nextInt(1, 100).toString());

      try {
        if (rng.next() > 0.5) {
          await vault.connect(user).deposit(amount);
        } else {
          const shares = await vault.balanceOf(user.address);
          if (shares > 0) {
            await vault.connect(user).withdraw(shares / 2n);
          }
        }
      } catch {
        // Expected
      }

      // Check invariant
      const totalShares = await vault.totalSupply();
      let sumShares = 0n;
      for (const user of users) {
        sumShares += await vault.balanceOf(user.address);
      }

      expect(totalShares).to.equal(sumShares);
    }
  });
});





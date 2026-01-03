# DSS SDK Tutorial: Building Your First Strategy

**Step-by-step tutorial for building a DSS-compliant strategy using @vaultbricks/dss-core, @vaultbricks/dss-test, and @vaultbricks/dss-cli**

## Prerequisites

- Node.js 20+ installed
- Basic knowledge of Solidity and TypeScript
- npm or yarn package manager

## Tutorial Overview

In this tutorial, you'll build a simple rebalancing strategy that:
- Maintains a 60/40 allocation between two assets
- Implements access control and emergency pause
- Includes comprehensive tests
- Achieves Bronze-level DSS compliance

**Estimated time:** 30-45 minutes

---

## Step 1: Initialize Your Project

### Install CLI

```bash
npm install -g @vaultbricks/dss-cli
```

### Create Project

```bash
dss init my-first-strategy --template rebalancing
cd my-first-strategy
npm install
```

**What this creates:**
- Hardhat project structure
- Basic strategy template
- Test files with examples
- Configuration files

---

## Step 2: Understand the Project Structure

```
my-first-strategy/
├── contracts/
│   └── MyRebalancingStrategy.sol  # Your strategy contract
├── test/
│   ├── core.test.ts               # Core functionality tests
│   ├── invariants.test.ts         # Invariant tests
│   └── fuzzing.test.ts            # Fuzzing tests
├── scripts/
│   └── deploy.ts                  # Deployment script
├── hardhat.config.ts              # Hardhat configuration
└── package.json                   # Dependencies
```

---

## Step 3: Review the Generated Strategy

Open `contracts/MyRebalancingStrategy.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@vaultbricks/dss-core/interfaces/IDSSStrategy.sol";
import "@vaultbricks/dss-core/contracts/DSSAccessControl.sol";
import "@vaultbricks/dss-core/contracts/DSSPausable.sol";

contract MyRebalancingStrategy is 
    IDSSStrategy, 
    DSSAccessControl, 
    DSSPausable 
{
    // Generated template code
}
```

**Key points:**
- Implements `IDSSStrategy` interface (required)
- Inherits `DSSAccessControl` for role management
- Inherits `DSSPausable` for emergency controls

---

## Step 4: Implement Core Functions

### 4.1 Add State Variables

```solidity
address[] private _assets;
uint256 public override lastRebalance;
uint256 public rebalanceInterval = 7 days;

// Target weights: 60% first asset, 40% second asset
uint256 constant TARGET_WEIGHT_1 = 6000; // 60% in basis points
uint256 constant TARGET_WEIGHT_2 = 4000; // 40% in basis points

event Rebalanced(uint256 timestamp, uint256[] balances, uint256[] weights);
```

### 4.2 Implement Constructor

```solidity
constructor(address[] memory assets_) {
    require(assets_.length == 2, "Strategy requires exactly 2 assets");
    _assets = assets_;
    
    // Initialize access control
    _grantRole(OWNER_ROLE, msg.sender);
    _grantRole(KEEPER_ROLE, msg.sender);
}
```

### 4.3 Implement Required Interface Functions

```solidity
function getAssets() external view override returns (address[] memory) {
    return _assets;
}

function calculateWeights() external pure override returns (uint256[] memory) {
    uint256[] memory weights = new uint256[](2);
    weights[0] = TARGET_WEIGHT_1;
    weights[1] = TARGET_WEIGHT_2;
    return weights;
}

function shouldRebalance() external view override returns (bool) {
    return block.timestamp >= lastRebalance + rebalanceInterval;
}

function rebalance() external override onlyKeeper whenNotPaused {
    require(this.shouldRebalance(), "Rebalance cooldown not elapsed");
    
    // Get current balances
    uint256[] memory balances = new uint256[](2);
    balances[0] = address(_assets[0]).balance;
    balances[1] = address(_assets[1]).balance;
    
    // Get target weights
    uint256[] memory weights = this.calculateWeights();
    
    // TODO: Implement actual rebalancing logic
    // 1. Calculate target balances
    // 2. Execute swaps via DEX
    // 3. Verify slippage limits
    
    lastRebalance = block.timestamp;
    emit Rebalanced(block.timestamp, balances, weights);
}
```

---

## Step 5: Write Tests

### 5.1 Core Tests

Open `test/core.test.ts` and update:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { StandardTests } from "@vaultbricks/dss-test";

describe("MyRebalancingStrategy - Core Tests", function () {
  let strategy: any;
  let owner: any, keeper: any, user: any;
  
  beforeEach(async function () {
    [owner, keeper, user] = await ethers.getSigners();
    
    const Strategy = await ethers.getContractFactory("MyRebalancingStrategy");
    const assets = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address
    ];
    
    strategy = await Strategy.deploy(assets);
    await strategy.waitForDeployment();
    
    // Grant keeper role
    await strategy.grantRole(await strategy.KEEPER_ROLE(), keeper.address);
  });
  
  it("should return valid assets array", async function () {
    const assets = await strategy.getAssets();
    expect(assets).to.have.length(2);
  });
  
  it("should return weights that sum to 10000", async function () {
    const weights = await strategy.calculateWeights();
    const sum = weights.reduce((a: bigint, b: bigint) => a + b, 0n);
    expect(sum).to.equal(10000n);
  });
  
  it("should pass standard DSS-1 tests", async function () {
    await StandardTests.runCoreStrategyTests(strategy);
  });
});
```

### 5.2 Invariant Tests

Open `test/invariants.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { InvariantRunner } from "@vaultbricks/dss-test";

describe("MyRebalancingStrategy - Invariant Tests", function () {
  let strategy: any;
  let runner: InvariantRunner;
  
  beforeEach(async function () {
    // ... setup strategy ...
    
    runner = new InvariantRunner({
      iterations: 200,
      seed: 42,
      verbose: true
    });
  });
  
  it("should maintain weight sum = 10000", async function () {
    await runner.run({
      name: "Weight sum invariant",
      setup: async () => {
        // Reset state if needed
      },
      actions: [
        async () => {
          // Simulate operations
        },
        async () => {
          await strategy.rebalance();
        }
      ],
      invariants: [
        async () => {
          const weights = await strategy.calculateWeights();
          const sum = weights.reduce((a: bigint, b: bigint) => a + b, 0n);
          expect(sum).to.equal(10000n);
        }
      ]
    });
  });
});
```

### 5.3 Fuzzing Tests

Open `test/fuzzing.test.ts`:

```typescript
import { expect } from "chai";
import { FuzzHelpers, runFuzzTest } from "@vaultbricks/dss-test";
import fc from "fast-check";

describe("MyRebalancingStrategy - Fuzzing Tests", function () {
  let strategy: any;
  
  beforeEach(async function () {
    // ... setup strategy ...
  });
  
  it("should handle arbitrary weight distributions", async function () {
    await runFuzzTest(
      fc.asyncProperty(
        FuzzHelpers.arbitraryWeights(2, 2),
        async (weights) => {
          const sum = weights.reduce((a, b) => a + b, 0);
          const normalized = weights.map(w => (w * 10000) / sum);
          const normalizedSum = normalized.reduce((a, b) => a + b, 0);
          expect(normalizedSum).to.equal(10000);
          return true;
        }
      ),
      { iterations: 600 }
    );
  });
});
```

---

## Step 6: Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm run test:core
npm run test:invariants
npm run test:fuzzing

# Run with coverage
npm run coverage
```

**Expected output:**
```
  MyRebalancingStrategy - Core Tests
    ✓ should return valid assets array
    ✓ should return weights that sum to 10000
    ✓ should pass standard DSS-1 tests

  MyRebalancingStrategy - Invariant Tests
    🔬 Running invariant test: Weight sum invariant
       Iterations: 200
    ✅ All 200 iterations passed!

  MyRebalancingStrategy - Fuzzing Tests
    ✓ should handle arbitrary weight distributions (600 runs)

  5 passing (3s)
```

---

## Step 7: Check DSS Compliance

```bash
dss check --level bronze --verbose
```

**Expected output:**
```
🔍 DSS Compliance Check
Target Level: BRONZE

✓ Checking project structure...
✓ Checking required files...
✓ Checking contracts...
✓ Checking tests...

Compliance: 85%

✅ Project meets BRONZE level requirements!
```

---

## Step 8: Generate Certification Report

```bash
dss report --level bronze --output CERTIFICATION.md
```

This creates a detailed report showing:
- What requirements are met
- What's missing
- Recommendations for improvement

---

## Step 9: Improve to Silver Level

Based on the report, add missing requirements:

### 9.1 Add Fuzzing Tests

Already done in Step 5.3!

### 9.2 Add Access Control Tests

```typescript
import { StandardTests } from "@vaultbricks/dss-test";

it("should pass access control tests", async function () {
  await StandardTests.runAccessControlTests(strategy, {
    owner,
    keeper,
    guardian,
    user
  });
});
```

### 9.3 Add Pausable Tests

```typescript
it("should pass pausable tests", async function () {
  await StandardTests.runPausableTests(strategy, {
    owner,
    guardian
  });
});
```

### 9.4 Re-check Compliance

```bash
dss check --level silver
```

---

## Step 10: Deploy to Testnet

Once tests pass and compliance is verified:

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## Next Steps

1. **Read the full specification**: See `specification/` for all DSS requirements
2. **Explore examples**: Check `examples/sdk/` for more complex strategies
3. **Join the community**: Open issues or discussions on GitHub
4. **Get certified**: Work towards Silver or Gold certification

---

## Common Issues & Solutions

### Issue: "Cannot find module '@vaultbricks/dss-core'"

**Solution:**
```bash
npm install @vaultbricks/dss-core
```

### Issue: Tests fail with "AccessControlUnauthorizedAccount"

**Solution:** Grant roles in `beforeEach`:
```typescript
await strategy.grantRole(await strategy.KEEPER_ROLE(), keeper.address);
```

### Issue: Weights don't sum to 10000

**Solution:** Ensure weights are in basis points (10000 = 100%):
```solidity
uint256 constant TARGET_WEIGHT_1 = 6000; // 60%
uint256 constant TARGET_WEIGHT_2 = 4000; // 40%
// Sum = 10000 (100%)
```

---

## Resources

- **[SDK Usage Guide](./SDK-USAGE-GUIDE.md)** - Comprehensive guide
- **[SDK Quick Reference](./SDK-QUICK-REFERENCE.md)** - Quick reference
- **[Getting Started Guide](../GETTING-STARTED.md)** - Step-by-step guide
- **[Examples](../examples/)** - Working examples

---

**Congratulations!** You've built your first DSS-compliant strategy! 🎉

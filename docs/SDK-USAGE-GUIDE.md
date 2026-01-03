# DSS SDK Usage Guide

**Complete guide to using @vaultbricks/dss-core, @vaultbricks/dss-test, and @vaultbricks/dss-cli**

This guide demonstrates how to use all three DSS SDK packages together to build, test, and certify DSS-compliant DeFi strategies.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Using @vaultbricks/dss-core](#using-vaultbrickscore)
3. [Using @vaultbricks/dss-test](#using-vaultbrickstest)
4. [Using @vaultbricks/dss-cli](#using-vaultbrickscli)
5. [Complete Example: Building a Strategy](#complete-example-building-a-strategy)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

```bash
# Install CLI globally
npm install -g @vaultbricks/dss-cli

# Or use npx
npx @vaultbricks/dss-cli init my-strategy
```

### Create Your First Strategy

```bash
# Initialize a new project
dss init my-strategy

# Navigate to project
cd my-strategy

# Install dependencies (includes @vaultbricks/dss-core and @vaultbricks/dss-test)
npm install

# Run tests
npm test

# Check compliance
dss check --level bronze
```

---

## Using @vaultbricks/dss-core

### Installation

```bash
npm install @vaultbricks/dss-core
```

### Basic Strategy Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@vaultbricks/dss-core/interfaces/IDSSStrategy.sol";
import "@vaultbricks/dss-core/contracts/DSSAccessControl.sol";
import "@vaultbricks/dss-core/contracts/DSSPausable.sol";
import "@vaultbricks/dss-core/libraries/DSSWeightLib.sol";

/**
 * @title SimpleRebalancingStrategy
 * @notice Example DSS-compliant strategy using @vaultbricks/dss-core
 */
contract SimpleRebalancingStrategy is 
    IDSSStrategy, 
    DSSAccessControl, 
    DSSPausable 
{
    using DSSWeightLib for uint256[];
    
    address[] private _assets;
    uint256 public override lastRebalance;
    uint256 public rebalanceInterval = 7 days;
    
    // Target weights: 60% first asset, 40% second asset
    uint256 constant TARGET_WEIGHT_1 = 6000; // 60% in basis points
    uint256 constant TARGET_WEIGHT_2 = 4000; // 40% in basis points
    
    event Rebalanced(uint256 timestamp, uint256[] balances, uint256[] weights);
    
    constructor(address[] memory assets_) {
        require(assets_.length == 2, "Strategy requires exactly 2 assets");
        _assets = assets_;
        
        // Initialize access control
        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);
    }
    
    /**
     * @notice Returns the list of assets managed by this strategy
     * @dev Required by IDSSStrategy interface
     */
    function getAssets() external view override returns (address[] memory) {
        return _assets;
    }
    
    /**
     * @notice Calculates target weights for each asset
     * @dev Required by IDSSStrategy interface
     * @return weights Array of weights in basis points (10000 = 100%)
     */
    function calculateWeights() external pure override returns (uint256[] memory) {
        uint256[] memory weights = new uint256[](2);
        weights[0] = TARGET_WEIGHT_1;
        weights[1] = TARGET_WEIGHT_2;
        return weights;
    }
    
    /**
     * @notice Checks if rebalancing should occur
     * @dev Implements DSS-3: Trigger & Timing Tests
     * @return true if rebalance interval has elapsed
     */
    function shouldRebalance() external view override returns (bool) {
        return block.timestamp >= lastRebalance + rebalanceInterval;
    }
    
    /**
     * @notice Executes rebalancing to target weights
     * @dev Implements DSS-1: Core Strategy functionality
     *      Protected by DSSAccessControl (onlyKeeper) and DSSPausable (whenNotPaused)
     */
    function rebalance() external override onlyKeeper whenNotPaused {
        require(this.shouldRebalance(), "Rebalance cooldown not elapsed");
        
        // Get current balances
        uint256[] memory balances = new uint256[](2);
        balances[0] = _assets[0].balance;
        balances[1] = _assets[1].balance;
        
        // Get target weights
        uint256[] memory weights = this.calculateWeights();
        
        // TODO: Implement actual rebalancing logic
        // 1. Calculate target balances based on weights
        // 2. Execute swaps via DEX (Uniswap, etc.)
        // 3. Verify slippage limits
        // 4. Update balances
        
        lastRebalance = block.timestamp;
        emit Rebalanced(block.timestamp, balances, weights);
    }
    
    /**
     * @notice Emergency pause function
     * @dev Implements DSS-4: Risk Management
     *      Only GUARDIAN_ROLE can pause
     */
    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause function
     * @dev Only OWNER_ROLE can unpause
     */
    function unpause() external onlyRole(OWNER_ROLE) {
        _unpause();
    }
}
```

### Key Features Used

- **IDSSStrategy**: Core interface that all strategies must implement
- **DSSAccessControl**: Role-based access control (OWNER, ADMIN, KEEPER, GUARDIAN)
- **DSSPausable**: Emergency pause mechanism for risk management
- **DSSWeightLib**: Utility library for weight calculations and normalization

---

## Using @vaultbricks/dss-test

### Installation

```bash
npm install --save-dev @vaultbricks/dss-test
```

### Core Strategy Tests (DSS-1)

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { runStandardDSSTests, StandardTests } from "@vaultbricks/dss-test";

describe("SimpleRebalancingStrategy - Core Tests", function () {
  let strategy: any;
  let owner: any, keeper: any, guardian: any, user: any;
  
  beforeEach(async function () {
    [owner, keeper, guardian, user] = await ethers.getSigners();
    
    const Strategy = await ethers.getContractFactory("SimpleRebalancingStrategy");
    const assets = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address
    ];
    
    strategy = await Strategy.deploy(assets);
    await strategy.waitForDeployment();
    
    // Setup roles
    await strategy.grantRole(await strategy.KEEPER_ROLE(), keeper.address);
    await strategy.grantRole(await strategy.GUARDIAN_ROLE(), guardian.address);
  });
  
  describe("DSS-1: Core Strategy Tests", function () {
    it("should return valid assets array", async function () {
      const assets = await strategy.getAssets();
      expect(assets).to.have.length(2);
      expect(assets[0]).to.be.properAddress;
      expect(assets[1]).to.be.properAddress;
    });
    
    it("should return weights that sum to 10000", async function () {
      const weights = await strategy.calculateWeights();
      const sum = weights.reduce((a: bigint, b: bigint) => a + b, 0n);
      expect(sum).to.equal(10000n);
    });
    
    it("should return all non-negative weights", async function () {
      const weights = await strategy.calculateWeights();
      weights.forEach((weight: bigint) => {
        expect(weight).to.be.gte(0n);
      });
    });
  });
  
  // Use StandardTests helper for common tests
  it("should pass standard DSS-1 tests", async function () {
    await StandardTests.runCoreStrategyTests(strategy);
  });
});
```

### Invariant Tests (DSS-2)

```typescript
import { InvariantRunner } from "@vaultbricks/dss-test";

describe("SimpleRebalancingStrategy - Invariant Tests", function () {
  let strategy: any;
  let runner: InvariantRunner;
  
  beforeEach(async function () {
    // ... setup strategy ...
    
    // Create invariant runner with 200 iterations
    runner = new InvariantRunner({
      iterations: 200,
      seed: 42, // For reproducibility
      verbose: true
    });
  });
  
  it("should maintain weight sum = 10000 across all operations", async function () {
    await runner.run({
      name: "Weight sum invariant",
      setup: async () => {
        // Reset to initial state if needed
      },
      actions: [
        // Random sequence of operations
        async () => {
          // Simulate deposit
          // await strategy.deposit(amount);
        },
        async () => {
          // Simulate withdrawal
          // await strategy.withdraw(amount);
        },
        async () => {
          // Trigger rebalance
          await strategy.rebalance();
        }
      ],
      invariants: [
        async () => {
          const weights = await strategy.calculateWeights();
          const sum = weights.reduce((a: bigint, b: bigint) => a + b, 0n);
          expect(sum).to.equal(10000n);
        },
        async () => {
          // All weights should be non-negative
          const weights = await strategy.calculateWeights();
          weights.forEach((weight: bigint) => {
            expect(weight).to.be.gte(0n);
          });
        }
      ]
    });
  });
});
```

### Fuzzing Tests (DSS-7)

```typescript
import { FuzzHelpers, runFuzzTest } from "@vaultbricks/dss-test";
import fc from "fast-check";

describe("SimpleRebalancingStrategy - Fuzzing Tests", function () {
  let strategy: any;
  
  beforeEach(async function () {
    // ... setup strategy ...
  });
  
  it("should handle arbitrary weight distributions", async function () {
    await runFuzzTest(
      fc.asyncProperty(
        FuzzHelpers.arbitraryWeights(2, 2), // Generate 2 weights for 2 assets
        async (weights) => {
          // Normalize weights to sum to 10000
          const sum = weights.reduce((a, b) => a + b, 0);
          const normalized = weights.map(w => (w * 10000) / sum);
          
          // Test that normalized weights sum to 10000
          const normalizedSum = normalized.reduce((a, b) => a + b, 0);
          expect(normalizedSum).to.equal(10000);
          
          return true;
        }
      ),
      {
        iterations: 600, // Silver level requirement
        seed: 42
      }
    );
  });
  
  it("should handle arbitrary price movements", async function () {
    await runFuzzTest(
      fc.asyncProperty(
        FuzzHelpers.arbitraryPriceHistory(10, 100), // 10-100 price points
        async (priceHistory) => {
          // Test strategy behavior with various price movements
          for (const price of priceHistory) {
            // Simulate price update and verify strategy response
            // ...
          }
          return true;
        }
      ),
      {
        iterations: 600
      }
    );
  });
});
```

### Access Control Tests (DSS-9.2)

```typescript
import { StandardTests } from "@vaultbricks/dss-test";

describe("SimpleRebalancingStrategy - Access Control", function () {
  let strategy: any;
  let owner: any, keeper: any, guardian: any, user: any;
  
  beforeEach(async function () {
    // ... setup ...
  });
  
  it("should pass standard access control tests", async function () {
    await StandardTests.runAccessControlTests(strategy, {
      owner,
      keeper,
      guardian,
      user
    });
  });
  
  it("should allow keeper to trigger rebalance", async function () {
    await expect(
      strategy.connect(keeper).rebalance()
    ).to.not.be.reverted;
  });
  
  it("should prevent non-keeper from triggering rebalance", async function () {
    await expect(
      strategy.connect(user).rebalance()
    ).to.be.revertedWithCustomError(strategy, "AccessControlUnauthorizedAccount");
  });
  
  it("should allow guardian to pause", async function () {
    await strategy.connect(guardian).pause();
    expect(await strategy.paused()).to.be.true;
  });
});
```

---

## Using @vaultbricks/dss-cli

### Installation

```bash
npm install -g @vaultbricks/dss-cli
```

### Initialize Project

```bash
# Interactive mode
dss init my-strategy

# Non-interactive mode
dss init my-strategy \
  --framework hardhat \
  --template rebalancing
```

**Output:**
```
🚀 DSS Project Initialization

✓ Creating project directory: my-strategy
✓ Initializing Hardhat project
✓ Installing dependencies...
✓ Generating strategy template...
✓ Creating test files...
✓ Setting up configuration...

✅ Project initialized successfully!

Next steps:
  cd my-strategy
  npm install
  npm test
  dss check --level bronze
```

### Check Compliance

```bash
# Basic check (default: silver level)
dss check

# Specific level
dss check --level bronze
dss check --level silver
dss check --level gold

# Verbose output
dss check --level silver --verbose
```

**Example Output:**
```
🔍 DSS Compliance Check
Target Level: SILVER

✓ Checking project structure...
✓ Checking required files...
✓ Checking contracts...
✓ Checking tests...

============================================================
Check Results
============================================================

Structure:
  ✓ contracts/ directory exists: PASS
  ✓ test/ directory exists: PASS
  ✓ scripts/ directory exists: PASS

Contracts:
  ✓ At least one .sol file: PASS
  ✓ Implements IDSSStrategy: PASS
  ✓ Uses DSSAccessControl: PASS
  ✓ Uses DSSPausable: PASS

Tests:
  ✓ Test files exist: PASS
  ✓ Core tests (DSS-1): PASS
  ✓ Invariant tests (DSS-2): PASS
  ✓ Fuzzing tests (DSS-7): PASS
  ✓ Access control tests (DSS-9.2): PASS

Documentation:
  ✓ README.md exists: PASS
  ⚠ SECURITY.md exists: WARN

============================================================
Summary
============================================================

  ✓ Passed: 12/13
  ⚠ Warnings: 1/13

  Compliance: 92%

  ⚠️  Project does not yet meet SILVER level (requires 95%)
  
Recommendations:
  - Add SECURITY.md file
  - Increase test coverage to >95%
```

### Generate Certification Report

```bash
# Default report
dss report

# Custom output file
dss report --output CERTIFICATION.md

# Specific level
dss report --level gold --output GOLD_CERTIFICATION.md
```

**Report includes:**
- Executive summary
- Category-by-category analysis
- Detailed recommendations
- Certification status
- Next steps for improvement

---

## Complete Example: Building a Strategy

### Step 1: Initialize Project

```bash
dss init my-lending-strategy --template lending
cd my-lending-strategy
npm install
```

### Step 2: Implement Strategy

```solidity
// contracts/MyLendingStrategy.sol
import "@vaultbricks/dss-core/interfaces/IDSSStrategy.sol";
import "@vaultbricks/dss-core/contracts/DSSAccessControl.sol";
import "@vaultbricks/dss-core/contracts/DSSPausable.sol";

contract MyLendingStrategy is IDSSStrategy, DSSAccessControl, DSSPausable {
    // Your implementation
}
```

### Step 3: Write Tests

```typescript
// test/core.test.ts
import { StandardTests } from "@vaultbricks/dss-test";

describe("MyLendingStrategy", function () {
  // ... setup ...
  
  it("should pass standard DSS tests", async function () {
    await StandardTests.runStandardDSSTests(strategy, {
      owner,
      keeper,
      guardian,
      user
    });
  });
});

// test/invariants.test.ts
import { InvariantRunner } from "@vaultbricks/dss-test";

describe("MyLendingStrategy - Invariants", function () {
  it("should maintain invariants", async function () {
    const runner = new InvariantRunner({ iterations: 200 });
    await runner.run({
      // ... test configuration ...
    });
  });
});

// test/fuzzing.test.ts
import { FuzzHelpers, runFuzzTest } from "@vaultbricks/dss-test";

describe("MyLendingStrategy - Fuzzing", function () {
  it("should handle arbitrary inputs", async function () {
    await runFuzzTest(
      fc.asyncProperty(
        FuzzHelpers.arbitraryWeights(2, 5),
        async (weights) => {
          // Test logic
        }
      )
    );
  });
});
```

### Step 4: Check Compliance

```bash
dss check --level silver --verbose
```

### Step 5: Generate Report

```bash
dss report --level silver --output CERTIFICATION.md
```

### Step 6: Iterate

Based on the report, address any missing requirements and re-check.

---

## Best Practices

### 1. Always Use Access Control

```solidity
// ✅ Good
function rebalance() external onlyKeeper whenNotPaused {
    // ...
}

// ❌ Bad
function rebalance() external {
    // No access control!
}
```

### 2. Implement Pausable for Risk Management

```solidity
// ✅ Good
function criticalOperation() external whenNotPaused {
    // ...
}

// ❌ Bad
function criticalOperation() external {
    // No pause protection!
}
```

### 3. Use StandardTests for Common Patterns

```typescript
// ✅ Good - Use helpers
await StandardTests.runStandardDSSTests(strategy, roles);

// ❌ Bad - Rewrite everything manually
// (More error-prone, less maintainable)
```

### 4. Test Invariants Thoroughly

```typescript
// ✅ Good - 200+ iterations
const runner = new InvariantRunner({ iterations: 200 });

// ❌ Bad - Too few iterations
const runner = new InvariantRunner({ iterations: 10 });
```

### 5. Use Fuzzing for Edge Cases

```typescript
// ✅ Good - Test with arbitrary inputs
await runFuzzTest(fc.asyncProperty(arbitraryWeights(), ...));

// ❌ Bad - Only test fixed values
it("should work with [1000, 9000]", ...);
```

---

## Troubleshooting

### Issue: "Cannot find module '@vaultbricks/dss-core'"

**Solution:**
```bash
npm install @vaultbricks/dss-core
```

### Issue: "AccessControlUnauthorizedAccount" error

**Solution:** Ensure roles are properly set up:
```solidity
_grantRole(KEEPER_ROLE, keeperAddress);
```

### Issue: Tests fail with "paused" error

**Solution:** Unpause the contract or use `whenNotPaused` modifier:
```solidity
function myFunction() external whenNotPaused {
    // ...
}
```

### Issue: CLI command not found

**Solution:**
```bash
# Install globally
npm install -g @vaultbricks/dss-cli

# Or use npx
npx @vaultbricks/dss-cli check
```

### Issue: Weights don't sum to 10000

**Solution:** Use DSSWeightLib for normalization:
```solidity
import "@vaultbricks/dss-core/libraries/DSSWeightLib.sol";

using DSSWeightLib for uint256[];

uint256[] memory normalized = weights.normalize();
```

---

## Next Steps

1. **Explore Examples**: Check out `examples/sdk/` for complete working examples
2. **Read Specification**: See `specification/` for detailed DSS requirements
3. **Join Community**: Open issues or discussions on GitHub
4. **Get Certified**: Work towards Bronze → Silver → Gold certification

---

## Resources

- **GitHub**: https://github.com/VaultBricks/DSS
- **npm Packages**:
  - [@vaultbricks/dss-core](https://www.npmjs.com/package/@vaultbricks/dss-core)
  - [@vaultbricks/dss-test](https://www.npmjs.com/package/@vaultbricks/dss-test)
  - [@vaultbricks/dss-cli](https://www.npmjs.com/package/@vaultbricks/dss-cli)
- **Documentation**: [specification/](./specification/)
- **Examples**: [examples/sdk/](./examples/sdk/)

---

**Happy building! 🚀**

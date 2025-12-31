# Getting Started with DSS SDK

This guide walks you through creating your first DSS-compliant strategy using the DSS SDK.

## Prerequisites

- Node.js 18+ and npm
- Basic understanding of Solidity and TypeScript
- Hardhat or Foundry (optional, can be installed by CLI)

## Step 1: Install DSS CLI

```bash
npm install -g @dss/cli
```

Verify installation:

```bash
dss --version
# Output: 1.2.0-alpha.0
```

## Step 2: Create a New Project

```bash
dss init my-rebalancing-strategy
```

The CLI will prompt you:

```
🚀 DSS Project Initialization

? Project name: my-rebalancing-strategy
? Select framework: Hardhat (TypeScript)
? Select strategy template: Rebalancing Strategy (60/40)

✅ Project initialized successfully!

Next steps:
  cd my-rebalancing-strategy
  npm install
  npx hardhat test
  dss check
```

## Step 3: Explore the Generated Project

```bash
cd my-rebalancing-strategy
tree -L 2
```

Your project structure:

```
my-rebalancing-strategy/
├── contracts/
│   └── MyRebalancingStrategy.sol
├── test/
│   ├── core.test.ts
│   ├── invariants.test.ts
│   └── fuzzing.test.ts
├── scripts/
│   └── deploy.ts
├── docs/
│   └── SPECIFICATION.md
├── hardhat.config.ts
├── package.json
└── README.md
```

## Step 4: Install Dependencies

```bash
npm install
```

This installs:
- `@dss/core` - Base contracts
- `@dss/test` - Testing utilities
- `hardhat` and related tools

## Step 5: Implement Your Strategy

Open `contracts/MyRebalancingStrategy.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@dss/core/interfaces/IDSSStrategy.sol";
import "@dss/core/contracts/DSSAccessControl.sol";
import "@dss/core/contracts/DSSPausable.sol";

contract MyRebalancingStrategy is IDSSStrategy, DSSAccessControl, DSSPausable {
    address[] private _assets;
    uint256 public override lastRebalance;
    uint256 public override rebalanceInterval = 24 hours;
    
    // Target weights: 60% ETH, 40% USDC
    uint256 constant TARGET_ETH = 6000; // basis points
    uint256 constant TARGET_USDC = 4000;
    
    constructor(address[] memory assets_) {
        require(assets_.length == 2, "Requires exactly 2 assets");
        _assets = assets_;
    }
    
    function getAssets() external view override returns (address[] memory) {
        return _assets;
    }
    
    function calculateWeights() external pure override returns (uint256[] memory) {
        uint256[] memory weights = new uint256[](2);
        weights[0] = TARGET_ETH;
        weights[1] = TARGET_USDC;
        return weights;
    }
    
    function shouldRebalance() external view override returns (bool) {
        return block.timestamp >= lastRebalance + rebalanceInterval;
    }
    
    function rebalance() external override onlyKeeper whenNotPaused {
        require(this.shouldRebalance(), "Cooldown not elapsed");
        
        // TODO: Implement rebalancing logic
        // 1. Get current balances
        // 2. Calculate target balances
        // 3. Execute swaps via DEX
        // 4. Verify slippage limits
        
        lastRebalance = block.timestamp;
        emit Rebalanced(block.timestamp, new uint256[](2), this.calculateWeights());
    }
}
```

## Step 6: Write Tests

The CLI generates starter tests. Open `test/invariants.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { createInvariantRunner } from "@dss/test";

describe("Invariant Tests", () => {
  let strategy: any;
  let runner: any;

  beforeEach(async () => {
    const Strategy = await ethers.getContractFactory("MyRebalancingStrategy");
    const [weth, usdc] = await deployMockTokens();
    strategy = await Strategy.deploy([weth.address, usdc.address]);
    
    runner = createInvariantRunner({ iterations: 200, seed: 42 });
  });

  it("maintains weight sum = 10000", async () => {
    await runner.run({
      name: "Weight sum invariant",
      setup: async () => {
        // Reset strategy state
      },
      actions: [
        async () => await strategy.deposit(ethers.utils.parseEther("1")),
        async () => await strategy.withdraw(ethers.utils.parseEther("0.5")),
        async () => await strategy.rebalance()
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

## Step 7: Run Tests

```bash
npm test
```

Expected output:

```
  Core Strategy Tests
    ✓ returns valid assets array
    ✓ weight sum equals 10000
    ✓ all weights are non-negative

  Invariant Tests
    🔬 Running invariant test: Weight sum invariant
       Iterations: 200
       Seed: 42
    ✅ All 200 iterations passed!

  DSS-9.2: Access Control Tests
    ✓ owner has OWNER_ROLE
    ✓ keeper can trigger rebalance
    ✓ non-keeper cannot trigger rebalance

  10 passing (2s)
```

## Step 8: Check DSS Compliance

```bash
dss check --level silver --verbose
```

Output:

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

Contracts:
  ✓ At least one .sol file: PASS
  ✓ Implements IDSSStrategy: PASS

Tests:
  ✓ Test files exist: PASS
  ✓ Core tests implemented: PASS
  ✓ Invariant tests implemented: PASS
  ✓ Fuzzing tests implemented: WARN

Documentation:
  ✓ README.md exists: PASS
  ⚠ SECURITY.md exists: WARN

============================================================
Summary
============================================================

  ✓ Passed: 9/11
  ⚠ Warnings: 2/11

  Compliance: 82%

  ⚠️  Project does not yet meet SILVER level (requires 95%)
```

## Step 9: Generate Certification Report

```bash
dss report --output CERTIFICATION.md
```

This creates a detailed Markdown report with:
- Executive summary
- Category-by-category analysis
- Recommendations for improvement
- Certification status

## Step 10: Iterate and Improve

Based on the report, address missing requirements:

1. **Add Fuzzing Tests** (DSS-7):

```typescript
import { arbitraryWeights, runFuzzTest } from "@dss/test";
import fc from "fast-check";

it("handles arbitrary weight distributions", async () => {
  await runFuzzTest(
    fc.asyncProperty(arbitraryWeights(2, 2), async (weights) => {
      // Test strategy with random weights
      const sum = weights.reduce((a, b) => a + b, 0);
      expect(sum).to.equal(10000);
    })
  );
});
```

2. **Add SECURITY.md**:

```bash
touch SECURITY.md
# Document security practices, audit results, bug bounty info
```

3. **Recheck compliance**:

```bash
dss check --level silver
```

## Next Steps

Once you reach your target certification level:

1. **Deploy to testnet**
2. **Get a professional audit** (required for Gold)
3. **Submit to DSS Registry** (Issue #4)
4. **Launch on mainnet**

## Resources

- [DSS Specification](https://github.com/VaultBricks/DSS/tree/main/specification)
- [@dss/core Documentation](https://github.com/VaultBricks/DSS/tree/main/packages/core)
- [@dss/test Documentation](https://github.com/VaultBricks/DSS/tree/main/packages/test)
- [Example Strategies](https://github.com/VaultBricks/DSS/tree/main/examples)

## Getting Help

- **GitHub Issues**: https://github.com/VaultBricks/DSS/issues
- **Discussions**: https://github.com/VaultBricks/DSS/discussions

---

*Happy building! 🚀*




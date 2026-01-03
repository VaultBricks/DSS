# HODLStrategy - DSS Basic Example

**Production-tested equal-weight rebalancing strategy**

This example demonstrates a complete DSS-compliant strategy implementation with comprehensive test coverage.

## 📋 Overview

**HODLStrategy** maintains equal weight distribution across all active assets, automatically rebalancing to maintain target allocations.

### Key Features

- ✅ **Equal-weight allocation** - Simple, transparent distribution
- ✅ **Automatic rebalancing** - Maintains target weights over time
- ✅ **Configurable constraints** - Per-asset min/max weight bounds
- ✅ **Emergency controls** - Pause mechanism for safety
- ✅ **Access control** - Role-based permissions (Admin, Keeper, Guardian)
- ✅ **Gas-optimized** - Production-tested efficiency

### Strategy Behavior

```
3 Active Assets → Each gets 33.33% (3334, 3333, 3333 bps)
2 Active Assets → Each gets 50% (5000, 5000 bps)
1 Active Asset  → Gets 100% (10000 bps)
```

**Note:** Despite the "HODL" name, this strategy **does rebalance**. The name comes from its equal-weight approach (like holding a diversified portfolio). For true buy-and-hold, disable automatic rebalancing.

## 🏗️ Architecture

### Contracts

- **`HODLStrategy.sol`** - Main strategy contract
  - Inherits: `IDSSStrategy`, `DSSAccessControl`, `DSSPausable`
  - Uses: `DSSWeightLib` for weight normalization
- **`DSSWeightLib.sol`** - Weight calculation library
  - Battle-tested in production
  - Handles min/max bounds and normalization

### Dependencies

```
HODLStrategy
├── IDSSStrategy (interface)
├── DSSAccessControl (role-based access)
├── DSSPausable (emergency pause)
└── DSSWeightLib (weight calculations)
```

## 🧪 Testing

This example includes **comprehensive test coverage** following DSS requirements:

### Test Suites

| File                 | Coverage                                       | DSS Category        |
| -------------------- | ---------------------------------------------- | ------------------- |
| `core.test.ts`       | Deployment, weight calculation, access control | DSS-1, DSS-3, DSS-4 |
| `invariants.test.ts` | Weight sum, bounds, monotonicity               | DSS-2               |
| `fuzzing.test.ts`    | Property-based testing (200+ iterations)       | DSS-7               |

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with custom iterations
FUZZ_ITERS=500 INVARIANT_ITERS=300 npm test

# Run with specific seed for reproducibility
RANDOM_SEED=12345 npm test
```

## 🎯 DSS Compliance

This example demonstrates compliance with:

- ✅ **DSS-1**: Core Strategy Tests
  - Deployment validation
  - Weight calculation
  - Asset management
- ✅ **DSS-2**: Economic Invariants
  - Weight sum = 10000 (100%)
  - Non-negative weights
  - Respect min/max bounds
  - Value conservation
- ✅ **DSS-3**: Trigger & Timing Tests
  - Rebalance interval enforcement
  - Cooldown mechanism
  - Timestamp monotonicity
- ✅ **DSS-4**: Risk Management Tests
  - Emergency pause functionality
  - Role-based access control
  - Safe state transitions
- ✅ **DSS-7**: Stress Tests & Fuzzing
  - Property-based testing
  - Random input generation
  - Edge case coverage
- ✅ **DSS-9**: Operational Security
  - Access control (Admin, Keeper, Guardian)
  - Parameter validation
  - Event logging

## 📖 Usage Example

```solidity
// Deploy strategy with 3 assets
address[] memory assets = [DAI, USDC, USDT];
uint256[] memory minWeights = [2000, 2000, 2000]; // 20% min each
uint256[] memory maxWeights = [5000, 5000, 5000]; // 50% max each

HODLStrategy strategy = new HODLStrategy(assets, minWeights, maxWeights);

// Grant roles
strategy.grantKeeperRole(keeperBot);
strategy.grantGuardianRole(multisig);

// Calculate target weights
uint256[] memory weights = strategy.calculateWeights();
// → [3334, 3333, 3333] (equal distribution)

// Check if rebalance is needed
bool should = strategy.shouldRebalance();
// → false (just deployed)

// Fast forward 24 hours...
// → true (cooldown elapsed)

// Execute rebalance (keeper only)
strategy.rebalance();

// Emergency pause (guardian only)
strategy.pause();

// Deactivate an asset (admin only)
strategy.setAssetActive(2, false);
// → weights become [5000, 5000, 0]
```

## 🔬 Testing Patterns

This example uses proven testing patterns from production:

### 1. Seedable PRNG

```typescript
// Reproducible random tests
function makeRng(seed?: number): () => number {
  let state = seed ?? Date.now();
  return function mulberry32() {
    // Mulberry32 implementation
  };
}
```

### 2. Property-Based Testing

```typescript
// Test invariants across random inputs
fc.assert(
  fc.asyncProperty(fc.array(/* ... */), async (inputs) => {
    // Verify invariants hold
  }),
  { numRuns: 200 }
);
```

### 3. Invariant Testing

```typescript
// Critical properties that must ALWAYS hold
expect(weightSum).to.equal(10000);
expect(weight).to.be.gte(minWeight);
expect(weight).to.be.lte(maxWeight);
```

## 📚 Learn More

- **[SDK Usage Guide](../../docs/SDK-USAGE-GUIDE.md)** - Complete guide to using @vaultbricks/dss-core, @vaultbricks/dss-test, and @vaultbricks/dss-cli
- **[SDK Tutorial](../../docs/SDK-TUTORIAL.md)** - Step-by-step tutorial with code examples
- **[SDK Quick Reference](../../docs/SDK-QUICK-REFERENCE.md)** - Quick reference for common patterns
- **DSS Specification**: See `../../specification/`
- **Advanced Examples**: See `../` for more complex strategies

## 📦 Using Published Packages

This example demonstrates manual testing patterns. In your own project, you can use the published SDK packages:

### Install Packages

```bash
npm install @vaultbricks/dss-core
npm install --save-dev @vaultbricks/dss-test
```

### Import in Solidity Contracts

```solidity
import "@vaultbricks/dss-core/interfaces/IDSSStrategy.sol";
import "@vaultbricks/dss-core/contracts/DSSAccessControl.sol";
import "@vaultbricks/dss-core/contracts/DSSPausable.sol";
```

### Use in TypeScript Tests

Instead of manual implementation, you can use the SDK utilities:

```typescript
// Using InvariantRunner from @vaultbricks/dss-test
import { InvariantRunner } from "@vaultbricks/dss-test";

const runner = new InvariantRunner({ iterations: 200, seed: 42 });
await runner.run({
  name: "Weight sum invariant",
  setup: async () => {
    /* setup */
  },
  actions: [action1, action2],
  invariants: [checkInvariant],
});

// Using FuzzHelpers from @vaultbricks/dss-test
import { FuzzHelpers, runFuzzTest } from "@vaultbricks/dss-test";
import fc from "fast-check";

await runFuzzTest(
  fc.asyncProperty(FuzzHelpers.arbitraryWeights(2, 5), async (weights) => {
    /* test logic */
  })
);

// Using StandardTests from @vaultbricks/dss-test
import { StandardTests } from "@vaultbricks/dss-test";

await StandardTests.runStandardDSSTests(strategy, {
  owner,
  keeper,
  guardian,
  user,
});
```

See [SDK Usage Guide](../../docs/SDK-USAGE-GUIDE.md) for comprehensive examples.

## 📄 License

MIT License

---

**Built with ❤️ by VaultBricks**  
Part of the DeFi Strategy Standard (DSS) project

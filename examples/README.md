# DSS Examples

**Production-grade strategy examples**

This directory contains complete, battle-tested DSS-compliant strategy implementations with production-ready code.

## 📋 Overview

All examples demonstrate:
- ✅ **Production-tested code** - Adapted from real deployments
- ✅ **Full DSS compliance** - Passes all certification requirements
- ✅ **Comprehensive testing** - Unit, invariant, and fuzz tests
- ✅ **Educational value** - Learn from working code

## 🏗️ Structure

```
examples/
├── sdk/                       # Hardhat-based examples
│   ├── basic-strategy/       # HODLStrategy (equal-weight)
│   └── rebalancing-strategy/ # Fixed6040Strategy (60/40)
└── foundry/                   # Foundry-based examples
    ├── src/                  # Strategy contracts
    └── test/                 # Foundry tests
```

## 📦 Available Examples

### 1. HODLStrategy - Equal-Weight Allocation

**Path:** `sdk/basic-strategy/`  
**Complexity:** ⭐ Basic

Equal-weight distribution across all active assets with automatic rebalancing.

```solidity
// 3 assets → 33.33% each
// 2 assets → 50% each
// Simple, transparent allocation
```

**Use Case:** Diversified exposure without complex calculations

**DSS Coverage:** DSS-1, DSS-2, DSS-3, DSS-4, DSS-7, DSS-9

[→ View full documentation](./sdk/basic-strategy/README.md)

### 2. Fixed6040Strategy - Balanced Portfolio

**Path:** `sdk/rebalancing-strategy/`  
**Complexity:** ⭐ Basic

Classic 60/40 portfolio allocation with weekly rebalancing.

```solidity
// First asset:  60% (growth)
// Second asset: 40% (stability)
// Traditional finance inspired
```

**Use Case:** Balanced exposure (e.g., 60% ETH / 40% stablecoins)

**DSS Coverage:** DSS-1, DSS-2, DSS-3, DSS-4, DSS-7, DSS-9

[→ View full documentation](./sdk/rebalancing-strategy/README.md)

### 3. Foundry Examples

**Path:** `foundry/`  
**Complexity:** ⭐ Basic

Same strategies as above, but using Foundry test framework.

```bash
forge test              # Run all tests
forge test --gas-report # With gas profiling
```

**Advantages:**
- ⚡ Faster execution (Rust-based)
- 📊 Built-in gas profiling
- 🔄 Native fuzz/invariant testing

[→ View full documentation](./foundry/README.md)

## 🧪 Testing Coverage

All examples include:

| Test Type | Description | DSS Category | Files |
|-----------|-------------|--------------|-------|
| **Unit Tests** | Core functionality | DSS-1, DSS-3, DSS-4 | `core.test.ts` / `.t.sol` |
| **Invariant Tests** | Economic properties | DSS-2 | `invariants.test.ts` / `Invariants.t.sol` |
| **Fuzz Tests** | Random input testing | DSS-7 | `fuzzing.test.ts` / `Fuzz.t.sol` |

## 🚀 Quick Start

### Hardhat Example

```bash
cd examples/sdk/basic-strategy
npm install
npm test
```

### Foundry Example

```bash
cd examples/foundry
forge install
forge test
```

## 📚 What You'll Learn

### From HODLStrategy
- Equal-weight calculation
- Weight normalization with bounds
- Rebalance timing (cooldown/intervals)
- Access control patterns
- Emergency pause mechanisms

### From Fixed6040Strategy
- Fixed allocation strategies
- Multiple asset handling
- Constraint enforcement (min/max)
- Production-grade error handling

### From Foundry Tests
- Property-based testing with Forge
- Invariant testing patterns
- Fuzz testing best practices
- Gas optimization techniques

## 🔬 Advanced Patterns

### 1. Weight Normalization

```solidity
// From DSSWeightLib
weights = DSSWeightLib.clampAndNormalizeToBps(
    weights,
    minWeights,
    maxWeights,
    isActive,
    10_000  // 100% in bps
);
```

**Features:**
- Respects per-asset min/max bounds
- Best-effort normalization when exact impossible
- Gas-optimized (production-tested)

### 2. Seedable PRNG for Testing

```typescript
// From InvariantHelpers
const rng = makeRng(12345); // Reproducible tests
for (let i = 0; i < 1000; i++) {
  const randomValue = rng(); // [0, 1)
  // Test with deterministic randomness
}
```

**Benefits:**
- Reproducible failures
- CI/CD friendly
- Debug specific seeds

### 3. Invariant Testing

```typescript
// Invariant test patterns
for (let iter = 0; iter < 200; iter++) {
  // Random operations
  
  // INVARIANTS that must ALWAYS hold:
  expect(weightSum).to.equal(10_000);
  expect(portfolioValue).to.be.gte(previousValue * 0.995); // 0.5% slippage
  expect(lastRebalance).to.be.lte(block.timestamp);
}
```

## 🎯 Choosing an Example

| Your Goal | Use This Example |
|-----------|------------------|
| Learn DSS basics | `basic-strategy` (HODLStrategy) |
| Build balanced portfolio | `rebalancing-strategy` (Fixed6040) |
| Use Foundry/Forge | `foundry/` |
| See production patterns | All examples |
| Prepare for audit | All (comprehensive tests) |

## 🙏 Credits

All examples use production-tested patterns and are designed to demonstrate best practices for DSS-compliant strategies.

## 📖 Next Steps

1. **Start with basics:** `cd sdk/basic-strategy && npm install && npm test`
2. **Read the code:** Study `HODLStrategy.sol` and understand weight calculation
3. **Run fuzz tests:** See how property-based testing finds edge cases
4. **Explore Foundry:** Try `cd foundry && forge test -vvv`
5. **Build your own:** Use these as templates for custom strategies

## 🔗 Related Documentation

- **DSS Specification:** `../specification/`
- **SDK Packages:** `../packages/`---**Built with ❤️ by VaultBricks**  
Part of the DeFi Strategy Standard (DSS) project

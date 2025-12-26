# DSS-1 to DSS-8: Code Quality & Testing

This document covers DSS-1 through DSS-8, which ensure that strategy implementation is correct, secure, and performant.

**Note:** This document reflects the DSS 1.0 structure. The requirements map as follows:
- **DSS-1**: Core Strategy Tests (formerly DSS-1)
- **DSS-2**: Economic Invariants (formerly DSS-3)
- **DSS-3**: Trigger & Timing Tests (NEW)
- **DSS-4**: Risk Management Tests (NEW)
- **DSS-5**: Integration Tests (formerly DSS-2)
- **DSS-6**: Security Tests (formerly DSS-6)
- **DSS-7**: Stress Tests & Fuzzing (formerly DSS-4 + DSS-9)
- **DSS-8**: Gas Efficiency (formerly DSS-5)

---

## DSS-1: Core Strategy Tests

**Priority:** P0 — Critical
**Certification:** Required for all levels

### 1.1 Overview

Core strategy logic tests validate that each strategy correctly implements its intended behavior. This is the foundation of all testing — if the core logic is wrong, nothing else matters.

### 1.2 Requirements

#### 1.2.1 Weight Calculation Tests

Every strategy must have comprehensive tests for its weight calculation function:

| Test Category          | Description                                           | Required     |
|------------------------|-------------------------------------------------------|--------------|
| **Basic Functionality** | Strategy returns expected weights for standard inputs | ✅ All       |
| **Edge Cases**          | Single asset, all inactive, boundary values           | ✅ All       |
| **Error Handling**      | Invalid inputs, overflow protection                   | ✅ All       |
| **State Transitions**   | Enable/disable, parameter changes                     | ✅ All       |

#### 1.2.2 Strategy-Specific Requirements

**HODL Strategy:**
```typescript
// Required tests for equal-weight distribution
describe("HODLFacet", () => {
  it("distributes weight equally among active assets");
  it("handles remainder distribution correctly");
  it("returns zero weights when disabled");
  it("handles single active asset (100% allocation)");
  it("handles all assets inactive (zero weights)");
});
```

**Fixed Allocation Strategy (e.g., 60/40):**
```typescript
describe("Fixed6040Facet", () => {
  it("allocates 60% to first active asset");
  it("allocates 40% to second active asset");
  it("handles single asset (100% allocation)");
  it("handles more than 2 assets (only first 2 get weight)");
  it("respects min/max bounds after clamping");
});
```

**Momentum Strategy:**
```typescript
describe("MomentumFacet", () => {
  it("selects top-N assets by momentum score");
  it("calculates momentum correctly over lookback period");
  it("handles all negative momentum (fallback behavior)");
  it("handles insufficient price history");
  it("respects topN parameter");
});
```

**Mean Reversion Strategy:**
```typescript
describe("MeanReversionFacet", () => {
  it("selects assets below MA by threshold");
  it("calculates moving average correctly");
  it("handles no assets meeting threshold (fallback)");
  it("respects dipThreshold parameter");
  it("handles insufficient price history");
});
```

**Inverse Volatility Strategy:**
```typescript
describe("OracleFacet", () => {
  it("calculates inverse volatility weights correctly");
  it("blends 30-day and 360-day volatility");
  it("handles zero volatility assets");
  it("handles insufficient price history");
  it("respects min/max bounds");
  it("normalizes weights to sum to 10000");
});
```

**Covariance-Based Strategy:**
```typescript
describe("OracleFacet - Covariance Mode", () => {
  it("calculates minimum variance weights");
  it("handles singular covariance matrices");
  it("applies ridge regularization correctly");
  it("falls back to inverse volatility on solver failure");
  it("respects governance-enabled covariance mode");
});
```

### 1.3 Coverage Thresholds

| Level  | Line Coverage | Branch Coverage | Function Coverage |
|--------|---------------|-----------------|-------------------|
| Bronze | ≥80%          | ≥70%            | 100%              |
| Silver | ≥90%          | ≥85%            | 100%              |
| Gold   | ≥95%          | ≥90%            | 100%              |

### 1.4 Implementation Example

```typescript
// test/facets/hodl.spec.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { HODLFacet } from "../typechain-types";

describe("HODLFacet", () => {
  let facet: HODLFacet;

  beforeEach(async () => {
    // Deploy Diamond with HODLFacet
    facet = await deployDiamondWithFacet("HODLFacet");
  });

  describe("calculateInverseVolatilityWeights", () => {
    it("distributes weight equally among 3 active assets", async () => {
      // Setup: 3 active assets
      await setupAssets(facet, [
        { symbol: "WETH", active: true },
        { symbol: "WBTC", active: true },
        { symbol: "USDC", active: true }
      ]);

      // Execute
      const weights = await facet.calculateInverseVolatilityWeights();
      const numericWeights = weights.map((w) => Number(w));

      // Verify: Equal distribution (3333, 3333, 3334)
      expect(numericWeights[0]).to.equal(3333);
      expect(numericWeights[1]).to.equal(3333);
      expect(numericWeights[2]).to.equal(3334);
      expect(numericWeights.reduce((a, b) => a + b, 0)).to.equal(10000);
    });

    it("handles remainder distribution correctly for 7 assets", async () => {
      // 10000 / 7 = 1428.57... → 1428 * 7 = 9996, remainder = 4
      await setupAssets(facet, Array(7).fill({ active: true }));

      const weights = await facet.calculateInverseVolatilityWeights();
      const numericWeights = weights.map((w) => Number(w));

      // First 4 assets get 1429, remaining 3 get 1428
      expect(numericWeights.slice(0, 4).every((w) => w === 1429)).to.be.true;
      expect(numericWeights.slice(4).every((w) => w === 1428)).to.be.true;
      expect(numericWeights.reduce((a, b) => a + b, 0)).to.equal(10000);
    });
  });
});
```

---

## DSS-5: Integration Tests

**Priority:** P1 — High
**Certification:** Required for all levels

### 2.1 Overview

Integration tests validate that components work correctly together. In DeFi strategies, this includes:

- Strategy ↔ Rebalance execution
- Strategy ↔ Oracle price feeds
- Strategy ↔ DEX swaps
- Strategy ↔ Lending protocols

### 2.2 Requirements

#### 2.2.1 Diamond Proxy Integration

For Diamond-pattern implementations:

| Test Category         | Description                          | Required     |
|-----------------------|---------------------------------------|--------------|
| **Facet Routing**     | Correct function dispatch to facets   | ✅ All       |
| **Storage Isolation** | No storage collisions between facets  | ✅ All       |
| **Upgrade Safety**     | DiamondCut preserves state            | ✅ Silver+   |
| **Selector Conflicts**| No duplicate selectors                | ✅ All       |

```typescript
describe("Diamond Integration", () => {
  it("routes calls to correct facet");
  it("preserves storage across upgrades");
  it("rejects duplicate selectors in DiamondCut");
  it("maintains facet address mapping consistency");
});
```

#### 2.2.2 Rebalance Integration

| Test Category           | Description                          | Required     |
|------------------------|--------------------------------------|--------------|
| **Weight Application** | Target weights applied correctly     | ✅ All       |
| **Swap Execution**      | DEX swaps execute with correct parameters | ✅ All       |
| **Slippage Protection**| Reverts on excessive slippage        | ✅ All       |
| **Cooldown Enforcement**| Respects rebalance interval           | ✅ All       |

```typescript
describe("Rebalance Integration", () => {
  it("applies strategy weights during rebalance");
  it("executes swaps through configured DEX");
  it("reverts when slippage exceeds maxSlippageBps");
  it("enforces cooldown between rebalances");
  it("emits Rebalanced event with correct parameters");
});
```

#### 2.2.3 Oracle Integration

| Test Category          | Description                     | Required     |
|------------------------|---------------------------------|--------------|
| **Price Fetching**     | Correct prices from Chainlink   | ✅ All       |
| **Staleness Handling** | Rejects stale prices            | ✅ All       |
| **TWAP Fallback**      | Uses TWAP when Chainlink fails  | ✅ Silver+   |
| **Decimal Normalization**| Consistent 18-decimal output    | ✅ All       |

```typescript
describe("Oracle Integration", () => {
  it("fetches prices from Chainlink feeds");
  it("reverts on stale prices (>1 hour)");
  it("falls back to TWAP when Chainlink unavailable");
  it("normalizes all prices to 18 decimals");
});
```

#### 2.2.4 Lending Protocol Integration

| Test Category           | Description                     | Required     |
|------------------------|---------------------------------|--------------|
| **Supply/Withdraw**     | Correct Aave interactions       | ✅ All       |
| **Health Factor**       | Maintains safe health factor  | ✅ All       |
| **Interest Accrual**    | Tracks aToken balance correctly| ✅ Silver+   |
| **Liquidation Protection**| Prevents unsafe positions      | ✅ All       |

### 2.3 Fork Testing Requirements

For Silver and Gold certification, fork tests against mainnet are required:

| Test Category   | Description                      | Required     |
|-----------------|----------------------------------|--------------|
| **Mainnet Fork**| Test against real protocol state | ✅ Silver+   |
| **Real Liquidity**| Verify slippage on actual pools | ✅ Silver+   |
| **Gas Estimation**| Accurate gas costs on mainnet   | ✅ Silver+   |
| **Multi-Block** | Test across block boundaries    | ✅ Gold      |

```typescript
describe("Arbitrum Mainnet Fork", () => {
  before(async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [{
        forking: {
          jsonRpcUrl: process.env.ARBITRUM_RPC_URL,
          blockNumber: 150000000
        }
      }]
    });
  });

  it("executes rebalance with real Aave V3 pool");
  it("swaps through real Uniswap V3 router");
  it("fetches prices from real Chainlink feeds");
});
```

---

## DSS-2: Economic Invariants

**Priority:** P1 — High
**Certification:** Required for all levels

### 3.1 Overview

Invariant tests verify that critical properties hold across all possible state transitions. Unlike unit tests that check specific scenarios, invariants must hold **always**.

### 3.2 Core Invariants

Every DeFi strategy must maintain these fundamental invariants:

#### 3.2.1 Weight Invariants

| Invariant           | Description                        | Formula                          |
|---------------------|------------------------------------|----------------------------------|
| **Weight Sum**       | Total weights always equal 100%    | `sum(weights) == 10000`         |
| **Non-Negative**     | No negative weights                | `∀i: weights[i] >= 0`            |
| **Bound Compliance** | Weights within min/max bounds     | `minBound <= weight <= maxBound` |
| **Active Only**      | Inactive assets have zero weight  | `!active[i] → weights[i] == 0`    |

```typescript
// test/invariants/weight.invariant.spec.ts
describe("Weight Invariants", () => {
  it("INVARIANT: sum(weights) == 10000 for any asset configuration", async () => {
    for (let i = 0; i < INVARIANT_ITERS; i++) {
      // Random asset configuration
      const config = generateRandomAssetConfig();
      await setupAssets(facet, config);

      const weights = await facet.calculateInverseVolatilityWeights();

      // Invariant check
      expect(weights.reduce((a, b) => a + b, 0)).to.equal(10000);
    }
  });

  it("INVARIANT: inactive assets always have zero weight", async () => {
    for (let i = 0; i < INVARIANT_ITERS; i++) {
      const config = generateRandomAssetConfig();
      await setupAssets(facet, config);

      const weights = await facet.calculateInverseVolatilityWeights();

      // Invariant check
      for (let j = 0; j < config.length; j++) {
        if (!config[j].active) {
          expect(weights[j]).to.equal(0);
        }
      }
    }
  });
});
```

#### 3.2.2 Balance Invariants

| Invariant              | Description                              | Formula                                      |
|------------------------|------------------------------------------|----------------------------------------------|
| **Non-Negative Balances**| No negative token balances              | `∀i: balance[i] >= 0`                       |
| **Share Conservation**   | Total shares = sum of user shares       | `totalShares == Σ userShares`                |
| **Value Conservation**  | Portfolio value preserved (within slippage)| `value_post >= value_pre * (1 - slippage)`  |

```typescript
describe("Balance Invariants", () => {
  it("INVARIANT: no negative balances after any operation sequence", async () => {
    for (let i = 0; i < INVARIANT_ITERS; i++) {
      // Random sequence of deposits, withdrawals, rebalances
      const operations = generateRandomOperations();

      for (const op of operations) {
        await executeOperation(op);

        // Invariant check after each operation
        const balances = await getTokenBalances();
        expect(balances.every(b => b >= 0)).to.be.true;
      }
    }
  });
});
```

#### 3.2.3 Share Price Invariants

| Invariant        | Description                              | Formula                              |
|------------------|------------------------------------------|--------------------------------------|
| **Monotonicity**  | Share price never decreases (excluding fees)| `sharePrice_t >= sharePrice_{t-1}` |
| **Positive Price**| Share price always positive              | `sharePrice > 0`                     |
| **Bounded Growth**| Share price growth bounded              | `sharePrice_t <= sharePrice_0 * maxGrowth` |

```typescript
describe("Share Price Invariants", () => {
  it("INVARIANT: share price is monotonically non-decreasing", async () => {
    let previousPrice = await vault.sharePrice();

    for (let i = 0; i < INVARIANT_ITERS; i++) {
      // Random operation
      await executeRandomOperation();

      const currentPrice = await vault.sharePrice();
      expect(currentPrice).to.be.gte(previousPrice);
      previousPrice = currentPrice;
    }
  });
});
```

#### 3.2.4 Rebalance Invariants

| Invariant        | Description                       | Formula                              |
|------------------|-----------------------------------|--------------------------------------|
| **Cooldown**      | Minimum time between rebalances  | `now - lastRebalance >= interval`   |
| **Slippage Bound**| Actual slippage within limit     | `actualSlippage <= maxSlippageBps`   |
| **Health Factor** | Aave health factor maintained    | `healthFactor >= MIN_HEALTH_FACTOR`  |
| **Event Emission**| Rebalance always emits event     | `emit Rebalanced(...)`               |

### 3.3 Diamond Proxy Invariants

For Diamond-pattern implementations:

| Invariant               | Description                               |
|-------------------------|-------------------------------------------|
| **Selector Uniqueness**  | No two facets share the same selector    |
| **Facet Validity**       | All facet addresses have code             |
| **Cut Atomicity**        | Failed cuts leave Diamond unchanged      |
| **Mapping Consistency**  | `facetAddress(selector)` always valid    |

```typescript
describe("Diamond Invariants", () => {
  it("INVARIANT: no duplicate selectors across facets", async () => {
    const facets = await diamond.facets();
    const allSelectors = facets.flatMap(f => f.selectors);
    const uniqueSelectors = new Set(allSelectors);

    expect(allSelectors.length).to.equal(uniqueSelectors.size);
  });

  it("INVARIANT: all facet addresses have code", async () => {
    const facets = await diamond.facets();

    for (const facet of facets) {
      const code = await ethers.provider.getCode(facet.facetAddress);
      expect(code).to.not.equal("0x");
    }
  });
});
```

### 3.4 Invariant Testing Framework

DSS recommends a custom invariant runner for Hardhat:

```typescript
// test/invariants/InvariantRunner.ts
export class InvariantRunner {
  constructor(
    private iterations: number = parseInt(process.env.INVARIANT_ITERS || "200"),
    private seed: number = parseInt(process.env.INVARIANT_SEED || Date.now().toString())
  ) {
    this.rng = new Mulberry32(this.seed);
  }

  async run(
    name: string,
    setup: () => Promise<void>,
    actions: Array<() => Promise<void>>,
    invariants: Array<() => Promise<void>>
  ): Promise<void> {
    console.log(`Running invariant test: ${name} (seed: ${this.seed})`);

    for (let i = 0; i < this.iterations; i++) {
      await setup();

      // Execute random sequence of actions
      const actionCount = this.rng.nextInt(1, 10);
      for (let j = 0; j < actionCount; j++) {
        const actionIndex = this.rng.nextInt(0, actions.length - 1);
        try {
          await actions[actionIndex]();
        } catch (e) {
          // Some actions may revert - that's expected
        }
      }

      // Verify all invariants hold
      for (const invariant of invariants) {
        await invariant();
      }
    }
  }
}
```

### 3.5 Coverage Thresholds

| Level  | Required Invariants                  | Iterations |
|--------|--------------------------------------|------------|
| Bronze | Weight sum, non-negative balances    | 100        |
| Silver | All core invariants                  | 200        |
| Gold   | All invariants + Diamond invariants  | 500        |

---

## DSS-7: Stress Tests & Fuzzing

**Priority:** P1 — High
**Certification:** Required for all levels

### 4.1 Overview

Fuzzing (property-based testing) generates random inputs to discover edge cases that example-based tests miss. DSS requires fuzzing for all strategy weight calculations.

### 4.2 Fuzzing Framework

**Recommended:** `fast-check` library for Hardhat/TypeScript

```bash
npm install --save-dev fast-check
```

**Configuration:**
```typescript
// Environment variables
FUZZ_ITERS=600        // Local development
FUZZ_ITERS_CI=1000    // CI pipeline
FUZZ_SEED=42          // Reproducible runs (optional)
FUZZ_VERBOSE=true     // Debug logging
```

### 4.3 Required Fuzzing Tests

#### 4.3.1 Weight Calculation Fuzzing

Every strategy must have fuzzing tests for weight calculations:

```typescript
import fc from 'fast-check';

describe("HODLFacet Fuzzing", () => {
  const FUZZ_ITERS = parseInt(process.env.FUZZ_ITERS || "600");

  it("FUZZ: weight sum always equals 10000", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
        async (activeFlags) => {
          // Setup assets with random active/inactive states
          await setupAssetsWithFlags(facet, activeFlags);

          const weights = await facet.calculateInverseVolatilityWeights();

          // Property: sum always equals 10000 (basis points)
          const sum = weights.reduce(
            (a: bigint, b: bigint) => a + b,
            0n
          );
          return sum === 10000n;
        }
      ),
      { numRuns: FUZZ_ITERS }
    );
  });

  it("FUZZ: equal distribution for any number of active assets", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (activeCount) => {
          await setupNActiveAssets(facet, activeCount);

          const weights = await facet.calculateInverseVolatilityWeights();
          const expectedBase = Math.floor(10000 / activeCount);

          // Property: all weights within 1 of expected
          return weights.every(w =>
            Math.abs(w.toNumber() - expectedBase) <= 1
          );
        }
      ),
      { numRuns: FUZZ_ITERS }
    );
  });
});
```

#### 4.3.2 Price History Fuzzing

For volatility-based strategies:

```typescript
describe("OracleFacet Fuzzing", () => {
  it("FUZZ: handles any valid price sequence", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.integer({ min: 1, max: 1000000 }), // Price in cents
          { minLength: 30, maxLength: 365 }
        ),
        async (prices) => {
          await setPriceHistory(oracle, prices);

          const weights = await facet.calculateInverseVolatilityWeights();

          // Properties
          const sum = weights.reduce((a, b) => a + b, 0);
          const allNonNegative = weights.every(w => w >= 0);

          return sum === 10000 && allNonNegative;
        }
      ),
      { numRuns: FUZZ_ITERS }
    );
  });

  it("FUZZ: inverse volatility ordering", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.array(fc.integer({ min: 1, max: 1000000 }), { minLength: 30, maxLength: 30 }),
          { minLength: 2, maxLength: 5 }
        ),
        async (priceHistories) => {
          // Setup multiple assets with different volatilities
          await setupAssetsWithPriceHistories(facet, priceHistories);

          const weights = await facet.calculateInverseVolatilityWeights();
          const volatilities = priceHistories.map(calculateVolatility);

          // Property: lower volatility → higher weight
          for (let i = 0; i < weights.length - 1; i++) {
            if (volatilities[i] < volatilities[i + 1]) {
              return weights[i] >= weights[i + 1];
            }
          }
          return true;
        }
      ),
      { numRuns: FUZZ_ITERS }
    );
  });
});
```

#### 4.3.3 Rebalance Fuzzing

```typescript
describe("RebalanceFacet Fuzzing", () => {
  it("FUZZ: value conservation within slippage", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 10000 }), { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 10, max: 500 }), // slippage bps
        async (targetWeights, slippageBps) => {
          const normalizedWeights = normalizeToSum(targetWeights, 10000);

          const valueBefore = await vault.totalValue();
          await rebalance(normalizedWeights, slippageBps);
          const valueAfter = await vault.totalValue();

          // Property: value preserved within slippage
          const minValue = valueBefore.mul(10000 - slippageBps).div(10000);
          return valueAfter.gte(minValue);
        }
      ),
      { numRuns: FUZZ_ITERS }
    );
  });
});
```

### 4.4 Shrinking & Reproducibility

`fast-check` automatically shrinks failing inputs to minimal examples:

```typescript
// Configure shrinking and seed logging
await fc.assert(
  fc.asyncProperty(...),
  {
    numRuns: FUZZ_ITERS,
    seed: parseInt(process.env.FUZZ_SEED || Date.now().toString()),
    endOnFailure: true,
    verbose: process.env.FUZZ_VERBOSE === 'true'
  }
);
```

**Failure Reproduction:**
```bash
# When a test fails, fast-check logs the seed
# Reproduce with:
FUZZ_SEED=12345 npm run test:fuzz
```

### 4.5 Coverage Thresholds

| Level  | Iterations | Strategies Covered        | Shrinking |
|--------|------------|---------------------------|-----------|
| Bronze | ≥100       | All weight calculations   | Optional  |
| Silver | ≥600       | All + rebalance           | Required  |
| Gold   | ≥1000      | All + oracle + edge cases | Required  |

---

## DSS-8: Gas Efficiency

**Priority:** P1 — High
**Certification:** Required for all levels

### 5.1 Overview

Gas optimization is critical for DeFi strategies. High gas costs can make strategies unprofitable, especially for frequent rebalancing. DSS requires gas benchmarking and regression prevention.

### 5.2 Gas Benchmarking Requirements

#### 5.2.1 Benchmark Categories

| Category                | Operations                             | Target (Arbitrum) |
|------------------------|----------------------------------------|-------------------|
| **Weight Calculation**  | `calculateInverseVolatilityWeights()` | <100k gas         |
| **Rebalance (2 assets)**| Full rebalance cycle                  | <500k gas         |
| **Rebalance (5 assets)**| Full rebalance cycle                  | <1M gas           |
| **Rebalance (10 assets)**| Full rebalance cycle                 | <2M gas           |
| **Deposit**            | User deposit                           | <200k gas         |
| **Withdraw**           | User withdrawal                        | <300k gas         |
| **Oracle Update**      | Price feed update                      | <50k gas          |

#### 5.2.2 Benchmark Implementation

```typescript
// test/gas/gas.benchmark.spec.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Gas Benchmarks", () => {
  const GAS_LIMITS = {
    weightCalculation: 100_000,
    rebalance2Assets: 500_000,
    rebalance5Assets: 1_000_000,
    rebalance10Assets: 2_000_000,
    deposit: 200_000,
    withdraw: 300_000
  };

  it("weight calculation gas benchmark", async () => {
    const gas = await facet.estimateGas.calculateInverseVolatilityWeights();

    console.log(`Weight calculation: ${gas.toString()} gas`);
    expect(Number(gas)).to.be.lte(GAS_LIMITS.weightCalculation);
  });

  it("rebalance gas scales linearly with assets", async () => {
    for (const assetCount of [2, 5, 10]) {
      await setupNAssets(assetCount);

      const tx = await rebalanceFacet.rebalance();
      const receipt = await tx.wait();

      console.log(`Rebalance (${assetCount} assets): ${receipt.gasUsed} gas`);

      const limit = GAS_LIMITS[`rebalance${assetCount}Assets`];
      expect(receipt.gasUsed).to.be.lte(limit);
    }
  });
});
```

### 5.3 Gas Regression Prevention

#### 5.3.1 Snapshot Comparison

```typescript
// test/gas/gas.snapshot.spec.ts
import fs from 'fs';

describe("Gas Snapshots", () => {
  const SNAPSHOT_FILE = '.gas-snapshot';
  const TOLERANCE = 0.05; // 5% tolerance

  after(async () => {
    // Save current gas measurements
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(gasResults, null, 2));
  });

  it("compares against baseline", async () => {
    if (!fs.existsSync(SNAPSHOT_FILE)) {
      console.log("No baseline snapshot - creating new one");
      return;
    }

    const baseline = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));

    for (const [operation, currentGas] of Object.entries(gasResults)) {
      const baselineGas = baseline[operation];
      if (baselineGas) {
        const increase = (currentGas - baselineGas) / baselineGas;

        if (increase > TOLERANCE) {
          throw new Error(
            `Gas regression: ${operation} increased by ${(increase * 100).toFixed(1)}%`
          );
        }
      }
    }
  });
});
```

#### 5.3.2 CI Integration

```yaml
# .github/workflows/gas-check.yml
name: Gas Check
on: [push, pull_request]

jobs:
  gas-benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:gas
      - name: Compare gas snapshots
        run: |
          if git diff --exit-code .gas-snapshot; then
            echo "No gas changes"
          else
            echo "::warning::Gas usage changed - review .gas-snapshot"
          fi
```

### 5.4 Performance Optimization Patterns

| Pattern                | Description                 | Gas Savings |
|------------------------|-----------------------------|-------------|
| **Batch Operations**    | Combine multiple swaps      | 20-40%      |
| **Storage Packing**     | Pack related variables      | 10-20%      |
| **Calldata vs Memory**  | Use calldata for read-only  | 5-10%       |
| **Unchecked Math**      | Skip overflow checks where safe| 5-15%      |
| **Assembly Optimization**| Low-level for hot paths     | 10-30%      |

### 5.5 Coverage Thresholds

| Level  | Requirements                            |
|--------|-----------------------------------------|
| Bronze | Gas benchmarks documented               |
| Silver | Gas regression tests in CI              |
| Gold   | Gas optimization audit + L2 benchmarks  |

---

## DSS-6: Security Tests

**Priority:** P0 — Critical
**Certification:** Required for all levels

### 6.1 Overview

Security testing combines automated static analysis with manual review patterns. DSS requires multiple layers of security validation.

### 6.2 Static Analysis Tools

#### 6.2.1 Required Tools

| Tool      | Purpose                    | Required Level   |
|-----------|----------------------------|------------------|
| **Slither**| Vulnerability detection    | ✅ All           |
| **Mythril**| Symbolic execution        | ✅ Silver+       |
| **Solhint**| Linting & best practices   | ✅ All           |
| **Aderyn** | Rust-based analyzer        | ⚠️ Recommended   |

#### 6.2.2 Slither Configuration

```yaml
# slither.config.json
{
  "detectors_to_exclude": [
    "naming-convention",
    "solc-version"
  ],
  "exclude_informational": true,
  "exclude_low": false,
  "exclude_medium": false,
  "exclude_high": false,
  "filter_paths": [
    "node_modules",
    "lib"
  ]
}
```

**Required Checks:**
```bash
# Run Slither with all detectors
slither . --config-file slither.config.json

# Required: Zero high-severity findings
# Required: Zero medium-severity findings (Silver+)
# Recommended: Address all low-severity findings
```

#### 6.2.3 Mythril Configuration

```bash
# Deep analysis for critical contracts
myth analyze contracts/facets/RebalanceFacet.sol \
  --execution-timeout 3600 \
  --max-depth 50 \
  --strategy bfs
```

### 6.3 Security Test Categories

#### 6.3.1 Access Control Tests

```typescript
describe("Access Control", () => {
  it("only owner can call admin functions");
  it("only keeper can trigger rebalance");
  it("users cannot access other users' funds");
  it("paused state blocks all operations");
  it("emergency withdrawal works when paused");
});
```

#### 6.3.2 Reentrancy Tests

```typescript
describe("Reentrancy Protection", () => {
  it("deposit is protected against reentrancy");
  it("withdraw is protected against reentrancy");
  it("rebalance is protected against reentrancy");
  it("cross-function reentrancy is prevented");
});
```

#### 6.3.3 Oracle Manipulation Tests

```typescript
describe("Oracle Security", () => {
  it("rejects stale price data");
  it("handles oracle failure gracefully");
  it("prevents flash loan price manipulation");
  it("validates price bounds");
});
```

#### 6.3.4 Integer Overflow Tests

```typescript
describe("Integer Safety", () => {
  it("handles maximum uint256 values");
  it("prevents underflow in withdrawals");
  it("weight calculations don't overflow");
  it("share calculations are precise");
});
```

### 6.4 CI Integration

```yaml
# .github/workflows/security.yml
name: Security Analysis
on: [push, pull_request]

jobs:
  slither:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: crytic/slither-action@v0.3.0
        with:
          fail-on: high
          sarif: results.sarif
      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: results.sarif

  mythril:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - run: pip install mythril
      - run: myth analyze contracts/facets/*.sol --execution-timeout 1800
```

### 6.5 Coverage Thresholds

| Level  | Requirements                                    |
|--------|-------------------------------------------------|
| Bronze | Slither: zero high-severity                     |
| Silver | Slither: zero high/medium + Mythril analysis    |
| Gold   | All tools + external audit                      |

---

## DSS-7: Mutation Testing (Part of Stress Tests)

**Priority:** P2 — Medium
**Certification:** Required for Silver+

### 7.1 Overview

Mutation testing validates test quality by introducing bugs (mutations) and verifying tests catch them. A high mutation score indicates robust tests.

### 7.2 Mutation Testing Tools

**Recommended:** Gambit (Certora) or Vertigo

```bash
# Install Gambit
pip install gambit-sol

# Run mutation testing
gambit mutate contracts/facets/HODLFacet.sol --output mutants/
```

### 7.3 Mutation Operators

| Operator | Description                      | Example           |
|----------|----------------------------------|-------------------|
| **AOR**   | Arithmetic operator replacement  | `+` → `-`         |
| **BOR**   | Binary operator replacement      | `&&` → `\|\|`     |
| **ROR**   | Relational operator replacement  | `<` → `<=`        |
| **UOI**   | Unary operator insertion          | `x` → `!x`        |
| **LCR**   | Literal constant replacement      | `10000` → `9999`  |
| **SBR**   | Statement block removal           | Delete statement  |

### 7.4 Implementation

```typescript
// scripts/mutation-test.ts
import { execSync } from 'child_process';
import fs from 'fs';

async function runMutationTests() {
  // Generate mutants
  execSync('gambit mutate contracts/facets/*.sol --output mutants/');

  const mutants = fs.readdirSync('mutants/');
  let killed = 0;
  let survived = 0;

  for (const mutant of mutants) {
    // Replace original with mutant
    const original = mutant.replace('.mutant.sol', '.sol');
    fs.copyFileSync(`mutants/${mutant}`, `contracts/facets/${original}`);

    try {
      // Run tests - should fail if mutant is detected
      execSync('npm test', { stdio: 'pipe' });
      survived++; // Tests passed = mutant survived = weak tests
      console.log(`⚠️ Mutant survived: ${mutant}`);
    } catch {
      killed++; // Tests failed = mutant killed = good tests
    }

    // Restore original
    execSync(`git checkout contracts/facets/${original}`);
  }

  const score = (killed / (killed + survived)) * 100;
  console.log(`Mutation Score: ${score.toFixed(1)}%`);
  console.log(`Killed: ${killed}, Survived: ${survived}`);

  return score;
}
```

### 7.5 Coverage Thresholds

| Level  | Mutation Score | Contracts Covered |
|-------|----------------|-------------------|
| Bronze| Not required    | —                 |
| Silver| ≥75%            | Strategy facets   |
| Gold  | ≥85%            | All facets        |

---

## DSS-6: Formal Verification (Part of Security Tests)

**Priority:** P3 — Low (Gold only)
**Certification:** Required for Gold

### 8.1 Overview

Formal verification mathematically proves that code satisfies its specification. For DeFi strategies, this provides the highest assurance for critical invariants.

### 8.2 Verification Tools

| Tool            | Approach          | Use Case            |
|-----------------|-------------------|---------------------|
| **Certora Prover**| SMT-based         | Complex invariants  |
| **Halmos**       | Symbolic execution| Foundry integration |
| **KEVM**         | K Framework       | EVM semantics      |

### 8.3 Specification Language (CVL)

```cvl
// specs/WeightInvariants.spec

methods {
    function calculateInverseVolatilityWeights() external returns (uint256[]) envfree;
    function getActiveAssetCount() external returns (uint256) envfree;
}

// Invariant: Weight sum always equals 10000
invariant weightSumIs10000()
    sum(calculateInverseVolatilityWeights()) == 10000

// Rule: Inactive assets have zero weight
rule inactiveAssetsZeroWeight(uint256 assetIndex) {
    require !isAssetActive(assetIndex);

    uint256[] weights = calculateInverseVolatilityWeights();

    assert weights[assetIndex] == 0;
}

// Rule: Weight calculation is deterministic
rule weightCalculationDeterministic() {
    uint256[] weights1 = calculateInverseVolatilityWeights();
    uint256[] weights2 = calculateInverseVolatilityWeights();

    assert weights1 == weights2;
}
```

### 8.4 Critical Properties to Verify

| Property              | Description                              | Priority |
|-----------------------|------------------------------------------|----------|
| **Weight Sum**         | `sum(weights) == 10000`                  | P0       |
| **Non-Negative**       | `∀i: weights[i] >= 0`                     | P0       |
| **Share Conservation**| `totalShares == Σ userShares`            | P0       |
| **No Reentrancy**      | State consistent after external calls    | P0       |
| **Access Control**     | Only authorized callers                 | P1       |

### 8.5 Coverage Thresholds

| Level  | Requirements                            |
|--------|-----------------------------------------|
| Bronze | Not required                            |
| Silver | Not required                            |
| Gold   | Critical invariants formally verified   |

---



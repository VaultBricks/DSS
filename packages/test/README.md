# @dss/test

Testing framework and utilities for DSS-compliant strategies.

## Overview

`@dss/test` provides ready-to-use testing utilities for validating DSS compliance:

- **InvariantRunner**: Property-based testing for economic invariants (DSS-2)
- **FuzzHelpers**: Utilities for fuzzing with fast-check (DSS-7)
- **StandardTests**: Pre-built test suites for common DSS requirements

## Installation

```bash
npm install --save-dev @dss/test
```

## Usage

### Invariant Testing (DSS-2)

```typescript
import { createInvariantRunner } from '@dss/test';

describe("Economic Invariants", () => {
  const runner = createInvariantRunner({ iterations: 200, seed: 42 });

  it("maintains weight sum = 10000", async () => {
    await runner.run({
      name: "Weight sum invariant",
      setup: async () => {
        // Setup initial state
      },
      actions: [
        async () => await strategy.deposit(amount),
        async () => await strategy.withdraw(amount),
        async () => await strategy.rebalance()
      ],
      invariants: [
        async () => {
          const weights = await strategy.calculateWeights();
          const sum = weights.reduce((a, b) => a + b, 0n);
          expect(sum).to.equal(10000n);
        }
      ]
    });
  });
});
```

### Fuzzing (DSS-7)

```typescript
import { arbitraryWeights, runFuzzTest, getDefaultFuzzConfig } from '@dss/test';
import fc from 'fast-check';

describe("Fuzzing Tests", () => {
  it("weight sum always equals 10000", async () => {
    await runFuzzTest(
      fc.asyncProperty(
        arbitraryWeights(2, 10),
        async (weights) => {
          await strategy.setWeights(weights);
          const sum = weights.reduce((a, b) => a + b, 0);
          return sum === 10000;
        }
      ),
      getDefaultFuzzConfig('Silver') // 600 iterations
    );
  });
});
```

### Standard Test Suites

```typescript
import { runStandardDSSTests } from '@dss/test';

describe("MyStrategy", () => {
  let strategy, owner, admin, keeper, guardian, user;

  beforeEach(async () => {
    // Deploy strategy and set up roles
  });

  // Run all standard DSS tests
  await runStandardDSSTests(strategy, {
    owner,
    admin,
    keeper,
    guardian,
    user
  });
});
```

## API Reference

### InvariantRunner

- `run(test: InvariantTest)`: Run a single invariant test
- `runSuite(tests: InvariantTest[])`: Run multiple invariant tests

### FuzzHelpers

- `arbitraryWeights(min, max)`: Generate random weights
- `arbitraryPriceHistory(minLen, maxLen)`: Generate price history
- `arbitrarySlippage(min, max)`: Generate slippage values
- `runFuzzTest(property, config)`: Run a fuzzing test

### StandardTests

- `runCoreStrategyTests(strategy)`: DSS-1 tests
- `runAccessControlTests(contract, roles)`: DSS-9.2 tests
- `runPausableTests(contract, roles)`: DSS-4 tests
- `runStandardDSSTests(strategy, roles)`: All standard tests

## Environment Variables

- `INVARIANT_ITERS`: Number of invariant test iterations (default: 200)
- `INVARIANT_SEED`: Seed for reproducible runs
- `INVARIANT_VERBOSE`: Enable verbose logging
- `FUZZ_ITERS`: Number of fuzz test runs (default: 600 for Silver)
- `FUZZ_SEED`: Seed for reproducible fuzzing
- `FUZZ_VERBOSE`: Enable verbose fuzzing output

## License

MIT


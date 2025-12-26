# Reference Implementation: VaultBricks

**VaultBricks** serves as a reference implementation example. It demonstrates how to implement a DSS-compliant strategy testing suite.

> **Note:** This document provides example metrics and structure as a reference for implementing your own DSS-compliant testing framework. Actual certification requires verification through the [Certification Process](CERTIFICATION-PROCESS.md).

## Test Suite Overview

| Metric | Example Value (Reference) |
|--------|---------------------------|
| **Target Certification Level** | Gold |
| **Example Test Count** | 525+ |
| **Example Test Files** | 60+ |
| **Target Statement Coverage** | >98% (Gold requirement) |
| **Target Branch Coverage** | >90% (Gold requirement) |
| **Fuzz Iterations** | 600 (local), 1000 (CI) |
| **Invariant Iterations** | 200 |

## Strategy Facet Coverage

| Facet | Unit Tests | Fuzz Tests | Invariant Tests | Example Status |
|-------|------------|------------|-----------------|----------------|
| HODLFacet | ✅ 15 tests | ✅ 11 tests | ✅ 4 invariants | Complete |
| Fixed6040Facet | ✅ 12 tests | ✅ 3 tests | ✅ 4 invariants | Complete |
| MomentumFacet | ✅ 18 tests | ✅ 5 tests | ✅ 4 invariants | Complete |
| MeanReversionFacet | ✅ 16 tests | ✅ 5 tests | ✅ 4 invariants | Complete |
| OracleFacet | ✅ 25 tests | ⚠️ In Progress | ⚠️ In Progress | 80% |
| RebalanceFacet | ✅ 30 tests | ⚠️ In Progress | ⚠️ In Progress | 75% |
| GatedFacet | ✅ 8 tests | ❌ Deferred | ❌ Deferred | 60% |

> **Note:** This table shows example test coverage distribution. Actual implementations should aim for complete coverage across all facets to meet DSS Gold requirements.

## Test Execution Times

| Test Category | Execution Time |
|---------------|----------------|
| Unit Tests | ~45 seconds |
| Integration Tests | ~2 minutes |
| Fuzz Tests (600 iters) | ~25 seconds |
| Invariant Tests (200 iters) | ~30 seconds |
| Full Suite | ~4 minutes |

## Directory Structure

```
test/
├── facets/                    # Unit tests per facet
│   ├── hodl.spec.ts
│   ├── fixed6040.spec.ts
│   ├── momentum.spec.ts
│   ├── meanreversion.spec.ts
│   ├── oracle.spec.ts
│   └── rebalance.spec.ts
├── fuzz/                      # Property-based tests
│   ├── hodl.fuzz.spec.ts
│   ├── fixed6040.fuzz.spec.ts
│   ├── momentum.fuzz.spec.ts
│   └── meanreversion.fuzz.spec.ts
├── invariants/                # Invariant tests
│   └── strategy.facets.invariant.spec.ts
├── integration/               # Cross-component tests
│   ├── diamond.integration.spec.ts
│   ├── rebalance.integration.spec.ts
│   └── oracle.integration.spec.ts
├── gas/                       # Gas benchmarks
│   └── gas.benchmark.spec.ts
└── helpers/                   # Test utilities
    ├── fixtures.ts
    ├── generators.ts
    └── assertions.ts
```

## Example Test Commands

The following commands demonstrate how to run a DSS-compliant test suite (adapt to your project):

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run coverage

# Run fuzzing tests
npm run test:fuzz

# Run invariant tests
npm run test:invariants

# Run gas benchmarks
npm run test:gas
```


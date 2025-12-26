# Reference Implementation: VaultBricks

**VaultBricks** is DSS-certified and serves as the reference implementation. It demonstrates how to implement a fully compliant strategy testing suite.

- ✅ **DSS Gold Certified**
- 📊 **525+ tests** across all DSS categories
- 🎯 **>98% statement coverage, >90% branch coverage** (DSS Gold requirements)
- 🔒 **Zero high-severity findings**

This document provides the test suite metrics and structure as a reference for implementing your own DSS-compliant testing framework.

## Test Suite Overview

| Metric | Value |
|--------|-------|
| **DSS Certification** | 🥇 Gold |
| **Total Tests** | 525+ |
| **Test Files** | 60+ |
| **Statement Coverage** | >98% |
| **Branch Coverage** | >90% |
| **Fuzz Iterations** | 600 (local), 1000 (CI) |
| **Invariant Iterations** | 200 |

## Strategy Facet Coverage

| Facet | Unit Tests | Fuzz Tests | Invariant Tests | Status |
|-------|------------|------------|-----------------|--------|
| HODLFacet | ✅ 15 tests | ✅ 11 tests | ✅ 4 invariants | Complete |
| Fixed6040Facet | ✅ 12 tests | ✅ 3 tests | ✅ 4 invariants | Complete |
| MomentumFacet | ✅ 18 tests | ✅ 5 tests | ✅ 4 invariants | Complete |
| MeanReversionFacet | ✅ 16 tests | ✅ 5 tests | ✅ 4 invariants | Complete |
| OracleFacet | ✅ 25 tests | ⚠️ In Progress | ⚠️ In Progress | 80% |
| RebalanceFacet | ✅ 30 tests | ⚠️ In Progress | ⚠️ In Progress | 75% |
| GatedFacet | ✅ 8 tests | ❌ Deferred | ❌ Deferred | 60% |

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


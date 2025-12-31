# DSS Foundry Examples

**Production-tested strategies with Foundry test framework**

This directory contains Foundry/Forge versions of DSS-compliant strategies.

## 📋 Overview

Foundry examples demonstrate:
- ✅ **Property-based testing** with built-in fuzzer
- ✅ **Invariant testing** with stateful fuzzing
- ✅ **Fast execution** with Rust-based tooling
- ✅ **Gas profiling** for optimization

## 🏗️ Structure

```
examples/foundry/
├── src/
│   ├── HODLStrategy.sol       # Equal-weight strategy
│   ├── Fixed6040Strategy.sol  # 60/40 allocation strategy
│   └── DSSWeightLib.sol       # Weight normalization library
├── test/
│   ├── HODL.t.sol            # Unit tests
│   ├── Invariants.t.sol      # Invariant tests
│   └── Fuzz.t.sol            # Fuzz tests
└── foundry.toml              # Configuration
```

## 🚀 Quick Start

### Installation

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install
```

### Running Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test file
forge test --match-path test/HODL.t.sol

# Run specific test
forge test --match-test testFuzz_WeightSumInvariant

# Run with gas report
forge test --gas-report
```

### Fuzz Testing

```bash
# Run with custom fuzz iterations
forge test --fuzz-runs 5000

# Run invariant tests
forge test --match-contract InvariantsTest
```

### Profiles

```bash
# CI profile (more iterations)
forge test --profile ci

# Lite profile (faster)
forge test --profile lite
```

## 🧪 Test Categories

### Unit Tests (`HODL.t.sol`)
Standard unit tests for:
- Deployment validation
- Weight calculation
- Access control
- Rebalance timing
- Emergency pause

**DSS Coverage:** DSS-1, DSS-3, DSS-4

### Invariant Tests (`Invariants.t.sol`)
Property-based tests that verify:
- Weight sum = 10000 (always)
- Non-negative weights (always)
- Bounds respect (always)
- Timestamp monotonicity (always)

**DSS Coverage:** DSS-2

### Fuzz Tests (`Fuzz.t.sol`)
Randomized input testing:
- Random asset counts (2-10)
- Random min/max bounds
- Random time intervals
- Edge case discovery

**DSS Coverage:** DSS-7

## 📊 Test Configuration

### From `foundry.toml`

```toml
[profile.default]
fuzz_runs = 1000              # Number of fuzz test runs
invariant_runs = 256
invariant_depth = 15
verbosity = 2
```

### Environment Variables

```bash
# Set custom fuzz iterations
export FOUNDRY_FUZZ_RUNS=5000

# Set random seed for reproducibility
export FOUNDRY_FUZZ_SEED=12345
```

## 🎯 DSS Compliance

| Test Type | File | DSS Categories |
|-----------|------|----------------|
| Unit | `HODL.t.sol` | DSS-1, DSS-3, DSS-4, DSS-9 |
| Invariant | `Invariants.t.sol` | DSS-2 |
| Fuzz | `Fuzz.t.sol` | DSS-7 |

## 💡 Testing Patterns

### 1. Stateless Fuzzing
```solidity
function testFuzz_WeightSumInvariant(uint8 assetCount) public {
    assetCount = uint8(bound(assetCount, 2, 10));
    // Test with random asset count
}
```

### 2. Invariant Testing
```solidity
function invariant_WeightSumIs10000() public {
    // This property must ALWAYS hold
    assertEq(sum, 10000);
}
```

### 3. Bounded Inputs
```solidity
function testFuzz_BoundsRespected(
    uint16 minWeight,
    uint16 maxWeight
) public {
    // Ensure valid range
    minWeight = uint16(bound(minWeight, 0, 3000));
    maxWeight = uint16(bound(maxWeight, minWeight, 10000));
}
```

## 📈 Performance

Foundry is significantly faster than Hardhat:

```
HODL.t.sol (10 tests)         ~50ms
Invariants.t.sol (5 tests)    ~100ms
Fuzz.t.sol (1000 runs)        ~2s
Total                         ~2.5s
```

vs Hardhat: ~30-60s for equivalent tests

## 🔬 Advanced Usage

### Gas Profiling

```bash
forge test --gas-report

# Output example:
# ├─ calculateWeights        avg: 45,234 gas
# ├─ rebalance              avg: 123,456 gas
```

### Coverage

```bash
forge coverage

# Generate LCOV report
forge coverage --report lcov
```

### Debugging

```bash
# Run with max verbosity
forge test -vvvv

# Debug specific test
forge test --debug testFuzz_WeightSumInvariant
```

## 🙏 Credits

Test patterns use industry best practices:
- Fuzz iterations: 1000 runs
- Invariant depth: 15 levels
- Property-based testing approach
- Seedable randomness for reproducibility

## 📚 Learn More

- **Foundry Book**: [book.getfoundry.sh](https://book.getfoundry.sh)
- **DSS Specification**: `../../specification/`

## 📄 License

MIT License

---

**Built with ❤️ by VaultBricks**  
Part of the DeFi Strategy Standard (DSS) project


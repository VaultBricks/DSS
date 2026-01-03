# Implementation Guidelines

This section provides practical guidance for implementing DSS requirements.

## Tool Integration

### Recommended Tool Stack

| Category | Tool | Purpose |
|----------|------|---------|
| **Standards** | VaultBricks MAS | Multi-asset architecture |
| **Framework** | Hardhat | Development, testing, deployment |
| **Testing** | Mocha + Chai | Unit and integration tests |
| **Fuzzing** | fast-check | Property-based testing |
| **Coverage** | solidity-coverage | Code coverage reporting |
| **Static Analysis** | Slither | Vulnerability detection |
| **Mutation** | Gambit | Test quality validation |
| **Formal Verification** | Certora | Mathematical proofs |
| **Monitoring** | OpenZeppelin Defender | On-chain monitoring |

### Package Installation

```bash
# Core testing dependencies
npm install --save-dev \
  hardhat \
  @nomicfoundation/hardhat-toolbox \
  chai \
  mocha \
  typescript

# Fuzzing
npm install --save-dev fast-check

# Coverage
npm install --save-dev solidity-coverage

# Static analysis (Python)
pip install slither-analyzer

# Mutation testing (Python)
pip install gambit-sol
```

## Example npm Scripts

The commands used throughout this document (for example `npm run test:fuzz` and `npm run test:invariants`) assume you have defined corresponding scripts in your `package.json`. A minimal Hardhat-based setup might look like:

```jsonc
{
  "scripts": {
    "test": "hardhat test",
    "coverage": "hardhat coverage",
    "test:dss": "hardhat test --grep \"DSS\"",
    "test:compliance": "hardhat test --grep \"DSS-\"",
    "test:core": "hardhat test --grep \"DSS-[1-8]\"", // Core Engineering (DSS-1 to DSS-8)
    "test:fuzz": "hardhat test --grep \"FUZZ\"",
    "test:invariants": "hardhat test --grep \"INVARIANT\"",
    "test:gas": "hardhat test --grep \"Gas\"",
    "test:mutation": "ts-node scripts/mutation-test.ts"
  }
}
```

## Code Examples

Complete code examples are available in the [examples/](../../examples/) directory:

- [Fuzzing Test Example](../../examples/fuzzing-test-example.ts) - Complete fuzzing test implementation
- [Invariant Test Example](../../examples/invariant-test-example.ts) - Complete invariant test implementation
- [Package.json Example](../../examples/package.json.example) - Full package.json configuration

## CI/CD Pipeline Configuration

Example CI/CD configurations are available in the [examples/](../../examples/) directory:

- [GitHub Actions DSS Compliance](../../examples/github-actions-dss-compliance.yml) - Complete CI/CD workflow
- [Slither Configuration](../../examples/slither.config.json) - Static analysis configuration

## Framework-Specific Guides

### Hardhat

The reference implementation uses Hardhat. See the [examples/](../../examples/) directory for complete Hardhat configurations.

### Foundry

Foundry support is planned for version 1.1.0. The DSS requirements are framework-agnostic and can be implemented with Foundry's testing framework.

## Environment Variables

DSS uses environment variables for configuration:

```bash
# Fuzzing configuration
FUZZ_ITERS=600        # Local development
FUZZ_ITERS_CI=1000    # CI pipeline
FUZZ_SEED=42          # Reproducible runs (optional)
FUZZ_VERBOSE=true     # Debug logging

# Invariant testing configuration
INVARIANT_ITERS=200
INVARIANT_SEED=12345  # Reproducible runs (optional)
```

## Coverage Thresholds

Configure coverage thresholds in your `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
  },
  coverage: {
    // Bronze thresholds
    lines: 80,
    branches: 60,
    functions: 100,
    statements: 80,
  },
};

export default config;
```

## Static Analysis Configuration

### Slither Configuration

See [examples/slither.config.json](../../examples/slither.config.json) for a complete Slither configuration.

### Running Slither

```bash
# Run Slither with all detectors
slither . --config-file slither.config.json

# Required: Zero high-severity findings
# Required: Zero medium-severity findings (Silver+)
# Recommended: Address all low-severity findings
```

## Mutation Testing

### Gambit Configuration

```bash
# Install Gambit
pip install gambit-sol

# Run mutation testing
gambit mutate contracts/facets/HODLFacet.sol --output mutants/
```

See the [examples/](../../examples/) directory for a complete mutation testing script.

## Formal Verification

### Certora Prover

For Gold certification, formal verification is required for critical paths. See the [Certora documentation](https://docs.certora.com/) for setup and configuration.

## Related Documentation

- [Certification Matrix](../../certification/CERTIFICATION-MATRIX.md) - Complete requirements table
- [Specification Part A](../../specification/part-a-code-quality.md) - Code Quality requirements (DSS-1 to DSS-8)
- [Specification Part E](../../specification/part-e-interoperability.md) - Interoperability (DSS-11)
- [Certification Process](../../certification/CERTIFICATION-PROCESS.md) - How to get certified
- [Examples](../../examples/) - Complete code examples

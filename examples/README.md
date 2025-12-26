# DSS Code Examples

This directory contains complete code examples for implementing DSS requirements.

## Examples

### Test Examples

- **[fuzzing-test-example.ts](fuzzing-test-example.ts)** - Complete fuzzing test implementation using fast-check
  - Demonstrates property-based testing for weight calculations
  - Shows how to test invariants with random inputs
  - Includes reproducible seed configuration

- **[invariant-test-example.ts](invariant-test-example.ts)** - Complete invariant test implementation
  - Demonstrates invariant testing with random operation sequences
  - Shows how to use seedable PRNG for reproducibility
  - Includes examples of share price and balance invariants

### Configuration Examples

- **[package.json.example](package.json.example)** - Complete package.json configuration
  - All required npm scripts for DSS compliance
  - Dependencies for Hardhat, testing, fuzzing, and coverage
  - Ready to use as a starting point

- **[github-actions-dss-compliance.yml](github-actions-dss-compliance.yml)** - Complete CI/CD workflow
  - Unit tests, coverage, fuzzing, invariants
  - Static analysis with Slither
  - Gas benchmarks and mutation testing
  - Ready to copy to `.github/workflows/`

- **[slither.config.json](slither.config.json)** - Slither static analysis configuration
  - Excludes informational findings
  - Configures severity thresholds
  - Filters out node_modules and lib directories

## Usage

### Setting Up Tests

1. Copy the example test files to your `test/` directory:
   ```bash
   cp examples/fuzzing-test-example.ts test/fuzz/strategy.fuzz.spec.ts
   cp examples/invariant-test-example.ts test/invariants/portfolio.invariant.spec.ts
   ```

2. Install required dependencies:
   ```bash
   npm install --save-dev fast-check
   ```

3. Configure environment variables:
   ```bash
   export FUZZ_ITERS=600
   export INVARIANT_ITERS=200
   ```

### Setting Up CI/CD

1. Copy the GitHub Actions workflow:
   ```bash
   mkdir -p .github/workflows
   cp examples/github-actions-dss-compliance.yml .github/workflows/dss-compliance.yml
   ```

2. Adjust coverage thresholds in the workflow to match your certification level:
   - Bronze: >80% statement coverage, >60% branch coverage
   - Silver: >95% statement coverage, >80% branch coverage
   - Gold: >98% statement coverage, >90% branch coverage

### Setting Up Static Analysis

1. Copy the Slither configuration:
   ```bash
   cp examples/slither.config.json slither.config.json
   ```

2. Run Slither:
   ```bash
   slither . --config-file slither.config.json
   ```

## Framework Support

Currently, examples are provided for **Hardhat**. Foundry examples are planned for version 1.1.0.

The DSS requirements are framework-agnostic, so you can adapt these examples to your preferred testing framework.

## Related Documentation

- [Implementation Guidelines](../IMPLEMENTATION-GUIDELINES.md) - Complete implementation guide
- [Specification Part A](../specification/part-a-code-quality.md) - Code Quality requirements
- [Certification Process](../CERTIFICATION-PROCESS.md) - How to get certified

## Contributing

If you have examples for other frameworks (Foundry, Truffle, etc.), please contribute them! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.




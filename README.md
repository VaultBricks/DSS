# DeFi Strategy Standard (DSS)

> Comprehensive testing & validation framework for DeFi trading strategies

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.2.0--alpha-blue?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Status-Beta-orange?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/Documentation-Complete-success?style=flat-square" alt="Documentation"/>
  <img src="https://img.shields.io/badge/SDK-Available-success?style=flat-square" alt="SDK"/>
  <img src="https://img.shields.io/badge/MAS-Compatible-brightgreen?style=flat-square" alt="MAS Compatible"/>
  <img src="https://img.shields.io/badge/ERC4626-Compliant-blueviolet?style=flat-square" alt="ERC4626"/>
  <br/>
  <img src="https://github.com/VaultBricks/DSS/workflows/Test%20Suite/badge.svg" alt="Tests"/>
  <img src="https://github.com/VaultBricks/DSS/workflows/Security%20Scan/badge.svg" alt="Security"/>
  <img src="https://github.com/VaultBricks/DSS/workflows/Documentation%20Checks/badge.svg" alt="Docs"/>
</p>

---

## Overview

The **DeFi Strategy Standard (DSS)** is the industry standard for validating DeFi trading strategies. DSS introduces a streamlined 14-point architecture focused on code quality, economic soundness, interoperability, and developer experience.

**NEW in v1.2.0:** DSS SDK & Tooling - Build DSS-compliant strategies with ready-to-use contracts, testing utilities, and CLI tools!

DSS combines:
- **Developer Tools**: SDK with contracts, testing framework, and CLI for rapid development.
- **Rigorous Validation**: DSS architecture with strict coverage requirements.
- **Interoperability**: Native support for **ERC-4626** and **MAS (Multi-Asset Standard)**.
- **2025 Best Practices**: Formal verification, mutation testing, and full invariant coverage.

### Why DSS?

**The Problem:** The DeFi industry lacks standardized testing practices. Most protocols launch with:

| Common Practice | Risk |
|-----------------|------|
| "Audit coming soon" | Unverified code handling user funds |
| 40-60% test coverage | Critical paths untested |
| No fuzzing | Edge cases undiscovered |
| No backtesting | Strategy performance unknown |
| No operational procedures | Incident response undefined |

**The Solution:** DSS provides a complete framework that standardizes:
1. **What to test** — Specific categories (DSS-1 through DSS-14)
2. **How much to test** — Quantitative coverage metrics per certification level
3. **How to validate** — Economic and market condition testing
4. **How to operate** — Deployment and monitoring standards
5. **How to govern** — Upgrade and documentation requirements

## Framework Structure (DSS 1-14)

DSS organizes requirements into **14 Functional Categories**:

### Core Engineering
- **DSS-1: Core Strategy Tests** - Weight logic, bounds, and basic correctness.
- **DSS-2: Economic Invariants** - Portfolio value conservation and math guarantees.
- **DSS-3: Trigger & Timing Tests** - Automation logic, cooldowns, and stale data handling.
- **DSS-4: Risk Management Tests** - Stop-losses, drawdowns, and emergency pauses.
- **DSS-5: Integration Tests** - Interactions with DEXs, Lending protocols, and Oracles.
- **DSS-6: Security Tests** - Flash loans, reentrancy, and manipulation resistance.

### Advanced Validation
- **DSS-7: Stress Tests & Fuzzing** - Random inputs, market crashes, and chaos testing.
- **DSS-8: Gas Efficiency** - Benchmarks and scaling limits.

### Operational & Governance
- **DSS-9: Operational Security** - Deployment, keys, and monitoring.
- **DSS-10: Governance & Upgrades** - Timelocks, audits, and disclosure.

### Interoperability
- **DSS-11: Interoperability** - ERC-4626 and MAS Protocol compliance.

### Tooling & Automation
- **DSS-12: Developer Experience & Documentation** - API docs, code templates, and tutorials.
- **DSS-13: CI/CD & Automation** - Automated testing, security scanning, and deployment workflows.
- **DSS-14: Production Monitoring & Observability** - Event monitoring, health checks, and incident response.

## Certification Levels

| Level | Focus | Key Requirements |
|-------|-------|------------------|
| 🥉 **Bronze** | MVP / Testnet | DSS 1-6, Basic Interoperability. >80% Coverage. |
| 🥈 **Silver** | Mainnet <$10M | All Bronze + Stress Tests (DSS-7), Audits. >95% Coverage. |
| 🥇 **Gold** | Institutional | Formal Verification, L2 Optimization, Bug Bounty. >98% Coverage. |

## 🚀 Quick Start

### Using the DSS CLI (Recommended)

```bash
# Install the DSS CLI globally
npm install -g @vaultbricks/dss-cli

# Create a new DSS-compliant strategy
dss init my-strategy

# Navigate to your project
cd my-strategy

# Install dependencies
npm install

# Run tests
npm test

# Check DSS compliance
dss check --level silver

# Generate certification report
dss report
```

### Manual Setup

```bash
# Clone the DSS repository
git clone https://github.com/VaultBricks/DSS.git
cd DSS

# Install dependencies
npm install

# Run the test suite
npm test

# Generate coverage report
npm run coverage
```

## 📚 Production Examples

DSS includes production-tested strategy examples:

### Strategy Examples
- **[HODLStrategy](examples/sdk/basic-strategy/)** - Equal-weight allocation strategy
- **[Fixed6040Strategy](examples/sdk/rebalancing-strategy/)** - Classic 60/40 portfolio
- **[Foundry Examples](examples/foundry/)** - Foundry/Forge test implementations

### Operational Examples (NEW!)
- **[Monitoring Bots](examples/operational/monitoring/)** - Real-time health monitoring and alerting
- **[Keeper Bots](examples/operational/keeper/)** - Automated rebalancing and maintenance
- **[Deployment Scripts](examples/operational/deployment/)** - Multi-sig deployment and verification
- **[Incident Response](examples/operational/incident-response/)** - Emergency procedures and playbooks

All examples include comprehensive test coverage and demonstrate DSS compliance.

See [Examples README](examples/README.md) for details.

## 📦 DSS SDK Packages

DSS now provides a complete SDK for building compliant strategies:

> **📚 New!** Check out the [SDK Usage Guide](./docs/SDK-USAGE-GUIDE.md) for comprehensive examples and tutorials.

### [@vaultbricks/dss-core](./packages/core) - Solidity Contracts

Base contracts and interfaces for DSS strategies:

```bash
npm install @vaultbricks/dss-core
# or
forge install VaultBricks/DSS
```

**Includes:**
- `IDSSStrategy` - Core strategy interface
- `DSSAccessControl` - Role-based access control (DSS-9)
- `DSSPausable` - Emergency pause (DSS-4)
- `DSSTimelock` - Governance timelock (DSS-10)
- `DSSWeightLib` - Battle-tested weight normalization library

### [@vaultbricks/dss-test](./packages/test) - Testing Framework

Ready-to-use testing utilities:

```bash
npm install --save-dev @vaultbricks/dss-test
```

**Includes:**
- `InvariantRunner` - Property-based testing (DSS-2)
- `InvariantHelpers` - Extended invariant testing utilities (value conservation, share price monotonicity, weight sum checks)
- `FuzzHelpers` - Extended fuzzing utilities with arbitraries (DSS-7)
- `StandardTests` - Pre-built test suites

### [@vaultbricks/dss-cli](./packages/cli) - Command Line Tool

Project initialization and certification:

```bash
npm install -g @vaultbricks/dss-cli
```

**Commands:**
- `dss init` - Create new project
- `dss check` - Verify compliance
- `dss report` - Generate certification report

## Documentation

### Getting Started
- **[Getting Started Guide](GETTING-STARTED.md)** - Step-by-step tutorial for building your first DSS strategy
- **[SDK Tutorial](docs/SDK-TUTORIAL.md)** - Complete tutorial with code examples ⭐ NEW
- **[SDK Usage Guide](docs/SDK-USAGE-GUIDE.md)** - Comprehensive guide to all SDK packages ⭐ NEW
- **[SDK Quick Reference](docs/SDK-QUICK-REFERENCE.md)** - Quick reference for common patterns ⭐ NEW

### Core Documentation
- **[Certification Matrix](certification/CERTIFICATION-MATRIX.md)** - Full requirements table
- **[Certification Process](certification/CERTIFICATION-PROCESS.md)** - How to get certified
- **[Interoperability Guide](specification/part-e-interoperability.md)** - MAS + ERC4626

### SDK Documentation
- **[SDK Usage Guide](./docs/SDK-USAGE-GUIDE.md)** - Complete guide with examples
- **[SDK Quick Reference](./docs/SDK-QUICK-REFERENCE.md)** - Quick reference guide
- **[@vaultbricks/dss-core](./packages/core/README.md)** - Solidity contracts and interfaces
- **[@vaultbricks/dss-test](./packages/test/README.md)** - Testing framework and utilities
- **[@vaultbricks/dss-cli](./packages/cli/README.md)** - Command-line tool
- **[Packages Overview](./packages/README.md)** - Complete SDK documentation

### Specification Parts
- [Part A: Code Quality](specification/part-a-code-quality.md) (DSS 1-8)
- [Part B: Economic Validation](specification/part-b-economic.md) (Reference)
- [Part C: Operational Security](specification/part-c-operational.md) (DSS-9)
- [Part D: Governance](specification/part-d-governance.md) (DSS-10)
- [Part E: Interoperability](specification/part-e-interoperability.md) (DSS-11)
- [Part F: Tooling & Automation](specification/part-f-tooling.md) (DSS-12, DSS-13, DSS-14) ⭐ NEW

## DSS & MAS: Better Together

DSS complements the VaultBricks Multi-Asset Standard (MAS):

| Standard | Focus        | Scope                        |
|----------|--------------|------------------------------|
| [MAS](https://github.com/vaultbricks/mas) | Architecture | Multi-asset vault structure  |
| DSS      | Validation   | Strategy testing & security  |

See [Integration Guide](docs/integration/INTEGRATION-WITH-MAS.md) for details.

## Contributing

DSS is an open-source standard that welcomes contributions from the community.
See [Contributing Guide](docs/development/CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file.

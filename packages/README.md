# DSS SDK & Tooling

Welcome to the **DeFi Strategy Standard (DSS)** SDK and tooling ecosystem!

This monorepo contains everything you need to build, test, and certify DSS-compliant DeFi strategies.

## 📦 Packages

### [@vaultbricks/dss-core](./packages/core)

Core Solidity contracts and interfaces for DSS-compliant strategies.

```bash
npm install @vaultbricks/dss-core
# or
forge install VaultBricks/DSS
```

**Includes:**
- `IDSSStrategy` - Core strategy interface
- `IDSSRegistry` - Strategy registry interface
- `DSSAccessControl` - Role-based access control
- `DSSPausable` - Emergency pause mechanism
- `DSSTimelock` - Governance timelock

### [@vaultbricks/test](./packages/test)

Testing framework and utilities for DSS compliance.

```bash
npm install --save-dev @vaultbricks/test
```

**Includes:**
- `InvariantRunner` - Property-based invariant testing (DSS-2)
- `FuzzHelpers` - Utilities for fuzzing with fast-check (DSS-7)
- `StandardTests` - Pre-built test suites for common requirements

### [@vaultbricks/cli](./packages/cli)

Command-line tool for project initialization and certification.

```bash
npm install -g @vaultbricks/cli
```

**Commands:**
- `dss init` - Initialize a new DSS project
- `dss check` - Check DSS compliance
- `dss report` - Generate certification report

## 🚀 Quick Start

### 1. Install the CLI

```bash
npm install -g @vaultbricks/cli
```

### 2. Create a New Project

```bash
dss init my-strategy
cd my-strategy
npm install
```

### 3. Run Tests

```bash
npm test
```

### 4. Check Compliance

```bash
dss check --level silver
```

### 5. Generate Report

```bash
dss report --output CERTIFICATION.md
```

## 📖 Documentation

Full documentation is available in the [specification](./specification) directory:

- [Part A: Code Quality](./specification/part-a-code-quality.md) - DSS-1 to DSS-8
- [Part B: Economic Reference](./specification/part-b-economic.md) - Backtesting & Economic Validation
- [Part C: Operational Security](./specification/part-c-operational.md) - DSS-9
- [Part D: Governance](./specification/part-d-governance.md) - DSS-10
- [Part E: Interoperability](./specification/part-e-interoperability.md) - DSS-11
- [Part F: Tooling & Automation](./specification/part-f-tooling.md) - DSS-12, DSS-13, DSS-14

## 🎯 Features

### For Developers

- **Quick Start**: Initialize projects with `dss init`
- **Type Safety**: Full TypeScript support
- **Testing**: Ready-to-use test utilities
- **Best Practices**: Built-in security and operational patterns

### For Auditors

- **Automated Checks**: `dss check` validates compliance
- **Detailed Reports**: `dss report` generates audit-ready documentation
- **Standard Tests**: Consistent testing patterns across projects

### For Users

- **Trust**: Certified strategies meet rigorous standards
- **Transparency**: Public registry of certified strategies
- **Safety**: Built-in risk management and emergency mechanisms

## 🏆 Certification Levels

### 🥉 Bronze (>80% compliance)

- Core strategy tests (DSS-1)
- Economic invariants (DSS-2)
- Integration tests (DSS-5)
- Basic documentation

### 🥈 Silver (>95% compliance)

- All Bronze requirements
- Trigger & timing tests (DSS-3)
- Risk management tests (DSS-4)
- Fuzzing & stress tests (DSS-7)
- Security analysis (DSS-8)
- Full operational documentation

### 🥇 Gold (>98% compliance)

- All Silver requirements
- Professional security audit
- Formal verification
- Bug bounty program
- Public disclosure

## 📊 Example Usage

### Creating a Rebalancing Strategy

```typescript
// contracts/MyStrategy.sol
import "@dss/core/interfaces/IDSSStrategy.sol";
import "@dss/core/contracts/DSSAccessControl.sol";
import "@dss/core/contracts/DSSPausable.sol";

contract MyStrategy is IDSSStrategy, DSSAccessControl, DSSPausable {
    // Your strategy implementation
}
```

### Testing with Invariants

```typescript
// test/invariants.test.ts
import { createInvariantRunner } from '@dss/test';

describe("Invariants", () => {
  const runner = createInvariantRunner();
  
  it("maintains weight sum = 10000", async () => {
    await runner.run({
      name: "Weight sum invariant",
      setup: async () => { /* setup */ },
      actions: [depositAction, withdrawAction, rebalanceAction],
      invariants: [checkWeightSum]
    });
  });
});
```

### Checking Compliance

```bash
$ dss check --level silver

🔍 DSS Compliance Check
Target Level: SILVER

✓ Project structure checked
✓ Required files checked
✓ Contracts checked
✓ Tests checked

Compliance: 96%
✅ Project meets SILVER level requirements!
```

## 🛠️ Development

### Project Structure

```
DSS/
├── packages/
│   ├── core/          # Solidity contracts
│   ├── test/          # Testing utilities
│   └── cli/           # CLI tool
├── specification/     # DSS documentation
├── examples/          # Example strategies
└── CHANGELOG.md
```

### Building

Each package can be built independently:

```bash
cd packages/core
# (Solidity - no build step)

cd packages/test
npm install && npm run build

cd packages/cli
npm install && npm run build
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- **GitHub**: https://github.com/VaultBricks/DSS
- **Documentation**: https://github.com/VaultBricks/DSS/tree/main/specification
- **Issues**: https://github.com/VaultBricks/DSS/issues
- **Roadmap**: [v1.1.0 Milestone](https://github.com/VaultBricks/DSS/milestone/1)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

*Built with ❤️ by the VaultBricks team*




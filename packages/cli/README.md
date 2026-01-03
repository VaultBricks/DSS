# @vaultbricks/dss-cli

Command-line interface for DSS project initialization and certification.

## Overview

`@vaultbricks/dss-cli` provides tools to:

- **Initialize** new DSS-compliant strategy projects
- **Check** project compliance against DSS requirements
- **Generate** certification reports

## Installation

### Global Installation

```bash
npm install -g @vaultbricks/dss-cli
```

### Usage Without Installation

```bash
npx @vaultbricks/dss-cli init my-strategy
```

## Commands

### `dss init`

Initialize a new DSS-compliant strategy project.

```bash
dss init [options]

Options:
  -n, --name <name>           Project name
  -f, --framework <framework> Framework (hardhat|foundry) [default: hardhat]
  -t, --template <template>   Strategy template (basic|rebalancing|lending) [default: basic]
```

**Example:**

```bash
dss init -n my-strategy -f hardhat -t rebalancing
cd my-strategy
npm install
npm test
```

### `dss check`

Check DSS compliance of the current project.

```bash
dss check [options]

Options:
  -l, --level <level>  Target certification level (bronze|silver|gold) [default: silver]
  -v, --verbose        Verbose output
```

**Example:**

```bash
cd my-strategy
dss check --level silver --verbose
```

**Output:**

```
🔍 DSS Compliance Check

Target Level: SILVER

✓ Checking project structure...
✓ Checking required files...
✓ Checking contracts...
✓ Checking tests...

============================================================
Check Results
============================================================

Structure:
  ✓ contracts/ directory exists: PASS
  ✓ test/ directory exists: PASS

Contracts:
  ✓ At least one .sol file: PASS
  ✓ Implements IDSSStrategy: PASS

Tests:
  ✓ Test files exist: PASS
  ✓ Core tests implemented: PASS
  ✓ Invariant tests implemented: PASS
  ✓ Fuzzing tests implemented: WARN

============================================================
Summary
============================================================

  ✓ Passed: 8/9
  ⚠ Warnings: 1/9

  Compliance: 89%

  ⚠️  Project does not yet meet SILVER level (requires 95%)
```

### `dss report`

Generate a detailed certification report.

```bash
dss report [options]

Options:
  -o, --output <file>  Output file path [default: DSS_REPORT.md]
  -l, --level <level>  Target certification level [default: silver]
```

**Example:**

```bash
dss report --level gold --output CERTIFICATION.md
```

**Output:** Generates a Markdown report with:

- Executive summary
- Category-by-category compliance analysis
- Detailed recommendations
- Certification status

## Templates

### Basic Strategy (HODL)

Simple strategy that holds assets without rebalancing.

### Rebalancing Strategy (60/40)

Classic portfolio rebalancing (e.g., 60% ETH / 40% USDC).

### Lending Strategy (Aave)

Strategy that supplies assets to Aave for yield.

## Certification Levels

### Bronze (>80% compliance)

- Core tests (DSS-1)
- Basic invariants (DSS-2)
- Integration tests (DSS-5)

### Silver (>95% compliance)

- All Bronze requirements
- Fuzzing (DSS-7)
- Security analysis (DSS-8)
- Full documentation

### Gold (>98% compliance)

- All Silver requirements
- Professional audit
- Formal verification
- Bug bounty program

## Project Structure

A typical DSS project initialized with `dss init`:

```
my-strategy/
├── contracts/
│   └── MyStrategy.sol
├── test/
│   ├── core.test.ts
│   ├── invariants.test.ts
│   └── fuzzing.test.ts
├── scripts/
│   └── deploy.ts
├── docs/
│   └── SPECIFICATION.md
├── README.md
└── package.json
```

## Environment Variables

- `DSS_LEVEL`: Default certification level (bronze|silver|gold)
- `DSS_VERBOSE`: Enable verbose output (true|false)

## License

MIT




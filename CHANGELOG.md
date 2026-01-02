# Changelog

All notable changes to the DeFi Strategy Standard (DSS) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - CI/CD Automation (DSS-13)

**NEW: Complete CI/CD automation workflows**

- GitHub Actions workflows for automated testing, security scanning, and releases
- Pre-commit hooks with Husky and lint-staged for code quality enforcement
- Dependabot configuration for automatic dependency updates
- Comprehensive CI/CD setup documentation

**Workflows:**
- `.github/workflows/test.yml` - Matrix testing (Hardhat + Foundry, Node 18+20)
- `.github/workflows/security.yml` - Security scanning (Slither, npm audit, CodeQL)
- `.github/workflows/release.yml` - Automated releases and NPM publishing

**Tools:**
- ESLint, Prettier, and Solhint for code quality
- Husky for Git hooks
- lint-staged for staged file linting

See [CI/CD Setup Guide](docs/CI-CD-SETUP.md) for details.

### Added - Production Examples

**NEW: Production-tested strategy examples**

#### Strategy Examples
- `examples/sdk/basic-strategy/` - HODLStrategy (equal-weight allocation)
  - Production-tested weight calculation logic
  - Comprehensive test suite (core, invariants, fuzzing)
  - Full DSS compliance (DSS-1, DSS-2, DSS-3, DSS-4, DSS-7, DSS-9)
- `examples/sdk/rebalancing-strategy/` - Fixed6040Strategy (60/40 portfolio)
  - Classic balanced portfolio allocation
  - Weekly rebalancing pattern
  - DSS-compliant with full test coverage
- `examples/foundry/` - Foundry/Forge versions (Issue #10)
  - Unit tests (`HODL.t.sol`)
  - Invariant tests (`Invariants.t.sol`)
  - Fuzz tests (`Fuzz.t.sol`)
  - Optimized configuration (1000 fuzz runs, 256 invariant runs)

#### Core Library Enhancements
- `packages/core/contracts/libraries/DSSWeightLib.sol`
  - Battle-tested weight normalization
  - Respects min/max bounds
  - Best-effort normalization when exact impossible
  - Gas-optimized from production use

#### Testing Framework Improvements (@dss/test)
- `src/InvariantHelpers.ts` - Invariant testing utilities
  - Value conservation checks (with slippage tolerance)
  - Share price monotonicity validation
  - Weight sum invariant checks
  - Timestamp monotonicity verification
  - Share accounting invariants
  - Seedable PRNG (Mulberry32) for reproducibility
- `helpers/FuzzHelpers.ts` - Extended arbitraries
  - Asset count generation
  - Weight bounds (with min <= max filter)
  - Price sequence simulation (with volatility)
  - Amount/slippage/time interval generation
  - Operation sequence generation for state machine tests
  - Active/inactive asset array generation

### Added - Specification Updates
- **Part F: Tooling & Automation** (`specification/part-f-tooling.md`)
  - DSS-12: Developer Experience & Documentation
  - DSS-13: CI/CD & Automation
  - DSS-14: Production Monitoring & Observability
  - Complete specification with requirements, examples, and certification thresholds

### Changed
- Project now demonstrates "Specification → Production Examples" flow
- Updated architecture from 11-point to 14-point (DSS-1 through DSS-14)

## [1.2.0-alpha.0] - 2025-12-27

### Added - DSS SDK & Tooling

**NEW: Complete SDK for building DSS-compliant strategies**

#### @dss/core - Solidity Contracts Package
- `IDSSStrategy.sol` - Core interface for all DSS strategies
- `IDSSRegistry.sol` - Interface for public strategy registry (Issue #4)
- `IDSSAccessControl.sol` - Interface for role-based access control
- `IDSSPausable.sol` - Interface for emergency pause functionality
- `DSSAccessControl.sol` - Ready-to-use role implementation (Owner, Admin, Keeper, Guardian)
- `DSSPausable.sol` - Emergency pause mechanism (DSS-4 compliant)
- `DSSTimelock.sol` - Governance timelock (DSS-10 compliant)
- Complete package.json for npm/forge installation
- Comprehensive README with usage examples

#### @dss/test - Testing Framework Package
- `InvariantRunner.ts` - Property-based testing for economic invariants (DSS-2)
  - Configurable iteration counts
  - Reproducible random testing with seeds
  - Action-based test scenarios
- `FuzzHelpers.ts` - Utilities for fuzzing with fast-check (DSS-7)
  - Weight generation (sum = 10000 bps)
  - Price history generation
  - Slippage simulation
  - Volatility calculation
- `StandardTests.ts` - Pre-built test suites for common requirements
  - Core strategy tests (DSS-1)
  - Access control tests (DSS-9.2)
  - Pausable tests (DSS-4)
- TypeScript support with full type definitions
- Environment variable configuration

#### @dss/cli - Command Line Tool
- `dss init` - Initialize new DSS projects
  - Interactive project wizard
  - Framework selection (Hardhat/Foundry)
  - Template selection (Basic, Rebalancing, Lending)
  - Automatic project structure generation
- `dss check` - Verify DSS compliance
  - Project structure validation
  - Contract interface checking
  - Test coverage analysis
  - Certification level scoring
- `dss report` - Generate certification reports
  - Markdown report generation
  - Category-by-category compliance analysis
  - Actionable recommendations
  - Bronze/Silver/Gold level evaluation
- Commander-based CLI with chalk styling
- Full TypeScript implementation

#### Documentation
- `packages/README.md` - Overview of all SDK packages
- Individual README files for each package with examples
- Updated main README.md with SDK quick start guide
- Installation instructions for all packages

### Changed
- Updated main README.md badges to reflect v1.2.0-alpha status
- Enhanced Quick Start section with CLI-based workflow
- Added SDK Packages section to main documentation

### Developer Experience Improvements
- Zero-config project initialization
- Built-in best practices and templates
- Automated compliance checking
- Standardized testing patterns
- Type-safe testing utilities
- Professional certification reports

## [1.0.1] - 2025-12-27

### Changed
- Reorganized `specification/part-a-code-quality.md` to follow sequential DSS ordering (DSS-1 through DSS-8).
- Refactored `specification/part-b-economic.md` into Economic Reference & Methodology document.
- Updated section numbering in Part B to align with its role as supplementary reference material.
- Fixed section numbering in `specification/part-c-operational.md` (DSS-9: 12.x/13.x/14.x → 9.1.x/9.2.x/9.3.x).
- Fixed section numbering in `specification/part-d-governance.md` (DSS-10: 15.x/16.x → 10.1.x/10.2.x).

### Added
- Comprehensive **DSS-3: Trigger & Timing Tests** section with cooldown enforcement, trigger conditions, and stale data handling.
- Comprehensive **DSS-4: Risk Management Tests** section with stop-loss, health factor monitoring, and emergency systems.
- Updated Summary of Categories section in Part A to reflect all 8 DSS categories.

### Removed
- Redundant planning files from `.github/planning/`.
- Duplicate Note section about DSS mapping from Part A (no longer needed after reorganization).

## [1.0.0] - 2025-12-26

### Initial Release

**Core Architecture (DSS 1-11):**
- **DSS-1 to DSS-6**: Core engineering and security tests
- **DSS-7 & DSS-8**: Advanced stress testing and gas efficiency
- **DSS-9 & DSS-10**: Consolidated operational and governance requirements
- **DSS-11**: Interoperability standards for ERC-4626 and MAS Protocol

**Certification Levels:**
- **Bronze**: >80% coverage, basic interoperability
- **Silver**: >95% coverage, audits, stress testing
- **Gold**: >98% coverage, formal verification, bug bounties

**Included Documentation:**
- Complete certification matrix and checklists
- Detailed specification parts (A, B, C, D, E)
- Reference implementation metrics
- Code examples for Hardhat
- CI/CD pipeline configurations

## [Unreleased] - Planned for Version 1.1.0

### Planned Features

- Foundry code examples
- L2-specific testing guidance
- Cross-chain strategy testing
- MEV protection patterns

---

[1.0.0]: https://github.com/VaultBricks/DSS/releases/tag/v1.0.0


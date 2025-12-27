# Changelog

All notable changes to the DeFi Strategy Standard (DSS) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-12-27

### Changed
- Reorganized `specification/part-a-code-quality.md` to follow sequential DSS ordering (DSS-1 through DSS-8).
- Refactored `specification/part-b-economic.md` into Economic Reference & Methodology document.
- Updated section numbering in Part B to align with its role as supplementary reference material.

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


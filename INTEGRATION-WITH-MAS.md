# DSS & MAS Integration Guide

## Overview

MAS and DSS are complementary standards:

| Standard | What        | Focus                        |
|----------|-------------|------------------------------|
| [MAS](https://github.com/vaultbricks/mas) | Architecture | Multi-asset vault structure  |
| [DSS](https://github.com/VaultBricks/DSS) | Validation   | Strategy testing framework   |

## Typical workflow

### 1. Design Phase
→ Follow MAS for vault architecture
- Multi-asset support
- Rebalancing mechanisms
- Fee structures

### 2. Implementation Phase
→ Follow DSS for testing and validation

**Core Testing (DSS-1 to DSS-6):**
- **DSS-1**: Core Strategy Tests (weight calculations, bounds, invariants)
- **DSS-2**: Economic Invariants (portfolio value, share price monotonicity)
- **DSS-3**: Trigger & Timing Tests (rebalance triggers, cooldowns, oracle handling)
- **DSS-4**: Risk Management Tests (stop-loss, drawdown limits, emergency pause)
- **DSS-5**: Integration Tests (DEX routers, lending protocols, oracles)
- **DSS-6**: Security Tests (reentrancy, access control, oracle manipulation resistance)

**Advanced Testing (DSS-7 to DSS-8):**
- **DSS-7**: Stress Tests & Fuzzing (random inputs, extreme scenarios, backtesting)
- **DSS-8**: Gas Efficiency (benchmarks, scaling tests)

**Operational & Governance (DSS-9 to DSS-10):**
- **DSS-9**: Operational Security (deployment, access control, monitoring)
- **DSS-10**: Governance & Upgrades (timelocks, documentation, audits)

**Interoperability (DSS-11):**
- **DSS-11**: Interoperability (ERC-4626 compliance + **MAS Protocol compliance**)
  - ERC-4626 interface tests
  - MAS integration tests
  - Cross-standard compatibility verification

### 3. Certification
→ Achieve dual certification
- MAS Silver + DSS Gold
- Or any combination

**Note:** DSS-11 explicitly requires MAS protocol compliance testing, ensuring seamless integration between MAS architecture and DSS validation standards.

## Example: VaultBricks

VaultBricks demonstrates both standards:
- ✅ MAS-compliant architecture
- ✅ DSS-compliant testing (example implementation)
- ✅ DSS-11: Full ERC-4626 + MAS interoperability compliance

See [REFERENCE-IMPLEMENTATION.md](REFERENCE-IMPLEMENTATION.md) for detailed implementation metrics.

## Certification matrix

| Your Goal      | Recommended Path          |
|----------------|--------------------------|
| MVP Launch     | MAS Bronze + DSS Bronze  |
| Mainnet <$10M  | MAS Silver + DSS Silver   |
| Mainnet >$10M  | MAS Gold + DSS Gold      |

## DSS-11: MAS Integration Requirements

DSS-11 (Interoperability) includes specific requirements for MAS protocol compliance:

### Bronze Level
- Basic MAS protocol compliance tests
- Basic MAS integration tests

### Silver Level
- Full MAS integration tests with stress scenarios
- Comprehensive MAS protocol compliance verification

### Gold Level
- Full MAS protocol compliance verification
- Comprehensive edge case testing for MAS integration
- Stress testing of MAS interoperability features

For detailed MAS architecture requirements, refer to the [MAS documentation](https://github.com/vaultbricks/mas).

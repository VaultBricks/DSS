# DSS Auditor Checklist

**Version:** 1.1.0  
**Last Updated:** 2026-01-03  
**Purpose:** Consolidated checklist for third-party auditors verifying DSS compliance

---

## How to Use This Checklist

This document consolidates all DSS requirements into a single auditor-friendly checklist. Use this to:

1. **Verify Compliance**: Check each requirement against the project's implementation
2. **Generate Audit Reports**: Use this as a template for your audit findings
3. **Identify Gaps**: Quickly spot missing requirements for the target certification level

**Certification Levels:**

- **Bronze**: Early-stage protocols, testnet deployments, MVPs
- **Silver**: Mainnet deployments, protocols with <$10M TVL
- **Gold**: Critical infrastructure, protocols with >$10M TVL

---

## Coverage Requirements Summary

| Level  | Statement Coverage | Branch Coverage | Fuzzing Iterations | Mutation Score |
| ------ | ------------------ | --------------- | ------------------ | -------------- |
| Bronze | ≥80%               | ≥60%            | 100                | N/A            |
| Silver | ≥95%               | ≥80%            | 500+               | ≥75%           |
| Gold   | ≥98%               | ≥90%            | 1000+              | ≥85%           |

---

## DSS-1: Core Strategy Tests

**Priority:** P0 — Critical  
**Required:** All levels

### Bronze Requirements

- [ ] Weight calculation correctness tests implemented
- [ ] Weight sum invariant test (always = 100% / 10000 bps)
- [ ] Bounds clamping tests (min/max weights respected)
- [ ] Active/inactive asset handling tests
- [ ] Statement coverage ≥80%
- [ ] Branch coverage ≥60%
- [ ] Basic unit tests for all public functions

### Silver Requirements (All Bronze +)

- [ ] Statement coverage ≥95%
- [ ] Branch coverage ≥80%
- [ ] Edge case tests for weight calculations
- [ ] Comprehensive unit tests for all functions

### Gold Requirements (All Silver +)

- [ ] Statement coverage ≥98%
- [ ] Branch coverage ≥90%
- [ ] Formal verification of weight calculation logic
- [ ] Mutation testing with ≥85% score

**Evidence to Review:**

- Coverage reports (lcov/HTML)
- Test files in `test/` directory
- Formal verification specs (Gold only)

---

## DSS-2: Economic Invariants

**Priority:** P0 — Critical  
**Required:** All levels

### All Levels

- [ ] Portfolio value conservation tests (within slippage bounds)
- [ ] No negative balances after any operation
- [ ] Share price monotonicity tests (non-decreasing)
- [ ] Total shares conservation tests

### Silver/Gold Additional

- [ ] Invariant tests run with fuzzing (500+ iterations for Silver, 1000+ for Gold)
- [ ] Property-based testing for all invariants
- [ ] Formal verification of critical invariants (Gold only)

**Evidence to Review:**

- Invariant test files
- Fuzzing test results
- Property-based test logs

---

## DSS-3: Trigger & Timing Tests

**Priority:** P1 — High  
**Required:** All levels

### Bronze Requirements

- [ ] Rebalance trigger conditions tests
- [ ] Cooldown enforcement tests
- [ ] Time-based restrictions tests (if applicable)
- [ ] Basic oracle staleness handling tests

### Silver Requirements (All Bronze +)

- [ ] Full oracle staleness handling with fallback mechanisms
- [ ] Edge case timing tests (boundary conditions)
- [ ] Multiple trigger condition combinations

### Gold Requirements (All Silver +)

- [ ] Comprehensive edge case coverage
- [ ] Oracle fallback chain testing
- [ ] Time manipulation attack resistance tests

**Evidence to Review:**

- Trigger test files
- Oracle integration tests
- Time-based test scenarios

---

## DSS-4: Risk Management Tests

**Priority:** P1 — High  
**Required:** All levels

### Bronze Requirements

- [ ] Stop-loss activation tests
- [ ] Drawdown limit enforcement tests
- [ ] Emergency pause behavior tests

### Silver Requirements (All Bronze +)

- [ ] Health factor monitoring tests
- [ ] Automated risk response tests
- [ ] Multi-scenario risk tests

### Gold Requirements (All Silver +)

- [ ] 24/7 monitoring integration tests
- [ ] Automated alerting system tests
- [ ] Incident response playbook validation

**Evidence to Review:**

- Risk management test files
- Emergency pause tests
- Monitoring system configuration

---

## DSS-5: Integration Tests

**Priority:** P1 — High  
**Required:** All levels

### Bronze Requirements

- [ ] DEX router integration tests (Uniswap, 1inch, etc.)
- [ ] Oracle integration tests (Chainlink, TWAP fallback)
- [ ] Basic cross-contract call sequence tests

### Silver Requirements (All Bronze +)

- [ ] Lending protocol integration tests
- [ ] Full cross-contract call sequences
- [ ] Mainnet fork testing

### Gold Requirements (All Silver +)

- [ ] Comprehensive mainnet fork tests
- [ ] Stress testing on forked mainnet
- [ ] Multi-protocol integration scenarios

**Evidence to Review:**

- Integration test files
- Fork test configurations
- External protocol interaction tests

---

## DSS-6: Security Tests

**Priority:** P0 — Critical  
**Required:** All levels

### Bronze Requirements

- [ ] Reentrancy protection tests
- [ ] Access control enforcement tests
- [ ] Slippage protection tests
- [ ] Basic oracle manipulation resistance tests
- [ ] Basic flash loan attack resistance tests
- [ ] Slither static analysis with zero high-severity findings

### Silver Requirements (All Bronze +)

- [ ] Mythril static analysis with zero high/medium severity findings
- [ ] Full oracle manipulation resistance tests
- [ ] Full flash loan attack resistance tests
- [ ] External audit completed (1 audit minimum)

### Gold Requirements (All Silver +)

- [ ] Formal verification of critical security properties
- [ ] Multiple external audits (2+ audits)
- [ ] Active bug bounty program
- [ ] Advanced static analysis (Aderyn, custom tools)

**Evidence to Review:**

- Security test files
- Static analysis reports (Slither, Mythril, Aderyn)
- External audit reports
- Bug bounty program documentation (Gold)

---

## DSS-7: Stress Tests & Fuzzing

**Priority:** P1 — High
**Required:** Bronze (basic), Silver/Gold (full)

### Bronze Requirements

- [ ] Random weight inputs fuzzing (100 iterations minimum)
- [ ] Extreme price movements tests
- [ ] High slippage scenarios tests
- [ ] Basic concurrent operations tests
- [ ] Backtesting over 1 year period

### Silver Requirements (All Bronze +)

- [ ] Fuzzing with 500+ iterations
- [ ] Full concurrent operations testing
- [ ] Backtesting over 2 years period
- [ ] Walk-forward analysis
- [ ] Mutation testing with ≥75% score

### Gold Requirements (All Silver +)

- [ ] Fuzzing with 1000+ iterations
- [ ] Backtesting over 5 years period
- [ ] Mutation testing with ≥85% score
- [ ] Comprehensive stress scenarios

**Evidence to Review:**

- Fuzzing test results
- Backtesting reports
- Mutation testing reports
- Stress test logs

---

## DSS-8: Gas Efficiency

**Priority:** P2 — Medium
**Required:** Bronze (documented), Silver/Gold (optimized)

### Bronze Requirements

- [ ] Gas benchmarks for critical operations documented
- [ ] Scaling tests (2, 5, 10+ assets)
- [ ] Comparison with baseline targets

### Silver Requirements (All Bronze +)

- [ ] CI regression testing for gas usage
- [ ] Gas optimization for common operations
- [ ] Gas reports in CI/CD pipeline

### Gold Requirements (All Silver +)

- [ ] L2-optimized implementations
- [ ] Advanced gas optimization techniques
- [ ] Gas benchmarks for all operations

**Evidence to Review:**

- Gas benchmark reports
- CI/CD gas regression tests
- Optimization documentation

---

## DSS-9: Operational Security

**Priority:** P0 — Critical
**Required:** All levels

### Bronze Requirements

- [ ] Deployment security script documented
- [ ] Access control configuration (2/3 multi-sig minimum)
- [ ] Basic monitoring setup

### Silver Requirements (All Bronze +)

- [ ] 3/5 multi-sig configuration
- [ ] Hardware wallet usage
- [ ] Automated monitoring system
- [ ] Incident response playbooks

### Gold Requirements (All Silver +)

- [ ] 4/7 multi-sig configuration
- [ ] Timelock integration
- [ ] 24/7 monitoring with alerting
- [ ] Comprehensive incident response procedures

**Evidence to Review:**

- Deployment scripts
- Multi-sig configuration
- Monitoring system setup
- Incident response playbooks

---

## DSS-10: Governance & Upgrades

**Priority:** P1 — High
**Required:** Silver/Gold

### Silver Requirements

- [ ] 24-hour timelock for governance actions
- [ ] Full governance documentation
- [ ] External audit completed (1 audit)
- [ ] Upgrade procedures documented

### Gold Requirements (All Silver +)

- [ ] 48-hour timelock for governance actions
- [ ] 100% NatSpec coverage
- [ ] Multiple external audits (2+ audits)
- [ ] Active bug bounty program
- [ ] Formal verification of upgrade logic

**Evidence to Review:**

- Timelock configuration
- Governance documentation
- Audit reports
- Bug bounty program details

---

## DSS-11: Interoperability

**Priority:** P1 — High
**Required:** All levels

### Bronze Requirements

- [ ] ERC-4626 compliance tests
- [ ] MAS protocol compliance tests
- [ ] Basic ERC-4626 interface tests
- [ ] Basic MAS integration tests

### Silver Requirements (All Bronze +)

- [ ] Full ERC-4626 interface tests
- [ ] Full MAS integration tests
- [ ] Cross-protocol compatibility tests

### Gold Requirements (All Silver +)

- [ ] Comprehensive ERC-4626 edge case tests
- [ ] Full MAS stress testing
- [ ] Multi-protocol integration scenarios

**Evidence to Review:**

- ERC-4626 compliance tests
- MAS integration tests
- Interoperability test suite

---

## DSS-12: Developer Experience & Documentation

**Priority:** P2 — Medium
**Required:** All levels

### Bronze Requirements

- [ ] README with project overview
- [ ] Basic NatSpec for public functions
- [ ] At least 1 basic code example/template
- [ ] Quick start tutorial

### Silver Requirements (All Bronze +)

- [ ] Full NatSpec for all functions
- [ ] Architecture documentation
- [ ] At least 2 templates (basic + advanced)
- [ ] Troubleshooting guide

### Gold Requirements (All Silver +)

- [ ] 100% NatSpec coverage
- [ ] Auto-generated API documentation
- [ ] At least 3 templates (+ integration examples)
- [ ] Video walkthrough tutorial

**Evidence to Review:**

- Documentation completeness
- NatSpec coverage
- Code examples and templates
- Tutorial quality

---

## DSS-13: CI/CD & Automation

**Priority:** P1 — High
**Required:** All levels

### Bronze Requirements

- [ ] Automated unit tests in CI
- [ ] Basic integration tests in CI
- [ ] npm audit security scanning

### Silver Requirements (All Bronze +)

- [ ] Full test suite in CI with coverage reporting
- [ ] Slither static analysis in CI
- [ ] Automated deployment scripts

### Gold Requirements (All Silver +)

- [ ] Nightly fuzzing tests
- [ ] Mythril + Aderyn static analysis
- [ ] Advanced CI/CD pipeline with all checks

**Evidence to Review:**

- CI/CD configuration files
- Test automation setup
- Security scanning integration

---

## DSS-14: Production Monitoring & Observability

**Priority:** P2 — Medium
**Required:** Silver (recommended), Gold (required)

### Silver Requirements (Recommended)

- [ ] Basic monitoring dashboard
- [ ] Automated alerting for critical events
- [ ] Log aggregation system

### Gold Requirements (Required)

- [ ] 24/7 monitoring with on-call rotation
- [ ] Comprehensive observability stack
- [ ] Real-time alerting and incident response
- [ ] Performance metrics tracking

**Evidence to Review:**

- Monitoring system configuration
- Alerting rules and thresholds
- Incident response procedures
- Observability dashboard

---

## Audit Report Template

### Project Information

- **Project Name:** **\*\***\_\_\_**\*\***
- **Target Certification Level:** **\*\***\_\_\_**\*\***
- **Audit Date:** **\*\***\_\_\_**\*\***
- **Auditor:** **\*\***\_\_\_**\*\***

### Compliance Summary

| Category | Bronze | Silver | Gold | Notes |
| -------- | :----: | :----: | :--: | ----- |
| DSS-1    |   ☐    |   ☐    |  ☐   |       |
| DSS-2    |   ☐    |   ☐    |  ☐   |       |
| DSS-3    |   ☐    |   ☐    |  ☐   |       |
| DSS-4    |   ☐    |   ☐    |  ☐   |       |
| DSS-5    |   ☐    |   ☐    |  ☐   |       |
| DSS-6    |   ☐    |   ☐    |  ☐   |       |
| DSS-7    |   ☐    |   ☐    |  ☐   |       |
| DSS-8    |   ☐    |   ☐    |  ☐   |       |
| DSS-9    |   ☐    |   ☐    |  ☐   |       |
| DSS-10   |  N/A   |   ☐    |  ☐   |       |
| DSS-11   |   ☐    |   ☐    |  ☐   |       |
| DSS-12   |   ☐    |   ☐    |  ☐   |       |
| DSS-13   |   ☐    |   ☐    |  ☐   |       |
| DSS-14   |  N/A   |   ☐    |  ☐   |       |

### Findings

#### Critical Issues

- None / [List issues]

#### High Severity Issues

- None / [List issues]

#### Medium Severity Issues

- None / [List issues]

#### Low Severity Issues / Recommendations

- None / [List issues]

### Certification Recommendation

☐ **PASS** - Project meets all requirements for [Level] certification
☐ **CONDITIONAL PASS** - Project meets requirements pending resolution of: [List items]
☐ **FAIL** - Project does not meet requirements. Major gaps: [List gaps]

---

## Related Documentation

- [DSS Certification Matrix](../certification/CERTIFICATION-MATRIX.md) - Complete requirements table
- [DSS Certification Process](../certification/CERTIFICATION-PROCESS.md) - Certification workflow
- [Auditor Guide](AUDITOR-GUIDE.md) - Detailed explanation of DSS for auditors
- [Specification Part A](../specification/part-a-code-quality.md) - Code Quality (DSS-1 to DSS-8)
- [Specification Part C](../specification/part-c-operational.md) - Operational Security (DSS-9)
- [Specification Part D](../specification/part-d-governance.md) - Governance (DSS-10)
- [Specification Part E](../specification/part-e-interoperability.md) - Interoperability (DSS-11)
- [Specification Part F](../specification/part-f-tooling.md) - Tooling & Automation (DSS-12, DSS-13, DSS-14)

---

**Document Version:** 1.1.0
**Maintained by:** VaultBricks DSS Team
**For questions:** See [FAQ](../docs/FAQ.md) or open an issue

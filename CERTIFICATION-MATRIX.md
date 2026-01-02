# Certification Matrix

The following matrix summarizes all DSS requirements by certification level:

| Category | Requirement | Bronze | Silver | Gold |
|----------|-------------|:------:|:------:|:----:|
| **DSS-1** | Core Strategy Tests | ✅ | ✅ | ✅ |
| | Weight calculation correctness | ✅ | ✅ | ✅ |
| | Weight sum invariant (100% / 10000 bps) | ✅ | ✅ | ✅ |
| | Bounds clamping (min/max weights) | ✅ | ✅ | ✅ |
| | Active/inactive asset handling | ✅ | ✅ | ✅ |
| | Statement Coverage | >80% | >95% | >98% |
| | Branch Coverage | >60% | >80% | >90% |
| **DSS-2** | Economic Invariants | ✅ | ✅ | ✅ |
| | Portfolio value conservation | ✅ | ✅ | ✅ |
| | No negative balances | ✅ | ✅ | ✅ |
| | Share price monotonicity | ✅ | ✅ | ✅ |
| | Total shares conservation | ✅ | ✅ | ✅ |
| **DSS-3** | Trigger & Timing Tests | Basic | Full | Full + Edge Cases |
| | Rebalance trigger conditions | ✅ | ✅ | ✅ |
| | Cooldown enforcement | ✅ | ✅ | ✅ |
| | Time-based restrictions | ✅ | ✅ | ✅ |
| | Oracle staleness handling | Basic | Full | Full + Fallback |
| **DSS-4** | Risk Management Tests | Basic | Full | Full + Monitoring |
| | Stop-loss activation | ✅ | ✅ | ✅ |
| | Drawdown limit enforcement | ✅ | ✅ | ✅ |
| | Health factor monitoring | ❌ | ✅ | ✅ |
| | Emergency pause behavior | ✅ | ✅ | ✅ |
| **DSS-5** | Integration Tests | Basic | Full | Full + Mainnet Fork |
| | DEX router integration | ✅ | ✅ | ✅ |
| | Lending protocol integration | ❌ | ✅ | ✅ |
| | Oracle integration | ✅ | ✅ | ✅ |
| | Cross-contract call sequences | Basic | Full | Full + Stress |
| | Fork Testing | ❌ | ✅ | ✅ |
| **DSS-6** | Security Tests | Basic | Full | Full + Formal |
| | Reentrancy protection | ✅ | ✅ | ✅ |
| | Access control enforcement | ✅ | ✅ | ✅ |
| | Slippage protection | ✅ | ✅ | ✅ |
| | Oracle manipulation resistance | Basic | Full | Full + Formal |
| | Flash loan attack resistance | Basic | Full | Full + Formal |
| | Static Analysis (Slither) | ✅ | ✅ | ✅ |
| | Static Analysis (Mythril) | ❌ | ✅ | ✅ |
| | High Severity Issues | 0 | 0 | 0 |
| | Medium Severity Issues | — | 0 | 0 |
| **DSS-7** | Stress Tests & Fuzzing | Basic | Full | Full + Mutation |
| | Random weight inputs | ✅ | ✅ | ✅ |
| | Extreme price movements | ✅ | ✅ | ✅ |
| | High slippage scenarios | ✅ | ✅ | ✅ |
| | Concurrent operations | Basic | Full | Full |
| | Fuzzing Iterations | 100 | 500+ | 1000+ |
| | Backtesting Period | 1 year | 2 years | 5 years |
| | Walk-Forward Analysis | ❌ | ✅ | ✅ |
| | Mutation Testing | ❌ | 75% | 85% |
| **DSS-8** | Gas Efficiency | Documented | CI Regression | L2 Optimized |
| | Gas benchmarks for critical operations | ✅ | ✅ | ✅ |
| | Scaling tests (2, 5, 10+ assets) | ✅ | ✅ | ✅ |
| | Comparison with baseline targets | ✅ | ✅ | ✅ |
| **DSS-9** | Operational Security | Basic | Automated | 24/7 |
| | Deployment Security | Script | Multi-sig | + Timelock |
| | Access Control | 2/3 | 3/5 | 4/7 |
| | Hardware Wallets | ❌ | ✅ | ✅ |
| | Monitoring | Basic | Automated | 24/7 |
| | Playbooks | ❌ | ✅ | ✅ |
| **DSS-10** | Governance & Upgrades | Basic | Full | Full + Audit |
| | Timelock | ❌ | 24h | 48h |
| | Documentation | Basic | Full | + NatSpec 100% |
| | Audit Reports | ❌ | 1 | 2+ |
| | Bug Bounty | ❌ | ❌ | ✅ |
| **DSS-11** | Interoperability | Basic | Full | Full + Compliance |
| | ERC-4626 Compliance | ✅ | ✅ | ✅ |
| | MAS Protocol Compliance | ✅ | ✅ | ✅ |
| | ERC-4626 Interface Tests | Basic | Full | Full + Edge Cases |
| | MAS Integration Tests | Basic | Full | Full + Stress |
| **DSS-12** | Developer Experience & Documentation | Basic | Full | Full + Auto-gen |
| | API Documentation (NatSpec) | Basic | Full | Full + Auto-generated |
| | Code Examples & Templates | ≥1 basic | ≥2 (basic + advanced) | ≥3 (+ integration) |
| | Developer Tutorials | Quick Start | + Troubleshooting | + Video walkthrough |
| **DSS-13** | CI/CD & Automation | Basic | Full | Full + Advanced |
| | Automated Testing (Unit, Integration) | Basic tests | Full suite + coverage | All + nightly + fuzz |
| | Security Scanning | npm audit | + Slither | + Mythril + Aderyn |
| | Pre-commit Hooks | Optional | Required | Required |
| **DSS-14** | Production Monitoring & Observability | Basic | Automated | 24/7 |
| | Event Monitoring | Basic logs | Event monitoring | Full observability |
| | Health Checks | None required | Balance checks | All checks + automated |
| | Incident Response | N/A | Runbook required | Full automation |

## Legend

- ✅ = Required
- ❌ = Not required
- — = Not applicable

## Quick Reference

### Bronze Certification
- Focus: Early-stage protocols, testnet deployments, MVPs
- Key Requirements: DSS-1 through DSS-6, basic DSS-9, DSS-11, basic DSS-12, basic DSS-13
- Coverage: >80% statement, >60% branch
- Testing: Basic unit tests, access control, pause/emergency tests

### Silver Certification
- Focus: Mainnet deployments, protocols with <$10M TVL
- Key Requirements: All Bronze + DSS-7 (500+ fuzzing), DSS-8, full DSS-9, DSS-10 (24h timelock), full DSS-12, full DSS-13, DSS-14 (recommended), external audit
- Coverage: >95% statement, >80% branch
- Testing: Fuzzing (500+ iterations), invariant tests, integration tests, gas benchmarks

### Gold Certification
- Focus: Critical infrastructure, protocols with >$10M TVL
- Key Requirements: All Silver + DSS-7 (1000+ fuzzing, mutation testing), DSS-8 (L2 optimized), DSS-10 (48h timelock, bug bounty), full DSS-12 (auto-generated docs), full DSS-13 (advanced scanning), full DSS-14 (24/7 monitoring), formal verification, multiple audits
- Coverage: >98% statement, >90% branch
- Testing: Mainnet fork tests, mutation testing (>80% score), formal verification, independent audit

## Related Documentation

- [Certification Process](CERTIFICATION-PROCESS.md) - How to get certified
- [Bronze Checklist](certification/checklist-bronze.md)
- [Silver Checklist](certification/checklist-silver.md)
- [Gold Checklist](certification/checklist-gold.md)


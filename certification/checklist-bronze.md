# DSS Bronze Certification Checklist

## DSS-1: Core Strategy Tests
- [ ] Weight calculation correctness tests
- [ ] Weight sum invariant test (always = 100% / 10000 bps)
- [ ] Bounds clamping tests (min/max weights respected)
- [ ] Active/inactive asset handling tests
- [ ] Statement coverage >80%
- [ ] Branch coverage >60%
- [ ] Basic unit tests for all public functions

## DSS-2: Economic Invariants
- [ ] Portfolio value conservation tests (within slippage bounds)
- [ ] No negative balances after any operation
- [ ] Share price monotonicity tests (non-decreasing)
- [ ] Total shares conservation tests

## DSS-3: Trigger & Timing Tests
- [ ] Rebalance trigger conditions tests
- [ ] Cooldown enforcement tests
- [ ] Time-based restrictions tests (if applicable)
- [ ] Basic oracle staleness handling tests

## DSS-4: Risk Management Tests
- [ ] Stop-loss activation tests
- [ ] Drawdown limit enforcement tests
- [ ] Emergency pause behavior tests

## DSS-5: Integration Tests
- [ ] DEX router integration tests (Uniswap, 1inch, etc.)
- [ ] Oracle integration tests (Chainlink, TWAP fallback)
- [ ] Basic cross-contract call sequence tests

## DSS-6: Security Tests
- [ ] Reentrancy protection tests
- [ ] Access control enforcement tests
- [ ] Slippage protection tests
- [ ] Basic oracle manipulation resistance tests
- [ ] Basic flash loan attack resistance tests
- [ ] Slither static analysis with zero high-severity findings

## DSS-9: Operational Security (Basic)
- [ ] Deployment security script documented
- [ ] Access control configuration (2/3 minimum)
- [ ] Basic monitoring setup

## DSS-11: Interoperability (Basic)
- [ ] ERC-4626 compliance tests
- [ ] MAS protocol compliance tests
- [ ] Basic ERC-4626 interface tests
- [ ] Basic MAS integration tests

## Documentation
- [ ] README with project overview
- [ ] Architecture documentation
- [ ] Risk disclosure document

## Verification
- [ ] All tests passing
- [ ] Coverage report generated (showing >80% statement, >60% branch)
- [ ] Contracts verified on block explorer
- [ ] All checklist items completed

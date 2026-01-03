# DSS Auditor Guide

**Version:** 1.1.0  
**Last Updated:** 2026-01-03  
**Audience:** Third-party auditors, security researchers, certification bodies

---

## Table of Contents

1. [Introduction to DSS](#introduction-to-dss)
2. [Why DSS Matters for Auditors](#why-dss-matters-for-auditors)
3. [Certification Levels Overview](#certification-levels-overview)
4. [Audit Workflow](#audit-workflow)
5. [Key Areas of Focus](#key-areas-of-focus)
6. [Common Pitfalls](#common-pitfalls)
7. [Tools and Resources](#tools-and-resources)
8. [Reporting Guidelines](#reporting-guidelines)

---

## Introduction to DSS

### What is DSS?

The **DeFi Strategy Standard (DSS)** is a comprehensive testing and validation framework for DeFi trading strategies. It defines 14 categories of requirements (DSS-1 through DSS-14) that ensure strategies are:

- **Secure**: Protected against common attack vectors
- **Reliable**: Economically sound with proven invariants
- **Operational**: Production-ready with monitoring and incident response
- **Interoperable**: Compatible with industry standards (ERC-4626, MAS)
- **Well-tested**: Comprehensive test coverage with fuzzing and formal verification

### DSS vs Traditional Smart Contract Audits

| Aspect            | Traditional Audit        | DSS Audit                                   |
| ----------------- | ------------------------ | ------------------------------------------- |
| **Scope**         | Security vulnerabilities | Security + Economics + Operations + Testing |
| **Focus**         | Code review              | Code + Test suite + Infrastructure          |
| **Standards**     | General best practices   | Specific quantitative requirements          |
| **Certification** | Pass/Fail                | Bronze/Silver/Gold levels                   |
| **Coverage**      | Varies                   | Minimum 80%/95%/98% required                |
| **Testing**       | Manual review            | Automated + Manual + Formal verification    |

### Who Uses DSS?

- **DeFi Protocols**: Vault strategies, yield aggregators, portfolio managers
- **Asset Managers**: On-chain investment strategies
- **DAOs**: Treasury management strategies
- **Institutional DeFi**: Compliant strategy implementations

---

## Why DSS Matters for Auditors

### 1. Clear Requirements

DSS provides **quantitative, verifiable requirements** instead of subjective "best practices":

- ✅ "Statement coverage ≥95%" (DSS-1 Silver)
- ❌ "Good test coverage" (vague)

### 2. Standardized Audit Process

The [AUDITOR-CHECKLIST.md](AUDITOR-CHECKLIST.md) provides a **complete audit template**, reducing:

- Audit preparation time
- Risk of missing requirements
- Client communication overhead

### 3. Economic Validation

DSS goes beyond security to verify **economic soundness**:

- Portfolio value conservation (DSS-2)
- Share price monotonicity (DSS-2)
- Backtesting requirements (DSS-7)

### 4. Operational Readiness

DSS ensures strategies are **production-ready**:

- Multi-sig configuration (DSS-9)
- Monitoring and alerting (DSS-14)
- Incident response playbooks (DSS-9)

---

## Certification Levels Overview

### Bronze Certification

**Target:** Early-stage protocols, testnet deployments, MVPs  
**Timeline:** 2-4 weeks  
**Audit Scope:** Basic security + Core functionality

**Key Requirements:**

- Statement coverage ≥80%, Branch coverage ≥60%
- Basic security tests (reentrancy, access control)
- Core strategy tests (weight calculations, invariants)
- Slither static analysis with zero high-severity findings

**Typical Audit Cost:** $5,000 - $15,000

### Silver Certification

**Target:** Mainnet deployments, protocols with <$10M TVL  
**Timeline:** 4-8 weeks  
**Audit Scope:** Full security + Economics + Operations

**Key Requirements:**

- Statement coverage ≥95%, Branch coverage ≥80%
- Fuzzing with 500+ iterations
- External audit completed (1 audit minimum)
- Operational security (multi-sig, monitoring)
- Governance with 24h timelock

**Typical Audit Cost:** $20,000 - $50,000

### Gold Certification

**Target:** Critical infrastructure, protocols with >$10M TVL  
**Timeline:** 3-6 months  
**Audit Scope:** Comprehensive security + Formal verification + 24/7 operations

**Key Requirements:**

- Statement coverage ≥98%, Branch coverage ≥90%
- Fuzzing with 1000+ iterations
- Mutation testing ≥85% score
- Formal verification of critical paths
- Multiple external audits (2+ audits)
- Active bug bounty program
- 24/7 monitoring with on-call rotation

**Typical Audit Cost:** $75,000 - $200,000+

---

## Audit Workflow

### Phase 1: Pre-Audit (1-2 days)

1. **Receive Project Materials**
   - Smart contract code
   - Test suite
   - Documentation
   - Previous audit reports (if any)

2. **Initial Assessment**
   - Verify target certification level
   - Check project structure
   - Review documentation completeness

3. **Setup Environment**
   - Clone repository
   - Install dependencies
   - Run test suite
   - Generate coverage reports

### Phase 2: Automated Analysis (2-3 days)

1. **Static Analysis**
   - Run Slither (all levels)
   - Run Mythril (Silver/Gold)
   - Run Aderyn (Gold)
   - Review findings

2. **Coverage Analysis**
   - Generate coverage reports
   - Verify coverage thresholds
   - Identify untested code paths

3. **Test Execution**
   - Run full test suite
   - Verify fuzzing iterations
   - Check mutation testing (Silver/Gold)

### Phase 3: Manual Review (5-10 days)

1. **Code Quality (DSS-1 to DSS-8)**
   - Review core strategy logic
   - Verify economic invariants
   - Check risk management
   - Assess gas efficiency

2. **Security (DSS-6)**
   - Reentrancy analysis
   - Access control review
   - Oracle manipulation resistance
   - Flash loan attack resistance

3. **Operations (DSS-9, DSS-14)**
   - Multi-sig configuration
   - Monitoring setup
   - Incident response procedures

4. **Governance (DSS-10)**
   - Timelock configuration
   - Upgrade procedures
   - Documentation quality

### Phase 4: Reporting (2-3 days)

1. **Findings Documentation**
   - Categorize by severity
   - Provide remediation recommendations
   - Reference DSS requirements

2. **Compliance Assessment**
   - Complete [AUDITOR-CHECKLIST.md](AUDITOR-CHECKLIST.md)
   - Calculate compliance percentage
   - Determine certification recommendation

3. **Final Report**
   - Executive summary
   - Detailed findings
   - Certification recommendation
   - Remediation timeline

---

## Key Areas of Focus

### 1. Core Strategy Logic (DSS-1)

**What to Check:**

- Weight calculation correctness
- Weight sum always equals 10000 bps (100%)
- Min/max weight bounds respected
- Active/inactive asset handling

**Common Issues:**

- Rounding errors causing weight sum ≠ 10000
- Integer overflow in weight calculations
- Missing bounds checks
- Incorrect handling of zero-weight assets

**Verification Method:**

```solidity
// Example test to verify
function test_weightSumInvariant() public {
    uint256[] memory weights = strategy.calculateWeights();
    uint256 sum = 0;
    for (uint i = 0; i < weights.length; i++) {
        sum += weights[i];
    }
    assertEq(sum, 10000, "Weight sum must equal 10000 bps");
}
```

### 2. Economic Invariants (DSS-2)

**What to Check:**

- Portfolio value conservation (accounting for slippage)
- No negative balances
- Share price monotonicity (non-decreasing)
- Total shares conservation

**Common Issues:**

- Value leakage during rebalancing
- Negative balances due to unchecked arithmetic
- Share price manipulation vulnerabilities
- Incorrect share minting/burning logic

**Verification Method:**

- Property-based testing
- Fuzzing with random operations
- Formal verification (Gold level)

### 3. Security Vulnerabilities (DSS-6)

**Critical Checks:**

#### Reentrancy

```solidity
// BAD: Vulnerable to reentrancy
function withdraw(uint256 amount) external {
    uint256 shares = balanceOf(msg.sender);
    _burn(msg.sender, shares);
    payable(msg.sender).transfer(amount); // ❌ External call before state update
}

// GOOD: Reentrancy-safe
function withdraw(uint256 amount) external nonReentrant {
    uint256 shares = balanceOf(msg.sender);
    _burn(msg.sender, shares); // ✅ State update first
    payable(msg.sender).transfer(amount);
}
```

#### Access Control

```solidity
// Verify role-based access control
function rebalance() external onlyKeeper whenNotPaused {
    // Only authorized keepers can rebalance
}
```

#### Oracle Manipulation

- Check for TWAP oracles (not spot prices)
- Verify oracle staleness checks
- Ensure fallback oracle mechanisms

#### Flash Loan Attacks

- Verify operations cannot be manipulated within single transaction
- Check for time-weighted calculations
- Ensure proper slippage protection

### 4. Operational Security (DSS-9)

**Multi-Sig Configuration:**

| Level  | Minimum Configuration | Recommended |
| ------ | --------------------- | ----------- |
| Bronze | 2/3                   | 2/3         |
| Silver | 3/5                   | 3/5 or 4/7  |
| Gold   | 4/7                   | 5/9         |

**Monitoring Requirements:**

- **Bronze**: Basic monitoring (manual checks acceptable)
- **Silver**: Automated monitoring with alerting
- **Gold**: 24/7 monitoring with on-call rotation

**Incident Response:**

Verify existence of:

- [ ] Incident response playbook
- [ ] Emergency pause procedures
- [ ] Communication plan
- [ ] Post-mortem process

### 5. Test Coverage (DSS-1, DSS-7)

**Coverage Thresholds:**

```bash
# Generate coverage report
npm run coverage

# Verify thresholds
# Bronze: ≥80% statement, ≥60% branch
# Silver: ≥95% statement, ≥80% branch
# Gold: ≥98% statement, ≥90% branch
```

**Fuzzing Requirements:**

```javascript
// Example fuzzing test
describe("Fuzzing Tests", () => {
  it("should handle random deposit amounts", async () => {
    // Bronze: 100 iterations
    // Silver: 500+ iterations
    // Gold: 1000+ iterations
    for (let i = 0; i < 1000; i++) {
      const amount = randomAmount();
      await strategy.deposit(amount);
      // Verify invariants
    }
  });
});
```

**Mutation Testing (Silver/Gold):**

```bash
# Run mutation testing
npx stryker run

# Verify mutation score
# Silver: ≥75%
# Gold: ≥85%
```

---

## Common Pitfalls

### 1. Insufficient Test Coverage

**Problem:** Tests exist but don't cover edge cases

**Example:**

```solidity
// Test only covers happy path
function test_deposit() public {
    strategy.deposit(1 ether); // ✅ Works
}

// Missing edge cases:
// - deposit(0)
// - deposit(MAX_UINT256)
// - deposit when paused
// - deposit with insufficient balance
```

**Solution:** Use fuzzing and property-based testing

### 2. Missing Invariant Tests

**Problem:** Invariants documented but not tested

**Example:**

```solidity
// Documentation says: "Weight sum must always equal 10000"
// But no test verifies this after every operation
```

**Solution:** Implement invariant tests that run after every state change

### 3. Inadequate Oracle Protection

**Problem:** Using spot prices instead of TWAP

**Example:**

```solidity
// BAD: Vulnerable to flash loan manipulation
uint256 price = oracle.latestAnswer();

// GOOD: Use time-weighted average
uint256 price = oracle.getTWAP(30 minutes);
```

### 4. Weak Access Control

**Problem:** Critical functions lack proper access control

**Example:**

```solidity
// BAD: Anyone can rebalance
function rebalance() external {
    // Critical operation without access control
}

// GOOD: Role-based access control
function rebalance() external onlyKeeper whenNotPaused {
    // Only authorized keepers can rebalance
}
```

### 5. Missing Emergency Procedures

**Problem:** No pause mechanism or emergency withdrawal

**Example:**

```solidity
// Missing emergency pause
contract Strategy {
    // No pause functionality
    // No emergency withdrawal
    // No circuit breakers
}

// Should have:
contract Strategy is Pausable {
    function pause() external onlyGuardian {
        _pause();
    }

    function emergencyWithdraw() external onlyOwner whenPaused {
        // Emergency withdrawal logic
    }
}
```

---

## Tools and Resources

### Static Analysis Tools

#### Slither (Required: All levels)

```bash
# Install
pip3 install slither-analyzer

# Run analysis
slither . --exclude-dependencies

# Check for high-severity issues (must be 0)
slither . --exclude-dependencies --filter-paths "node_modules|test"
```

#### Mythril (Required: Silver/Gold)

```bash
# Install
pip3 install mythril

# Run analysis
myth analyze contracts/Strategy.sol

# Check for vulnerabilities
```

#### Aderyn (Required: Gold)

```bash
# Install
cargo install aderyn

# Run analysis
aderyn .
```

### Testing Tools

#### Hardhat (JavaScript/TypeScript)

```bash
# Run tests
npx hardhat test

# Generate coverage
npx hardhat coverage

# Run fuzzing
npx hardhat test --grep "fuzz"
```

#### Foundry (Solidity)

```bash
# Run tests
forge test

# Generate coverage
forge coverage

# Run fuzzing
forge test --fuzz-runs 1000
```

### Coverage Tools

#### Istanbul (Hardhat)

```bash
# Generate coverage report
npx hardhat coverage

# View HTML report
open coverage/index.html
```

#### Forge Coverage (Foundry)

```bash
# Generate coverage
forge coverage --report lcov

# View report
genhtml lcov.info -o coverage
open coverage/index.html
```

### Mutation Testing

#### Stryker (JavaScript/TypeScript)

```bash
# Install
npm install --save-dev @stryker-mutator/core

# Run mutation testing
npx stryker run

# View report
open reports/mutation/html/index.html
```

### Formal Verification

#### Certora Prover (Gold level)

```bash
# Install Certora CLI
pip3 install certora-cli

# Run verification
certoraRun contracts/Strategy.sol --verify Strategy:specs/Strategy.spec
```

---

## Reporting Guidelines

### Report Structure

1. **Executive Summary**
   - Project overview
   - Target certification level
   - Overall assessment
   - Key findings summary
   - Certification recommendation

2. **Scope**
   - Contracts audited
   - Commit hash
   - Audit timeline
   - Methodology

3. **Findings**
   - Critical issues
   - High severity issues
   - Medium severity issues
   - Low severity issues
   - Informational/Gas optimizations

4. **DSS Compliance Assessment**
   - Use [AUDITOR-CHECKLIST.md](AUDITOR-CHECKLIST.md)
   - Mark each requirement as Pass/Fail
   - Provide evidence for each requirement
   - Calculate compliance percentage

5. **Recommendations**
   - Prioritized remediation steps
   - Timeline for fixes
   - Re-audit requirements

### Severity Classification

| Severity          | Description                                   | Examples                                |
| ----------------- | --------------------------------------------- | --------------------------------------- |
| **Critical**      | Immediate risk of fund loss                   | Reentrancy, access control bypass       |
| **High**          | Potential fund loss under specific conditions | Oracle manipulation, flash loan attacks |
| **Medium**        | Incorrect behavior, no immediate fund loss    | Incorrect calculations, missing events  |
| **Low**           | Best practice violations                      | Missing NatSpec, gas inefficiencies     |
| **Informational** | Code quality improvements                     | Style issues, documentation gaps        |

### Certification Recommendation Format

```markdown
## Certification Recommendation

**Target Level:** Silver

**Overall Compliance:** 94% (132/140 requirements met)

**Recommendation:** CONDITIONAL PASS

**Conditions:**

1. Fix critical issue #1 (reentrancy in withdraw function)
2. Increase fuzzing iterations from 300 to 500+
3. Add missing invariant tests for share price monotonicity

**Timeline:** 2 weeks for remediation + 1 week re-audit

**Re-audit Scope:** Verify fixes for issues #1-3, re-run full test suite
```

---

## Frequently Asked Questions

### Q: How long does a DSS audit take?

**A:**

- Bronze: 2-4 weeks
- Silver: 4-8 weeks
- Gold: 3-6 months

### Q: Can a project skip Bronze and go straight to Silver/Gold?

**A:** Yes, if the project meets all requirements for the target level. However, we recommend starting with Bronze for early-stage projects.

### Q: What if a project fails certification?

**A:** The audit report will identify gaps and provide a remediation plan. The project can address issues and request re-audit.

### Q: Are external audits required?

**A:**

- Bronze: No
- Silver: Yes (1 audit minimum)
- Gold: Yes (2+ audits minimum)

### Q: How often should projects re-certify?

**A:**

- After major upgrades
- Annually for Gold certification
- After any security incident

---

## Related Documentation

- **[AUDITOR-CHECKLIST.md](AUDITOR-CHECKLIST.md)** - Complete audit checklist
- **[Certification Matrix](../certification/CERTIFICATION-MATRIX.md)** - Requirements table
- **[Certification Process](../certification/CERTIFICATION-PROCESS.md)** - Certification workflow
- **[Specification Part A](../specification/part-a-code-quality.md)** - Code Quality (DSS-1 to DSS-8)
- **[Specification Part C](../specification/part-c-operational.md)** - Operational Security (DSS-9)
- **[Specification Part D](../specification/part-d-governance.md)** - Governance (DSS-10)
- **[Specification Part E](../specification/part-e-interoperability.md)** - Interoperability (DSS-11)
- **[Specification Part F](../specification/part-f-tooling.md)** - Tooling & Automation (DSS-12, DSS-13, DSS-14)

---

## Contact Information

For questions about DSS audits or certification:

- **GitHub Issues:** https://github.com/VaultBricks/DSS/issues
- **Documentation:** https://github.com/VaultBricks/DSS
- **FAQ:** [docs/FAQ.md](../docs/FAQ.md)

---

**Document Version:** 1.1.0
**Maintained by:** VaultBricks DSS Team
**Last Updated:** 2026-01-03

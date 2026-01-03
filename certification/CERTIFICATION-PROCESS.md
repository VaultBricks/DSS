# Certification Process

DSS supports both self-certification and third-party certification. This guide explains how to achieve DSS certification at any level.

## Self-Certification

DSS supports self-certification for teams that want to demonstrate compliance without third-party verification.

### Step 1: Complete Checklist

Use the appropriate certification checklist to track your progress:

- [Bronze Certification Checklist](checklist-bronze.md)
- [Silver Certification Checklist](checklist-silver.md)
- [Gold Certification Checklist](checklist-gold.md)

### Step 2: Generate Evidence

Generate all required evidence documents:

```bash
# Generate coverage report
npm run coverage

# Generate test report
npm test -- --reporter json > test-report.json

# Generate gas report
npm run test:gas > gas-report.txt

# Run static analysis
slither . --json slither-report.json
```

### Step 3: Create Certification Document

Create a certification report using the following template:

```markdown
# DSS Certification Report

## Protocol: [Your Protocol Name]
## Version: [Version Number]
## Date: [Certification Date]
## Standards Compliance:
- VaultBricks MAS: [Version/Level]
- VaultBricks DSS: [Version/Level]

## DSS Level: [Bronze/Silver/Gold]

### Evidence Summary

| Requirement | Status | Evidence |
|-------------|--------|----------|
| DSS-1 Line Coverage | ✅ 96% | coverage/lcov-report/index.html |
| DSS-1 Branch Coverage | ✅ 87% | coverage/lcov-report/index.html |
| DSS-7 Fuzz Iterations | ✅ 600 | test-report.json |
| ... | ... | ... |

### Test Results

- Total Tests: 525
- Passing: 525
- Failing: 0
- Skipped: 0

### Attestation

We, the undersigned, attest that [Protocol Name] meets all requirements
for DSS [Level] certification as of [Date].

Signed: [Team Lead]
```

### Step 4: Publish Certification

Once you've completed the certification document:

1. Add it to your repository (e.g., `CERTIFICATION.md`)
2. Update your README with DSS certification badges
3. Optionally, submit a PR to the DSS repository to be listed as a certified protocol

## Third-Party Certification

For protocols seeking independent verification, DSS recommends engaging:

### Security Auditors

- **Trail of Bits** — Comprehensive security audits
- **OpenZeppelin** — Smart contract security expertise
- **Consensys Diligence** — DeFi-focused audits

### Formal Verification

- **Certora** — SMT-based formal verification
- **Runtime Verification** — K Framework verification

### Economic Auditors

- **Gauntlet** — Economic modeling and simulation
- **Chaos Labs** — Risk analysis and stress testing

## Certification Levels

### Bronze Certification

**Target:** Early-stage protocols, testnet deployments, MVPs

**Timeline:** 2-4 weeks

**Key Requirements:**
- DSS-1 through DSS-6 at Bronze thresholds
- DSS-11 Basic Interoperability
- Statement Coverage: ≥80%
- Branch Coverage: ≥60%

### Silver Certification

**Target:** Mainnet deployments, protocols with <$10M TVL

**Timeline:** 4-8 weeks (includes audit)

**Key Requirements:**
- All Bronze requirements
- DSS-7 (Stress Tests & Fuzzing)
- DSS-8 (Gas Efficiency)
- DSS-9 (Operational Security)
- Statement Coverage: ≥95%
- Branch Coverage: ≥80%
- External audit completed

### Gold Certification

**Target:** Critical infrastructure, protocols with >$10M TVL

**Timeline:** 3-6 months (includes formal verification)

**Key Requirements:**
- All Silver requirements
- DSS-10 (Governance & Upgrades)
- Formal Verification of critical paths
- L2 Optimization
- Statement Coverage: ≥98%
- Branch Coverage: ≥90%
- Multiple external audits
- Active bug bounty program

## Re-Certification

Re-certification is recommended:

- After major upgrades
- Annually for Gold certification
- After any security incident

## Certification Badges

Certified protocols can display DSS badges:

```markdown
![DSS Bronze](https://img.shields.io/badge/DSS-Bronze-orange)
![DSS Silver](https://img.shields.io/badge/DSS-Silver-lightgrey)
![DSS Gold](https://img.shields.io/badge/DSS-Gold-gold)
![MAS Compatible](https://img.shields.io/badge/MAS-Compatible-brightgreen)
```

## Related Documentation

- [Certification Matrix](CERTIFICATION-MATRIX.md) - Complete requirements table
- [FAQ](../docs/FAQ.md) - Frequently asked questions about certification
- [Implementation Guidelines](../docs/development/IMPLEMENTATION-GUIDELINES.md) - How to implement DSS requirements

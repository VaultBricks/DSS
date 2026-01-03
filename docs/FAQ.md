# FAQ - Frequently Asked Questions

## General Questions

### Q: What's the difference between MAS and DSS?

**A:** MAS (Multi-Asset Standard) defines the architecture for multi-asset vaults. DSS (DeFi Strategy Standard) defines the testing framework for strategy validation. Most protocols should follow both:

- MAS → What to build (vault structure)
- DSS → How to validate (testing requirements)

### Q: Is DSS mandatory?

**A:** No, DSS is a voluntary standard. However, protocols that achieve certification demonstrate a commitment to quality that can build user trust.

### Q: Can I use Foundry instead of Hardhat?

**A:** Yes, DSS is framework-agnostic. The requirements can be met with Foundry, Hardhat, or any other testing framework. The code examples use Hardhat because that's what the reference implementation uses.

### Q: How long does it take to achieve DSS certification?

**A:** Typical timelines:

- Bronze: 2-4 weeks for a new protocol
- Silver: 4-8 weeks (includes audit)
- Gold: 3-6 months (includes formal verification)

### Q: What if my protocol doesn't fit the strategy categories?

**A:** DSS is extensible. You can add custom categories for your specific use case while still following the core principles.

## Technical Questions

### Q: Why 10000 basis points instead of percentages?

**A:** Using 10000 basis points (100.00%) provides precision without floating-point issues in Solidity. This is a common pattern in DeFi.

### Q: How do I handle strategies that don't use weight calculations?

**A:** Adapt the invariants to your strategy's core properties. The principle is the same: identify critical properties that must always hold.

### Q: What's the difference between fuzzing and invariant testing?

**A:**
- **Fuzzing** generates random inputs for a single function call
- **Invariant testing** executes random sequences of operations and checks properties after each

### Q: How do I reproduce a failing fuzz test?

**A:** fast-check logs the seed when a test fails. Set `FUZZ_SEED=<seed>` to reproduce:

```bash
FUZZ_SEED=12345 npm run test:fuzz
```

## Certification Questions

### Q: Can I claim partial certification?

**A:** Yes, you can claim "DSS Bronze Compliant" or "DSS Silver Compliant (Part A)" if you meet some but not all requirements.

### Q: How often should I re-certify?

**A:** Re-certification is recommended:

- After major upgrades
- Annually for Gold certification
- After any security incident

### Q: Is there a certification badge?

**A:** Yes, certified protocols can display the DSS badge:

```markdown
![DSS Gold](https://img.shields.io/badge/DSS-Gold-gold)
![Works with MAS](https://img.shields.io/badge/MAS-Compatible-brightgreen)
```

---

For more information, see:
- [Certification Process](../certification/CERTIFICATION-PROCESS.md)
- [Certification Matrix](../certification/CERTIFICATION-MATRIX.md)
- [Implementation Guidelines](development/IMPLEMENTATION-GUIDELINES.md)

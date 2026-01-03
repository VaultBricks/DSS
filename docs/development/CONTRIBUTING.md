# Contributing to DSS

DSS is an open-source standard that welcomes contributions from the community.

## How to Contribute

### 1. Report Issues

Found a gap in the standard? Open an issue on GitHub describing:

- What's missing or unclear
- Why it's important
- Suggested approach (if any)

### 2. Suggest Improvements

Have ideas for new categories? Submit a proposal via:

- GitHub Issue with `[Proposal]` prefix
- Detailed explanation of the new requirement
- Rationale and use cases

### 3. Add Examples

Contribute code examples for different frameworks:

- Foundry examples (currently only Hardhat examples exist)
- L2-specific testing patterns
- Cross-chain strategy testing
- MEV protection examples

### 4. Translate

Help translate DSS into other languages:

- Create a new directory: `docs/[language-code]/`
- Translate all specification files
- Maintain consistency with English version

### 5. Submit Your Certified Strategy to the Registry

Have you achieved DSS certification? Share your success with the community!

The [DSS Registry](../../REGISTRY.md) is a public showcase of certified strategies that:

- Provides social proof for the DSS standard
- Helps developers find reference implementations
- Builds community around best practices
- Assists auditors in finding compliant examples

**How to Submit:**

1. **Achieve DSS Certification**
   - Complete all requirements for Bronze, Silver, or Gold certification
   - Generate your certification report following the [Certification Process](../../certification/CERTIFICATION-PROCESS.md)
   - Ensure all evidence is publicly accessible

2. **Submit via Issue Template**
   - Go to [Issues](https://github.com/VaultBricks/DSS/issues/new/choose)
   - Select "Registry Submission" template
   - Fill out all required fields:
     - Protocol and strategy name
     - Certification level and date
     - Links to repository, documentation, and certification report
     - Key metrics (coverage, fuzzing, audits)
   - Submit the issue

3. **Verification & Approval**
   - Maintainers will verify your certification claims
   - Review typically takes 1-3 days
   - Once approved, your entry will be added to the registry
   - Your achievement may be featured in DSS updates!

**Requirements:**

- ✅ Public repository with strategy code
- ✅ Complete certification report
- ✅ Test coverage reports and evidence
- ✅ Clear documentation
- ✅ All claims must be verifiable

**Alternative:** You can also submit a PR directly to edit `REGISTRY.md`. See the [Registry Guidelines](../../REGISTRY.md#how-to-submit-your-strategy) for details.

## Contribution Process

1. **Fork the repository**

   ```bash
   git clone https://github.com/VaultBricks/DSS.git
   cd DSS
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style and formatting
   - Update documentation as needed
   - Add tests if applicable

4. **Submit a pull request**
   - Provide clear description of changes
   - Reference related issues
   - Ensure all checks pass

5. **Participate in review**
   - Address review comments
   - Update PR as needed
   - Be patient and respectful

## Governance

DSS is governed by a steering committee of industry practitioners. Major changes require:

- **RFC (Request for Comments) period:** 2 weeks
- **Community vote:** Simple majority
- **Implementation period:** 4 weeks

### What Requires RFC?

- New DSS categories (DSS-17, DSS-18, etc.)
- Changes to certification thresholds
- Breaking changes to existing requirements
- Major structural changes

### What Doesn't Require RFC?

- Bug fixes
- Documentation improvements
- Code examples
- Clarifications to existing requirements

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## Questions?

If you have questions about contributing:

- Open a GitHub Discussion
- Check existing Issues and PRs
- Review the [FAQ](../FAQ.md)

---

Thank you for contributing to DSS! Your efforts help make DeFi safer for everyone.

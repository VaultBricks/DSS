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
- Review the [FAQ](FAQ.md)

---

Thank you for contributing to DSS! Your efforts help make DeFi safer for everyone.




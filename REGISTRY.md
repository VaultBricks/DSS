# DSS Certified Strategies Registry

Welcome to the official registry of DeFi Strategy Standard (DSS) certified strategies! This registry showcases projects that have achieved DSS certification, demonstrating their commitment to security, quality, and best practices.

## Purpose

This registry serves to:

- **Provide social proof** for the DSS standard through real-world adoption
- **Help developers** find reference implementations and learn from certified strategies
- **Build community** around the DSS standard
- **Assist auditors** in finding examples of compliant implementations
- **Showcase excellence** in DeFi strategy development

## Registry Entries

### Format

Each registry entry includes:

- **Protocol Name** - The name of the protocol/project
- **Strategy Name** - Specific strategy that is certified
- **Certification Level** - Bronze 🥉, Silver 🥈, or Gold 🥇
- **Certification Date** - When certification was achieved
- **Version** - DSS version used for certification
- **Links** - Repository, documentation, and certification report
- **Description** - Brief description of the strategy

---

## Certified Strategies

> **Note:** This registry is currently empty. Be the first to submit your DSS-certified strategy!

<!--
### Example Entry Format (remove this comment when adding real entries):

### 🥇 [Protocol Name] - [Strategy Name]

**Certification Level:** Gold 🥇
**Certified:** 2026-01-15
**DSS Version:** v1.2.0
**Repository:** https://github.com/example/strategy
**Documentation:** https://docs.example.com
**Certification Report:** [View Report](link-to-report)

**Description:** Brief description of what this strategy does, its key features, and why it's notable.

**Key Metrics:**
- Test Coverage: 98.5%
- Fuzzing Runs: 10,000+
- Audit Status: Audited by [Firm Name]

---
-->

## How to Submit Your Strategy

We welcome submissions from any project that has achieved DSS certification! Here's how to add your strategy to the registry:

### Submission Process

1. **Achieve DSS Certification**
   - Complete all requirements for your target certification level (Bronze, Silver, or Gold)
   - Generate your certification report following the [Certification Process](certification/CERTIFICATION-PROCESS.md)
   - Ensure all evidence is publicly accessible

2. **Prepare Your Submission**
   - Gather all required information (see format above)
   - Prepare links to your repository, documentation, and certification report
   - Write a brief description of your strategy (2-3 sentences)

3. **Submit via GitHub**

   **Option A: Use the Issue Template (Recommended)**
   - Go to [Issues](https://github.com/VaultBricks/DSS/issues/new/choose)
   - Select "Registry Submission" template
   - Fill out all required fields
   - Submit the issue
   - A maintainer will review and create a PR to add your entry

   **Option B: Submit a Pull Request Directly**
   - Fork this repository
   - Edit `REGISTRY.md` and add your entry in the appropriate section
   - Follow the format shown in the example above
   - Ensure entries are sorted by certification level (Gold → Silver → Bronze), then by date (newest first)
   - Submit a pull request with title: `[REGISTRY] Add [Your Protocol Name]`
   - Include your certification report or link to it in the PR description

### Submission Requirements

To be listed in the registry, your submission must include:

- ✅ **Public Repository** - Your strategy code must be publicly accessible
- ✅ **Certification Report** - A completed DSS certification report (can be in your repo or linked)
- ✅ **Evidence** - Test coverage reports, audit reports (for Silver/Gold), and other required evidence
- ✅ **Documentation** - Clear documentation explaining your strategy
- ✅ **Verification** - All claims must be verifiable by maintainers

### Review Process

1. **Submission** - You submit via issue template or PR
2. **Verification** - Maintainers verify your certification claims
3. **Review** - Quick review of submission format and completeness (1-3 days)
4. **Approval** - Entry is added to the registry
5. **Announcement** - Your achievement may be featured in DSS updates!

### Updating Your Entry

If you need to update your registry entry (e.g., new certification level, updated links):

1. Submit a new issue using the "Registry Submission" template
2. Mark it as an update in the title: `[REGISTRY UPDATE] [Your Protocol Name]`
3. Provide the updated information
4. A maintainer will update your entry

## Registry Statistics

**Total Certified Strategies:** 0  
**Gold Certified:** 0 🥇  
**Silver Certified:** 0 🥈  
**Bronze Certified:** 0 🥉

---

## Certification Levels Overview

| Level         | Focus         | Key Requirements                                                 |
| ------------- | ------------- | ---------------------------------------------------------------- |
| 🥉 **Bronze** | MVP / Testnet | DSS 1-6, Basic Interoperability. >80% Coverage.                  |
| 🥈 **Silver** | Mainnet <$10M | All Bronze + Stress Tests (DSS-7), Audits. >95% Coverage.        |
| 🥇 **Gold**   | Institutional | Formal Verification, L2 Optimization, Bug Bounty. >98% Coverage. |

For detailed requirements, see the [Certification Matrix](certification/CERTIFICATION-MATRIX.md).

## Questions?

- **How do I get certified?** See the [Certification Process](certification/CERTIFICATION-PROCESS.md)
- **What are the requirements?** Check the [Certification Matrix](certification/CERTIFICATION-MATRIX.md)
- **Need help?** Open a [GitHub Discussion](https://github.com/VaultBricks/DSS/discussions)
- **Found an issue?** Report it in [Issues](https://github.com/VaultBricks/DSS/issues)

## Contributing

This registry is maintained by the DSS community. See [Contributing Guide](docs/development/CONTRIBUTING.md) for more information on how to contribute to DSS.

---

**Last Updated:** 2026-01-03  
**Registry Version:** 1.0.0

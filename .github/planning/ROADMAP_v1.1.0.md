# DSS v1.1.0 Roadmap Issues

This file contains the content for GitHub Issues to track improvements for DSS v1.1.0, based on the comprehensive review of DSS 1.0.0.

## Priority: High

### Issue 1: Add Foundry Support & Examples
**Title:** [FEATURE] Add Foundry Support & Examples
**Labels:** `type: feature`, `component: examples`, `priority: high`, `status: help wanted`
**Milestone:** v1.1.0

**Summary:**
Port existing Hardhat examples to Foundry/Forge to support the growing number of DeFi developers using Foundry in 2025.

**Motivation:**
The DSS standard currently provides examples exclusively for Hardhat. However, the DeFi industry has largely migrated to Foundry for smart contract development. Without Foundry examples, DSS may appear outdated to modern developers, limiting adoption.

**Proposed Solution:**
- Create `examples/foundry/` directory parallel to existing Hardhat examples
- Port `fuzzing-test-example.ts` to Solidity (Foundry/Forge)
- Port `invariant-test-example.ts` to Solidity (Foundry/Forge)
- Add `foundry.toml` example configuration with DSS-specific settings
- Update `examples/README.md` to include Foundry instructions
- Add Foundry-specific CI/CD examples if applicable

**Tasks:**
- [ ] Create `examples/foundry/` directory structure
- [ ] Port fuzzing test example to Foundry
- [ ] Port invariant test example to Foundry
- [ ] Create `foundry.toml` example configuration
- [ ] Update `examples/README.md` with Foundry section
- [ ] Update `IMPLEMENTATION-GUIDELINES.md` to mention Foundry support
- [ ] Test all Foundry examples compile and run

**Related:**
- Related to DSS-7 (Stress Tests & Fuzzing)
- Related to DSS-2 (Economic Invariants)
- See existing Issue #3 in ISSUES_BATCH.md (may need to merge/consolidate)

---

## Priority: Medium

### Issue 2: Develop DSS CLI for Report Generation
**Title:** [FEATURE] Develop DSS CLI Tool for Automated Certification Report Generation
**Labels:** `type: feature`, `component: examples`, `priority: medium`, `status: help wanted`
**Milestone:** v1.1.0

**Summary:**
Create a CLI tool (`npx dss report` or `dss-cli`) that automatically parses test results and generates a `CERTIFICATION.md` draft, reducing manual work for developers seeking certification.

**Motivation:**
Currently, self-certification requires developers to manually:
1. Run tests and collect coverage reports
2. Copy-paste results into a Markdown template
3. Manually check off checklist items

This friction can discourage teams from pursuing certification. An automated tool would lower the barrier to entry.

**Proposed Solution:**
- Create a Node.js CLI package (or standalone script)
- Parse test output (JSON reporter format)
- Parse coverage reports (lcov/JSON format)
- Parse static analysis results (Slither/Mythril JSON)
- Generate `CERTIFICATION.md` draft with:
  - Evidence summary table (auto-filled from reports)
  - Test results summary
  - Coverage metrics
  - Checklist items (pre-checked based on evidence)
- Support for both Hardhat and Foundry output formats

**Tasks:**
- [ ] Design CLI interface (`dss report --format=hardhat|foundry`)
- [ ] Implement test result parser
- [ ] Implement coverage report parser
- [ ] Implement static analysis parser
- [ ] Generate certification document template
- [ ] Add validation to ensure required evidence is present
- [ ] Create documentation for CLI usage
- [ ] Add to `package.json` as optional dependency or separate package

**Alternatives Considered:**
- GitHub Action instead of CLI (less flexible, but could be easier for CI/CD)
- Web-based form (requires hosting infrastructure)

**Related:**
- Related to `CERTIFICATION-PROCESS.md`
- Affects all certification levels (Bronze/Silver/Gold)

---

### Issue 3: Add Operational Security Examples (DSS-9)
**Title:** [FEATURE] Add Concrete Operational Security Examples for DSS-9
**Labels:** `type: documentation`, `component: part-c`, `priority: medium`, `status: help wanted`
**Milestone:** v1.1.0

**Summary:**
Add practical code examples for monitoring bots, keeper scripts, and incident response automation to make DSS-9 (Operational Security) requirements actionable.

**Motivation:**
DSS-9 describes *what* needs to be monitored (deployment security, access control, monitoring), but lacks concrete examples of *how* to implement these requirements. Developers need working code examples to understand how to build keeper bots or integrate with monitoring services.

**Proposed Solution:**
- Add `examples/operational/` directory
- Create example monitoring bot script (TypeScript/JavaScript)
- Add OpenZeppelin Defender configuration example
- Add generic keeper bot example (using ethers.js/hardhat)
- Add example alerting configuration (Tenderly, Defender, or custom)
- Add example deployment script with multi-sig verification
- Document incident response playbook template

**Tasks:**
- [ ] Create `examples/operational/` directory
- [ ] Write example keeper bot script
- [ ] Add OpenZeppelin Defender config example
- [ ] Add generic monitoring script example
- [ ] Create deployment script example with multi-sig
- [ ] Add alerting configuration examples
- [ ] Create incident response playbook template
- [ ] Update `specification/part-c-operational.md` with links to examples

**Related:**
- Related to DSS-9 (Operational Security)
- Required for Silver and Gold certification

---

## Priority: Low

### Issue 4: Create Certified Strategy Registry
**Title:** [FEATURE] Create Public Registry of DSS-Certified Strategies
**Labels:** `type: feature`, `component: documentation`, `priority: low`, `status: help wanted`
**Milestone:** v1.1.0

**Summary:**
Create a public registry (`REGISTRY.md` or `ADOPTERS.md`) where projects can list their DSS-certified strategies, providing social proof and encouraging adoption.

**Motivation:**
Social proof is crucial for standard adoption. A public registry:
- Demonstrates real-world usage
- Helps developers find reference implementations
- Builds community around the standard
- Provides examples for auditors and reviewers

**Proposed Solution:**
- Create `REGISTRY.md` in repository root
- Define format for registry entries (protocol name, certification level, links, date)
- Add instructions for submitting via PR
- Create GitHub issue template for registry submissions
- Optionally: Add badges/links in README to showcase adopters

**Tasks:**
- [ ] Design registry entry format
- [ ] Create `REGISTRY.md` file with header and instructions
- [ ] Add example entries (if any exist)
- [ ] Create issue template for registry submissions
- [ ] Update `CONTRIBUTING.md` with registry submission process
- [ ] Add registry section to README (optional)

**Alternatives Considered:**
- Separate website/database (more complex, requires hosting)
- GitHub Discussions (less discoverable)

**Related:**
- Community engagement
- Marketing/adoption

---

### Issue 5: Create Auditor Checklists & Templates
**Title:** [FEATURE] Create Auditor-Focused Checklists and Templates
**Labels:** `type: documentation`, `component: part-d`, `priority: low`, `status: help wanted`
**Milestone:** v1.1.0

**Summary:**
Create a dedicated PDF/Markdown artifact specifically designed for auditors to use when verifying DSS compliance, making it easier for teams to engage third-party auditors.

**Motivation:**
When teams hire auditors, they need to clearly communicate DSS requirements. Currently, auditors must navigate multiple documents (Matrix, Specs, Checklists). A consolidated auditor-focused document would:
- Streamline the audit process
- Ensure auditors check all DSS requirements
- Increase DSS adoption by making audits easier

**Proposed Solution:**
- Create `auditor/` directory
- Generate `AUDITOR-CHECKLIST.md` (consolidated view of all requirements)
- Create `AUDITOR-GUIDE.md` (explanation of DSS for auditors unfamiliar with the standard)
- Optionally: Generate PDF version for offline use
- Add auditor-specific test coverage requirements summary

**Tasks:**
- [ ] Design auditor checklist format
- [ ] Create `auditor/AUDITOR-CHECKLIST.md` (all DSS requirements in one place)
- [ ] Create `auditor/AUDITOR-GUIDE.md` (DSS overview for auditors)
- [ ] Add test coverage summary by certification level
- [ ] Create PDF export script or instructions
- [ ] Update `CERTIFICATION-PROCESS.md` to reference auditor resources

**Related:**
- Related to DSS-10 (Governance & Upgrades)
- Affects third-party certification process

---

## Notes

- These issues are based on the comprehensive review of DSS 1.0.0
- Priority levels reflect impact on adoption and developer experience
- All issues should be created with the `v1.1.0` milestone
- Consider creating a project board to track these issues


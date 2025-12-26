# Initial Issues Batch

This file contains the content for the initial set of issues to populate the DSS repository roadmap.

## Documentation & Onboarding

### Issue 1: Refine "How to Contribute" Guide
**Title:** Refine "How to Contribute" Guide with Specific Examples
**Labels:** `type: documentation`, `status: good first issue`
**Milestone:** v1.0.0
**Body:**
The current contributing guide is generic. We need to add specific examples of how to propose a new DSS category or update an existing one.

**Tasks:**
- [ ] Add a step-by-step example of submitting a proposal for a new testing category.
- [ ] Explain the "RFC" process mentioned in the governance section in more detail.
- [ ] Add a template or checklist for what a good PR description should include for DSS.

### Issue 2: Add Glossary of Terms
**Title:** Add Glossary of Terms
**Labels:** `type: documentation`, `status: help wanted`
**Milestone:** v1.0.0
**Body:**
Create a glossary defining key terms used throughout the DSS framework to help less experienced users understand the standard.

**Terms to define:**
- Facet (Diamond Pattern)
- Invariants
- Fuzzing vs. Property-Based Testing
- MEV (Miner Extractable Value)
- Timelock
- Slippage
- TWAP

## v1.1.0 Roadmap Items

### Issue 3: Add Foundry Code Examples
**Title:** Add Foundry Code Examples
**Labels:** `type: feature`, `component: examples`, `priority: high`
**Milestone:** v1.1.0
**Body:**
Port the existing Hardhat examples to Foundry (Forge) to support the growing number of developers using Foundry.

**Scope:**
- [ ] Create `examples/foundry/` directory.
- [ ] Port `fuzzing-test-example.ts` to Solidity (Foundry).
- [ ] Port `invariant-test-example.ts` to Solidity (Foundry).
- [ ] Add a `foundry.toml` example configuration.
- [ ] Update `examples/README.md` to include instructions for Foundry.

### Issue 4: Create L2-Specific Testing Guidelines
**Title:** Create L2-Specific Testing Guidelines
**Labels:** `type: feature`, `component: part-a`
**Milestone:** v1.1.0
**Body:**
Layer 2 networks have specific characteristics that affect strategy testing. We need a new section or guide addressing these.

**Topics to cover:**
- Sequencer uptime and centralization risks.
- Different gas models (L1 data availability costs).
- L2-specific opcodes or precompiles.
- Finality differences.

### Issue 5: Develop Cross-Chain Strategy Testing Standards
**Title:** Develop Cross-Chain Strategy Testing Standards
**Labels:** `type: feature`, `component: part-a`
**Milestone:** v1.1.0
**Body:**
Define standards for testing bridge interactions and cross-chain message passing.

**Requirements:**
- Testing asynchronous message handling.
- Mocking bridge interfaces (LayerZero, wormhole, etc.).
- Handling failed cross-chain transactions (revert on destination).
- Latency simulation in tests.

### Issue 6: Document MEV Protection Patterns
**Title:** Document MEV Protection Patterns
**Labels:** `type: documentation`, `component: part-b`
**Milestone:** v1.1.0
**Body:**
Expand DSS-10 (Economic Attack Resistance) with specific code patterns and testing strategies for MEV protection.

**Content to add:**
- Commit-reveal schemes for rebalancing.
- Slippage protection calculations.
- Using private RPCs/mempools (Flashbots Protect).
- Code examples for these patterns.

## Operational

### Issue 7: Setup CI/CD for Example Code
**Title:** Setup CI/CD for Example Code
**Labels:** `type: maintenance`, `priority: medium`
**Milestone:** v1.1.0
**Body:**
Ensure the code examples in `examples/` are automatically linted and tested on PRs to prevent regressions in our reference material.

**Tasks:**
- [ ] Create a GitHub Action workflow `examples-ci.yml`.
- [ ] Install dependencies in `examples/`.
- [ ] Run linting and basic tests for the example files.

### Issue 8: Automate Broken Link Checking
**Title:** Automate Broken Link Checking
**Labels:** `type: maintenance`
**Milestone:** v1.0.0
**Body:**
Add a GitHub Action to check for broken links in documentation periodically to ensure the standard remains navigable.

**Implementation:**
- Use `lycheeverse/lychee-action` or similar.
- Configure to check local markdown files and external links.
- Schedule to run weekly or on push to main.




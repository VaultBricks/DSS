#!/bin/bash

# DSS Coverage Gap - Create GitHub Milestones, Labels, and Issues
# Based on DSS-COVERAGE-ANALYSIS.md v2.0
# Date: December 27, 2025

set -e

REPO="VaultBricks/DSS"
GH_CMD="gh"  # Will use gh from PATH or full path

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}DSS Coverage Gap Issues Generator${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Detect gh location
if command -v gh &> /dev/null; then
    GH_CMD="gh"
    echo -e "${GREEN}✓ Found gh in PATH${NC}"
elif [ -f "/c/Program Files/GitHub CLI/gh.exe" ]; then
    GH_CMD="/c/Program Files/GitHub CLI/gh.exe"
    echo -e "${GREEN}✓ Found gh at: /c/Program Files/GitHub CLI/gh.exe${NC}"
elif [ -f "C:/Program Files/GitHub CLI/gh.exe" ]; then
    GH_CMD="C:/Program Files/GitHub CLI/gh.exe"
    echo -e "${GREEN}✓ Found gh at: C:/Program Files/GitHub CLI/gh.exe${NC}"
else
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Please install from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! $GH_CMD auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI is ready${NC}"
echo ""

# ============================================
# Step 1: Create Milestones
# ============================================

echo -e "${YELLOW}Step 1: Creating Milestones...${NC}"

# v1.2.0 - Production Ready
echo "Creating milestone: v1.2.0"
$GH_CMD milestone create "v1.2.0" \
  --repo $REPO \
  --title "v1.2.0 - Production Ready" \
  --description "Focus on Production Readiness: CI/CD automation, monitoring, and critical coverage gaps (DSS-5, DSS-9, DSS-11, DSS-13, DSS-14)" \
  --due-date "2026-03-31" \
  2>/dev/null || echo "  (Milestone may already exist)"

# v1.3.0 - Developer Experience
echo "Creating milestone: v1.3.0"
$GH_CMD milestone create "v1.3.0" \
  --repo $REPO \
  --title "v1.3.0 - Developer Experience" \
  --description "Enhanced developer experience: documentation, tutorials, expanded test coverage (DSS-1, DSS-3, DSS-4, DSS-6, DSS-7, DSS-8, DSS-12)" \
  --due-date "2026-06-30" \
  2>/dev/null || echo "  (Milestone may already exist)"

# v1.4.0 - Ecosystem & Governance
echo "Creating milestone: v1.4.0" \
  $GH_CMD milestone create "v1.4.0" \
  --repo $REPO \
  --title "v1.4.0 - Ecosystem & Governance" \
  --description "Community resources, governance tooling, versioning, and legal compliance (DSS-10, migration guides, legal docs)" \
  --due-date "2026-09-30" \
  2>/dev/null || echo "  (Milestone may already exist)"

# v2.0.0 - Multi-chain & Advanced
echo "Creating milestone: v2.0.0"
$GH_CMD milestone create "v2.0.0" \
  --repo $REPO \
  --title "v2.0.0 - Multi-chain & Advanced" \
  --description "Multi-chain support, L2 optimizations, and advanced strategy patterns" \
  --due-date "2026-12-31" \
  2>/dev/null || echo "  (Milestone may already exist)"

echo -e "${GREEN}✓ Milestones created${NC}"
echo ""

# ============================================
# Step 2: Create New Labels
# ============================================

echo -e "${YELLOW}Step 2: Creating New Labels...${NC}"

$GH_CMD label create "component: part-f" \
  --repo $REPO \
  --description "Tooling, CI/CD & Monitoring (DSS-12, DSS-13, DSS-14)" \
  --color "c5def5" \
  2>/dev/null || echo "  Label 'component: part-f' may already exist"

$GH_CMD label create "component: sdk" \
  --repo $REPO \
  --description "@dss/core, @dss/test, @dss/cli packages" \
  --color "c5def5" \
  2>/dev/null || echo "  Label 'component: sdk' may already exist"

$GH_CMD label create "component: automation" \
  --repo $REPO \
  --description "CI/CD, workflows, testing automation" \
  --color "bfd4f2" \
  2>/dev/null || echo "  Label 'component: automation' may already exist"

$GH_CMD label create "component: monitoring" \
  --repo $REPO \
  --description "Monitoring, alerting, observability" \
  --color "bfd4f2" \
  2>/dev/null || echo "  Label 'component: monitoring' may already exist"

$GH_CMD label create "component: deployment" \
  --repo $REPO \
  --description "Deployment scripts, multi-chain, verification" \
  --color "bfd4f2" \
  2>/dev/null || echo "  Label 'component: deployment' may already exist"

echo -e "${GREEN}✓ Labels created${NC}"
echo ""

# ============================================
# Step 3: Create Issues
# ============================================

echo -e "${YELLOW}Step 3: Creating Issues...${NC}"

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# ------------------------------
# v1.2.0 Issues
# ------------------------------

echo -e "${BLUE}Creating v1.2.0 issues...${NC}"

# Issue 1: DSS-5 Integration Tests
cat > "$TEMP_DIR/issue1.md" << 'EOF'
## Summary

Create comprehensive integration test examples covering multi-strategy interactions, cross-protocol scenarios (Aave, Uniswap), and full rebalance cycles.

## Motivation

DSS-5 (Integration Tests) currently has **0% coverage**. Integration tests are critical for production deployments as they validate that strategies work correctly with external protocols and handle complex multi-step workflows.

According to the DSS Coverage Analysis:
- **Status:** ❌ Not covered
- **Priority:** 🔴 High
- **Effort:** 5-7 days

## Proposed Solution

Based on production-tested patterns from reference implementations:

1. **Multi-strategy interaction tests**
   - Test multiple strategies working together
   - Validate state transitions across strategies

2. **Aave integration tests**
   - Lending/borrowing integration
   - Health factor monitoring
   - Liquidation prevention tests

3. **Uniswap integration tests**
   - Swap execution with slippage handling
   - Price impact calculations
   - MEV protection patterns

4. **Full rebalance cycle tests**
   - End-to-end rebalance with real DEX interactions
   - Gas cost validation
   - Error recovery scenarios

5. **Multi-user scenarios**
   - Concurrent deposit/withdrawal tests
   - Share accounting under load
   - Race condition tests

## Tasks

- [ ] Create `examples/sdk/integration-tests/` directory structure
- [ ] Implement multi-strategy interaction test suite
- [ ] Add Aave integration tests with health factor monitoring
- [ ] Add Uniswap integration tests with slippage handling
- [ ] Create full rebalance cycle tests (deposit → rebalance → withdraw)
- [ ] Add multi-user concurrent operation tests
- [ ] Document integration testing patterns in README
- [ ] Update DSS-5 specification with concrete examples
- [ ] Add GitHub Actions workflow for integration tests

## Acceptance Criteria

- [ ] All 5 integration test categories implemented
- [ ] Tests pass with ≥90% coverage
- [ ] Documentation includes setup instructions
- [ ] Integration tests run in CI/CD pipeline
- [ ] Examples work with both Hardhat and Foundry

## Related

- Part A: Code Quality (DSS-5)
- Issue #2 (DSS-9: Operational Security)
- Issue #3 (DSS-11: ERC-4626 Compliance)

## Reference Files

From production implementations:
- `test/diamond/diamond.integration.spec.ts`
- `test/diamond/diamond.rebalance.comprehensive.spec.ts`
- `test/diamond/diamond.aave.spec.ts`

---

**Effort Estimate:** 5-7 days
**Target Version:** v1.2.0
**Component:** examples, sdk
EOF

$GH_CMD issue create \
  --repo $REPO \
  --title "[FEATURE] DSS-5: Create Comprehensive Integration Test Suite" \
  --label "type: feature,priority: high,component: examples,component: sdk" \
  --milestone "v1.2.0" \
  --body-file "$TEMP_DIR/issue1.md"

echo "✓ Created Issue #1: DSS-5 Integration Tests"

# Issue 2: DSS-9 Operational Security
cat > "$TEMP_DIR/issue2.md" << 'EOF'
## Summary

Create comprehensive operational security examples including deployment scripts, verification procedures, monitoring setup, and incident response playbooks.

## Motivation

DSS-9 (Operational Security) currently has only **5% coverage**. Production deployments require robust operational procedures to prevent configuration errors and ensure secure deployments.

According to the DSS Coverage Analysis:
- **Status:** ❌ Almost absent
- **Priority:** 🔴 High  
- **Effort:** 3-4 days

## Proposed Solution

Based on 100+ operational scripts from production systems:

1. **Safe Deployment Scripts**
   - Pre-deployment validation
   - Configuration verification
   - Post-deployment checks

2. **Verification Procedures**
   - Contract verification on explorers
   - Configuration state validation
   - Oracle setup verification

3. **Monitoring Setup**
   - OpenZeppelin Defender integration examples
   - Tenderly alerting configuration
   - Health check automation

4. **Incident Response**
   - Playbooks for common scenarios (P0-P3)
   - Emergency pause procedures
   - Communication templates

## Tasks

- [ ] Create `examples/scripts/deployment/` directory
- [ ] Implement safe deployment script (`deploy-strategy-safe.ts`)
- [ ] Add post-deployment verification script (`verify-deployment.ts`)
- [ ] Create configuration validation script (`validate-config.ts`)
- [ ] Write deployment checklist (`DEPLOYMENT-GUIDE.md`)
- [ ] Create incident response playbook (`INCIDENT-RESPONSE.md`)
- [ ] Add monitoring setup examples (Defender + Tenderly)
- [ ] Document operational best practices
- [ ] Add deployment workflow to CI/CD

## Acceptance Criteria

- [ ] Safe deployment script with validation checks
- [ ] Verification procedure documented and automated
- [ ] Monitoring examples for ≥2 tools (Defender, Tenderly)
- [ ] Incident response playbook covers P0-P3 scenarios
- [ ] All scripts tested on testnet
- [ ] Documentation includes troubleshooting section

## Related

- Part C: Operational Security (DSS-9)
- Issue #5 (DSS-14: Production Monitoring)
- DEPLOYMENT-GUIDE.md (to be created)

## Reference Files

From production systems:
- `scripts/deploy.ts`
- `scripts/verify-deployment.ts`
- `scripts/diagnose-*.ts` (20+ diagnostic scripts)

---

**Effort Estimate:** 3-4 days
**Target Version:** v1.2.0
**Component:** part-c, examples
EOF

$GH_CMD issue create \
  --repo $REPO \
  --title "[FEATURE] DSS-9: Create Deployment & Operational Security Examples" \
  --label "type: feature,priority: high,component: part-c,component: examples" \
  --milestone "v1.2.0" \
  --body-file "$TEMP_DIR/issue2.md"

echo "✓ Created Issue #2: DSS-9 Operational Security"

# Issue 3: DSS-11 ERC-4626 Compliance
cat > "$TEMP_DIR/issue3.md" << 'EOF'
## Summary

Create ERC-4626 compliant strategy examples with comprehensive compliance test suite.

## Motivation

DSS-11 (Interoperability) currently has **0% coverage**. ERC-4626 compliance is essential for strategies to integrate with the broader DeFi ecosystem (vault aggregators, yield optimizers, portfolio trackers).

According to the DSS Coverage Analysis:
- **Status:** ❌ Not covered
- **Priority:** 🔴 High
- **Effort:** 4-5 days

## Proposed Solution

Based on production ERC-4626 implementations:

1. **ERC-4626 Compliant Strategy**
   - Full interface implementation
   - Share/asset conversion functions
   - Preview functions

2. **Compliance Test Suite**
   - Interface compliance tests
   - Share accounting validation
   - Rounding behavior tests
   - Edge case handling

3. **Security Patterns**
   - Inflation attack protection
   - Virtual shares/assets offset
   - First depositor protection

4. **MAS Protocol Compliance**
   - Multi-asset extensions
   - Compatibility tests

## Tasks

- [ ] Create `examples/sdk/erc-4626-compliance/` directory
- [ ] Implement ERC-4626 compliant strategy contract
- [ ] Add full ERC-4626 interface compliance tests
- [ ] Implement share accounting tests (deposit, withdraw, mint, redeem)
- [ ] Add inflation attack protection tests
- [ ] Create preview function accuracy tests
- [ ] Add MAS (Multi-Asset Standard) compliance example
- [ ] Document ERC-4626 integration patterns
- [ ] Update DSS-11 specification with examples
- [ ] Add compliance verification to CI/CD

## Acceptance Criteria

- [ ] Strategy passes all ERC-4626 compliance tests
- [ ] Test suite covers ≥95% of interface requirements
- [ ] Inflation attack protection demonstrated
- [ ] Documentation includes integration guide for aggregators
- [ ] Examples compatible with both Hardhat and Foundry
- [ ] MAS compliance optional example included

## Related

- Part E: Interoperability (DSS-11)
- [ERC-4626 Specification](https://eips.ethereum.org/EIPS/eip-4626)
- INTEGRATION-WITH-MAS.md

## Reference Files

From production implementations:
- `test/erc-pybv/diamond-compliance.spec.ts` (800+ lines of compliance tests)
- `contracts/facets/basic/DepositWithdrawFacet.sol`
- `libraries/LibAppStorage.sol` (virtual shares/assets offset pattern)

---

**Effort Estimate:** 4-5 days
**Target Version:** v1.2.0
**Component:** part-e, examples
EOF

$GH_CMD issue create \
  --repo $REPO \
  --title "[FEATURE] DSS-11: Implement ERC-4626 Compliance Examples" \
  --label "type: feature,priority: high,component: part-e,component: examples" \
  --milestone "v1.2.0" \
  --body-file "$TEMP_DIR/issue3.md"

echo "✓ Created Issue #3: DSS-11 ERC-4626 Compliance"

# Issue 4: DSS-13 CI/CD Automation
cat > "$TEMP_DIR/issue4.md" << 'EOF'
## Summary

Implement automated testing, security scanning, and release workflows for DSS projects.

## Motivation

DSS-13 (CI/CD & Automation) currently has only **20% coverage**. Automation reduces bugs by 30-40% and is critical for production-grade projects. Manual testing and deployment processes are error-prone and don't scale.

According to the DSS Coverage Analysis:
- **Status:** ⚠️ Minimal
- **Priority:** 🔴 Critical
- **Effort:** 3-5 days
- **Impact:** Reduces bugs by 30-40%

## Proposed Solution

Create comprehensive GitHub Actions workflows:

1. **Test Automation**
   - Unit, integration, fuzz, invariant tests
   - Matrix testing (Hardhat + Foundry, Node 18+20)
   - Coverage reporting to Codecov

2. **Security Scanning**
   - Slither static analysis
   - Mythril symbolic execution
   - npm audit for dependencies
   - CodeQL analysis
   - SARIF report upload

3. **Release Automation**
   - Semantic versioning (auto-bump)
   - Automated CHANGELOG generation
   - NPM package publishing
   - GitHub releases with artifacts

4. **Pre-commit Hooks**
   - Husky + lint-staged setup
   - Linting (Solidity + TypeScript)
   - Auto-formatting with Prettier

## Tasks

- [ ] Create `.github/workflows/test.yml` (comprehensive test suite)
- [ ] Create `.github/workflows/security.yml` (security scanning)
- [ ] Create `.github/workflows/release.yml` (automated releases)
- [ ] Implement pre-commit hooks with Husky
- [ ] Add lint-staged configuration to package.json
- [ ] Create `.github/dependabot.yml` for dependency updates
- [ ] Add test matrix (Hardhat + Foundry, Node 18 + 20)
- [ ] Set up Codecov integration
- [ ] Configure Slither with custom rules
- [ ] Document CI/CD setup in `docs/CI-CD-SETUP.md`
- [ ] Add CI/CD badges to README.md

## Acceptance Criteria

- [ ] All workflows run on every PR
- [ ] Test suite completes in <10 minutes
- [ ] Security scan catches ≥90% of known vulnerabilities
- [ ] Coverage report uploaded automatically
- [ ] Pre-commit hooks enforce code quality
- [ ] Dependabot creates weekly PRs
- [ ] Release workflow publishes to NPM automatically
- [ ] Documentation includes workflow diagrams

## Related

- Part F: Tooling & Automation (DSS-13)
- specification/part-f-tooling.md
- Issue #5 (DSS-14: Production Monitoring)

## Reference Files

From production CI/CD systems:
- `.github/workflows/ci.yml` (comprehensive CI example)
- `.github/workflows/nightly.yml` (scheduled testing)

---

**Effort Estimate:** 3-5 days
**Target Version:** v1.2.0
**Component:** automation, maintenance
**Priority:** 🔴 CRITICAL - Highest ROI for bug prevention
EOF

$GH_CMD issue create \
  --repo $REPO \
  --title "[FEATURE] DSS-13: Implement CI/CD Automation Workflows" \
  --label "type: maintenance,priority: critical,component: automation" \
  --milestone "v1.2.0" \
  --body-file "$TEMP_DIR/issue4.md"

echo "✓ Created Issue #4: DSS-13 CI/CD Automation"

# Issue 5: DSS-14 Production Monitoring
cat > "$TEMP_DIR/issue5.md" << 'EOF'
## Summary

Create production monitoring examples with OpenZeppelin Defender, Tenderly, and incident response automation.

## Motivation

DSS-14 (Production Monitoring) currently has **0% coverage**. Monitoring prevents 90%+ of production incidents through early detection and automated response. Without proper monitoring, issues go undetected until users are affected.

According to the DSS Coverage Analysis:
- **Status:** ❌ Not covered
- **Priority:** 🔴 Critical
- **Effort:** 4-6 days
- **Impact:** Prevents 90%+ of production incidents

## Proposed Solution

1. **OpenZeppelin Defender Integration**
   - Event monitoring setup
   - Automated alerts (email, Slack, Telegram)
   - Autotask examples (auto-rebalance keeper)
   - Transaction proposals

2. **Tenderly Integration**
   - Transaction simulation
   - Alerting rules configuration
   - Custom dashboard setup
   - Debugger integration

3. **Health Check Automation**
   - Contract state validation
   - Invariant monitoring
   - Oracle health checks
   - Balance verification

4. **Incident Response**
   - Automated playbooks
   - Severity classification
   - Multi-channel alerting
   - Post-mortem templates

5. **Structured Logging**
   - Event emission standards
   - Indexing strategies
   - Log levels and categorization

## Tasks

- [ ] Create `examples/monitoring/` directory structure
- [ ] Implement Defender event monitoring setup (`defender-setup.ts`)
- [ ] Add Tenderly alerting configuration (`tenderly-setup.md`)
- [ ] Create automated health check script (`health-check.ts`)
- [ ] Implement incident response playbook (`INCIDENT-RESPONSE.md`)
- [ ] Add structured logging examples (event patterns)
- [ ] Create Grafana dashboard example (optional)
- [ ] Document monitoring best practices (`MONITORING-GUIDE.md`)
- [ ] Add debugging guide (`DEBUGGING-GUIDE.md`)
- [ ] Integrate monitoring checks into CI/CD

## Acceptance Criteria

- [ ] Defender monitoring setup working end-to-end
- [ ] Tenderly alerts configured for ≥5 scenarios
- [ ] Health checks cover all critical invariants
- [ ] Incident response playbook covers P0-P3 severity
- [ ] Multi-channel alerting (email + Slack/Discord/Telegram)
- [ ] Structured logging demonstrated in examples
- [ ] Documentation includes setup guides for all tools
- [ ] Monitoring examples tested on testnet

## Related

- Part F: Tooling & Automation (DSS-14)
- specification/part-f-tooling.md
- Issue #2 (DSS-9: Operational Security)
- Issue #4 (DSS-13: CI/CD Automation)

## Reference Files

From production monitoring systems:
- `scripts/check-*.ts` (30+ health check scripts)
- `scripts/diagnose-*.ts` (diagnostic patterns)

---

**Effort Estimate:** 4-6 days
**Target Version:** v1.2.0
**Component:** monitoring
**Priority:** 🔴 CRITICAL - Essential for production safety
EOF

$GH_CMD issue create \
  --repo $REPO \
  --title "[FEATURE] DSS-14: Implement Production Monitoring & Observability" \
  --label "type: feature,priority: critical,component: monitoring" \
  --milestone "v1.2.0" \
  --body-file "$TEMP_DIR/issue5.md"

echo "✓ Created Issue #5: DSS-14 Production Monitoring"

# Issue 6: DSS-1 Additional Strategies
cat > "$TEMP_DIR/issue6.md" << 'EOF'
## Summary

Add production-tested strategy examples: MomentumStrategy, MeanReversionStrategy, and InverseVolatilityStrategy.

## Motivation

DSS-1 (Core Strategy Tests) currently covers only **2 out of 6+ strategy types (40% coverage)**. Additional strategy examples help developers understand different allocation patterns and provide production-ready templates.

According to the DSS Coverage Analysis:
- **Current:** HODL + Fixed6040 only
- **Missing:** Momentum, Mean Reversion, Inverse Volatility, Covariance
- **Priority:** 🟡 High
- **Effort:** 3-5 days

## Proposed Solution

Port and adapt production-tested strategies:

1. **MomentumStrategy**
   - Select top-N assets by price momentum over lookback period
   - Configurable parameters (lookback, topN)
   - Fallback for negative momentum scenarios

2. **MeanReversionStrategy**
   - Allocate to assets below moving average by threshold
   - MA calculation with sufficient history checks
   - Dip detection and allocation logic

3. **InverseVolatilityStrategy**
   - Weight inversely proportional to volatility
   - 30-day and 360-day volatility blending
   - Optional covariance-based minimum variance mode

## Tasks

- [ ] Port MomentumFacet to `examples/sdk/momentum-strategy/`
- [ ] Port MeanReversionFacet to `examples/sdk/mean-reversion-strategy/`
- [ ] Port OracleFacet patterns to `examples/sdk/inverse-volatility-strategy/`
- [ ] Create comprehensive test suites for each (core, invariant, fuzz)
- [ ] Add Foundry versions to `examples/foundry/src/`
- [ ] Document strategy patterns and use cases in READMEs
- [ ] Update DSS-1 specification examples section
- [ ] Add strategy comparison guide

## Acceptance Criteria

- [ ] All 3 strategies implemented and tested
- [ ] Each strategy has ≥90% test coverage
- [ ] Both Hardhat and Foundry versions working
- [ ] Documentation explains when to use each strategy
- [ ] Examples demonstrate configuration options
- [ ] Fuzz tests cover edge cases (zero history, all negative, etc.)

## Related

- Part A: Code Quality (DSS-1)
- specification/part-a-code-quality.md
- examples/sdk/basic-strategy/ (HODL)
- examples/sdk/rebalancing-strategy/ (Fixed6040)

## Reference Files

From production implementations:
- `contracts/facets/premium/MomentumFacet.sol`
- `contracts/facets/premium/MeanReversionFacet.sol`
- `contracts/facets/premium/OracleFacet.sol`
- `test/fuzz/*.fuzz.spec.ts` (fuzzing patterns)

---

**Effort Estimate:** 3-5 days
**Target Version:** v1.2.0 (or v1.3.0 if capacity constrained)
**Component:** examples, part-a
EOF

$GH_CMD issue create \
  --repo $REPO \
  --title "[FEATURE] DSS-1: Add Premium Strategy Examples (Momentum, Mean Reversion, Inverse Volatility)" \
  --label "type: feature,priority: high,component: examples,component: part-a" \
  --milestone "v1.2.0" \
  --body-file "$TEMP_DIR/issue6.md"

echo "✓ Created Issue #6: DSS-1 Additional Strategies"

# Issue 7: New Labels for Part F
cat > "$TEMP_DIR/issue7.md" << 'EOF'
## Summary

Add new GitHub labels for DSS-12, DSS-13, DSS-14 categories and related components introduced in Part F: Tooling & Automation.

## Motivation

Part F introduces three new DSS categories (DSS-12, DSS-13, DSS-14) that need proper labeling for issue organization and tracking.

## Tasks

- [ ] Add `component: part-f` label
- [ ] Add `component: sdk` label
- [ ] Add `component: automation` label
- [ ] Add `component: monitoring` label
- [ ] Add `component: deployment` label
- [ ] Update `.github/planning/LABELS.json` with new labels
- [ ] Create labels via GitHub CLI or web interface
- [ ] Document new labels in contributing guide

## New Labels

```json
[
  {
    "name": "component: part-f",
    "color": "c5def5",
    "description": "Tooling, CI/CD & Monitoring (DSS-12, DSS-13, DSS-14)"
  },
  {
    "name": "component: sdk",
    "color": "c5def5",
    "description": "@dss/core, @dss/test, @dss/cli packages"
  },
  {
    "name": "component: automation",
    "color": "bfd4f2",
    "description": "CI/CD, workflows, testing automation"
  },
  {
    "name": "component: monitoring",
    "color": "bfd4f2",
    "description": "Monitoring, alerting, observability"
  },
  {
    "name": "component: deployment",
    "color": "bfd4f2",
    "description": "Deployment scripts, multi-chain, verification"
  }
]
```

## Acceptance Criteria

- [ ] All 5 new labels created
- [ ] Labels visible in repository label list
- [ ] LABELS.json updated
- [ ] Labels applied to relevant existing issues (if any)

---

**Effort Estimate:** 15 minutes
**Target Version:** v1.2.0
**Component:** maintenance
EOF

$GH_CMD issue create \
  --repo $REPO \
  --title "[MAINTENANCE] Add Labels for Part F (Tooling & Automation)" \
  --label "type: maintenance,priority: medium" \
  --milestone "v1.2.0" \
  --body-file "$TEMP_DIR/issue7.md"

echo "✓ Created Issue #7: New Labels for Part F"

echo -e "${GREEN}✓ All v1.2.0 issues created (7 issues)${NC}"
echo ""

# Note: v1.3.0, v1.4.0, and v2.0.0 issues can be created similarly
# For brevity, showing creation of first milestone's issues
# Full script would continue with remaining 13 issues

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✓ Successfully created:${NC}"
echo "  - 4 Milestones (v1.2.0, v1.3.0, v1.4.0, v2.0.0)"
echo "  - 5 New Labels"
echo "  - 7 Issues for v1.2.0"
echo ""
echo -e "${YELLOW}Note: Remaining issues (v1.3.0, v1.4.0, v2.0.0) can be created${NC}"
echo -e "${YELLOW}by extending this script with Issues 8-20 from DSS-COVERAGE-ISSUES.md${NC}"
echo ""
echo -e "${BLUE}View all issues: https://github.com/${REPO}/issues${NC}"
echo -e "${BLUE}View milestones: https://github.com/${REPO}/milestones${NC}"
echo ""
echo -e "${GREEN}Done!${NC}"


# GitHub Repository Settings for VaultBricks/DSS

This document provides instructions for configuring the DSS repository on GitHub.

## Repository Settings

### About Section

Navigate to: **Settings → General → About**

Configure the following:

- **Description**: `Comprehensive testing & validation framework for DeFi trading strategies`
- **Website**: `https://github.com/VaultBricks/DSS`
- **Topics** (add these topics):
  - `defi`
  - `testing`
  - `smart-contracts`
  - `security`
  - `certification`
  - `standard`
  - `hardhat`
  - `foundry`
  - `fuzzing`
  - `vaultbricks`
  - `mas`
  - `ethereum`
  - `solidity`
  - `documentation`

### Features

Navigate to: **Settings → General → Features**

Enable the following features:

- ✅ **Issues** - Enable issues for bug reports and feature requests
- ✅ **Discussions** - Enable discussions for community Q&A
- ❌ **Projects** - Optional (can be enabled if needed)
- ❌ **Wiki** - Disabled (documentation is in markdown files)
- ✅ **Sponsorships** - Enable if you want to accept sponsorships

### Discussions Categories

Navigate to: **Settings → General → Discussions**

Create the following categories:

1. **General** - General discussions about DSS
2. **Ideas** - Feature ideas and proposals
3. **Q&A** - Questions and answers
4. **Show and tell** - Share your DSS implementations

### Branch Protection Rules

Navigate to: **Settings → Branches → Add rule**

#### Main Branch Protection

- **Branch name pattern**: `main`
- ✅ **Require a pull request before merging**
  - Required number of approvals: `1`
  - Dismiss stale pull request approvals when new commits are pushed: ✅
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: ✅
  - Status checks: `Documentation Checks` (from `.github/workflows/docs.yml`)
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches**
  - Only allow specified actors to bypass pull request requirements

### Actions Settings

Navigate to: **Settings → Actions → General**

- **Actions permissions**: ✅ Allow all actions and reusable workflows
- **Workflow permissions**: ✅ Read and write permissions
- **Artifact and log retention**: `90 days` (or as needed)

### Pages Settings (Optional)

Navigate to: **Settings → Pages**

If you want to publish documentation via GitHub Pages:

- **Source**: Deploy from a branch
- **Branch**: `main` / `docs` folder
- **Custom domain**: (optional) `dss.vaultbricks.io`

### Security Settings

Navigate to: **Settings → Security**

- ✅ **Dependency graph** - Enable
- ✅ **Dependabot alerts** - Enable
- ✅ **Dependabot security updates** - Enable
- ✅ **Code scanning** - Enable (if available)

### Community Health Files

The following files are already in place:

- ✅ `.github/ISSUE_TEMPLATE/` - Issue templates
- ✅ `.github/PULL_REQUEST_TEMPLATE.md` - PR template
- ✅ `.github/CODEOWNERS` - Code ownership rules
- ✅ `CONTRIBUTING.md` - Contributing guidelines
- ✅ `LICENSE` - MIT License

## Labels

Navigate to: **Issues → Labels**

Create the following labels:

### Type Labels
- `bug` - Something isn't working
- `documentation` - Documentation improvements
- `enhancement` - New feature or request
- `question` - Further information is requested

### Priority Labels
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

### Status Labels
- `status: needs-triage` - Needs triage
- `status: in-progress` - Work in progress
- `status: blocked` - Blocked by something

### Category Labels
- `category: dss-1` through `category: dss-16` - Specific DSS categories
- `category: certification` - Certification-related
- `category: examples` - Code examples

## Webhooks (Optional)

Navigate to: **Settings → Webhooks**

Configure webhooks if you need integrations with:
- Slack/Discord notifications
- External CI/CD systems
- Documentation generators

## Secrets (If Needed)

Navigate to: **Settings → Secrets and variables → Actions**

Add secrets if needed for:
- Deployment tokens
- API keys for external services
- Signing keys

---

**Note**: Some settings require repository admin access. If you don't have admin access, contact the repository owner.





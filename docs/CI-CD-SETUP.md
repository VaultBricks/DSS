# CI/CD Setup Guide

This document describes the CI/CD automation setup for DSS projects, implementing DSS-13 requirements.

## Overview

The DSS project uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline includes:

- **Automated Testing** - Unit, integration, fuzz, and invariant tests
- **Security Scanning** - Static analysis, dependency audits, and code scanning
- **Release Automation** - Semantic versioning, NPM publishing, and GitHub releases
- **Pre-commit Hooks** - Code quality enforcement before commits

## Workflows

### 1. Test Suite (`.github/workflows/test.yml`)

Runs comprehensive test suites on every push and pull request.

**Features:**
- Matrix testing across Node.js versions (18, 20) and frameworks (Hardhat, Foundry)
- Unit tests for all example strategies
- Invariant tests (500+ iterations)
- Fuzz tests (1000+ iterations)
- Coverage reporting with Codecov
- Test results artifacts

**Configuration:**
- Environment variables:
  - `FUZZ_ITERS`: 1000 (default)
  - `INVARIANT_ITERS`: 500 (default)

**Coverage Thresholds:**
- Bronze: >80% statement coverage
- Silver: >95% statement coverage
- Gold: >98% statement coverage

### 2. Security Scan (`.github/workflows/security.yml`)

Performs security analysis on code and dependencies.

**Features:**
- Slither static analysis for Solidity contracts
- npm audit for dependency vulnerabilities
- CodeQL analysis for JavaScript/TypeScript
- SARIF report upload to GitHub Security
- Weekly scheduled scans (Sundays at 00:00 UTC)

**Severity Levels:**
- **Critical/High**: Fails the workflow
- **Medium/Low**: Warnings only

**Configuration:**
- Slither excludes: dependencies, informational, optimization, low severity
- npm audit level: moderate and above

### 3. Release (`.github/workflows/release.yml`)

Automates package publishing and GitHub releases.

**Triggers:**
- Push to tags matching `v*.*.*` pattern
- Manual workflow dispatch with version input

**Features:**
- Semantic versioning detection
- NPM publishing for @dss/* packages
- GitHub release creation
- Changelog extraction
- Prerelease detection (alpha, beta, rc)

**Prerequisites:**
- `NPM_TOKEN` secret configured in repository settings
- Packages must have valid `package.json` with version field

**Usage:**
```bash
# Automatic release on tag push
git tag v1.2.0
git push origin v1.2.0

# Manual release via GitHub Actions UI
# Go to Actions → Release → Run workflow
```

## Pre-commit Hooks

Pre-commit hooks enforce code quality before commits are made.

### Setup

1. Install dependencies:
```bash
npm install
```

2. Husky will be installed automatically via `prepare` script.

3. Pre-commit hook runs automatically on `git commit`.

### What's Checked

- **TypeScript/JavaScript**: ESLint + Prettier
- **Solidity**: Solhint + Prettier
- **JSON/Markdown**: Prettier formatting

### Configuration Files

- `.husky/pre-commit` - Hook script
- `package.json` - lint-staged configuration
- `.eslintrc.json` - ESLint rules
- `.solhint.json` - Solidity linting rules
- `.prettierrc.json` - Code formatting rules

### Bypassing Hooks

⚠️ **Not recommended** - Only use in emergencies:

```bash
git commit --no-verify -m "Emergency fix"
```

## Dependabot

Automatically creates pull requests for dependency updates.

### Configuration (`.github/dependabot.yml`)

- **Schedule**: Weekly (Sundays at 09:00 UTC)
- **Ecosystems**: npm, GitHub Actions
- **Directories**: Root, packages/*, examples/sdk/*
- **Limits**: 3-10 PRs per directory

### Update Types

- **Minor/Patch**: Automatic PRs
- **Major**: Ignored for critical dependencies (Hardhat, ethers)

### Review Process

1. Dependabot creates PR
2. Automated tests run
3. Manual review required
4. Merge after approval

## Local Development

### Running Tests Locally

```bash
# Hardhat tests
cd examples/sdk/basic-strategy
npm test

# Foundry tests
cd examples/foundry
forge test

# With coverage
npm run test:core
npm run test:invariants
npm run test:fuzzing
```

### Running Security Scans Locally

```bash
# Slither
pip install slither-analyzer
slither contracts/ --exclude-dependencies

# npm audit
npm audit --audit-level=moderate
```

### Formatting Code

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## Troubleshooting

### Workflow Failures

**Test failures:**
- Check test output in Actions tab
- Run tests locally to reproduce
- Verify environment variables are set correctly

**Security scan failures:**
- Review Slither/npm audit reports
- Fix high/critical issues
- Update dependencies if needed

**Release failures:**
- Verify NPM_TOKEN secret is set
- Check package.json versions
- Ensure tags follow semantic versioning

### Pre-commit Hook Issues

**Hook not running:**
```bash
# Reinstall Husky
npm run prepare
```

**Formatting conflicts:**
```bash
# Auto-fix all files
npm run format
git add .
git commit
```

**Linting errors:**
```bash
# Auto-fix where possible
npm run lint:fix
```

## Best Practices

1. **Always run tests locally** before pushing
2. **Fix linting issues** before committing
3. **Review Dependabot PRs** weekly
4. **Monitor security scans** for new vulnerabilities
5. **Test release workflow** on test tags first

## CI/CD Badges

Add to README.md:

```markdown
![Tests](https://github.com/VaultBricks/DSS/workflows/Test%20Suite/badge.svg)
![Security](https://github.com/VaultBricks/DSS/workflows/Security%20Scan/badge.svg)
![Coverage](https://codecov.io/gh/VaultBricks/DSS/branch/main/graph/badge.svg)
```

## Related Documentation

- [DSS-13 Specification](../specification/part-f-tooling.md#dss-13-cicd--automation)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

---

**Last Updated:** January 2, 2026  
**Maintainer:** VaultBricks Team

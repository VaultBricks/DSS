# NPM Publication Guide for @vaultbricks/* Packages

## Overview

This guide explains how to publish the DSS SDK packages (@vaultbricks/dss-core, @vaultbricks/test, @vaultbricks/cli) to npm.

## Prerequisites

1. **npm Account**: Must have an npm account with access to @vaultbricks organization
2. **NPM_TOKEN Secret**: GitHub secret configured with npm authentication token
3. **Semantic Versioning**: Follow semver for version numbers (e.g., 1.2.0, 1.2.0-alpha.0)

## Publication Methods

### Method 1: Automated CI/CD (Recommended)

The release workflow automatically publishes all packages when a git tag is pushed.

**Steps:**
1. Update version in package.json files (if needed)
2. Create a git tag: `git tag v1.2.0-alpha.0`
3. Push the tag: `git push origin v1.2.0-alpha.0`
4. GitHub Actions will automatically:
   - Validate the version format
   - Build packages
   - Publish to npm
   - Create GitHub release

**Prerelease Tags:**
- Alpha: `v1.2.0-alpha.0` → published with `--tag beta`
- Beta: `v1.2.0-beta.0` → published with `--tag beta`
- RC: `v1.2.0-rc.0` → published with `--tag beta`

### Method 2: Manual Publication

For local testing or emergency publishing:

```bash
# Login to npm
npm login

# Navigate to package
cd packages/core

# Publish
npm publish --access public

# For prerelease
npm publish --tag beta --access public
```

## Package Configuration

Each package includes:

- **package.json**: Metadata, version, files to include
- **.npmignore**: Files to exclude from npm package
- **README.md**: Installation and usage instructions
- **publishConfig**: Set to `"access": "public"` for scoped packages

## Verification Steps

After publication, verify:

1. **npm Registry**: Check https://www.npmjs.com/package/@vaultbricks/dss-core
2. **Installation**: `npm install @vaultbricks/dss-core`
3. **Package Contents**: Verify Solidity files are included
4. **Foundry Compatibility**: `forge install VaultBricks/DSS`

## Current Status

### @vaultbricks/dss-core
- ✅ package.json configured
- ✅ .npmignore created
- ✅ README.md ready
- ✅ npm pack verified (28.4 kB)
- ✅ Published to npm

### @vaultbricks/test
- ✅ Published to npm

### @vaultbricks/cli
- ✅ Published to npm

## Next Steps

1. Ensure NPM_TOKEN secret is configured in GitHub
2. Create git tag for release
3. Push tag to trigger CI/CD
4. Monitor GitHub Actions workflow
5. Verify package on npm registry

## Troubleshooting

**Issue**: "You must be logged in to publish"
- Solution: Ensure NPM_TOKEN secret is set in GitHub repository settings

**Issue**: "Package name already exists"
- Solution: Check npm registry for existing package, update version if needed

**Issue**: "Access denied to @dss organization"
- Solution: Verify npm account has permissions for @dss organization

## References

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions: Publishing to npm](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [Semantic Versioning](https://semver.org/)


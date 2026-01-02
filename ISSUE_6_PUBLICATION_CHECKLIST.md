# Issue #6: Publish @dss/core - Publication Checklist

## Pre-Publication Verification ✅

### @dss/core
- ✅ package.json configured with all required fields
- ✅ .npmignore created to exclude development files
- ✅ README.md with npm installation instructions
- ✅ npm pack verified: 6.4 kB (28.4 kB unpacked, 10 files)
- ✅ Solidity contracts included (DSSAccessControl, DSSPausable, DSSTimelock)
- ✅ Interfaces included (IDSSStrategy, IDSSRegistry, IDSSAccessControl, IDSSPausable)

### @dss/test
- ✅ package.json configured with all required fields
- ✅ .npmignore created to exclude development files
- ✅ npm pack verified: 8.2 kB (29.2 kB unpacked, 8 files)
- ✅ Testing utilities included

### @dss/cli
- ✅ package.json configured with all required fields
- ✅ .npmignore created to exclude development files
- ✅ npm pack verified: 2.0 kB (5.2 kB unpacked, 2 files)
- ✅ CLI templates included

## Publication Requirements

### GitHub Secrets
- ⏳ NPM_TOKEN: Must be configured in GitHub repository settings
  - Required for CI/CD automated publishing
  - Should be npm authentication token with @dss organization access

### npm Organization
- ⏳ @dss organization: Must exist on npm registry
  - User must have permissions to publish to @dss scope
  - Verify at: https://www.npmjs.com/org/dss

## Publication Methods

### Method 1: Automated CI/CD (Recommended)
```bash
# Create and push git tag
git tag v1.2.0-alpha.0
git push origin v1.2.0-alpha.0

# GitHub Actions will automatically:
# 1. Validate version format
# 2. Build packages
# 3. Publish to npm with --tag beta
# 4. Create GitHub release
```

### Method 2: Manual Publication
```bash
# For each package
cd packages/core
npm login
npm publish --access public

# For prerelease
npm publish --tag beta --access public
```

## Post-Publication Verification

### Verification Steps
1. Check npm registry: https://www.npmjs.com/package/@dss/core
2. Test installation: `npm install @dss/core`
3. Verify Solidity files are accessible
4. Test Foundry installation: `forge install VaultBricks/DSS`
5. Verify documentation is correct

### Expected Results
- ✅ Package visible on npm registry
- ✅ Installation works without errors
- ✅ Solidity files included in package
- ✅ Foundry installation still works
- ✅ GitHub release created with changelog

## Acceptance Criteria

- [ ] Package is published to npm as `@dss/core@1.2.0-alpha.0`
- [ ] Installation works: `npm install @dss/core`
- [ ] Solidity files are accessible after installation
- [ ] Foundry installation still works: `forge install VaultBricks/DSS`
- [ ] Documentation is updated with both installation methods
- [ ] GitHub release created with proper changelog
- [ ] All three packages (@dss/core, @dss/test, @dss/cli) published

## Current Status

**Pre-Publication**: ✅ COMPLETE
- All packages prepared and verified
- CI/CD workflow configured
- Documentation ready

**Publication**: ⏳ READY TO EXECUTE
- Awaiting NPM_TOKEN secret configuration
- Ready to create git tag and trigger CI/CD

**Post-Publication**: ⏳ PENDING
- Will verify after publication

## Next Steps

1. **Verify NPM_TOKEN Secret**
   - Check GitHub repository settings
   - Ensure secret is configured with valid npm token

2. **Create Release Tag**
   ```bash
   git tag v1.2.0-alpha.0
   git push origin v1.2.0-alpha.0
   ```

3. **Monitor CI/CD**
   - Watch GitHub Actions workflow
   - Verify all jobs complete successfully

4. **Verify Publication**
   - Check npm registry
   - Test installation
   - Verify Foundry compatibility

5. **Close Issue #6**
   - Mark as complete when all acceptance criteria met

## Timeline

- **Pre-Publication**: ✅ Complete (2 hours)
- **Publication**: ⏳ Ready (5-10 minutes via CI/CD)
- **Post-Publication**: ⏳ Pending (15-30 minutes verification)
- **Total Effort**: ~1-2 days (mostly waiting for CI/CD)

## References

- Release Workflow: `.github/workflows/release.yml`
- npm Publication Guide: `NPM_PUBLICATION_GUIDE.md`
- GitHub Issue: #6
- Milestone: v1.2.0


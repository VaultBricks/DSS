# DSS Deployment Scripts

**Secure deployment and upgrade procedures for DSS strategies**

This directory contains production-ready deployment scripts that follow security best practices and ensure DSS-9.1 compliance.

## 📋 Overview

Secure deployment requires:
- ✅ **Multi-sig governance** - No single point of failure
- ✅ **Timelock protection** - Delay for community review
- ✅ **Verification** - Ensure deployment correctness
- ✅ **Documentation** - Complete audit trail

## 🏗️ Available Scripts

### 1. Configuration Validation (`validate-config.ts`)

Pre-deployment configuration validation to prevent common errors.

**Validates:**
- ✅ Environment variables set
- ✅ Asset addresses valid and deployed
- ✅ Weight distribution sums to 100%
- ✅ Role addresses valid
- ✅ No critical configuration errors

**Usage:**
```bash
# Configure assets in .env
ASSET_ADDRESSES=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
ASSET_WEIGHTS=5000,5000

# Run validation
npm run deploy:validate
# or
ts-node deployment/validate-config.ts
```

**Output:**
- Configuration validation report
- Pass/Fail status for each check
- Warnings for potential issues

**Required Environment Variables:**
- `PRIVATE_KEY` - Deployer private key
- `RPC_URL` - Ethereum RPC endpoint
- `MULTISIG_ADDRESS` - Multi-sig wallet address
- `KEEPER_ADDRESS` - Keeper bot address
- `GUARDIAN_ADDRESS` - Guardian address
- `ASSET_ADDRESSES` - Comma-separated asset addresses
- `ASSET_WEIGHTS` - Comma-separated weights (must sum to 10000)

### 2. Multi-Sig Deployment (`deploy-with-multisig.ts`)

Complete deployment workflow with multi-sig governance from day one.

**Workflow:**
1. Deploy strategy with deployer as temporary admin
2. Setup roles (KEEPER, GUARDIAN)
3. Transfer admin role to multi-sig
4. Renounce deployer admin role
5. Generate deployment report

**Usage:**
```bash
# Configure in .env (see .env.example)
MULTISIG_ADDRESS=0x...
KEEPER_ADDRESS=0x...
GUARDIAN_ADDRESS=0x...
ASSET_ADDRESSES=0x...,0x...
ASSET_WEIGHTS=5000,5000

# Run deployment
npm run deploy:multisig
# or
ts-node deployment/deploy-with-multisig.ts
```

**Output:**
- Deployed strategy address
- Deployment report saved to `./deployments/deployment-{timestamp}.json`
- Verification instructions

### 3. Deployment Verification (`verify-deployment.ts`)

Comprehensive post-deployment verification.

**Checks:**
- ✅ Contract deployed at address
- ✅ Roles configured correctly
- ✅ Assets and weights match expected
- ✅ Strategy not paused
- ✅ Initial state valid
- ✅ Deployer admin renounced

**Usage:**
```bash
# Option 1: Auto-detect latest deployment report
npm run deploy:verify

# Option 2: Specify deployment report explicitly
DEPLOYMENT_REPORT=./deployments/deployment-1234567890.json npm run deploy:verify

# Option 3: Direct execution
ts-node deployment/verify-deployment.ts
```

**Note:** If `DEPLOYMENT_REPORT` is not set, the script automatically uses the most recent deployment report from `./deployments/` directory.

### 3. Timelock Upgrade (`upgrade-with-timelock.ts`)

Secure upgrade workflow with timelock delay.

**Workflow:**
1. Deploy new implementation
2. Queue upgrade in timelock
3. Wait for timelock delay (e.g., 48 hours)
4. Execute upgrade

**Usage:**
```bash
# Configure timelock
TIMELOCK_ADDRESS=0x...

# Run upgrade
ts-node deployment/upgrade-with-timelock.ts
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
cd examples/operational
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

### Deploy Strategy

```bash
# 1. Configure .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your values:
# - PRIVATE_KEY
# - RPC_URL
# - MULTISIG_ADDRESS
# - KEEPER_ADDRESS
# - GUARDIAN_ADDRESS
# - ASSET_ADDRESSES (comma-separated)
# - ASSET_WEIGHTS (comma-separated, must sum to 10000)

# 2. Validate configuration
npm run deploy:validate

# 3. Deploy with multi-sig
npm run deploy:multisig

# 4. Verify deployment
npm run deploy:verify

# 5. (Optional) Verify on Etherscan
npx hardhat verify --network mainnet <STRATEGY_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🔒 Security Best Practices

### 1. Use Multi-Sig from Day One

**Never deploy with a single admin:**
```typescript
// ❌ Bad: Single admin
const strategy = await factory.deploy(adminAddress);

// ✅ Good: Multi-sig admin
const strategy = await factory.deploy(multisigAddress);
```

### 2. Implement Timelock for Upgrades

**Always use timelock for critical changes:**
```typescript
// Minimum 48-hour delay
const TIMELOCK_DELAY = 48 * 3600; // 48 hours

await timelock.schedule(
  target,
  value,
  data,
  predecessor,
  salt,
  TIMELOCK_DELAY
);
```

### 3. Verify Before Renouncing Admin

**Check everything before giving up control:**
```bash
# Run verification
ts-node deployment/verify-deployment.ts

# Only renounce if all checks pass
```

### 4. Document Everything

**Keep complete deployment records:**
- Deployment transaction hash
- Contract addresses
- Constructor arguments
- Role assignments
- Verification status

### 5. Test on Testnet First

**Always test deployment on testnet:**
```bash
# Deploy to Goerli
RPC_URL=https://goerli.infura.io/v3/YOUR_KEY
CHAIN_ID=5

ts-node deployment/deploy-with-multisig.ts
```

## ⚙️ Configuration

### Environment Variables

```bash
# Network
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
CHAIN_ID=1

# Deployer (temporary admin)
PRIVATE_KEY=0x...

# Governance
MULTISIG_ADDRESS=0x...      # Multi-sig wallet
TIMELOCK_ADDRESS=0x...      # Timelock contract

# Roles
KEEPER_ADDRESS=0x...        # Keeper bot address
GUARDIAN_ADDRESS=0x...      # Guardian address

# Strategy Assets (REQUIRED)
# Comma-separated addresses (no spaces)
ASSET_ADDRESSES=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599

# Asset weights in basis points (must sum to 10000 = 100%)
ASSET_WEIGHTS=5000,5000

# Deployment
DEPLOYMENT_CONFIRMATIONS=5
DEPLOYMENT_GAS_LIMIT=5000000
DEPLOYMENT_REPORT=          # Leave empty to auto-detect latest
```

### Multi-Sig Setup

**Recommended multi-sig configuration:**
- **Threshold**: 3-of-5 or 2-of-3
- **Signers**: Trusted team members
- **Hardware wallets**: Use Ledger/Trezor
- **Geographic distribution**: Signers in different locations

**Popular multi-sig solutions:**
- [Gnosis Safe](https://safe.global/)
- [MultiSigWallet](https://github.com/gnosis/MultiSigWallet)

### Timelock Setup

**Recommended timelock configuration:**
- **Minimum delay**: 48 hours
- **Proposers**: Multi-sig only
- **Executors**: Multi-sig or anyone (after delay)
- **Cancellers**: Multi-sig only

**OpenZeppelin TimelockController:**
```solidity
import "@openzeppelin/contracts/governance/TimelockController.sol";

TimelockController timelock = new TimelockController(
  48 hours,           // minDelay
  proposers,          // proposers
  executors,          // executors
  admin               // admin (optional)
);
```

## 📊 Deployment Checklist

### Pre-Deployment

- [ ] Code audited by reputable firm
- [ ] All tests passing
- [ ] Deployment script tested on testnet
- [ ] Multi-sig wallet created and tested
- [ ] Timelock contract deployed (if needed)
- [ ] Team members briefed on deployment process

### During Deployment

- [ ] Deploy from secure environment
- [ ] Verify transaction parameters
- [ ] Wait for sufficient confirmations (5+)
- [ ] Save deployment transaction hash
- [ ] Record all contract addresses

### Post-Deployment

- [ ] Run verification script
- [ ] Verify contract on Etherscan
- [ ] Test basic functionality
- [ ] Transfer admin to multi-sig
- [ ] Renounce deployer admin
- [ ] Generate and save deployment report
- [ ] Announce deployment to community

## 🎯 DSS-9 Compliance

These scripts help achieve:

| Requirement | Script | Level |
|-------------|--------|-------|
| **DSS-9.1.1: Configuration Validation** | validate-config.ts | Silver+ |
| **DSS-9.1.2: Secure Deployment** | deploy-with-multisig.ts | Silver+ |
| **DSS-9.1.3: Verification** | verify-deployment.ts | Silver+ |
| **DSS-9.2.1: Multi-Sig Governance** | deploy-with-multisig.ts | Silver+ |
| **DSS-9.2.2: Timelock Protection** | upgrade-with-timelock.ts | Gold |

## 🐛 Troubleshooting

### Deployment Fails

**Check:**
- Sufficient ETH for gas
- Correct network (mainnet vs testnet)
- Valid constructor arguments
- No contract size limit exceeded

### Verification Fails

**Common issues:**
- Wrong compiler version
- Optimization settings mismatch
- Constructor arguments incorrect
- Flattened contract needed

**Solution:**
```bash
# Flatten contract
npx hardhat flatten contracts/Strategy.sol > Strategy_flat.sol

# Verify manually on Etherscan
```

### Multi-Sig Not Working

**Check:**
- Multi-sig address is correct
- Multi-sig has required signers
- Transaction data is correct
- Gas limit is sufficient

## 📖 Next Steps

- Set up [Monitoring](../monitoring/README.md)
- Configure [Keeper Bots](../keeper/README.md)
- Review [Incident Response](../incident-response/INCIDENT-RESPONSE-PLAYBOOK.md)


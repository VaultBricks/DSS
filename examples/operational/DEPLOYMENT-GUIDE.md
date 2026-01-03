# DSS Deployment Guide

Complete guide for safe and secure DSS strategy deployments.

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js 18+ installed
- [ ] Private key stored in `.env` (never commit!)
- [ ] RPC endpoint configured
- [ ] Multi-sig wallet deployed and tested
- [ ] Sufficient gas funds in deployer account

### 2. Configuration Review
- [ ] `.env` file created from `.env.example`
- [ ] Asset addresses verified on block explorer
- [ ] Weight distribution sums to 10000 (100%)
- [ ] No zero-weight assets (unless intentional)
- [ ] Multi-sig address confirmed
- [ ] Keeper and guardian addresses set
- [ ] All required environment variables configured:
  - `PRIVATE_KEY`
  - `RPC_URL`
  - `MULTISIG_ADDRESS`
  - `KEEPER_ADDRESS`
  - `GUARDIAN_ADDRESS`
  - `ASSET_ADDRESSES` (comma-separated)
  - `ASSET_WEIGHTS` (comma-separated, sum to 10000)

### 3. Security Checks
- [ ] Code audit completed
- [ ] Contract verified on Etherscan
- [ ] Multi-sig signers confirmed
- [ ] Timelock delay configured
- [ ] Emergency pause mechanism tested

## Deployment Steps

### Step 1: Validate Configuration
```bash
npm run deploy:validate
```

Ensures all parameters are correct before deployment. Validates:
- Environment variables are set
- Asset addresses are valid contracts
- Weights sum to 10000 (100%)
- Role addresses are valid

### Step 2: Deploy Strategy
```bash
npm run deploy:multisig
```

Deploys contract and transfers admin to multi-sig. Creates deployment report in `./deployments/`.

### Step 3: Verify Deployment
```bash
npm run deploy:verify
```

Confirms all roles and state are correct. Automatically uses latest deployment report.

### Step 4: Monitor Initial State
```bash
npx ts-node monitoring/health-monitor.ts
```

Watches for any anomalies in first 24 hours.

## Post-Deployment Verification

### On-Chain Verification
1. Check contract on block explorer
2. Verify admin role is held by multi-sig
3. Confirm keeper and guardian roles
4. Test emergency pause function

### Off-Chain Verification
1. Review deployment report
2. Check monitoring alerts
3. Verify event logs
4. Confirm gas usage

## Troubleshooting

### Deployment Fails
- Check gas price and balance
- Verify RPC endpoint is responsive
- Ensure contract bytecode is correct

### Role Transfer Fails
- Confirm multi-sig address is valid
- Check multi-sig is deployed
- Verify deployer has admin role

### Verification Fails
- Wait for block confirmations
- Check network connectivity
- Verify contract address

## Emergency Procedures

### Pause Strategy
```bash
npx ts-node incident-response/emergency-pause.ts
```

### Rollback (if needed)
1. Pause strategy immediately
2. Notify all signers
3. Prepare upgrade transaction
4. Execute through multi-sig

## Best Practices

1. **Always test on testnet first**
2. **Use multi-sig for all admin functions**
3. **Monitor for 24 hours after deployment**
4. **Keep deployment reports for audit**
5. **Document all configuration changes**

## Support

For issues or questions:
1. Check troubleshooting section
2. Review incident response playbook
3. Contact security team


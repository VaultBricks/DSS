# DSS Operational Examples - Quick Start

**Get started with operational security in 5 minutes**

## 🚀 Installation

```bash
cd examples/operational
npm install
cp .env.example .env
```

## ⚙️ Configuration

Edit `.env` with your settings:

```bash
# Required
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
STRATEGY_ADDRESS=0x...

# Optional (for alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## 📊 Run Health Monitor

Monitor strategy health in real-time:

```bash
npm run monitor:health
```

**Output:**
```
🔍 DSS Strategy Health Monitor

✅ Health monitor started for strategy: 0x...
Block 18500000 | Assets: 2 | Weight Sum: 10000 | Gas: 25 gwei
✓ All oracles fresh
✓ Approvals verified
✓ Health factors OK
```

## 🤖 Run Keeper Bot

Automate rebalancing:

```bash
# Test in dry-run mode first
DRY_RUN=true npm run keeper:rebalance
```

**Output:**
```
🤖 DSS Rebalance Keeper Bot

Keeper address: 0x...
Strategy address: 0x...
⚠️  Running in DRY RUN mode

--- Check #1 ---
✓ No rebalance needed
```

## 🚀 Deploy Strategy

Deploy with multi-sig governance:

```bash
# Configure multi-sig
export MULTISIG_ADDRESS=0x...

# Deploy
npm run deploy:multisig

# Verify
npm run deploy:verify
```

## 🚨 Emergency Pause

Execute emergency pause:

```bash
npm run emergency:pause "Reason for pause"
```

## 📖 Next Steps

### 1. Set Up Monitoring

- Configure [OpenZeppelin Defender](monitoring/defender-setup.ts)
- Set up [Tenderly alerts](monitoring/tenderly-setup.md)
- Run monitors 24/7 with PM2

### 2. Deploy Keeper Bots

- Test keeper in dry-run mode
- Deploy to production with PM2
- Monitor keeper health

### 3. Review Incident Response

- Read [Incident Response Playbook](incident-response/INCIDENT-RESPONSE-PLAYBOOK.md)
- Test emergency procedures
- Set up alert channels

## 🔗 Documentation

- [Main README](README.md) - Complete overview
- [Monitoring](monitoring/README.md) - Monitoring setup
- [Keeper Bots](keeper/README.md) - Keeper configuration
- [Deployment](deployment/README.md) - Deployment procedures
- [Incident Response](incident-response/README.md) - Emergency procedures

## 💡 Tips

1. **Start with testnet** - Test all scripts on Goerli/Sepolia first
2. **Use dry-run mode** - Test keepers without executing transactions
3. **Set up alerts** - Configure Slack/Telegram for notifications
4. **Monitor continuously** - Run health monitors 24/7
5. **Test emergency procedures** - Practice incident response monthly

## 🆘 Troubleshooting

**Monitor not starting?**
- Check RPC_URL is valid
- Verify STRATEGY_ADDRESS is correct
- Ensure strategy ABI path is correct

**Keeper not executing?**
- Check keeper has KEEPER_ROLE
- Verify keeper wallet has ETH for gas
- Check gas price is below MAX_GAS_PRICE

**Alerts not sending?**
- Verify webhook URLs
- Test webhooks manually
- Check network connectivity

## 📞 Support

- [GitHub Issues](https://github.com/VaultBricks/DSS/issues)
- [Documentation](https://github.com/VaultBricks/DSS)
- [Examples](https://github.com/VaultBricks/DSS/tree/main/examples)


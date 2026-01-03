# DSS Keeper Bots

**Automated keeper bots for DSS strategy maintenance**

Keeper bots automate routine operations, reducing manual intervention and ensuring strategies operate optimally 24/7.

## 📋 Overview

Keeper bots provide:
- ✅ **Automated rebalancing** - Execute rebalances when conditions are met
- ✅ **Routine maintenance** - Check health, verify approvals, monitor oracles
- ✅ **24/7 operation** - No manual intervention required
- ✅ **Gas optimization** - Wait for favorable gas prices

## 🤖 Available Keepers

### 1. Rebalance Keeper (`rebalance-keeper.ts`)

Automatically executes strategy rebalances when needed.

**Features:**
- Checks if rebalance is needed via `shouldRebalance()`
- Verifies gas prices are acceptable
- Respects minimum rebalance intervals
- Dry-run mode for testing
- Slack/Telegram alerts

**Conditions Checked:**
- ✅ Strategy not paused
- ✅ `shouldRebalance()` returns true
- ✅ Gas price below threshold
- ✅ Minimum time since last rebalance elapsed

**Usage:**
```bash
# Configure in .env
MIN_REBALANCE_INTERVAL=86400  # 24 hours
MAX_GAS_PRICE=150             # 150 gwei
DRY_RUN=false                 # Set to true for testing

# Run keeper
npm run keeper:rebalance
```

### 2. Maintenance Keeper (`maintenance-keeper.ts`)

Performs routine health checks and maintenance tasks.

**Tasks:**
- Check oracle data freshness
- Verify token approvals
- Monitor health factors
- Generate health reports

**Usage:**
```bash
npm run keeper:maintenance
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

### Required Environment Variables

```bash
# Network
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Strategy
STRATEGY_ADDRESS=0x...
STRATEGY_ABI_PATH=../sdk/basic-strategy/artifacts/...

# Keeper wallet (needs KEEPER_ROLE)
PRIVATE_KEY=0x...

# Configuration
MIN_REBALANCE_INTERVAL=86400  # seconds
MAX_GAS_PRICE=150             # gwei
DRY_RUN=true                  # Start with dry-run

# Alerting (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Test in Dry-Run Mode

```bash
# Set DRY_RUN=true in .env
DRY_RUN=true

# Run keeper
npm run keeper:rebalance
```

### Deploy to Production

```bash
# Use PM2 for process management
npm install -g pm2

# Start keeper
pm2 start keeper/rebalance-keeper.ts --name dss-rebalance-keeper

# Monitor logs
pm2 logs dss-rebalance-keeper

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

## 🔒 Security Best Practices

### 1. Use Dedicated Keeper Wallet

Create a separate wallet for keeper operations:
```bash
# Generate new wallet
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

# Grant KEEPER_ROLE to this address
# (via multi-sig or admin)
```

### 2. Limit Keeper Permissions

Keeper should only have `KEEPER_ROLE`, not admin:
```solidity
// ✅ Good: Keeper can only rebalance
grantRole(KEEPER_ROLE, keeperAddress);

// ❌ Bad: Keeper has admin access
grantRole(DEFAULT_ADMIN_ROLE, keeperAddress);
```

### 3. Monitor Keeper Activity

Set up alerts for keeper actions:
- Successful rebalances
- Failed transactions
- High gas usage
- Unexpected behavior

### 4. Use Hardware Wallet for Funding

Fund keeper wallet from hardware wallet:
```bash
# Keep only enough ETH for gas
# Refill periodically from secure wallet
```

### 5. Implement Circuit Breakers

Add safety checks in keeper logic:
```typescript
// Example: Pause if too many failures
let failureCount = 0;
const MAX_FAILURES = 3;

if (failureCount >= MAX_FAILURES) {
  await strategy.pause(); // Emergency pause
  await sendCriticalAlert('Keeper paused after multiple failures');
}
```

## ⚙️ Configuration

### Gas Price Management

```typescript
// In .env
MAX_GAS_PRICE=150  # gwei

// Dynamic gas pricing (advanced)
const gasPrice = await provider.getFeeData();
const maxGasPrice = ethers.parseUnits('150', 'gwei');

if (gasPrice.gasPrice > maxGasPrice) {
  console.log('Gas too high, waiting...');
  return;
}
```

### Rebalance Timing

```typescript
// Minimum interval between rebalances
MIN_REBALANCE_INTERVAL=86400  # 24 hours

// Check interval (how often to check conditions)
HEALTH_CHECK_INTERVAL=300000  # 5 minutes
```

### Alerting

```typescript
// Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

// Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## 📊 Monitoring Keeper Health

### Check Keeper Status

```bash
# Using PM2
pm2 status

# View logs
pm2 logs dss-rebalance-keeper --lines 100

# Monitor resource usage
pm2 monit
```

### Keeper Metrics

Track these metrics:
- **Uptime**: Keeper should run 24/7
- **Success rate**: % of successful rebalances
- **Gas usage**: Average gas per rebalance
- **Response time**: Time from condition met to execution

### Example Monitoring Script

```typescript
// keeper-health-check.ts
setInterval(async () => {
  const lastRebalance = await strategy.lastRebalanceTime();
  const timeSinceRebalance = Date.now() / 1000 - Number(lastRebalance);
  
  if (timeSinceRebalance > 48 * 3600) {
    await sendAlert('⚠️ No rebalance in 48 hours - check keeper!');
  }
}, 3600000); // Check every hour
```

## 🐛 Troubleshooting

### Keeper Not Executing Rebalances

**Check:**
1. Keeper wallet has KEEPER_ROLE
2. Keeper wallet has enough ETH for gas
3. Gas price is below MAX_GAS_PRICE
4. Strategy is not paused
5. `shouldRebalance()` returns true

**Debug:**
```bash
# Check keeper role
cast call $STRATEGY_ADDRESS "hasRole(bytes32,address)" \
  $(cast keccak "KEEPER_ROLE") $KEEPER_ADDRESS

# Check balance
cast balance $KEEPER_ADDRESS

# Check if paused
cast call $STRATEGY_ADDRESS "paused()"
```

### High Gas Usage

**Solutions:**
- Increase MAX_GAS_PRICE threshold
- Wait for off-peak hours
- Optimize rebalance logic
- Use Flashbots for MEV protection

### Keeper Crashes

**Check logs:**
```bash
pm2 logs dss-rebalance-keeper --err
```

**Common issues:**
- RPC connection timeout → Use reliable RPC provider
- Out of gas → Increase gas limit
- Nonce issues → Implement nonce management

## 🎯 DSS-9 Compliance

Keeper bots help achieve:

| Requirement | Keeper | Level |
|-------------|--------|-------|
| **Automated Operations** | rebalance-keeper.ts | Silver+ |
| **Health Monitoring** | maintenance-keeper.ts | Silver+ |
| **24/7 Availability** | PM2 deployment | Gold |

## 📖 Next Steps

- Set up [Monitoring](../monitoring/README.md)
- Review [Deployment Scripts](../deployment/README.md)
- Read [Incident Response Playbook](../incident-response/INCIDENT-RESPONSE-PLAYBOOK.md)


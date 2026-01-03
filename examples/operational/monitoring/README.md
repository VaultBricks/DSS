# DSS Monitoring Examples

**Real-time monitoring and alerting for DSS-9 compliance**

This directory contains production-ready monitoring solutions for DSS strategies.

## 📋 Overview

Monitoring is essential for:
- ✅ **Early anomaly detection** - Catch issues before they become critical
- ✅ **24/7 visibility** - Know what's happening with your strategy
- ✅ **Compliance** - Required for DSS-9.3 (Silver/Gold certification)
- ✅ **Incident response** - Quick reaction to security events

## 🏗️ Available Monitors

### 1. Health Monitor (`health-monitor.ts`)

Continuous health checks for strategy metrics.

**Monitors:**
- Total assets and asset count
- Weight sum (should be 10000)
- Pause status
- Time since last rebalance
- Gas prices

**Alerts on:**
- Strategy paused
- Weight sum out of bounds
- No rebalance for extended period
- High gas prices

**Usage:**
```bash
npm run monitor:health
```

### 2. Event Monitor (`event-monitor.ts`)

Real-time event monitoring with WebSocket connection.

**Monitors:**
- Rebalance events
- Pause/Unpause events
- Role changes (granted/revoked)
- All strategy events

**Alerts on:**
- Every critical event
- Failed transactions
- Unexpected role changes

**Usage:**
```bash
npm run monitor:events
```

### 3. OpenZeppelin Defender (`defender-setup.ts`)

Automated monitoring using OpenZeppelin Defender.

**Features:**
- Automated event monitoring
- Multi-channel alerts (Email, Slack, Telegram)
- Failed transaction detection
- Gas usage monitoring
- Role change tracking

**Setup:**
```bash
# Configure Defender credentials in .env
DEFENDER_API_KEY=your_key
DEFENDER_API_SECRET=your_secret

# Run setup
ts-node defender-setup.ts
```

### 4. Tenderly Alerting (`tenderly-setup.md`)

Complete guide for Tenderly integration.

**Features:**
- Transaction simulation
- Custom dashboards
- Web3 Actions (automated responses)
- Advanced debugging

**See:** [tenderly-setup.md](./tenderly-setup.md)

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

### Run Health Monitor

```bash
npm run monitor:health
```

### Run Event Monitor

```bash
npm run monitor:events
```

## 📊 Monitoring Best Practices

### 1. Use Multiple Channels

Don't rely on a single alerting channel:
- **Email**: For non-critical alerts
- **Slack**: For team visibility
- **Telegram**: For mobile alerts
- **PagerDuty**: For critical incidents

### 2. Set Appropriate Thresholds

Avoid alert fatigue:
- **Critical**: Immediate action required (pause, failed tx)
- **Warning**: Review needed (high gas, delayed rebalance)
- **Info**: Informational only (successful rebalance)

### 3. Monitor Continuously

Run monitors 24/7:
```bash
# Using PM2 for process management
npm install -g pm2

pm2 start monitoring/health-monitor.ts --name dss-health
pm2 start monitoring/event-monitor.ts --name dss-events

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

### 4. Log Everything

Enable file logging:
```bash
# In .env
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/monitoring.log
```

### 5. Test Alerts

Always test before production:
```bash
# Test Slack webhook
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test alert from DSS monitoring"}'
```

## 🔧 Configuration

### Environment Variables

See [.env.example](../.env.example) for all configuration options.

**Required:**
- `RPC_URL` - Ethereum RPC endpoint
- `STRATEGY_ADDRESS` - Your strategy contract address

**Optional:**
- `SLACK_WEBHOOK_URL` - Slack alerts
- `TELEGRAM_BOT_TOKEN` - Telegram alerts
- `DEFENDER_API_KEY` - OpenZeppelin Defender
- `TENDERLY_ACCESS_KEY` - Tenderly integration

### Alert Thresholds

Customize in your monitor scripts:

```typescript
const thresholds = {
  maxGasPrice: ethers.parseUnits('100', 'gwei'),
  minWeightSum: 9999n,
  maxWeightSum: 10001n,
  maxTimeSinceRebalance: 86400n * 2n // 2 days
};
```

## 📈 Metrics to Monitor

### Critical Metrics
- ✅ Pause status
- ✅ Weight sum accuracy
- ✅ Failed transactions
- ✅ Role changes

### Important Metrics
- ⚠️ Time since last rebalance
- ⚠️ Gas prices
- ⚠️ Asset count changes

### Informational Metrics
- ℹ️ Successful rebalances
- ℹ️ Total value locked
- ℹ️ Transaction count

## 🎯 DSS-9 Compliance

These monitors help achieve:

| Requirement | Monitor | Level |
|-------------|---------|-------|
| **DSS-9.3.1: Event Monitoring** | event-monitor.ts | Silver+ |
| **DSS-9.3.2: Health Checks** | health-monitor.ts | Silver+ |
| **DSS-9.3.3: Alerting** | All monitors | Silver+ |
| **DSS-9.3.4: 24/7 Monitoring** | PM2 + monitors | Gold |

## 🐛 Troubleshooting

**Issue**: Monitor not starting
```bash
# Check environment variables
cat .env | grep -v '^#'

# Verify RPC connection
curl -X POST $RPC_URL \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Issue**: No alerts received
- Check webhook URLs are correct
- Verify network connectivity
- Test webhooks manually
- Check log files for errors

**Issue**: Too many alerts
- Adjust thresholds in monitor scripts
- Add time windows for batching
- Filter out expected events

## 📖 Next Steps

- Set up [Keeper Bots](../keeper/README.md)
- Review [Incident Response](../incident-response/INCIDENT-RESPONSE-PLAYBOOK.md)
- Configure [Deployment Scripts](../deployment/README.md)


# Tenderly Alerting Setup for DSS Strategies

**Complete guide for setting up Tenderly monitoring and alerting**

Tenderly provides powerful monitoring, alerting, and debugging capabilities for smart contracts. This guide shows how to configure Tenderly for DSS-9 compliance.

## Prerequisites

1. **Tenderly Account**: Sign up at https://dashboard.tenderly.co/
2. **Project Created**: Create a new project for your DSS strategy
3. **Contract Added**: Add your strategy contract to the project

## Step 1: Add Contract to Tenderly

### Via Dashboard

1. Go to https://dashboard.tenderly.co/
2. Navigate to your project
3. Click "Add Contract"
4. Enter your strategy address
5. Select the network (Mainnet, Goerli, etc.)
6. Click "Add Contract"

### Via CLI

```bash
# Install Tenderly CLI
npm install -g @tenderly/cli

# Login
tenderly login

# Add contract
tenderly contract add \
  --network mainnet \
  --address YOUR_STRATEGY_ADDRESS \
  --name "DSS Strategy"
```

## Step 2: Configure Alerts

### Alert 1: Rebalance Events

**Purpose**: Monitor all rebalancing operations

```yaml
Name: DSS Rebalance Alert
Type: Event
Event: Rebalance(address,uint256,uint256[])
Condition: Always trigger
Destinations: Slack, Email
```

**Setup via Dashboard:**
1. Go to Alerts → Create Alert
2. Select "Event" type
3. Choose your contract
4. Select `Rebalance` event
5. Set condition: `true` (always trigger)
6. Add destinations (Slack, Email, Telegram)

### Alert 2: Emergency Pause

**Purpose**: Critical alert when strategy is paused

```yaml
Name: DSS Emergency Pause
Type: Event
Event: Paused(address)
Condition: Always trigger
Severity: Critical
Destinations: Slack, Email, SMS, PagerDuty
```

### Alert 3: Failed Transactions

**Purpose**: Detect failed strategy operations

```yaml
Name: DSS Failed Transactions
Type: Transaction
Condition: status == "failed"
Destinations: Slack, Email
```

### Alert 4: High Gas Usage

**Purpose**: Alert on unusually high gas consumption

```yaml
Name: DSS High Gas Alert
Type: Transaction
Condition: gasUsed > 500000
Destinations: Email
```

### Alert 5: Role Changes

**Purpose**: Monitor access control changes

```yaml
Name: DSS Role Changes
Type: Event
Events: 
  - RoleGranted(bytes32,address,address)
  - RoleRevoked(bytes32,address,address)
Condition: Always trigger
Destinations: Slack, Email
```

## Step 3: Configure Destinations

### Slack Integration

1. Go to Tenderly → Integrations → Slack
2. Click "Add to Slack"
3. Authorize Tenderly
4. Select channel (e.g., `#dss-alerts`)
5. Test the integration

### Email Notifications

1. Go to Tenderly → Integrations → Email
2. Add email addresses
3. Configure notification preferences
4. Test with a sample alert

### Telegram Integration

1. Create a Telegram bot via @BotFather
2. Get bot token
3. Add bot to your group/channel
4. Get chat ID
5. Configure in Tenderly → Integrations → Telegram

### PagerDuty (Critical Alerts)

1. Create PagerDuty account
2. Get integration key
3. Add to Tenderly → Integrations → PagerDuty
4. Configure escalation policies

## Step 4: Set Up Web3 Actions (Advanced)

Web3 Actions allow automated responses to events.

### Example: Auto-Pause on Anomaly

```javascript
// Tenderly Web3 Action
const { ethers } = require('ethers');

module.exports.handler = async (context, event) => {
  const { transaction } = event;
  
  // Check if rebalance failed
  if (transaction.status === 'failed' && 
      transaction.to === process.env.STRATEGY_ADDRESS) {
    
    // Send alert
    await context.secrets.SLACK_WEBHOOK({
      text: '🚨 Failed rebalance detected! Manual review required.'
    });
    
    // Optionally: Execute emergency pause
    // (requires guardian private key in secrets)
    const provider = new ethers.providers.JsonRpcProvider(context.secrets.RPC_URL);
    const wallet = new ethers.Wallet(context.secrets.GUARDIAN_KEY, provider);
    const strategy = new ethers.Contract(
      process.env.STRATEGY_ADDRESS,
      ['function pause() external'],
      wallet
    );
    
    // Pause strategy
    const tx = await strategy.pause();
    await tx.wait();
    
    console.log('Strategy paused automatically');
  }
};
```

## Step 5: Create Custom Dashboard

1. Go to Tenderly → Dashboards → Create Dashboard
2. Add widgets:
   - **Transaction Count**: Track rebalance frequency
   - **Gas Usage**: Monitor gas costs over time
   - **Event Timeline**: Visualize all events
   - **Failed Transactions**: Track failures
3. Share dashboard with team

## Step 6: Enable Simulation

Tenderly Simulation allows testing transactions before execution.

```typescript
// Example: Simulate rebalance before execution
import axios from 'axios';

async function simulateRebalance(strategyAddress: string, newWeights: number[]) {
  const response = await axios.post(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/simulate`,
    {
      network_id: '1', // Mainnet
      from: KEEPER_ADDRESS,
      to: strategyAddress,
      input: encodeRebalanceCall(newWeights),
      save: true,
      save_if_fails: true
    },
    {
      headers: {
        'X-Access-Key': process.env.TENDERLY_ACCESS_KEY
      }
    }
  );
  
  if (!response.data.simulation.status) {
    console.error('Simulation failed:', response.data.simulation.error_message);
    return false;
  }
  
  console.log('Simulation successful. Gas used:', response.data.simulation.gas_used);
  return true;
}
```

## Best Practices

1. **Test Alerts**: Always test alerts before going live
2. **Escalation**: Configure escalation for critical alerts
3. **Noise Reduction**: Avoid alert fatigue with proper thresholds
4. **Regular Review**: Review and update alert rules monthly
5. **Documentation**: Document all alert configurations

## Troubleshooting

**Issue**: Alerts not triggering
- Check contract is added to Tenderly
- Verify alert conditions are correct
- Check destination integrations are active

**Issue**: Too many alerts
- Adjust thresholds
- Use time windows to batch alerts
- Filter out expected events

## Resources

- [Tenderly Documentation](https://docs.tenderly.co/)
- [Web3 Actions Guide](https://docs.tenderly.co/web3-actions)
- [Alert Rules Reference](https://docs.tenderly.co/monitoring/alerts)


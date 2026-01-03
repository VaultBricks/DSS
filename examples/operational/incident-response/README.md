# DSS Incident Response

**Emergency procedures and tools for handling security incidents**

This directory contains incident response procedures and emergency tools for DSS strategies. Essential for DSS-9.4 (Gold certification).

## 📋 Overview

Incident response requires:
- ✅ **Clear procedures** - Step-by-step playbooks
- ✅ **Emergency tools** - Fast response capabilities
- ✅ **Communication** - Alert all stakeholders
- ✅ **Documentation** - Complete incident records

## 🏗️ Contents

### 1. Incident Response Playbook (`INCIDENT-RESPONSE-PLAYBOOK.md`)

Comprehensive guide for handling security incidents.

**Covers:**
- Incident severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- Step-by-step response procedures
- Emergency contacts
- Incident documentation templates
- Post-incident review process

**Use Cases:**
- Active exploit in progress
- Suspicious activity detected
- Failed operations
- Routine issues

### 2. Emergency Pause Script (`emergency-pause.ts`)

Immediately pause strategy in emergency situations.

**Features:**
- Fast execution with high gas price
- Multi-channel alerts (Slack, Telegram, Discord)
- Incident logging
- Role verification

**Usage:**
```bash
# Execute emergency pause
ts-node emergency-pause.ts "Reason for pause"

# Example
ts-node emergency-pause.ts "Suspicious transactions detected"
```

## 🚨 Emergency Response

### CRITICAL Incident (< 15 minutes)

**Active exploit or immediate threat:**

```bash
# 1. PAUSE IMMEDIATELY
cd examples/operational/incident-response
ts-node emergency-pause.ts "Active exploit detected"

# 2. Alert team (automatic via script)

# 3. Assess situation
npm run monitor:health
npm run monitor:events

# 4. Follow playbook procedures
# See INCIDENT-RESPONSE-PLAYBOOK.md
```

### HIGH Incident (< 1 hour)

**Suspicious activity or high risk:**

```bash
# 1. Verify the alert
npm run monitor:health

# 2. Assess risk
# Review recent transactions
# Check oracle prices
# Verify weights

# 3. Decide on action
# If confirmed: execute emergency pause
ts-node emergency-pause.ts "Suspicious activity confirmed"
```

### MEDIUM/LOW Incidents

**Follow procedures in playbook:**
- Check logs
- Identify cause
- Fix issue
- Verify resolution

## 🛠️ Emergency Tools

### Emergency Pause

```bash
# Quick pause
ts-node emergency-pause.ts "Reason"

# With custom RPC
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY \
ts-node emergency-pause.ts "Reason"
```

### Health Check

```bash
# Check strategy status
npm run monitor:health

# Check specific metrics
cast call $STRATEGY_ADDRESS "paused()"
cast call $STRATEGY_ADDRESS "calculateWeights()"
```

### Manual Unpause

```bash
# After incident is resolved
cast send $STRATEGY_ADDRESS "unpause()" \
  --private-key $GUARDIAN_KEY \
  --rpc-url $RPC_URL
```

### Transaction Analysis

```bash
# Get recent transactions
cast logs --address $STRATEGY_ADDRESS \
  --from-block -1000 \
  --rpc-url $RPC_URL

# Decode transaction
cast tx $TX_HASH --rpc-url $RPC_URL
```

## 📞 Emergency Contacts

### Setup Contact List

Create `contacts.json`:
```json
{
  "guardians": [
    {
      "name": "Alice",
      "phone": "+1-555-0101",
      "email": "alice@example.com",
      "role": "Primary Guardian"
    }
  ],
  "multisig_signers": [
    {
      "name": "Bob",
      "phone": "+1-555-0102",
      "address": "0x..."
    }
  ],
  "external": {
    "auditor": "security@auditor.com",
    "insurance": "claims@insurance.com"
  }
}
```

### Alert Channels

Configure in `.env`:
```bash
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email (via SendGrid)
SENDGRID_API_KEY=your_api_key
ALERT_EMAIL=alerts@yourdomain.com
```

## 📊 Incident Documentation

### Create Incident Report

```bash
# Use template from playbook
cp INCIDENT-RESPONSE-PLAYBOOK.md incident-report-$(date +%Y%m%d).md

# Fill in:
# - Summary
# - Timeline
# - Root cause
# - Impact
# - Response actions
# - Lessons learned
```

### Incident Log

All emergency pauses are automatically logged to:
```
logs/incident-{timestamp}.log
```

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

## What Happened
[Brief description]

## Timeline
- HH:MM - Event 1
- HH:MM - Event 2

## Root Cause
[Technical explanation]

## Impact
- Funds at risk: $X
- Actual loss: $Y
- Downtime: Z hours

## What Went Well
- [Item]

## What Could Be Improved
- [Item]

## Action Items
- [ ] [Preventive measure]
- [ ] [Process improvement]
```

## 🔄 Testing Emergency Procedures

### Monthly Drill

```bash
# 1. Simulate incident
# 2. Execute emergency pause (on testnet)
# 3. Time the response
# 4. Review and improve

# Testnet drill
RPC_URL=https://goerli.infura.io/v3/YOUR_KEY \
STRATEGY_ADDRESS=0x... \
ts-node emergency-pause.ts "Monthly drill"
```

### Verify Response Time

Target response times:
- **Detection to alert**: < 1 minute
- **Alert to pause**: < 5 minutes
- **Total response**: < 15 minutes

### Update Procedures

After each incident or drill:
1. Review what worked
2. Identify improvements
3. Update playbook
4. Train team

## 🎯 DSS-9 Compliance

Incident response helps achieve:

| Requirement | Tool/Procedure | Level |
|-------------|----------------|-------|
| **DSS-9.4.1: Incident Procedures** | INCIDENT-RESPONSE-PLAYBOOK.md | Gold |
| **DSS-9.4.2: Emergency Pause** | emergency-pause.ts | Gold |
| **DSS-9.4.3: Communication** | Multi-channel alerts | Gold |
| **DSS-9.4.4: Documentation** | Incident logging | Gold |

## 🐛 Troubleshooting

### Emergency Pause Fails

**Check:**
- Guardian has GUARDIAN_ROLE
- Guardian wallet has ETH for gas
- RPC connection is working
- Strategy is not already paused

**Debug:**
```bash
# Check role
cast call $STRATEGY_ADDRESS \
  "hasRole(bytes32,address)" \
  $(cast keccak "GUARDIAN_ROLE") \
  $GUARDIAN_ADDRESS

# Check balance
cast balance $GUARDIAN_ADDRESS

# Check pause status
cast call $STRATEGY_ADDRESS "paused()"
```

### Alerts Not Sending

**Check:**
- Webhook URLs are correct
- Network connectivity
- API tokens are valid

**Test:**
```bash
# Test Slack
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test alert"}'
```

### Can't Unpause

**Possible reasons:**
- Only guardian can unpause
- Timelock delay not passed
- Contract issue

**Solution:**
```bash
# Check who can unpause
cast call $STRATEGY_ADDRESS \
  "hasRole(bytes32,address)" \
  $(cast keccak "GUARDIAN_ROLE") \
  $YOUR_ADDRESS
```

## 📖 Next Steps

- Review [Incident Response Playbook](./INCIDENT-RESPONSE-PLAYBOOK.md)
- Set up [Monitoring](../monitoring/README.md)
- Configure [Alert Channels](../.env.example)
- Test emergency procedures monthly


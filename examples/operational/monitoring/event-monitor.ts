/**
 * @file event-monitor.ts
 * @description Event-based monitoring for DSS strategy events
 * 
 * Monitors critical strategy events (Rebalance, Pause, RoleGranted, etc.)
 * and sends real-time alerts. Essential for DSS-9.3 compliance.
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

dotenv.config();

// ============ Event Handlers ============

async function handleRebalanceEvent(event: ethers.EventLog) {
  const [executor, timestamp, newWeights] = event.args || [];
  
  console.log(chalk.green(`\n✅ Rebalance Event Detected`));
  console.log(`  Executor: ${executor}`);
  console.log(`  Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
  console.log(`  New Weights: ${newWeights.map((w: bigint) => Number(w) / 100).join('%, ')}%`);
  
  await sendAlert('INFO', `Rebalance executed by ${executor}`);
}

async function handlePauseEvent(event: ethers.EventLog) {
  const [account] = event.args || [];
  
  console.log(chalk.red(`\n🚨 PAUSE Event Detected`));
  console.log(`  Paused by: ${account}`);
  
  await sendAlert('CRITICAL', `⏸️  Strategy PAUSED by ${account}. Immediate attention required!`);
}

async function handleUnpauseEvent(event: ethers.EventLog) {
  const [account] = event.args || [];
  
  console.log(chalk.yellow(`\n▶️  UNPAUSE Event Detected`));
  console.log(`  Unpaused by: ${account}`);
  
  await sendAlert('WARNING', `▶️  Strategy UNPAUSED by ${account}`);
}

async function handleRoleGrantedEvent(event: ethers.EventLog) {
  const [role, account, sender] = event.args || [];
  
  const roleNames: { [key: string]: string } = {
    '0x0000000000000000000000000000000000000000000000000000000000000000': 'ADMIN',
    [ethers.id('KEEPER_ROLE')]: 'KEEPER',
    [ethers.id('GUARDIAN_ROLE')]: 'GUARDIAN'
  };
  
  const roleName = roleNames[role] || role;
  
  console.log(chalk.blue(`\n👤 Role Granted Event`));
  console.log(`  Role: ${roleName}`);
  console.log(`  Account: ${account}`);
  console.log(`  Granted by: ${sender}`);
  
  await sendAlert('WARNING', `Role ${roleName} granted to ${account} by ${sender}`);
}

async function handleRoleRevokedEvent(event: ethers.EventLog) {
  const [role, account, sender] = event.args || [];
  
  console.log(chalk.yellow(`\n🚫 Role Revoked Event`));
  console.log(`  Account: ${account}`);
  console.log(`  Revoked by: ${sender}`);
  
  await sendAlert('WARNING', `Role revoked from ${account} by ${sender}`);
}

// ============ Alert Function ============

async function sendAlert(severity: 'INFO' | 'WARNING' | 'CRITICAL', message: string) {
  const timestamp = new Date().toISOString();
  
  // Log to file
  if (process.env.LOG_TO_FILE === 'true') {
    const logDir = './logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(
      process.env.LOG_FILE_PATH || './logs/event-monitor.log',
      `${timestamp} [${severity}] ${message}\n`
    );
  }
  
  // Send to Slack
  if (process.env.SLACK_WEBHOOK_URL && severity !== 'INFO') {
    try {
      const axios = (await import('axios')).default;
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🔔 DSS Event Alert [${severity}]\n${message}`,
        username: 'DSS Event Monitor'
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

// ============ Main Monitor ============

async function main() {
  console.log(chalk.bold.cyan('\n📡 DSS Strategy Event Monitor\n'));
  
  if (!process.env.RPC_URL || !process.env.STRATEGY_ADDRESS) {
    console.error(chalk.red('❌ Missing required environment variables'));
    process.exit(1);
  }
  
  const provider = new ethers.WebSocketProvider(
    process.env.RPC_URL.replace('https://', 'wss://')
  );
  const strategyAddress = process.env.STRATEGY_ADDRESS;
  
  // Load ABI
  const abiPath = process.env.STRATEGY_ABI_PATH || '../sdk/basic-strategy/artifacts/contracts/HODLStrategy.sol/HODLStrategy.json';
  const strategyArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const strategy = new ethers.Contract(strategyAddress, strategyArtifact.abi, provider);
  
  console.log(chalk.green(`✅ Monitoring strategy: ${strategyAddress}\n`));
  
  // Listen to events
  strategy.on('Rebalance', handleRebalanceEvent);
  strategy.on('Paused', handlePauseEvent);
  strategy.on('Unpaused', handleUnpauseEvent);
  strategy.on('RoleGranted', handleRoleGrantedEvent);
  strategy.on('RoleRevoked', handleRoleRevokedEvent);
  
  // Listen for failed transactions
  provider.on('error', async (error) => {
    await sendAlert('CRITICAL', `Provider error: ${error.message}`);
  });
  
  console.log(chalk.gray('Listening for events... (Press Ctrl+C to stop)\n'));
  
  // Keep alive
  await new Promise(() => {});
}

main().catch(console.error);


/**
 * @file defender-setup.ts
 * @description OpenZeppelin Defender configuration for DSS strategies
 * 
 * Sets up automated monitoring, alerting, and security responses using
 * OpenZeppelin Defender. Essential for production deployments.
 * 
 * DSS-9.3: Monitoring & Alerting (Silver/Gold certification)
 */

import { Defender } from '@openzeppelin/defender-sdk';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// ============ Defender Setup ============

async function setupDefender() {
  console.log(chalk.bold.cyan('\n🛡️  OpenZeppelin Defender Setup\n'));
  
  // Validate credentials
  if (!process.env.DEFENDER_API_KEY || !process.env.DEFENDER_API_SECRET) {
    console.error(chalk.red('❌ Missing Defender credentials'));
    console.error('Required: DEFENDER_API_KEY, DEFENDER_API_SECRET');
    process.exit(1);
  }
  
  const client = new Defender({
    apiKey: process.env.DEFENDER_API_KEY,
    apiSecret: process.env.DEFENDER_API_SECRET
  });
  
  const strategyAddress = process.env.STRATEGY_ADDRESS;
  if (!strategyAddress) {
    console.error(chalk.red('❌ Missing STRATEGY_ADDRESS'));
    process.exit(1);
  }
  
  console.log(chalk.blue('Setting up monitors for strategy:'), strategyAddress);
  
  // ============ Monitor 1: Rebalance Events ============
  
  console.log(chalk.gray('\n📊 Creating Rebalance Monitor...'));
  
  const rebalanceMonitor = await client.monitor.create({
    name: 'DSS Strategy - Rebalance Monitor',
    type: 'BLOCK',
    addresses: [strategyAddress],
    abi: JSON.stringify([
      'event Rebalance(address indexed executor, uint256 timestamp, uint256[] newWeights)'
    ]),
    paused: false,
    eventConditions: [
      {
        eventSignature: 'Rebalance(address,uint256,uint256[])',
        expression: 'true' // Alert on all rebalances
      }
    ],
    alertThreshold: {
      amount: 1,
      windowSeconds: 0 // Alert immediately
    },
    notificationChannels: [
      process.env.SLACK_WEBHOOK_URL ? 'slack' : 'email'
    ]
  });
  
  console.log(chalk.green('✅ Rebalance Monitor created:'), rebalanceMonitor.monitorId);
  
  // ============ Monitor 2: Emergency Pause ============
  
  console.log(chalk.gray('\n🚨 Creating Emergency Pause Monitor...'));
  
  const pauseMonitor = await client.monitor.create({
    name: 'DSS Strategy - Emergency Pause',
    type: 'BLOCK',
    addresses: [strategyAddress],
    abi: JSON.stringify([
      'event Paused(address account)',
      'event Unpaused(address account)'
    ]),
    paused: false,
    eventConditions: [
      {
        eventSignature: 'Paused(address)',
        expression: 'true'
      },
      {
        eventSignature: 'Unpaused(address)',
        expression: 'true'
      }
    ],
    alertThreshold: {
      amount: 1,
      windowSeconds: 0
    },
    notificationChannels: ['email', 'slack', 'telegram']
  });
  
  console.log(chalk.green('✅ Pause Monitor created:'), pauseMonitor.monitorId);
  
  // ============ Monitor 3: Failed Transactions ============
  
  console.log(chalk.gray('\n❌ Creating Failed Transaction Monitor...'));
  
  const failedTxMonitor = await client.monitor.create({
    name: 'DSS Strategy - Failed Transactions',
    type: 'BLOCK',
    addresses: [strategyAddress],
    paused: false,
    txCondition: 'status == "failed"',
    alertThreshold: {
      amount: 1,
      windowSeconds: 300 // Alert if 1+ failed tx in 5 minutes
    },
    notificationChannels: ['email', 'slack']
  });
  
  console.log(chalk.green('✅ Failed TX Monitor created:'), failedTxMonitor.monitorId);
  
  // ============ Monitor 4: High Gas Usage ============
  
  console.log(chalk.gray('\n⛽ Creating Gas Usage Monitor...'));
  
  const gasMonitor = await client.monitor.create({
    name: 'DSS Strategy - High Gas Usage',
    type: 'BLOCK',
    addresses: [strategyAddress],
    abi: JSON.stringify([
      'event Rebalance(address indexed executor, uint256 timestamp, uint256[] newWeights)'
    ]),
    paused: false,
    eventConditions: [
      {
        eventSignature: 'Rebalance(address,uint256,uint256[])',
        expression: 'gasUsed > 500000' // Alert if gas > 500k
      }
    ],
    alertThreshold: {
      amount: 1,
      windowSeconds: 0
    },
    notificationChannels: ['email']
  });
  
  console.log(chalk.green('✅ Gas Monitor created:'), gasMonitor.monitorId);
  
  // ============ Monitor 5: Role Changes ============
  
  console.log(chalk.gray('\n👤 Creating Role Change Monitor...'));
  
  const roleMonitor = await client.monitor.create({
    name: 'DSS Strategy - Role Changes',
    type: 'BLOCK',
    addresses: [strategyAddress],
    abi: JSON.stringify([
      'event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)',
      'event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)'
    ]),
    paused: false,
    eventConditions: [
      {
        eventSignature: 'RoleGranted(bytes32,address,address)',
        expression: 'true'
      },
      {
        eventSignature: 'RoleRevoked(bytes32,address,address)',
        expression: 'true'
      }
    ],
    alertThreshold: {
      amount: 1,
      windowSeconds: 0
    },
    notificationChannels: ['email', 'slack']
  });
  
  console.log(chalk.green('✅ Role Monitor created:'), roleMonitor.monitorId);
  
  console.log(chalk.bold.green('\n✅ All Defender monitors configured successfully!\n'));
}

// Run setup
setupDefender().catch(console.error);


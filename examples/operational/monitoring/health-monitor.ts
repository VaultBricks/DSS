/**
 * @file health-monitor.ts
 * @description Real-time strategy health monitoring bot for DSS-9 compliance
 * 
 * This bot continuously monitors strategy health metrics and sends alerts
 * when anomalies are detected. Suitable for 24/7 production monitoring.
 * 
 * DSS-9.3: Monitoring & Alerting (Silver/Gold certification)
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

dotenv.config();

// ============ Configuration ============

interface HealthMetrics {
  timestamp: number;
  blockNumber: number;
  totalAssets: bigint;
  assetCount: number;
  weights: bigint[];
  weightSum: bigint;
  isPaused: boolean;
  lastRebalance: bigint;
  gasPrice: bigint;
}

interface AlertThresholds {
  maxGasPrice: bigint;
  minWeightSum: bigint;
  maxWeightSum: bigint;
  maxTimeSinceRebalance: bigint;
}

// ============ Alert Functions ============

async function sendAlert(severity: 'INFO' | 'WARNING' | 'CRITICAL', message: string) {
  const timestamp = new Date().toISOString();
  const coloredMessage = severity === 'CRITICAL' 
    ? chalk.red(`[${severity}] ${message}`)
    : severity === 'WARNING'
    ? chalk.yellow(`[${severity}] ${message}`)
    : chalk.blue(`[${severity}] ${message}`);
  
  console.log(`${timestamp} ${coloredMessage}`);
  
  // Log to file
  if (process.env.LOG_TO_FILE === 'true') {
    const logDir = './logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(
      process.env.LOG_FILE_PATH || './logs/health-monitor.log',
      `${timestamp} [${severity}] ${message}\n`
    );
  }
  
  // Send to Slack
  if (process.env.SLACK_WEBHOOK_URL && severity !== 'INFO') {
    try {
      const axios = (await import('axios')).default;
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 DSS Health Alert [${severity}]\n${message}`,
        username: 'DSS Health Monitor',
        icon_emoji: severity === 'CRITICAL' ? ':rotating_light:' : ':warning:'
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

// ============ Health Check Functions ============

async function checkStrategyHealth(
  strategy: ethers.Contract,
  provider: ethers.Provider,
  thresholds: AlertThresholds
): Promise<HealthMetrics> {
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  
  // Fetch strategy metrics
  const [assets, weights, isPaused, lastRebalance] = await Promise.all([
    strategy.getAssets(),
    strategy.calculateWeights(),
    strategy.paused(),
    strategy.lastRebalanceTime()
  ]);
  
  const weightSum = weights.reduce((sum: bigint, w: bigint) => sum + w, 0n);
  
  const metrics: HealthMetrics = {
    timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
    blockNumber,
    totalAssets: BigInt(assets.length),
    assetCount: assets.length,
    weights,
    weightSum,
    isPaused,
    lastRebalance,
    gasPrice: (await provider.getFeeData()).gasPrice || 0n
  };
  
  // Check thresholds
  await checkThresholds(metrics, thresholds);
  
  return metrics;
}

async function checkThresholds(metrics: HealthMetrics, thresholds: AlertThresholds) {
  // Check if paused
  if (metrics.isPaused) {
    await sendAlert('CRITICAL', '⏸️  Strategy is PAUSED! Manual intervention required.');
  }
  
  // Check weight sum (should be exactly 10000 for 100%)
  if (metrics.weightSum < thresholds.minWeightSum || metrics.weightSum > thresholds.maxWeightSum) {
    await sendAlert(
      'CRITICAL',
      `⚠️  Weight sum out of bounds: ${metrics.weightSum} (expected 10000)`
    );
  }
  
  // Check time since last rebalance
  const timeSinceRebalance = BigInt(metrics.timestamp) - metrics.lastRebalance;
  if (timeSinceRebalance > thresholds.maxTimeSinceRebalance) {
    await sendAlert(
      'WARNING',
      `⏰ No rebalance for ${timeSinceRebalance / 86400n} days. Consider manual rebalance.`
    );
  }
  
  // Check gas price
  if (metrics.gasPrice > thresholds.maxGasPrice) {
    await sendAlert(
      'WARNING',
      `⛽ High gas price: ${ethers.formatUnits(metrics.gasPrice, 'gwei')} gwei`
    );
  }
}

// ============ Main Monitor Loop ============

async function main() {
  console.log(chalk.bold.cyan('\n🔍 DSS Strategy Health Monitor\n'));
  
  // Validate environment
  if (!process.env.RPC_URL || !process.env.STRATEGY_ADDRESS) {
    console.error(chalk.red('❌ Missing required environment variables'));
    console.error('Required: RPC_URL, STRATEGY_ADDRESS');
    process.exit(1);
  }
  
  // Setup provider and contract
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const strategyAddress = process.env.STRATEGY_ADDRESS;
  
  // Load strategy ABI
  const abiPath = process.env.STRATEGY_ABI_PATH || '../sdk/basic-strategy/artifacts/contracts/HODLStrategy.sol/HODLStrategy.json';
  const strategyArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const strategy = new ethers.Contract(strategyAddress, strategyArtifact.abi, provider);
  
  // Configure thresholds
  const thresholds: AlertThresholds = {
    maxGasPrice: ethers.parseUnits(process.env.GAS_PRICE_ALERT_THRESHOLD || '100', 'gwei'),
    minWeightSum: 9999n, // Allow 0.01% tolerance
    maxWeightSum: 10001n,
    maxTimeSinceRebalance: BigInt(process.env.MIN_REBALANCE_INTERVAL || '86400') * 2n // 2x expected interval
  };
  
  await sendAlert('INFO', `✅ Health monitor started for strategy: ${strategyAddress}`);
  
  // Main monitoring loop
  const interval = parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000');
  
  while (true) {
    try {
      const metrics = await checkStrategyHealth(strategy, provider, thresholds);
      
      console.log(chalk.gray(`Block ${metrics.blockNumber} | Assets: ${metrics.assetCount} | Weight Sum: ${metrics.weightSum} | Gas: ${ethers.formatUnits(metrics.gasPrice, 'gwei')} gwei`));
      
    } catch (error) {
      await sendAlert('CRITICAL', `❌ Health check failed: ${error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

// Run monitor
main().catch(console.error);


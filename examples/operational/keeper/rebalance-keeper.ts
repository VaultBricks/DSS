/**
 * @file rebalance-keeper.ts
 * @description Automated keeper bot for DSS strategy rebalancing
 * 
 * This bot monitors strategy conditions and automatically executes rebalances
 * when needed. Essential for maintaining optimal portfolio allocation.
 * 
 * DSS-9: Operational Security - Automated Operations
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

dotenv.config();

// ============ Configuration ============

interface KeeperConfig {
  minRebalanceInterval: number; // seconds
  maxGasPrice: bigint; // wei
  dryRun: boolean;
  checkInterval: number; // milliseconds
}

// ============ Helper Functions ============

async function sendAlert(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${chalk.blue('[KEEPER]')} ${message}`);
  
  // Log to file
  if (process.env.LOG_TO_FILE === 'true') {
    const logDir = './logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(
      process.env.LOG_FILE_PATH || './logs/keeper.log',
      `${timestamp} ${message}\n`
    );
  }
  
  // Send to Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const axios = (await import('axios')).default;
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🤖 Keeper Bot: ${message}`,
        username: 'DSS Keeper Bot'
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

async function checkRebalanceConditions(
  strategy: ethers.Contract,
  provider: ethers.Provider,
  config: KeeperConfig
): Promise<boolean> {
  try {
    // Check if strategy is paused
    const isPaused = await strategy.paused();
    if (isPaused) {
      console.log(chalk.yellow('⏸️  Strategy is paused. Skipping rebalance check.'));
      return false;
    }
    
    // Check if rebalance is needed
    const shouldRebalance = await strategy.shouldRebalance();
    if (!shouldRebalance) {
      console.log(chalk.gray('✓ No rebalance needed'));
      return false;
    }
    
    // Check gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;
    
    if (gasPrice > config.maxGasPrice) {
      console.log(chalk.yellow(`⛽ Gas price too high: ${ethers.formatUnits(gasPrice, 'gwei')} gwei (max: ${ethers.formatUnits(config.maxGasPrice, 'gwei')} gwei)`));
      return false;
    }
    
    // Check time since last rebalance
    const lastRebalanceTime = await strategy.lastRebalanceTime();
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceRebalance = currentTime - Number(lastRebalanceTime);
    
    if (timeSinceRebalance < config.minRebalanceInterval) {
      console.log(chalk.gray(`⏰ Too soon to rebalance (${timeSinceRebalance}s / ${config.minRebalanceInterval}s)`));
      return false;
    }
    
    console.log(chalk.green('✅ All conditions met for rebalance'));
    return true;
    
  } catch (error) {
    console.error(chalk.red('❌ Error checking rebalance conditions:'), error);
    return false;
  }
}

async function executeRebalance(
  strategy: ethers.Contract,
  wallet: ethers.Wallet,
  config: KeeperConfig
): Promise<boolean> {
  try {
    console.log(chalk.cyan('\n🔄 Executing rebalance...'));
    
    if (config.dryRun) {
      console.log(chalk.yellow('🧪 DRY RUN MODE - Not executing transaction'));
      await sendAlert('DRY RUN: Would execute rebalance');
      return true;
    }
    
    // Estimate gas
    const gasEstimate = await strategy.rebalance.estimateGas();
    console.log(chalk.gray(`Gas estimate: ${gasEstimate.toString()}`));
    
    // Execute rebalance
    const tx = await strategy.rebalance({
      gasLimit: gasEstimate * 120n / 100n // 20% buffer
    });
    
    console.log(chalk.blue(`📝 Transaction sent: ${tx.hash}`));
    await sendAlert(`Rebalance transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt?.status === 1) {
      console.log(chalk.green(`✅ Rebalance successful! Block: ${receipt.blockNumber}`));
      await sendAlert(`✅ Rebalance successful in block ${receipt.blockNumber}`);
      return true;
    } else {
      console.log(chalk.red('❌ Rebalance transaction failed'));
      await sendAlert('❌ Rebalance transaction failed');
      return false;
    }
    
  } catch (error: any) {
    console.error(chalk.red('❌ Rebalance execution failed:'), error.message);
    await sendAlert(`❌ Rebalance failed: ${error.message}`);
    return false;
  }
}

// ============ Main Keeper Loop ============

async function main() {
  console.log(chalk.bold.cyan('\n🤖 DSS Rebalance Keeper Bot\n'));
  
  // Validate environment
  if (!process.env.RPC_URL || !process.env.STRATEGY_ADDRESS || !process.env.PRIVATE_KEY) {
    console.error(chalk.red('❌ Missing required environment variables'));
    console.error('Required: RPC_URL, STRATEGY_ADDRESS, PRIVATE_KEY');
    process.exit(1);
  }
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const strategyAddress = process.env.STRATEGY_ADDRESS;
  
  console.log(chalk.blue('Keeper address:'), wallet.address);
  console.log(chalk.blue('Strategy address:'), strategyAddress);
  
  // Load strategy ABI
  const abiPath = process.env.STRATEGY_ABI_PATH || '../sdk/basic-strategy/artifacts/contracts/HODLStrategy.sol/HODLStrategy.json';
  const strategyArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const strategy = new ethers.Contract(strategyAddress, strategyArtifact.abi, wallet);
  
  // Configure keeper
  const config: KeeperConfig = {
    minRebalanceInterval: parseInt(process.env.MIN_REBALANCE_INTERVAL || '86400'), // 24 hours
    maxGasPrice: ethers.parseUnits(process.env.MAX_GAS_PRICE || '150', 'gwei'),
    dryRun: process.env.DRY_RUN === 'true',
    checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '300000') // 5 minutes
  };
  
  if (config.dryRun) {
    console.log(chalk.yellow('⚠️  Running in DRY RUN mode - no transactions will be executed\n'));
  }
  
  await sendAlert('✅ Keeper bot started');
  
  // Main loop
  let iteration = 0;
  while (true) {
    iteration++;
    console.log(chalk.gray(`\n--- Check #${iteration} ---`));
    
    try {
      const shouldRebalance = await checkRebalanceConditions(strategy, provider, config);
      
      if (shouldRebalance) {
        await executeRebalance(strategy, wallet, config);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error in keeper loop:'), error);
      await sendAlert(`❌ Keeper error: ${error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, config.checkInterval));
  }
}

// Run keeper
main().catch(console.error);


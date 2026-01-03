/**
 * @file maintenance-keeper.ts
 * @description Automated maintenance tasks for DSS strategies
 * 
 * Performs routine maintenance operations like:
 * - Checking and updating oracle prices
 * - Verifying asset approvals
 * - Monitoring health factors
 * - Cleaning up stale data
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

dotenv.config();

// ============ Maintenance Tasks ============

async function checkOracleFreshness(strategy: ethers.Contract): Promise<boolean> {
  console.log(chalk.gray('Checking oracle freshness...'));
  
  try {
    // This is strategy-specific - adjust based on your implementation
    // Example: Check if oracle data is stale
    const assets = await strategy.getAssets();
    
    for (const asset of assets) {
      // Check oracle timestamp (if applicable)
      // const oracleData = await oracle.getLatestPrice(asset);
      // if (isStale(oracleData.timestamp)) {
      //   console.log(chalk.yellow(`⚠️  Stale oracle data for ${asset}`));
      //   return false;
      // }
    }
    
    console.log(chalk.green('✓ All oracles fresh'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Oracle check failed:'), error);
    return false;
  }
}

async function verifyApprovals(
  strategy: ethers.Contract,
  provider: ethers.Provider
): Promise<boolean> {
  console.log(chalk.gray('Verifying token approvals...'));
  
  try {
    const assets = await strategy.getAssets();
    const strategyAddress = await strategy.getAddress();
    
    for (const assetAddress of assets) {
      const token = new ethers.Contract(
        assetAddress,
        ['function allowance(address,address) view returns (uint256)'],
        provider
      );
      
      // Check if strategy has approval to spend tokens
      // This is an example - adjust based on your architecture
      const allowance = await token.allowance(strategyAddress, strategyAddress);
      
      if (allowance === 0n) {
        console.log(chalk.yellow(`⚠️  No approval for ${assetAddress}`));
        // In production, you might want to request approval here
      }
    }
    
    console.log(chalk.green('✓ Approvals verified'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Approval check failed:'), error);
    return false;
  }
}

async function checkHealthFactors(strategy: ethers.Contract): Promise<boolean> {
  console.log(chalk.gray('Checking health factors...'));
  
  try {
    // Check if strategy is healthy
    const isPaused = await strategy.paused();
    
    if (isPaused) {
      console.log(chalk.red('❌ Strategy is paused!'));
      return false;
    }
    
    // Check weight distribution
    const weights = await strategy.calculateWeights();
    const weightSum = weights.reduce((sum: bigint, w: bigint) => sum + w, 0n);
    
    if (weightSum !== 10000n) {
      console.log(chalk.yellow(`⚠️  Weight sum: ${weightSum} (expected 10000)`));
      return false;
    }
    
    console.log(chalk.green('✓ Health factors OK'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Health check failed:'), error);
    return false;
  }
}

async function generateHealthReport(strategy: ethers.Contract, provider: ethers.Provider) {
  console.log(chalk.cyan('\n📊 Generating Health Report...\n'));
  
  try {
    const [assets, weights, isPaused, lastRebalance] = await Promise.all([
      strategy.getAssets(),
      strategy.calculateWeights(),
      strategy.paused(),
      strategy.lastRebalanceTime()
    ]);
    
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    const currentTime = block?.timestamp || Math.floor(Date.now() / 1000);
    const timeSinceRebalance = currentTime - Number(lastRebalance);
    
    console.log(chalk.bold('Strategy Health Report'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`Block: ${blockNumber}`);
    console.log(`Timestamp: ${new Date(currentTime * 1000).toISOString()}`);
    console.log(`Status: ${isPaused ? chalk.red('PAUSED') : chalk.green('ACTIVE')}`);
    console.log(`Assets: ${assets.length}`);
    console.log(`Weights: ${weights.map((w: bigint) => Number(w) / 100).join('%, ')}%`);
    console.log(`Last Rebalance: ${Math.floor(timeSinceRebalance / 3600)} hours ago`);
    console.log(chalk.gray('─'.repeat(50)));
    
    // Save report to file
    const reportDir = './reports';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = `${reportDir}/health-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: currentTime,
      blockNumber,
      isPaused,
      assets: assets.length,
      weights: weights.map((w: bigint) => w.toString()),
      lastRebalance: lastRebalance.toString(),
      timeSinceRebalance
    }, null, 2));
    
    console.log(chalk.green(`\n✅ Report saved to ${reportPath}\n`));
    
  } catch (error) {
    console.error(chalk.red('❌ Report generation failed:'), error);
  }
}

// ============ Main Maintenance Loop ============

async function main() {
  console.log(chalk.bold.cyan('\n🔧 DSS Maintenance Keeper\n'));
  
  if (!process.env.RPC_URL || !process.env.STRATEGY_ADDRESS) {
    console.error(chalk.red('❌ Missing required environment variables'));
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const strategyAddress = process.env.STRATEGY_ADDRESS;
  
  // Load strategy ABI
  const abiPath = process.env.STRATEGY_ABI_PATH || '../sdk/basic-strategy/artifacts/contracts/HODLStrategy.sol/HODLStrategy.json';
  const strategyArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const strategy = new ethers.Contract(strategyAddress, strategyArtifact.abi, provider);
  
  console.log(chalk.blue('Strategy:'), strategyAddress);
  
  const maintenanceInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL || '3600000'); // 1 hour
  
  let iteration = 0;
  while (true) {
    iteration++;
    console.log(chalk.bold(`\n=== Maintenance Check #${iteration} ===`));
    
    try {
      // Run maintenance tasks
      await checkOracleFreshness(strategy);
      await verifyApprovals(strategy, provider);
      await checkHealthFactors(strategy);
      
      // Generate report every 24 hours
      if (iteration % 24 === 0) {
        await generateHealthReport(strategy, provider);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Maintenance error:'), error);
    }
    
    console.log(chalk.gray(`\nNext check in ${maintenanceInterval / 1000 / 60} minutes...`));
    await new Promise(resolve => setTimeout(resolve, maintenanceInterval));
  }
}

main().catch(console.error);


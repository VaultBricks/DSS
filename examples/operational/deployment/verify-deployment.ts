/**
 * @file verify-deployment.ts
 * @description Post-deployment verification for DSS strategies
 * 
 * Comprehensive verification checks to ensure deployment was successful
 * and strategy is configured correctly. Essential for DSS-9.1 compliance.
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

dotenv.config();

// ============ Verification Checks ============

interface VerificationResult {
  check: string;
  passed: boolean;
  details?: string;
}

const results: VerificationResult[] = [];

function addResult(check: string, passed: boolean, details?: string) {
  results.push({ check, passed, details });
  
  const icon = passed ? chalk.green('✅') : chalk.red('❌');
  const message = details ? `${check}: ${details}` : check;
  console.log(`${icon} ${message}`);
}

async function verifyContractDeployed(
  provider: ethers.Provider,
  address: string
): Promise<boolean> {
  console.log(chalk.bold('\n🔍 Contract Deployment'));
  
  const code = await provider.getCode(address);
  const isDeployed = code !== '0x';
  
  addResult('Contract deployed', isDeployed, isDeployed ? address : 'No code at address');
  
  return isDeployed;
}

async function verifyRoles(
  strategy: ethers.Contract,
  expectedRoles: { [role: string]: string }
): Promise<boolean> {
  console.log(chalk.bold('\n🔐 Role Configuration'));
  
  let allPassed = true;
  
  for (const [roleName, expectedAddress] of Object.entries(expectedRoles)) {
    const roleHash = roleName === 'ADMIN' 
      ? ethers.ZeroHash 
      : ethers.id(`${roleName}_ROLE`);
    
    const hasRole = await strategy.hasRole(roleHash, expectedAddress);
    addResult(`${roleName} role`, hasRole, `${expectedAddress}`);
    
    if (!hasRole) allPassed = false;
  }
  
  return allPassed;
}

async function verifyAssets(
  strategy: ethers.Contract,
  expectedAssets: string[]
): Promise<boolean> {
  console.log(chalk.bold('\n💎 Asset Configuration'));
  
  const assets = await strategy.getAssets();
  
  if (assets.length !== expectedAssets.length) {
    addResult('Asset count', false, `Expected ${expectedAssets.length}, got ${assets.length}`);
    return false;
  }
  
  addResult('Asset count', true, `${assets.length} assets`);
  
  let allMatch = true;
  for (let i = 0; i < expectedAssets.length; i++) {
    const matches = assets[i].toLowerCase() === expectedAssets[i].toLowerCase();
    addResult(`Asset ${i}`, matches, assets[i]);
    if (!matches) allMatch = false;
  }
  
  return allMatch;
}

async function verifyWeights(
  strategy: ethers.Contract,
  expectedWeights: number[]
): Promise<boolean> {
  console.log(chalk.bold('\n⚖️  Weight Configuration'));
  
  const weights = await strategy.calculateWeights();
  
  if (weights.length !== expectedWeights.length) {
    addResult('Weight count', false, `Expected ${expectedWeights.length}, got ${weights.length}`);
    return false;
  }
  
  const weightSum = weights.reduce((sum: bigint, w: bigint) => sum + w, 0n);
  addResult('Weight sum', weightSum === 10000n, `${weightSum} (expected 10000)`);
  
  let allMatch = true;
  for (let i = 0; i < expectedWeights.length; i++) {
    const expected = BigInt(expectedWeights[i]);
    const matches = weights[i] === expected;
    addResult(`Weight ${i}`, matches, `${weights[i]} (expected ${expected})`);
    if (!matches) allMatch = false;
  }
  
  return weightSum === 10000n && allMatch;
}

async function verifyPauseStatus(strategy: ethers.Contract): Promise<boolean> {
  console.log(chalk.bold('\n⏸️  Pause Status'));
  
  const isPaused = await strategy.paused();
  addResult('Not paused', !isPaused, isPaused ? 'Strategy is paused!' : 'Active');
  
  return !isPaused;
}

async function verifyInitialState(strategy: ethers.Contract): Promise<boolean> {
  console.log(chalk.bold('\n📊 Initial State'));
  
  try {
    const lastRebalance = await strategy.lastRebalanceTime();
    addResult('Last rebalance time set', lastRebalance > 0n, `${lastRebalance}`);
    
    // Check if strategy can be rebalanced
    const shouldRebalance = await strategy.shouldRebalance();
    addResult('Rebalance check works', true, `shouldRebalance: ${shouldRebalance}`);
    
    return true;
  } catch (error: any) {
    addResult('Initial state check', false, error.message);
    return false;
  }
}

async function verifyNoDeployerAdmin(
  strategy: ethers.Contract,
  deployerAddress: string
): Promise<boolean> {
  console.log(chalk.bold('\n🔓 Deployer Admin Renounced'));
  
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const hasAdmin = await strategy.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
  
  addResult('Deployer admin renounced', !hasAdmin, 
    hasAdmin ? 'Deployer still has admin!' : 'Admin properly transferred');
  
  return !hasAdmin;
}

// ============ Main Verification ============

async function main() {
  console.log(chalk.bold.cyan('\n🔍 DSS Deployment Verification\n'));
  
  // Load deployment report
  const deploymentPath = process.env.DEPLOYMENT_REPORT || './deployments/latest.json';
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(chalk.red(`❌ Deployment report not found: ${deploymentPath}`));
    console.error('Run deploy-with-multisig.ts first or specify DEPLOYMENT_REPORT');
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
  
  console.log(chalk.blue('Strategy:'), deployment.strategyAddress);
  console.log(chalk.blue('Network:'), deployment.network);
  console.log(chalk.blue('Deployed:'), deployment.timestamp);
  console.log();
  
  // Setup provider and contract
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const abiPath = process.env.STRATEGY_ABI_PATH || '../sdk/basic-strategy/artifacts/contracts/HODLStrategy.sol/HODLStrategy.json';
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const strategy = new ethers.Contract(deployment.strategyAddress, artifact.abi, provider);
  
  // Run verification checks
  await verifyContractDeployed(provider, deployment.strategyAddress);
  
  await verifyRoles(strategy, {
    'ADMIN': deployment.multisig,
    'KEEPER': deployment.keeper,
    'GUARDIAN': deployment.guardian
  });
  
  await verifyAssets(strategy, deployment.assets);
  await verifyWeights(strategy, deployment.weights);
  await verifyPauseStatus(strategy);
  await verifyInitialState(strategy);
  await verifyNoDeployerAdmin(strategy, deployment.deployer);
  
  // Summary
  console.log(chalk.bold('\n📋 Verification Summary'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`Passed: ${passed}/${total} (${percentage}%)`);
  
  if (passed === total) {
    console.log(chalk.bold.green('\n✅ All verification checks passed!\n'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ Some verification checks failed!\n'));
    console.log(chalk.yellow('Failed checks:'));
    results.filter(r => !r.passed).forEach(r => {
      console.log(chalk.red(`  - ${r.check}: ${r.details || 'Failed'}`));
    });
    process.exit(1);
  }
}

main().catch(console.error);


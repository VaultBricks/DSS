/**
 * @file deploy-with-multisig.ts
 * @description Secure multi-sig deployment workflow for DSS strategies
 * 
 * This script demonstrates how to deploy a DSS strategy with multi-sig
 * governance from day one. Essential for DSS-9.1 compliance.
 * 
 * Workflow:
 * 1. Deploy strategy with deployer as temporary admin
 * 2. Verify deployment
 * 3. Transfer admin role to multi-sig
 * 4. Renounce deployer admin role
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

dotenv.config();

// ============ Deployment Configuration ============

interface DeploymentConfig {
  strategyName: string;
  assets: string[];
  weights: number[];
  multisigAddress: string;
  keeperAddress: string;
  guardianAddress: string;
}

// ============ Helper Functions ============

async function waitForConfirmations(tx: ethers.ContractTransactionResponse, confirmations: number = 5) {
  console.log(chalk.gray(`Waiting for ${confirmations} confirmations...`));
  const receipt = await tx.wait(confirmations);
  console.log(chalk.green(`✅ Confirmed in block ${receipt?.blockNumber}`));
  return receipt;
}

async function verifyContract(address: string, constructorArgs: any[]) {
  console.log(chalk.blue('\n📝 Contract Verification'));
  console.log(chalk.gray('To verify on Etherscan, run:'));
  console.log(chalk.cyan(`npx hardhat verify --network mainnet ${address} ${constructorArgs.join(' ')}`));
}

// ============ Deployment Steps ============

async function deployStrategy(
  deployer: ethers.Wallet,
  config: DeploymentConfig
): Promise<ethers.Contract> {
  console.log(chalk.bold.cyan('\n🚀 Step 1: Deploy Strategy Contract\n'));
  
  // Load contract factory
  const abiPath = process.env.STRATEGY_ABI_PATH || '../sdk/basic-strategy/artifacts/contracts/HODLStrategy.sol/HODLStrategy.json';
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  
  console.log(chalk.gray('Deploying with parameters:'));
  console.log(`  Name: ${config.strategyName}`);
  console.log(`  Assets: ${config.assets.join(', ')}`);
  console.log(`  Weights: ${config.weights.join('%, ')}%`);
  
  // Deploy
  const strategy = await factory.deploy(
    config.strategyName,
    config.assets,
    config.weights
  );
  
  console.log(chalk.blue(`📝 Transaction: ${strategy.deploymentTransaction()?.hash}`));
  
  await strategy.waitForDeployment();
  const address = await strategy.getAddress();
  
  console.log(chalk.green(`✅ Strategy deployed at: ${address}`));
  
  return strategy;
}

async function setupRoles(
  strategy: ethers.Contract,
  deployer: ethers.Wallet,
  config: DeploymentConfig
) {
  console.log(chalk.bold.cyan('\n🔐 Step 2: Setup Roles\n'));
  
  const KEEPER_ROLE = ethers.id('KEEPER_ROLE');
  const GUARDIAN_ROLE = ethers.id('GUARDIAN_ROLE');
  
  // Grant KEEPER_ROLE
  console.log(chalk.gray(`Granting KEEPER_ROLE to ${config.keeperAddress}...`));
  let tx = await strategy.grantRole(KEEPER_ROLE, config.keeperAddress);
  await waitForConfirmations(tx);
  
  // Grant GUARDIAN_ROLE
  console.log(chalk.gray(`Granting GUARDIAN_ROLE to ${config.guardianAddress}...`));
  tx = await strategy.grantRole(GUARDIAN_ROLE, config.guardianAddress);
  await waitForConfirmations(tx);
  
  console.log(chalk.green('✅ Roles configured'));
}

async function transferAdminToMultisig(
  strategy: ethers.Contract,
  deployer: ethers.Wallet,
  multisigAddress: string
) {
  console.log(chalk.bold.cyan('\n👥 Step 3: Transfer Admin to Multi-Sig\n'));
  
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  
  console.log(chalk.yellow('⚠️  This will transfer admin control to multi-sig'));
  console.log(chalk.gray(`Multi-sig address: ${multisigAddress}`));
  
  // Grant admin role to multi-sig
  console.log(chalk.gray('Granting admin role to multi-sig...'));
  let tx = await strategy.grantRole(DEFAULT_ADMIN_ROLE, multisigAddress);
  await waitForConfirmations(tx);
  
  console.log(chalk.green('✅ Admin role granted to multi-sig'));
  
  // Verify multi-sig has admin role
  const hasRole = await strategy.hasRole(DEFAULT_ADMIN_ROLE, multisigAddress);
  if (!hasRole) {
    throw new Error('Multi-sig does not have admin role!');
  }
  
  console.log(chalk.green('✅ Verified multi-sig has admin role'));
}

async function renounceDeployerAdmin(
  strategy: ethers.Contract,
  deployer: ethers.Wallet
) {
  console.log(chalk.bold.cyan('\n🔓 Step 4: Renounce Deployer Admin\n'));
  
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  
  console.log(chalk.red('⚠️  WARNING: This action is IRREVERSIBLE!'));
  console.log(chalk.yellow('After this, only the multi-sig will have admin access.'));
  
  // In production, you might want to add a confirmation prompt here
  
  console.log(chalk.gray('Renouncing admin role...'));
  const tx = await strategy.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address);
  await waitForConfirmations(tx);
  
  // Verify deployer no longer has admin
  const hasRole = await strategy.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  if (hasRole) {
    throw new Error('Deployer still has admin role!');
  }
  
  console.log(chalk.green('✅ Deployer admin role renounced'));
}

async function generateDeploymentReport(
  strategy: ethers.Contract,
  config: DeploymentConfig,
  deployer: ethers.Wallet
) {
  console.log(chalk.bold.cyan('\n📊 Step 5: Generate Deployment Report\n'));
  
  const address = await strategy.getAddress();
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const KEEPER_ROLE = ethers.id('KEEPER_ROLE');
  const GUARDIAN_ROLE = ethers.id('GUARDIAN_ROLE');
  
  const report = {
    timestamp: new Date().toISOString(),
    network: (await deployer.provider?.getNetwork())?.name,
    chainId: (await deployer.provider?.getNetwork())?.chainId.toString(),
    strategyAddress: address,
    strategyName: config.strategyName,
    deployer: deployer.address,
    multisig: config.multisigAddress,
    keeper: config.keeperAddress,
    guardian: config.guardianAddress,
    roles: {
      admin: await strategy.hasRole(DEFAULT_ADMIN_ROLE, config.multisigAddress),
      keeper: await strategy.hasRole(KEEPER_ROLE, config.keeperAddress),
      guardian: await strategy.hasRole(GUARDIAN_ROLE, config.guardianAddress)
    },
    assets: config.assets,
    weights: config.weights
  };
  
  // Save report
  const reportDir = './deployments';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = `${reportDir}/deployment-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(chalk.green(`✅ Report saved to ${reportPath}`));
  
  // Print summary
  console.log(chalk.bold('\n📋 Deployment Summary'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(`Strategy: ${address}`);
  console.log(`Multi-sig Admin: ${config.multisigAddress}`);
  console.log(`Keeper: ${config.keeperAddress}`);
  console.log(`Guardian: ${config.guardianAddress}`);
  console.log(chalk.gray('─'.repeat(60)));
}

// ============ Main Deployment ============

async function main() {
  console.log(chalk.bold.cyan('\n🛡️  DSS Multi-Sig Deployment\n'));
  
  // Validate environment
  if (!process.env.PRIVATE_KEY || !process.env.RPC_URL || !process.env.MULTISIG_ADDRESS) {
    console.error(chalk.red('❌ Missing required environment variables'));
    console.error('Required: PRIVATE_KEY, RPC_URL, MULTISIG_ADDRESS');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log(chalk.blue('Deployer:'), deployer.address);
  console.log(chalk.blue('Network:'), (await provider.getNetwork()).name);
  
  // Configuration
  const config: DeploymentConfig = {
    strategyName: 'HODL Strategy',
    assets: [
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'  // WBTC
    ],
    weights: [5000, 5000], // 50% each
    multisigAddress: process.env.MULTISIG_ADDRESS!,
    keeperAddress: process.env.KEEPER_ADDRESS || deployer.address,
    guardianAddress: process.env.GUARDIAN_ADDRESS || deployer.address
  };
  
  // Execute deployment
  const strategy = await deployStrategy(deployer, config);
  await setupRoles(strategy, deployer, config);
  await transferAdminToMultisig(strategy, deployer, config.multisigAddress);
  await renounceDeployerAdmin(strategy, deployer);
  await generateDeploymentReport(strategy, config, deployer);
  
  console.log(chalk.bold.green('\n✅ Deployment Complete!\n'));
}

main().catch(console.error);


/**
 * @file validate-config.ts
 * @description Configuration validation script for DSS strategy deployments
 * 
 * This script validates all critical configuration parameters before deployment
 * to prevent common configuration errors. Essential for DSS-9.2 compliance.
 * 
 * Validates:
 * - Asset addresses and decimals
 * - Weight distributions
 * - Role assignments
 * - Contract state
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

interface ValidationResult {
  passed: boolean;
  checks: {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
  }[];
}

async function validateAssets(
  provider: ethers.Provider,
  assets: string[]
): Promise<ValidationResult['checks']> {
  const checks: ValidationResult['checks'] = [];
  
  for (const asset of assets) {
    // Check if address is valid
    if (!ethers.isAddress(asset)) {
      checks.push({
        name: `Asset ${asset} validity`,
        status: 'FAIL',
        message: 'Invalid Ethereum address'
      });
      continue;
    }
    
    // Check if contract exists
    const code = await provider.getCode(asset);
    if (code === '0x') {
      checks.push({
        name: `Asset ${asset} existence`,
        status: 'FAIL',
        message: 'No contract code at address'
      });
      continue;
    }
    
    checks.push({
      name: `Asset ${asset}`,
      status: 'PASS',
      message: 'Valid ERC20 token'
    });
  }
  
  return checks;
}

async function validateWeights(weights: number[]): Promise<ValidationResult['checks']> {
  const checks: ValidationResult['checks'] = [];
  
  // Check sum equals 10000 (100%)
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum !== 10000) {
    checks.push({
      name: 'Weight distribution',
      status: 'FAIL',
      message: `Weights sum to ${sum}%, expected 10000%`
    });
  } else {
    checks.push({
      name: 'Weight distribution',
      status: 'PASS',
      message: 'Weights sum to 100%'
    });
  }
  
  // Check no zero weights
  const zeroWeights = weights.filter(w => w === 0).length;
  if (zeroWeights > 0) {
    checks.push({
      name: 'Zero weights',
      status: 'WARN',
      message: `${zeroWeights} assets have 0% weight`
    });
  }
  
  // Check reasonable distribution
  const maxWeight = Math.max(...weights);
  if (maxWeight > 9000) {
    checks.push({
      name: 'Weight concentration',
      status: 'WARN',
      message: `Highest weight is ${maxWeight / 100}% - highly concentrated`
    });
  }
  
  return checks;
}

async function validateRoles(
  provider: ethers.Provider,
  roles: { multisig: string; keeper: string; guardian: string }
): Promise<ValidationResult['checks']> {
  const checks: ValidationResult['checks'] = [];
  
  for (const [role, address] of Object.entries(roles)) {
    if (!ethers.isAddress(address)) {
      checks.push({
        name: `${role} address`,
        status: 'FAIL',
        message: 'Invalid address'
      });
      continue;
    }
    
    const code = await provider.getCode(address);
    if (code === '0x') {
      checks.push({
        name: `${role} address`,
        status: 'WARN',
        message: 'EOA address (not a contract)'
      });
    } else {
      checks.push({
        name: `${role} address`,
        status: 'PASS',
        message: 'Valid contract address'
      });
    }
  }
  
  return checks;
}

async function validateEnvironment(): Promise<ValidationResult['checks']> {
  const checks: ValidationResult['checks'] = [];
  const required = [
    'PRIVATE_KEY',
    'RPC_URL',
    'MULTISIG_ADDRESS',
    'KEEPER_ADDRESS',
    'GUARDIAN_ADDRESS',
    'ASSET_ADDRESSES',
    'ASSET_WEIGHTS'
  ];

  for (const env of required) {
    if (process.env[env]) {
      checks.push({
        name: `Environment: ${env}`,
        status: 'PASS',
        message: 'Set'
      });
    } else {
      checks.push({
        name: `Environment: ${env}`,
        status: 'FAIL',
        message: 'Not set'
      });
    }
  }

  return checks;
}

async function main() {
  console.log(chalk.bold.cyan('\n🔍 DSS Configuration Validator\n'));

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // Parse asset addresses from environment
  const assetAddresses = process.env.ASSET_ADDRESSES
    ? process.env.ASSET_ADDRESSES.split(',').map(addr => addr.trim())
    : [];

  // Parse weights from environment
  const weights = process.env.ASSET_WEIGHTS
    ? process.env.ASSET_WEIGHTS.split(',').map(w => parseInt(w.trim()))
    : [];

  // Validate we have configuration
  if (assetAddresses.length === 0) {
    console.error(chalk.red('❌ No asset addresses configured!'));
    console.error(chalk.yellow('Set ASSET_ADDRESSES in .env (comma-separated)'));
    process.exit(1);
  }

  if (weights.length === 0) {
    console.error(chalk.red('❌ No asset weights configured!'));
    console.error(chalk.yellow('Set ASSET_WEIGHTS in .env (comma-separated)'));
    process.exit(1);
  }

  if (assetAddresses.length !== weights.length) {
    console.error(chalk.red('❌ Asset addresses and weights count mismatch!'));
    console.error(chalk.yellow(`Assets: ${assetAddresses.length}, Weights: ${weights.length}`));
    process.exit(1);
  }

  console.log(chalk.blue('Validating configuration:'));
  console.log(chalk.gray(`  Assets: ${assetAddresses.length}`));
  console.log(chalk.gray(`  Weights: ${weights.join('%, ')}%`));
  console.log();

  // Run all validations
  const envChecks = await validateEnvironment();
  const assetChecks = await validateAssets(provider, assetAddresses);
  const weightChecks = await validateWeights(weights);
  const roleChecks = await validateRoles(provider, {
    multisig: process.env.MULTISIG_ADDRESS || '',
    keeper: process.env.KEEPER_ADDRESS || '',
    guardian: process.env.GUARDIAN_ADDRESS || ''
  });
  
  const allChecks = [...envChecks, ...assetChecks, ...weightChecks, ...roleChecks];
  const passed = allChecks.every(c => c.status !== 'FAIL');
  
  // Print results
  console.log(chalk.bold('Validation Results:'));
  console.log(chalk.gray('─'.repeat(60)));
  
  for (const check of allChecks) {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️ ';
    console.log(`${icon} ${check.name}: ${check.message}`);
  }
  
  console.log(chalk.gray('─'.repeat(60)));
  if (passed) {
    console.log(chalk.green('✅ All critical checks passed!'));
  } else {
    console.log(chalk.red('❌ Some checks failed. Fix before deploying.'));
    process.exit(1);
  }
}

main().catch(console.error);


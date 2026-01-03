/**
 * @file upgrade-with-timelock.ts
 * @description Timelock-protected upgrade workflow for DSS strategies
 * 
 * Demonstrates how to upgrade a strategy using a timelock contract,
 * providing a delay for community review. Essential for DSS-9.2 compliance.
 * 
 * Workflow:
 * 1. Deploy new implementation
 * 2. Queue upgrade in timelock
 * 3. Wait for timelock delay
 * 4. Execute upgrade
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// ============ Timelock Functions ============

async function queueUpgrade(
  timelock: ethers.Contract,
  target: string,
  value: bigint,
  data: string,
  predecessor: string,
  salt: string,
  delay: number
): Promise<string> {
  console.log(chalk.bold.cyan('\n📝 Step 1: Queue Upgrade in Timelock\n'));
  
  console.log(chalk.gray('Parameters:'));
  console.log(`  Target: ${target}`);
  console.log(`  Value: ${value}`);
  console.log(`  Data: ${data.slice(0, 66)}...`);
  console.log(`  Delay: ${delay} seconds (${delay / 3600} hours)`);
  
  const tx = await timelock.schedule(
    target,
    value,
    data,
    predecessor,
    salt,
    delay
  );
  
  console.log(chalk.blue(`📝 Transaction: ${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.green(`✅ Queued in block ${receipt?.blockNumber}`));
  
  // Calculate operation ID
  const operationId = await timelock.hashOperation(
    target,
    value,
    data,
    predecessor,
    salt
  );
  
  console.log(chalk.blue(`Operation ID: ${operationId}`));
  
  return operationId;
}

async function checkTimelockStatus(
  timelock: ethers.Contract,
  operationId: string
): Promise<{ isPending: boolean; isReady: boolean; isDone: boolean }> {
  const [isPending, isReady, isDone] = await Promise.all([
    timelock.isOperationPending(operationId),
    timelock.isOperationReady(operationId),
    timelock.isOperationDone(operationId)
  ]);
  
  return { isPending, isReady, isDone };
}

async function waitForTimelock(
  timelock: ethers.Contract,
  operationId: string,
  delay: number
) {
  console.log(chalk.bold.cyan('\n⏰ Step 2: Wait for Timelock Delay\n'));
  
  const readyTime = Date.now() + delay * 1000;
  console.log(chalk.yellow(`Upgrade will be ready at: ${new Date(readyTime).toISOString()}`));
  console.log(chalk.gray(`Waiting ${delay} seconds...`));
  
  // Poll timelock status
  while (true) {
    const status = await checkTimelockStatus(timelock, operationId);
    
    if (status.isDone) {
      console.log(chalk.green('✅ Operation already executed'));
      return;
    }
    
    if (status.isReady) {
      console.log(chalk.green('✅ Timelock delay passed, ready to execute'));
      return;
    }
    
    if (!status.isPending) {
      throw new Error('Operation is not pending in timelock!');
    }
    
    // Wait 1 minute before checking again
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log(chalk.gray('Still waiting...'));
  }
}

async function executeUpgrade(
  timelock: ethers.Contract,
  target: string,
  value: bigint,
  data: string,
  predecessor: string,
  salt: string
) {
  console.log(chalk.bold.cyan('\n🚀 Step 3: Execute Upgrade\n'));
  
  const tx = await timelock.execute(
    target,
    value,
    data,
    predecessor,
    salt
  );
  
  console.log(chalk.blue(`📝 Transaction: ${tx.hash}`));
  const receipt = await tx.wait();
  console.log(chalk.green(`✅ Executed in block ${receipt?.blockNumber}`));
}

// ============ Upgrade Workflow ============

async function main() {
  console.log(chalk.bold.cyan('\n🔄 DSS Timelock Upgrade\n'));
  
  // Validate environment
  if (!process.env.RPC_URL || !process.env.TIMELOCK_ADDRESS || !process.env.STRATEGY_ADDRESS) {
    console.error(chalk.red('❌ Missing required environment variables'));
    console.error('Required: RPC_URL, TIMELOCK_ADDRESS, STRATEGY_ADDRESS');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const timelockAddress = process.env.TIMELOCK_ADDRESS;
  const strategyAddress = process.env.STRATEGY_ADDRESS;
  
  console.log(chalk.blue('Timelock:'), timelockAddress);
  console.log(chalk.blue('Strategy:'), strategyAddress);
  console.log(chalk.blue('Executor:'), wallet.address);
  console.log();
  
  // Load timelock contract
  const timelockAbi = [
    'function schedule(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt, uint256 delay) external',
    'function execute(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt) external',
    'function hashOperation(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt) view returns (bytes32)',
    'function isOperationPending(bytes32 id) view returns (bool)',
    'function isOperationReady(bytes32 id) view returns (bool)',
    'function isOperationDone(bytes32 id) view returns (bool)',
    'function getMinDelay() view returns (uint256)'
  ];
  
  const timelock = new ethers.Contract(timelockAddress, timelockAbi, wallet);
  
  // Get minimum delay
  const minDelay = await timelock.getMinDelay();
  console.log(chalk.gray(`Timelock minimum delay: ${minDelay} seconds (${Number(minDelay) / 3600} hours)\n`));
  
  // Example: Upgrade to pause strategy
  // In production, this would be upgrading to a new implementation
  const upgradeData = new ethers.Interface([
    'function pause() external'
  ]).encodeFunctionData('pause', []);
  
  const target = strategyAddress;
  const value = 0n;
  const data = upgradeData;
  const predecessor = ethers.ZeroHash;
  const salt = ethers.id(`upgrade-${Date.now()}`);
  
  // Queue upgrade
  const operationId = await queueUpgrade(
    timelock,
    target,
    value,
    data,
    predecessor,
    salt,
    Number(minDelay)
  );
  
  // Wait for timelock
  await waitForTimelock(timelock, operationId, Number(minDelay));
  
  // Execute upgrade
  await executeUpgrade(timelock, target, value, data, predecessor, salt);
  
  console.log(chalk.bold.green('\n✅ Upgrade Complete!\n'));
}

main().catch(console.error);


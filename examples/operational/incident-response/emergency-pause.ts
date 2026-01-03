/**
 * @file emergency-pause.ts
 * @description Emergency pause script for DSS strategies
 * 
 * This script immediately pauses a strategy in case of security incident.
 * Should be executed by guardian or multi-sig in emergency situations.
 * 
 * DSS-9.4: Incident Response (Gold certification)
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

dotenv.config();

// ============ Alert Functions ============

async function sendCriticalAlert(message: string) {
  const timestamp = new Date().toISOString();
  console.log(chalk.bold.red(`\n🚨 CRITICAL ALERT 🚨`));
  console.log(chalk.red(`${timestamp} - ${message}\n`));
  
  // Log to file
  const logDir = './logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const incidentLog = `${logDir}/incident-${Date.now()}.log`;
  fs.writeFileSync(incidentLog, `${timestamp} - EMERGENCY PAUSE\n${message}\n`);
  
  // Send to all alert channels
  const alerts = [];
  
  // Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    alerts.push(sendSlackAlert(message));
  }
  
  // Telegram
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    alerts.push(sendTelegramAlert(message));
  }
  
  // Discord
  if (process.env.DISCORD_WEBHOOK_URL) {
    alerts.push(sendDiscordAlert(message));
  }
  
  await Promise.allSettled(alerts);
  
  console.log(chalk.green(`✅ Incident logged to: ${incidentLog}`));
}

async function sendSlackAlert(message: string) {
  try {
    const axios = (await import('axios')).default;
    await axios.post(process.env.SLACK_WEBHOOK_URL!, {
      text: `🚨 *EMERGENCY PAUSE EXECUTED* 🚨\n\n${message}`,
      username: 'DSS Emergency Bot',
      icon_emoji: ':rotating_light:'
    });
    console.log(chalk.green('✅ Slack alert sent'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to send Slack alert:'), error);
  }
}

async function sendTelegramAlert(message: string) {
  try {
    const axios = (await import('axios')).default;
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `🚨 EMERGENCY PAUSE EXECUTED 🚨\n\n${message}`,
        parse_mode: 'Markdown'
      }
    );
    console.log(chalk.green('✅ Telegram alert sent'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to send Telegram alert:'), error);
  }
}

async function sendDiscordAlert(message: string) {
  try {
    const axios = (await import('axios')).default;
    await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
      content: `🚨 **EMERGENCY PAUSE EXECUTED** 🚨\n\n${message}`
    });
    console.log(chalk.green('✅ Discord alert sent'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to send Discord alert:'), error);
  }
}

// ============ Emergency Pause ============

async function executePause(
  strategy: ethers.Contract,
  guardian: ethers.Wallet,
  reason: string
): Promise<boolean> {
  try {
    console.log(chalk.bold.red('\n⏸️  EXECUTING EMERGENCY PAUSE\n'));
    
    // Check if already paused
    const isPaused = await strategy.paused();
    if (isPaused) {
      console.log(chalk.yellow('⚠️  Strategy is already paused'));
      await sendCriticalAlert(`Strategy already paused. Reason: ${reason}`);
      return true;
    }
    
    // Estimate gas
    console.log(chalk.gray('Estimating gas...'));
    const gasEstimate = await strategy.pause.estimateGas();
    console.log(chalk.gray(`Gas estimate: ${gasEstimate.toString()}`));
    
    // Execute pause with high gas price for fast confirmation
    const feeData = await guardian.provider!.getFeeData();
    const maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas || 0n) * 2n; // 2x priority
    const maxFeePerGas = (feeData.maxFeePerGas || 0n) * 2n; // 2x max fee
    
    console.log(chalk.yellow('⚡ Using high gas price for fast confirmation'));
    console.log(chalk.gray(`Max fee: ${ethers.formatUnits(maxFeePerGas, 'gwei')} gwei`));
    
    const tx = await strategy.pause({
      gasLimit: gasEstimate * 120n / 100n, // 20% buffer
      maxPriorityFeePerGas,
      maxFeePerGas
    });
    
    console.log(chalk.blue(`\n📝 Transaction sent: ${tx.hash}`));
    console.log(chalk.gray('Waiting for confirmation...'));
    
    const receipt = await tx.wait(1); // Wait for 1 confirmation
    
    if (receipt?.status === 1) {
      console.log(chalk.green(`\n✅ PAUSE SUCCESSFUL`));
      console.log(chalk.green(`Block: ${receipt.blockNumber}`));
      console.log(chalk.green(`Gas used: ${receipt.gasUsed.toString()}`));
      
      await sendCriticalAlert(
        `Strategy paused successfully!\n` +
        `Transaction: ${tx.hash}\n` +
        `Block: ${receipt.blockNumber}\n` +
        `Reason: ${reason}\n` +
        `Executor: ${guardian.address}`
      );
      
      return true;
    } else {
      console.log(chalk.red('\n❌ PAUSE FAILED'));
      await sendCriticalAlert(`Emergency pause transaction failed! TX: ${tx.hash}`);
      return false;
    }
    
  } catch (error: any) {
    console.error(chalk.red('\n❌ PAUSE EXECUTION FAILED:'), error.message);
    await sendCriticalAlert(`Emergency pause failed: ${error.message}`);
    return false;
  }
}

// ============ Main ============

async function main() {
  console.log(chalk.bold.red('\n🚨 DSS EMERGENCY PAUSE 🚨\n'));
  
  // Validate environment
  if (!process.env.RPC_URL || !process.env.STRATEGY_ADDRESS || !process.env.PRIVATE_KEY) {
    console.error(chalk.red('❌ Missing required environment variables'));
    console.error('Required: RPC_URL, STRATEGY_ADDRESS, PRIVATE_KEY');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const guardian = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const strategyAddress = process.env.STRATEGY_ADDRESS;
  
  console.log(chalk.blue('Guardian:'), guardian.address);
  console.log(chalk.blue('Strategy:'), strategyAddress);
  console.log(chalk.blue('Network:'), (await provider.getNetwork()).name);
  console.log();
  
  // Load strategy contract
  const abiPath = process.env.STRATEGY_ABI_PATH || '../sdk/basic-strategy/artifacts/contracts/HODLStrategy.sol/HODLStrategy.json';
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const strategy = new ethers.Contract(strategyAddress, artifact.abi, guardian);
  
  // Verify guardian has GUARDIAN_ROLE
  const GUARDIAN_ROLE = ethers.id('GUARDIAN_ROLE');
  const hasRole = await strategy.hasRole(GUARDIAN_ROLE, guardian.address);
  
  if (!hasRole) {
    console.error(chalk.red('❌ Guardian does not have GUARDIAN_ROLE'));
    console.error(chalk.yellow('This address cannot pause the strategy'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Guardian role verified\n'));
  
  // Get reason from command line or use default
  const reason = process.argv[2] || 'Emergency pause - security incident';
  
  console.log(chalk.yellow('Reason:'), reason);
  console.log();
  
  // Execute pause
  const success = await executePause(strategy, guardian, reason);
  
  if (success) {
    console.log(chalk.bold.green('\n✅ EMERGENCY PAUSE COMPLETE\n'));
    console.log(chalk.yellow('Next steps:'));
    console.log('1. Investigate the incident');
    console.log('2. Document findings');
    console.log('3. Develop and test fix');
    console.log('4. Deploy fix (if needed)');
    console.log('5. Unpause strategy');
    console.log('6. Conduct post-mortem\n');
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ EMERGENCY PAUSE FAILED\n'));
    console.log(chalk.red('Manual intervention required!'));
    process.exit(1);
  }
}

main().catch(console.error);


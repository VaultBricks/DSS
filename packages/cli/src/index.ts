#!/usr/bin/env node

/**
 * @file index.ts
 * @description Main entry point for DSS CLI tool
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { checkCommand } from './commands/check';
import { reportCommand } from './commands/report';

const program = new Command();

program
  .name('dss')
  .description('DeFi Strategy Standard (DSS) CLI - Tools for creating and certifying DSS-compliant strategies')
  .version('1.2.0-alpha.0');

// dss init
program
  .command('init')
  .description('Initialize a new DSS-compliant strategy project')
  .option('-n, --name <name>', 'Project name')
  .option('-f, --framework <framework>', 'Framework (hardhat|foundry)', 'hardhat')
  .option('-t, --template <template>', 'Strategy template (basic|rebalancing|lending)', 'basic')
  .action(initCommand);

// dss check
program
  .command('check')
  .description('Check DSS compliance of current project')
  .option('-l, --level <level>', 'Target certification level (bronze|silver|gold)', 'silver')
  .option('-v, --verbose', 'Verbose output', false)
  .action(checkCommand);

// dss report
program
  .command('report')
  .description('Generate DSS certification report')
  .option('-o, --output <file>', 'Output file path', 'DSS_REPORT.md')
  .option('-l, --level <level>', 'Target certification level', 'silver')
  .action(reportCommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}




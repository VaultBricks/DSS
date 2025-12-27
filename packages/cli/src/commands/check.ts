/**
 * @file commands/check.ts
 * @description Check DSS compliance of current project
 */

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

interface CheckOptions {
  level: 'bronze' | 'silver' | 'gold';
  verbose: boolean;
}

interface CheckResult {
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
}

export async function checkCommand(options: CheckOptions) {
  console.log(chalk.bold.cyan('\n🔍 DSS Compliance Check\n'));
  console.log(chalk.gray(`Target Level: ${options.level.toUpperCase()}\n`));

  const results: CheckResult[] = [];

  // Check project structure
  const structureSpinner = ora('Checking project structure...').start();
  results.push(...await checkProjectStructure());
  structureSpinner.succeed('Project structure checked');

  // Check required files
  const filesSpinner = ora('Checking required files...').start();
  results.push(...await checkRequiredFiles(options.level));
  filesSpinner.succeed('Required files checked');

  // Check contract structure
  const contractsSpinner = ora('Checking contracts...').start();
  results.push(...await checkContracts());
  contractsSpinner.succeed('Contracts checked');

  // Check tests
  const testsSpinner = ora('Checking tests...').start();
  results.push(...await checkTests(options.level));
  testsSpinner.succeed('Tests checked');

  // Display results
  displayResults(results, options);
}

async function checkProjectStructure(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const requiredDirs = ['contracts', 'test'];

  for (const dir of requiredDirs) {
    const exists = await fs.pathExists(path.join(process.cwd(), dir));
    results.push({
      category: 'Structure',
      requirement: `${dir}/ directory exists`,
      status: exists ? 'pass' : 'fail',
      message: exists ? undefined : `Missing ${dir}/ directory`
    });
  }

  return results;
}

async function checkRequiredFiles(level: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  
  const requiredFiles = [
    { file: 'README.md', required: 'all' },
    { file: 'SECURITY.md', required: 'silver' },
    { file: 'AUDIT_REPORT.md', required: 'gold' }
  ];

  for (const { file, required } of requiredFiles) {
    const shouldCheck = required === 'all' || 
      (required === 'silver' && ['silver', 'gold'].includes(level)) ||
      (required === 'gold' && level === 'gold');

    if (!shouldCheck) continue;

    const exists = await fs.pathExists(path.join(process.cwd(), file));
    results.push({
      category: 'Documentation',
      requirement: `${file} exists`,
      status: exists ? 'pass' : (required === 'gold' ? 'warn' : 'fail'),
      message: exists ? undefined : `Missing ${file}`
    });
  }

  return results;
}

async function checkContracts(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const contractsDir = path.join(process.cwd(), 'contracts');

  if (!await fs.pathExists(contractsDir)) {
    results.push({
      category: 'Contracts',
      requirement: 'Strategy contract exists',
      status: 'fail',
      message: 'No contracts/ directory found'
    });
    return results;
  }

  const files = await fs.readdir(contractsDir);
  const solFiles = files.filter(f => f.endsWith('.sol'));

  results.push({
    category: 'Contracts',
    requirement: 'At least one .sol file',
    status: solFiles.length > 0 ? 'pass' : 'fail',
    message: solFiles.length > 0 ? `Found ${solFiles.length} contract(s)` : 'No contracts found'
  });

  // Check for IDSSStrategy implementation (basic)
  for (const file of solFiles) {
    const content = await fs.readFile(path.join(contractsDir, file), 'utf-8');
    
    const hasIDSSStrategy = content.includes('IDSSStrategy');
    if (hasIDSSStrategy) {
      results.push({
        category: 'Contracts',
        requirement: 'Implements IDSSStrategy',
        status: 'pass',
        message: `${file} implements IDSSStrategy`
      });
      break;
    }
  }

  return results;
}

async function checkTests(level: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const testDir = path.join(process.cwd(), 'test');

  if (!await fs.pathExists(testDir)) {
    results.push({
      category: 'Tests',
      requirement: 'Test files exist',
      status: 'fail',
      message: 'No test/ directory found'
    });
    return results;
  }

  const files = await fs.readdir(testDir);
  const testFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.sol'));

  results.push({
    category: 'Tests',
    requirement: 'Test files exist',
    status: testFiles.length > 0 ? 'pass' : 'fail',
    message: testFiles.length > 0 ? `Found ${testFiles.length} test file(s)` : 'No tests found'
  });

  // Check for specific test types
  const testContent = (await Promise.all(
    testFiles.map(f => fs.readFile(path.join(testDir, f), 'utf-8'))
  )).join('\n');

  const checks = [
    { name: 'Core tests', pattern: /DSS-1|calculateWeights|getAssets/, required: 'all' },
    { name: 'Invariant tests', pattern: /InvariantRunner|invariant/i, required: 'silver' },
    { name: 'Fuzzing tests', pattern: /fast-check|fuzz|arbitrary/i, required: 'silver' },
    { name: 'Formal verification', pattern: /certora|halmos|formal/i, required: 'gold' }
  ];

  for (const { name, pattern, required } of checks) {
    const shouldCheck = required === 'all' || 
      (required === 'silver' && ['silver', 'gold'].includes(level)) ||
      (required === 'gold' && level === 'gold');

    if (!shouldCheck) continue;

    const found = pattern.test(testContent);
    results.push({
      category: 'Tests',
      requirement: `${name} implemented`,
      status: found ? 'pass' : (required === 'gold' ? 'warn' : 'fail'),
      message: found ? undefined : `No ${name} found`
    });
  }

  return results;
}

function displayResults(results: CheckResult[], options: CheckOptions) {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold('Check Results'));
  console.log('='.repeat(60) + '\n');

  const categories = [...new Set(results.map(r => r.category))];

  for (const category of categories) {
    console.log(chalk.bold.underline(`\n${category}:`));
    const categoryResults = results.filter(r => r.category === category);

    for (const result of categoryResults) {
      const icon = result.status === 'pass' ? chalk.green('✓') :
                   result.status === 'warn' ? chalk.yellow('⚠') :
                   chalk.red('✗');
      
      const status = result.status === 'pass' ? chalk.green('PASS') :
                     result.status === 'warn' ? chalk.yellow('WARN') :
                     chalk.red('FAIL');

      console.log(`  ${icon} ${result.requirement}: ${status}`);
      if (result.message && options.verbose) {
        console.log(chalk.gray(`     ${result.message}`));
      }
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const warned = results.filter(r => r.status === 'warn').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold('Summary'));
  console.log('='.repeat(60) + '\n');

  console.log(chalk.green(`  ✓ Passed: ${passed}/${total}`));
  if (warned > 0) console.log(chalk.yellow(`  ⚠ Warnings: ${warned}/${total}`));
  if (failed > 0) console.log(chalk.red(`  ✗ Failed: ${failed}/${total}`));

  const percentage = Math.round((passed / total) * 100);
  console.log(`\n  Compliance: ${percentage}%`);

  const levelThresholds = { bronze: 80, silver: 95, gold: 98 };
  const targetThreshold = levelThresholds[options.level];

  if (percentage >= targetThreshold && failed === 0) {
    console.log(chalk.green.bold(`\n  ✅ Project meets ${options.level.toUpperCase()} level requirements!\n`));
  } else {
    console.log(chalk.yellow(`\n  ⚠️  Project does not yet meet ${options.level.toUpperCase()} level (requires ${targetThreshold}%)\n`));
  }
}


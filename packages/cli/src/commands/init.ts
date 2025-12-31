/**
 * @file commands/init.ts
 * @description Initialize a new DSS-compliant strategy project
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

interface InitOptions {
  name?: string;
  framework?: 'hardhat' | 'foundry';
  template?: 'basic' | 'rebalancing' | 'lending';
}

export async function initCommand(options: InitOptions) {
  console.log(chalk.bold.cyan('\n🚀 DSS Project Initialization\n'));

  // Prompt for missing options
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: 'my-dss-strategy',
      when: !options.name
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Select framework:',
      choices: [
        { name: 'Hardhat (TypeScript)', value: 'hardhat' },
        { name: 'Foundry (Solidity)', value: 'foundry' }
      ],
      default: 'hardhat',
      when: !options.framework
    },
    {
      type: 'list',
      name: 'template',
      message: 'Select strategy template:',
      choices: [
        { name: 'Basic Strategy (HODL)', value: 'basic' },
        { name: 'Rebalancing Strategy (60/40)', value: 'rebalancing' },
        { name: 'Lending Strategy (Aave)', value: 'lending' }
      ],
      default: 'basic',
      when: !options.template
    }
  ]);

  const config = { ...options, ...answers };
  const projectPath = path.join(process.cwd(), config.name!);

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    console.log(chalk.red(`\n❌ Directory "${config.name}" already exists!\n`));
    process.exit(1);
  }

  const spinner = ora('Creating project structure...').start();

  try {
    // Create project directory
    await fs.ensureDir(projectPath);

    // Copy template files
    const templateDir = path.join(__dirname, '..', '..', 'templates', config.framework!, config.template!);
    if (await fs.pathExists(templateDir)) {
      await fs.copy(templateDir, projectPath);
    } else {
      // Create basic structure if template doesn't exist yet
      await createBasicStructure(projectPath, config);
    }

    // Create README
    await createReadme(projectPath, config);

    // Create package.json (for Hardhat)
    if (config.framework === 'hardhat') {
      await createPackageJson(projectPath, config);
    }

    spinner.succeed('Project structure created!');

    console.log(chalk.green('\n✅ Project initialized successfully!\n'));
    console.log(chalk.bold('Next steps:\n'));
    console.log(chalk.cyan(`  cd ${config.name}`));
    console.log(chalk.cyan(`  ${config.framework === 'hardhat' ? 'npm install' : 'forge install'}`));
    console.log(chalk.cyan(`  ${config.framework === 'hardhat' ? 'npx hardhat test' : 'forge test'}`));
    console.log(chalk.cyan(`  dss check\n`));
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    process.exit(1);
  }
}

async function createBasicStructure(projectPath: string, config: any) {
  const dirs = [
    'contracts',
    'test',
    config.framework === 'hardhat' ? 'scripts' : 'script',
    'docs'
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir));
  }

  // Create basic contract
  const contractContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@dss/core/interfaces/IDSSStrategy.sol";
import "@dss/core/contracts/DSSAccessControl.sol";
import "@dss/core/contracts/DSSPausable.sol";

/**
 * @title ${config.name}
 * @notice ${config.template} strategy following DSS
 */
contract ${toPascalCase(config.name)} is IDSSStrategy, DSSAccessControl, DSSPausable {
    address[] private _assets;
    uint256 public override lastRebalance;
    uint256 public override rebalanceInterval = 24 hours;
    
    constructor(address[] memory assets_) {
        _assets = assets_;
    }
    
    function getAssets() external view override returns (address[] memory) {
        return _assets;
    }
    
    function calculateWeights() external pure override returns (uint256[] memory) {
        // TODO: Implement weight calculation logic
        uint256[] memory weights = new uint256[](1);
        weights[0] = 10000;
        return weights;
    }
    
    function shouldRebalance() external view override returns (bool) {
        return block.timestamp >= lastRebalance + rebalanceInterval;
    }
    
    function rebalance() external override onlyKeeper whenNotPaused {
        require(this.shouldRebalance(), "Cooldown not elapsed");
        
        // TODO: Implement rebalancing logic
        
        lastRebalance = block.timestamp;
        emit Rebalanced(block.timestamp, new uint256[](0), new uint256[](0));
    }
}
`;

  await fs.writeFile(
    path.join(projectPath, 'contracts', `${toPascalCase(config.name)}.sol`),
    contractContent
  );
}

async function createReadme(projectPath: string, config: any) {
  const content = `# ${config.name}

DSS-compliant ${config.template} strategy.

## Overview

This project was initialized with \`@dss/cli\` and follows the DeFi Strategy Standard (DSS).

## Getting Started

### Install Dependencies

\`\`\`bash
${config.framework === 'hardhat' ? 'npm install' : 'forge install'}
\`\`\`

### Run Tests

\`\`\`bash
${config.framework === 'hardhat' ? 'npx hardhat test' : 'forge test'}
\`\`\`

### Check DSS Compliance

\`\`\`bash
dss check
\`\`\`

### Generate Certification Report

\`\`\`bash
dss report
\`\`\`

## DSS Requirements

- ✅ DSS-1: Core Strategy Tests
- ✅ DSS-2: Economic Invariants
- ⏳ DSS-3: Trigger & Timing Tests
- ⏳ DSS-4: Risk Management Tests
- ⏳ DSS-5: Integration Tests
- ⏳ DSS-6: Historical Backtesting
- ⏳ DSS-7: Stress Tests & Fuzzing
- ⏳ DSS-8: Security Testing
- ⏳ DSS-9: Operational Security
- ⏳ DSS-10: Governance & Upgrades
- ⏳ DSS-11: Interoperability

## License

MIT
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), content);
}

async function createPackageJson(projectPath: string, config: any) {
  const content = {
    name: config.name,
    version: '0.1.0',
    description: `DSS-compliant ${config.template} strategy`,
    scripts: {
      test: 'hardhat test',
      compile: 'hardhat compile',
      'dss:check': 'dss check',
      'dss:report': 'dss report'
    },
    devDependencies: {
      '@dss/core': '^1.2.0-alpha.0',
      '@dss/test': '^1.2.0-alpha.0',
      hardhat: '^2.19.0',
      '@nomicfoundation/hardhat-toolbox': '^4.0.0'
    }
  };

  await fs.writeJSON(path.join(projectPath, 'package.json'), content, { spaces: 2 });
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}




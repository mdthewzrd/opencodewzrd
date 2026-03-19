#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { OpenCodeRemi } from './index';

const program = new Command();
const agent = new OpenCodeRemi();

program
  .name('wzrd')
  .description('WZRD.dev agent for OpenCode - AI assistant with auto-mode detection')
  .version('0.1.0');

program
  .command('chat')
  .description('Start interactive chat session')
  .argument('<message>', 'Message to send')
  .action(async (message) => {
    try {
      const response = await agent.processMessage(message);
      console.log(chalk.green('\nResponse:'));
      console.log(chalk.white(response));
    } catch (error) {
      console.error(chalk.red('Error:', error));
    }
  });

program
  .command('modes')
  .description('List available modes')
  .action(() => {
    const modes = agent.getAvailableModes();
    console.log(chalk.cyan('\nAvailable Modes:'));
    modes.forEach(mode => {
      console.log(chalk.yellow(`  ${mode}`));
    });
  });

program
  .command('skills')
  .description('Show loaded skills')
  .action(() => {
    const count = agent.getSkillsCount();
    console.log(chalk.cyan(`\nLoaded Skills: ${count}`));
    
    // In a real implementation, we'd list them
    console.log(chalk.gray('(Skills are loaded from bundled directory)'));
  });

program
  .command('setup')
  .description('Setup configuration')
  .action(() => {
    console.log(chalk.cyan('\nSetting up WZRD.dev OpenCode extension...'));
    
    // Create config directory
    const configDir = path.join(process.env.HOME || '.', '.wzrd');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(chalk.green(`Created config directory: ${configDir}`));
    }
    
    // Create default config
    const configFile = path.join(configDir, 'config.json');
    const defaultConfig = {
      autoModeDetection: true,
      skillDirectory: './skills',
      logLevel: 'info',
      maxResponseLength: 5000,
      enableSkills: true
    };
    
    fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    console.log(chalk.green(`Created default config: ${configFile}`));
    
    console.log(chalk.green('\nSetup complete!'));
    console.log(chalk.gray('\nUsage:'));
    console.log('  wzrd chat "Your message here"');
    console.log('  wzrd modes');
    console.log('  wzrd skills');
  });

program.parse(process.argv);
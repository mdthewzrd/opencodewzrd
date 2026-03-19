#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Bundle skills from source directory to distribution
 * 
 * This script copies skills from a source directory to the bundled
 * skills directory in the dist folder. In a real implementation,
 * this would fetch from GitHub or use local skill files.
 */

console.log('📦 Bundling skills for WZRD.dev OpenCode extension...');

const sourceDir = path.join(__dirname, '..', 'example-skills');
const targetDir = path.join(__dirname, '..', 'skills');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created skills directory: ${targetDir}`);
}

// Copy example skills if source directory exists
if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const sourceFile = path.join(sourceDir, file);
      const targetFile = path.join(targetDir, file);
      
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`  Copied: ${file}`);
    }
  });
} else {
  console.log('⚠️  No example skills directory found. Creating minimal skill set...');
  
  // Create minimal skill set
  const minimalSkills = [
    {
      name: 'coding',
      description: 'Code implementation across all languages and frameworks',
      modes: ['CODER'],
      instructions: 'Provide code solutions with explanations',
      examples: ['Write a Python function', 'Create React component'],
      tags: ['code', 'programming', 'development'],
      version: '1.0.0'
    },
    {
      name: 'debugging',
      description: 'Debugging strategies, troubleshooting, and problem-solving',
      modes: ['DEBUG'],
      instructions: 'Analyze errors and provide solutions',
      examples: ['Fix this error:', 'Why is this not working?'],
      tags: ['debug', 'error', 'fix'],
      version: '1.0.0'
    },
    {
      name: 'architecture',
      description: 'System design, API design, and architectural decisions',
      modes: ['THINKER'],
      instructions: 'Design systems and document trade-offs',
      examples: ['Design a database schema', 'Plan API architecture'],
      tags: ['design', 'architecture', 'system'],
      version: '1.0.0'
    },
    {
      name: 'research',
      description: 'Research, investigation, and information gathering',
      modes: ['RESEARCH'],
      instructions: 'Provide comprehensive analysis with sources',
      examples: ['Research React best practices', 'Compare databases'],
      tags: ['research', 'analysis', 'compare'],
      version: '1.0.0'
    },
    {
      name: 'chat',
      description: 'Casual conversation and simple explanations',
      modes: ['CHAT'],
      instructions: 'Be friendly and conversational',
      examples: ['Hi', 'How are you?', 'What is this?'],
      tags: ['chat', 'conversation', 'help'],
      version: '1.0.0'
    }
  ];
  
  minimalSkills.forEach(skill => {
    const skillFile = path.join(targetDir, `${skill.name}.json`);
    fs.writeFileSync(skillFile, JSON.stringify(skill, null, 2));
    console.log(`  Created: ${skill.name}.json`);
  });
}

console.log(`✅ Bundled ${fs.readdirSync(targetDir).length} skills`);
console.log('✨ Skill bundling complete!');
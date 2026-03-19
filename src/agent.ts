import * as fs from 'fs';
import * as path from 'path';
import { Skill } from './types';

/**
 * Remi Agent - Core AI agent with auto-mode detection
 */
export class RemiAgent {
  private skills: Map<string, Skill> = new Map();
  private skillsLoaded = false;
  
  constructor() {
    this.loadAllSkills();
  }
  
  /**
   * Detect which mode to use based on user input
   */
  detectMode(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Mode detection rules
    if (this.isCoderMessage(lowerMessage)) {
      return 'CODER';
    }
    
    if (this.isThinkerMessage(lowerMessage)) {
      return 'THINKER';
    }
    
    if (this.isDebugMessage(lowerMessage)) {
      return 'DEBUG';
    }
    
    if (this.isResearchMessage(lowerMessage)) {
      return 'RESEARCH';
    }
    
    // Default to CHAT mode
    return 'CHAT';
  }
  
  /**
   * Check if message is for CODER mode
   */
  private isCoderMessage(message: string): boolean {
    const coderKeywords = [
      'write', 'code', 'function', 'implement', 'build',
      'create', 'script', 'program', 'python', 'javascript',
      'typescript', 'java', 'go', 'rust', 'c++', 'php',
      'sql', 'html', 'css', 'react', 'vue', 'angular',
      'node', 'express', 'django', 'flask', 'fastapi'
    ];
    
    return coderKeywords.some(keyword => message.includes(keyword));
  }
  
  /**
   * Check if message is for THINKER mode
   */
  private isThinkerMessage(message: string): boolean {
    const thinkerKeywords = [
      'design', 'architecture', 'plan', 'structure',
      'how should', 'what would', 'system design',
      'database schema', 'api design', 'component',
      'microservices', 'monolith', 'scalability',
      'performance', 'security'
    ];
    
    return thinkerKeywords.some(keyword => message.includes(keyword));
  }
  
  /**
   * Check if message is for DEBUG mode
   */
  private isDebugMessage(message: string): boolean {
    const debugKeywords = [
      'error', 'bug', 'fix', 'not working', 'broken',
      'crash', 'exception', 'stack trace', 'debug',
      'troubleshoot', 'problem', 'issue', 'failed',
      'why does', 'how to fix', 'help with error',
      'undefined is not a function', 'cannot read property',
      'syntax error', 'typeerror', 'referenceerror'
    ];
    
    return debugKeywords.some(keyword => message.includes(keyword));
  }
  
  /**
   * Check if message is for RESEARCH mode
   */
  private isResearchMessage(message: string): boolean {
    const researchKeywords = [
      'research', 'compare', 'analyze', 'trends',
      'latest', 'best practices', 'guide', 'tutorial',
      'documentation', 'overview', 'survey', 'review',
      'benchmark', 'evaluation', 'what are', 'how to'
    ];
    
    return researchKeywords.some(keyword => message.includes(keyword));
  }
  
  /**
   * Load skills for a specific mode
   */
  loadSkillsForMode(mode: string): Skill[] {
    const modeSkills: Skill[] = [];
    
    for (const [name, skill] of this.skills) {
      if (skill.modes.includes(mode)) {
        modeSkills.push(skill);
      }
    }
    
    return modeSkills;
  }
  
  /**
   * Load all skills from bundled directory
   */
  private loadAllSkills(): void {
    if (this.skillsLoaded) return;
    
    const skillsDir = path.join(__dirname, '..', 'skills');
    
    if (!fs.existsSync(skillsDir)) {
      console.warn(`Skills directory not found: ${skillsDir}`);
      return;
    }
    
    try {
      const skillFiles = fs.readdirSync(skillsDir);
      
      for (const file of skillFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(skillsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const skill = JSON.parse(content) as Skill;
          
          this.skills.set(skill.name, skill);
        }
      }
      
      this.skillsLoaded = true;
      console.log(`Loaded ${this.skills.size} skills`);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  }
  
  /**
   * Generate response based on mode and available skills
   */
  generateResponse(
    message: string, 
    mode: string, 
    skills: Skill[], 
    context?: any
  ): string {
    // Start with mode indicator
    let response = `[${mode} MODE]\n\n`;
    
    // Add context if provided
    if (context) {
      response += `Context: ${JSON.stringify(context, null, 2)}\n\n`;
    }
    
    // Show available skills for this mode
    if (skills.length > 0) {
      response += `Available skills (${skills.length}): ${skills.map(s => s.name).join(', ')}\n\n`;
    }
    
    // Generate mode-specific response
    switch (mode) {
      case 'CODER':
        response += this.generateCoderResponse(message);
        break;
      case 'THINKER':
        response += this.generateThinkerResponse(message);
        break;
      case 'DEBUG':
        response += this.generateDebugResponse(message);
        break;
      case 'RESEARCH':
        response += this.generateResearchResponse(message);
        break;
      default: // CHAT
        response += this.generateChatResponse(message);
    }
    
    return response;
  }
  
  private generateCoderResponse(message: string): string {
    return `I'll help you write code. Analyzing: "${message}"\n\n`;
  }
  
  private generateThinkerResponse(message: string): string {
    return `I'll help you design and plan. Analyzing: "${message}"\n\n`;
  }
  
  private generateDebugResponse(message: string): string {
    return `I'll help you debug. Analyzing: "${message}"\n\n`;
  }
  
  private generateResearchResponse(message: string): string {
    return `I'll help you research. Analyzing: "${message}"\n\n`;
  }
  
  private generateChatResponse(message: string): string {
    return `Hi! I'm Remi from WZRD.dev. How can I help you today?\n\n`;
  }
  
  /**
   * Get total number of loaded skills
   */
  getSkillsCount(): number {
    return this.skills.size;
  }
}
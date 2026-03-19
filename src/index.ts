#!/usr/bin/env node

import { RemiAgent } from './agent';

/**
 * WZRD.dev Remi Agent for OpenCode
 * 
 * Main entry point for the OpenCode extension.
 * Provides auto-mode detection and skill loading.
 */

export class OpenCodeRemi {
  private agent: RemiAgent;
  
  constructor() {
    this.agent = new RemiAgent();
  }
  
  /**
   * Process a user message and return appropriate response
   */
  async processMessage(message: string, context?: any): Promise<string> {
    const mode = this.agent.detectMode(message);
    const skills = this.agent.loadSkillsForMode(mode);
    
    return this.agent.generateResponse(message, mode, skills, context);
  }
  
  /**
   * Get available modes
   */
  getAvailableModes(): string[] {
    return ['CHAT', 'CODER', 'THINKER', 'DEBUG', 'RESEARCH'];
  }
  
  /**
   * Get loaded skills count
   */
  getSkillsCount(): number {
    return this.agent.getSkillsCount();
  }
}

/**
 * Default export for OpenCode integration
 */
export default OpenCodeRemi;
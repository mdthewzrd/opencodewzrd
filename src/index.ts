#!/usr/bin/env node

import { RemiAgent } from './agent';
import { autoCore, remiAuto, AutoCore } from './auto-core/index';

/**
 * WZRD.dev Remi v2 Agent for OpenCode
 *
 * Main entry point for the OpenCode extension.
 * Provides auto-mode detection, auto-PIV orchestration, auto-skill loading,
 * and auto-Gold-Standard enforcement.
 */

export class OpenCodeRemi {
  private agent: RemiAgent;
  private autoCore: AutoCore;

  constructor() {
    this.agent = new RemiAgent();
    this.autoCore = new AutoCore();
  }

  /**
   * Process a user message with full auto-capabilities
   * - Auto-mode detection
   * - Auto-skill loading
   * - Auto-PIV triggering for complex tasks
   * - Gold Standard enforcement
   */
  async processMessage(message: string, context?: any): Promise<string> {
    // Use v2 auto-capabilities
    const analysis = await this.autoCore.processInput(message);

    // Build response with auto-detected mode and skills
    let response = `[${analysis.mode} MODE]`;

    if (analysis.shouldRunPIV) {
      response += ' | PIV Orchestrated';
    }

    response += `\n\nSkills loaded: ${analysis.skills.loaded.join(', ') || 'none'}\n\n`;

    // Generate mode-specific response
    const modeResponse = this.agent.generateResponse(message, analysis.mode, [], context);
    response += modeResponse.replace(/\[.*MODE\]\n\n/, '');

    return response;
  }

  /**
   * Get available modes
   */
  getAvailableModes(): string[] {
    return ['CHAT', 'CODER', 'THINKER', 'DEBUG', 'RESEARCH', 'TESTING', 'PLANNING', 'DOCUMENTATION', 'REVIEW'];
  }

  /**
   * Get loaded skills count
   */
  getSkillsCount(): number {
    return this.agent.getSkillsCount();
  }

  /**
   * Get auto-core instance for advanced usage
   */
  getAutoCore(): AutoCore {
    return this.autoCore;
  }
}

/**
 * Auto-capabilities exports
 */
export { autoCore, remiAuto, AutoCore };

/**
 * Default export for OpenCode integration
 */
export default OpenCodeRemi;
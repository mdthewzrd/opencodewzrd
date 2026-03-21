/**
 * Remi v2 Auto-Capabilities Integration
 * Connects auto-core to OpenCode agent
 */

import { autoCore, GoldStandardEnforcer, PIVOrchestrator, AutoSkillLoader, AttemptTracker } from './index';

// ============================================================================
// AGENT INTEGRATION
// ============================================================================

interface ToolCall {
  name: string;
  arguments: any;
}

interface AgentResponse {
  mode: string;
  content: string;
  tools?: ToolCall[];
  goldStandard?: {
    verifications: string[];
    attempts: number;
  };
  piv?: {
    sessionId: string;
    currentPhase: string;
  };
  skills?: string[];
}

export class RemiAutoIntegration {
  private goldStandard: GoldStandardEnforcer;
  private piv: PIVOrchestrator;
  private skills: AutoSkillLoader;
  private currentTaskId: string | null = null;

  constructor() {
    this.goldStandard = autoCore.goldStandard;
    this.piv = autoCore.piv;
    this.skills = autoCore.skills;
  }

  /**
   * Process incoming user message with auto-capabilities
   */
  async processMessage(input: string): Promise<AgentResponse> {
    // Auto-detect mode and load skills
    const analysis = await autoCore.processInput(input);
    
    const response: AgentResponse = {
      mode: analysis.mode,
      content: '',
      skills: analysis.skills.loaded
    };

    // Build response content
    let content = `[${analysis.mode} MODE]`;
    
    if (analysis.skills.loaded.length > 0) {
      content += `\n📚 Auto-loaded skills: ${analysis.skills.loaded.join(', ')}`;
    }

    // Check if PIV needed
    if (analysis.shouldRunPIV) {
      content += `\n🔄 Auto-PIV detected (complexity > threshold)`;
      response.piv = {
        sessionId: '',
        currentPhase: 'PLAN'
      };
    }

    if (analysis.goldStandard) {
      content += `\n✅ Gold Standard: Active (auto-verification enabled)`;
    }

    content += `\n\n`;
    response.content = content;

    return response;
  }

  /**
   * Wrap file write with Gold Standard verification
   */
  async writeFileWithVerification(
    filePath: string,
    content: string,
    taskId?: string
  ): Promise<{ success: boolean; evidence?: string; error?: string }> {
    // Track attempt
    const task = taskId || `write-${filePath}`;
    const { canRetry, shouldPivot } = this.goldStandard.trackAttempt(task);

    if (shouldPivot) {
      const suggestion = this.goldStandard.generatePivotSuggestion(task, `Writing ${filePath}`);
      return {
        success: false,
        error: `Max attempts reached. ${suggestion}`
      };
    }

    try {
      // Write file
      const fs = await import('fs-extra');
      await fs.writeFile(filePath, content, 'utf-8');

      // Auto-verify
      const verification = await this.goldStandard.verifyFileWrite(filePath, content);
      
      if (!verification.success) {
        return {
          success: false,
          error: verification.error,
          evidence: verification.evidence
        };
      }

      // Clear attempts on success
      this.goldStandard.clearAttempts(task);

      return {
        success: true,
        evidence: `✅ Verified: ${filePath} (${content.length} bytes)`
      };
    } catch (error) {
      return {
        success: false,
        error: `Write failed: ${error}`
      };
    }
  }

  /**
   * Wrap file edit with Gold Standard verification
   */
  async editFileWithVerification(
    filePath: string,
    oldString: string,
    newString: string,
    taskId?: string
  ): Promise<{ success: boolean; evidence?: string; error?: string }> {
    const task = taskId || `edit-${filePath}`;
    const { canRetry, shouldPivot } = this.goldStandard.trackAttempt(task);

    if (shouldPivot) {
      const suggestion = this.goldStandard.generatePivotSuggestion(task, `Editing ${filePath}`);
      return {
        success: false,
        error: `Max attempts reached. ${suggestion}`
      };
    }

    try {
      // Read first (Gold Standard requirement)
      const fs = await import('fs-extra');
      const content = await fs.readFile(filePath, 'utf-8');

      if (!content.includes(oldString)) {
        return {
          success: false,
          error: `oldString not found in ${filePath}`
        };
      }

      // Apply edit
      const newContent = content.replace(oldString, newString);
      await fs.writeFile(filePath, newContent, 'utf-8');

      // Verify
      const verification = await this.goldStandard.verifyFileWrite(filePath, newContent);
      
      if (!verification.success) {
        return {
          success: false,
          error: verification.error
        };
      }

      this.goldStandard.clearAttempts(task);

      return {
        success: true,
        evidence: `✅ Verified edit: ${filePath}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Edit failed: ${error}`
      };
    }
  }

  /**
   * Execute PIV workflow
   */
  async executePIV(
    request: string,
    planTasks: Array<() => Promise<any>>,
    buildTask: (context: Map<string, any>) => Promise<any>,
    validateTasks: Array<() => Promise<any>>
  ): Promise<{ success: boolean; report: string; error?: string }> {
    const session = this.piv.startPIV(request);

    try {
      // Phase 1: PLAN
      console.log('[PIV] Starting PLAN phase...');
      await this.piv.executePlanPhase(session.id, planTasks);

      // Phase 2: IMPLEMENT
      console.log('[PIV] Starting IMPLEMENT phase...');
      await this.piv.executeImplementPhase(session.id, buildTask);

      // Phase 3: VALIDATE
      console.log('[PIV] Starting VALIDATE phase...');
      await this.piv.executeValidatePhase(session.id, validateTasks);

      // Generate report
      const report = this.piv.generateReport(session.id);

      return {
        success: true,
        report
      };
    } catch (error) {
      const report = this.piv.generateReport(session.id);
      return {
        success: false,
        report,
        error: String(error)
      };
    }
  }

  /**
   * Get current attempt status
   */
  getAttemptStatus(taskId: string) {
    return this.goldStandard.getAttemptStatus(taskId);
  }

  /**
   * Get loaded skills
   */
  getLoadedSkills(): string[] {
    return this.skills.getLoadedSkills();
  }

  /**
   * Get skill load log
   */
  getSkillLoadLog() {
    return this.skills.getLoadLog();
  }
}

// Export singleton
export const remiAuto = new RemiAutoIntegration();

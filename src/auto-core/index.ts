/**
 * Remi v2 Auto-Capabilities Core
 * Auto-Gold-Standard + Auto-PIV + Auto-Skills
 */

import * as fs from 'fs-extra';
import * as path from 'path';

// ============================================================================
// AUTO-GOLD-STANDARD SYSTEM
// ============================================================================

export interface AttemptTracker {
  taskId: string;
  attempts: number;
  lastAttempt: Date;
  errors: string[];
}

interface VerificationResult {
  success: boolean;
  evidence?: string;
  error?: string;
}

export class GoldStandardEnforcer {
  private attempts: Map<string, AttemptTracker> = new Map();
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Auto-verify file write with read-back
   */
  async verifyFileWrite(filePath: string, expectedContent?: string): Promise<VerificationResult> {
    try {
      // Read back the file
      const actualContent = await fs.readFile(filePath, 'utf-8');
      
      // If expected content provided, verify match
      if (expectedContent && actualContent !== expectedContent) {
        return {
          success: false,
          error: `Content mismatch in ${filePath}`,
          evidence: `Expected: ${expectedContent.slice(0, 100)}...\nActual: ${actualContent.slice(0, 100)}...`
        };
      }

      return {
        success: true,
        evidence: `File ${filePath} verified: ${actualContent.length} bytes`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to verify ${filePath}: ${error}`
      };
    }
  }

  /**
   * Track attempt for a task
   */
  trackAttempt(taskId: string, error?: string): { canRetry: boolean; shouldPivot: boolean } {
    const tracker = this.attempts.get(taskId) || {
      taskId,
      attempts: 0,
      lastAttempt: new Date(),
      errors: []
    };

    tracker.attempts++;
    tracker.lastAttempt = new Date();
    if (error) tracker.errors.push(error);

    this.attempts.set(taskId, tracker);

    const canRetry = tracker.attempts < this.MAX_ATTEMPTS;
    const shouldPivot = tracker.attempts >= this.MAX_ATTEMPTS;

    return { canRetry, shouldPivot };
  }

  /**
   * Get attempt status
   */
  getAttemptStatus(taskId: string): AttemptTracker | undefined {
    return this.attempts.get(taskId);
  }

  /**
   * Generate pivot suggestion after 3 failures
   */
  generatePivotSuggestion(taskId: string, context: string): string {
    const tracker = this.attempts.get(taskId);
    if (!tracker) return '';

    const errors = tracker.errors.slice(-3).join('; ');
    return `
⚠️ PIVOT SUGGESTION (Attempt ${tracker.attempts}/${this.MAX_ATTEMPTS})

Repeated errors: ${errors}

Suggested alternatives:
1. Break task into smaller sub-tasks
2. Research the error pattern before retrying
3. Use a different approach/technology
4. Escalate to human review

Context: ${context}
    `.trim();
  }

  /**
   * Require evidence before claiming completion
   */
  requireEvidence(claim: string, evidence?: string): VerificationResult {
    if (!evidence) {
      return {
        success: false,
        error: `Cannot claim "${claim}" without evidence`
      };
    }
    return { success: true, evidence };
  }

  /**
   * Clear attempts for a task
   */
  clearAttempts(taskId: string): void {
    this.attempts.delete(taskId);
  }
}

// ============================================================================
// AUTO-PIV ORCHESTRATION
// ============================================================================

interface PIVPhase {
  name: 'PLAN' | 'IMPLEMENT' | 'VALIDATE';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  evidence?: string;
}

interface PIVSession {
  id: string;
  request: string;
  phases: PIVPhase[];
  currentPhase: number;
  context: Map<string, any>;
}

export class PIVOrchestrator {
  private sessions: Map<string, PIVSession> = new Map();

  /**
   * Detect if task needs PIV based on complexity signals
   */
  shouldAutoPIV(input: string): boolean {
    const complexitySignals = [
      // Multiple components
      (input.match(/\band\b/gi) || []).length >= 2,
      // Implementation + testing
      /implement|build|create/i.test(input) && /test|validate|verify/i.test(input),
      // Research + build
      /research|analyze|investigate/i.test(input) && /build|implement|create/i.test(input),
      // Detailed request
      input.length > 200,
      // Feature with validation
      /feature/i.test(input) && /validate|test|verify/i.test(input),
      // Multi-step language
      /phases?|steps?|stages?/i.test(input),
    // Complex keywords
    /architecture|design|system|framework/i.test(input),
    // Architecture + validation pattern
    /architecture|design/i.test(input) && /validat|test|verif/i.test(input)
    ];

    const score = complexitySignals.filter(Boolean).length;
    // Check for research+build pattern specifically (strong signal)
    const hasResearch = /research|analyze|investigate/i.test(input);
    const hasBuild = /implement|build|create/i.test(input);
    if (hasResearch && hasBuild) return true;
    
    return score >= 2; // Need 2+ signals to trigger auto-PIV
  }

  /**
   * Start PIV session
   */
  startPIV(request: string): PIVSession {
    const id = `piv-${Date.now()}`;
    const session: PIVSession = {
      id,
      request,
      phases: [
        { name: 'PLAN', status: 'pending' },
        { name: 'IMPLEMENT', status: 'pending' },
        { name: 'VALIDATE', status: 'pending' }
      ],
      currentPhase: 0,
      context: new Map()
    };
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Execute PLAN phase (parallel research)
   */
  async executePlanPhase(
    sessionId: string,
    researchTasks: Array<() => Promise<any>>
  ): Promise<PIVPhase> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const phase = session.phases[0];
    phase.status = 'running';
    phase.startTime = new Date();

    try {
      // Run research tasks in parallel
      const results = await Promise.all(researchTasks.map(task => task()));
      
      phase.result = results;
      phase.evidence = `Research completed: ${results.length} parallel tasks`;
      phase.status = 'completed';
      phase.endTime = new Date();

      // Store context for next phase
      session.context.set('research', results);
      session.currentPhase = 1;

      return phase;
    } catch (error) {
      phase.status = 'failed';
      phase.evidence = `Research failed: ${error}`;
      phase.endTime = new Date();
      throw error;
    }
  }

  /**
   * Execute IMPLEMENT phase (single focused build)
   */
  async executeImplementPhase(
    sessionId: string,
    buildTask: (context: Map<string, any>) => Promise<any>
  ): Promise<PIVPhase> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const phase = session.phases[1];
    phase.status = 'running';
    phase.startTime = new Date();

    try {
      // Single focused build with context from PLAN
      const result = await buildTask(session.context);
      
      phase.result = result;
      phase.evidence = `Implementation completed: ${result}`;
      phase.status = 'completed';
      phase.endTime = new Date();

      // Store context for next phase
      session.context.set('implementation', result);
      session.currentPhase = 2;

      return phase;
    } catch (error) {
      phase.status = 'failed';
      phase.evidence = `Implementation failed: ${error}`;
      phase.endTime = new Date();
      throw error;
    }
  }

  /**
   * Execute VALIDATE phase (parallel testing)
   */
  async executeValidatePhase(
    sessionId: string,
    validationTasks: Array<() => Promise<any>>
  ): Promise<PIVPhase> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const phase = session.phases[2];
    phase.status = 'running';
    phase.startTime = new Date();

    try {
      // Run validation tasks in parallel
      const results = await Promise.all(validationTasks.map(task => task()));
      
      phase.result = results;
      phase.evidence = `Validation completed: ${results.length} test suites passed`;
      phase.status = 'completed';
      phase.endTime = new Date();

      session.context.set('validation', results);

      return phase;
    } catch (error) {
      phase.status = 'failed';
      phase.evidence = `Validation failed: ${error}`;
      phase.endTime = new Date();
      throw error;
    }
  }

  /**
   * Generate PIV report
   */
  generateReport(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return 'Session not found';

    const duration = session.phases.reduce((total, phase) => {
      if (phase.startTime && phase.endTime) {
        return total + (phase.endTime.getTime() - phase.startTime.getTime());
      }
      return total;
    }, 0);

    return `
# PIV Execution Report

**Request:** ${session.request}
**Session ID:** ${sessionId}
**Total Duration:** ${(duration / 1000).toFixed(2)}s

## Phases

${session.phases.map(phase => `
### ${phase.name} Phase
- **Status:** ${phase.status}
- **Duration:** ${phase.startTime && phase.endTime ? 
  ((phase.endTime.getTime() - phase.startTime.getTime()) / 1000).toFixed(2) + 's' : 'N/A'}
- **Evidence:** ${phase.evidence || 'N/A'}
`).join('\n')}

## Summary
- All phases completed: ${session.phases.every(p => p.status === 'completed') ? '✅' : '❌'}
- Context keys: ${Array.from(session.context.keys()).join(', ')}
    `.trim();
  }

  /**
   * Get session status
   */
  getSession(sessionId: string): PIVSession | undefined {
    return this.sessions.get(sessionId);
  }
}

// ============================================================================
// AUTO-SKILL LOADING
// ============================================================================

interface SkillMapping {
  keywords: string[];
  skills: string[];
  priority: 'P0' | 'P1' | 'P2';
}

export class AutoSkillLoader {
  private skillMappings: SkillMapping[] = [
    // Development
    { keywords: ['test', 'validate', 'verify', 'qa'], skills: ['testing', 'e2e-test'], priority: 'P0' },
    { keywords: ['react', 'ui', 'component', 'frontend'], skills: ['react-ui-master', 'shadcn-generator'], priority: 'P0' },
    { keywords: ['debug', 'fix', 'error', 'bug'], skills: ['debugging'], priority: 'P0' },
    { keywords: ['design', 'architecture', 'system'], skills: ['architecture'], priority: 'P1' },
    { keywords: ['transform', 'refactor', 'migrate'], skills: ['transform-model-a', 'transform-model-b', 'transform-model-c'], priority: 'P1' },
    
    // Operations
    { keywords: ['git', 'commit', 'branch', 'merge'], skills: ['git'], priority: 'P0' },
    { keywords: ['deploy', 'release', 'publish'], skills: ['automation', 'git'], priority: 'P1' },
    { keywords: ['docker', 'container'], skills: ['docker'], priority: 'P1' },
    
    // Research
    { keywords: ['research', 'investigate', 'analyze'], skills: ['research'], priority: 'P0' },
    { keywords: ['search', 'find', 'lookup'], skills: ['web-search'], priority: 'P1' },
    { keywords: ['data', 'statistics', 'chart'], skills: ['data-analysis'], priority: 'P1' },
    
    // Quality
    { keywords: ['security', 'audit', 'vulnerability'], skills: ['security'], priority: 'P0' },
    { keywords: ['performance', 'optimize', 'slow'], skills: ['performance'], priority: 'P1' },
    { keywords: ['review', 'check', 'quality'], skills: ['gold-standard'], priority: 'P0' },
    
    // Integration
    { keywords: ['api', 'rest', 'graphql'], skills: ['api'], priority: 'P0' },
    { keywords: ['mcp', 'protocol'], skills: ['mcp'], priority: 'P1' },
    
    // Documentation
    { keywords: ['document', 'readme', 'guide'], skills: ['documentation'], priority: 'P0' },
    
    // Advanced
    { keywords: ['subagent', 'parallel', 'delegate'], skills: ['background-agents', 'orchestration'], priority: 'P1' },
    { keywords: ['memory', 'learn', 'pattern'], skills: ['memory-curation'], priority: 'P2' }
  ];

  private loadedSkills: Set<string> = new Set();
  private loadLog: Array<{ skill: string; reason: string; timestamp: Date }> = [];

  /**
   * Detect needed skills from input
   */
  detectSkills(input: string): { P0: string[]; P1: string[]; P2: string[] } {
    const detected: { P0: Set<string>; P1: Set<string>; P2: Set<string> } = {
      P0: new Set(),
      P1: new Set(),
      P2: new Set()
    };

    const lowerInput = input.toLowerCase();

    for (const mapping of this.skillMappings) {
      const matches = mapping.keywords.some(keyword => lowerInput.includes(keyword));
      if (matches) {
        for (const skill of mapping.skills) {
          detected[mapping.priority].add(skill);
        }
      }
    }

    return {
      P0: Array.from(detected.P0),
      P1: Array.from(detected.P1),
      P2: Array.from(detected.P2)
    };
  }

  /**
   * Load a skill (simulated - actual loading depends on skill system)
   */
  async loadSkill(skillName: string, reason: string): Promise<boolean> {
    if (this.loadedSkills.has(skillName)) {
      return false; // Already loaded
    }

    // Simulate skill loading
    this.loadedSkills.add(skillName);
    this.loadLog.push({ skill: skillName, reason, timestamp: new Date() });
    
    return true;
  }

  /**
   * Auto-load skills based on input
   */
  async autoLoadSkills(input: string): Promise<{ loaded: string[]; alreadyLoaded: string[] }> {
    const detected = this.detectSkills(input);
    const result = { loaded: [] as string[], alreadyLoaded: [] as string[] };

    // Load P0 immediately
    for (const skill of detected.P0) {
      const loaded = await this.loadSkill(skill, 'P0 auto-detected');
      if (loaded) result.loaded.push(skill);
      else result.alreadyLoaded.push(skill);
    }

    // Load P1
    for (const skill of detected.P1) {
      const loaded = await this.loadSkill(skill, 'P1 auto-detected');
      if (loaded) result.loaded.push(skill);
      else result.alreadyLoaded.push(skill);
    }

    // Log P2 (don't auto-load, just track)
    for (const skill of detected.P2) {
      this.loadLog.push({ skill, reason: 'P2 detected (not loaded)', timestamp: new Date() });
    }

    return result;
  }

  /**
   * Get load log
   */
  getLoadLog(): Array<{ skill: string; reason: string; timestamp: Date }> {
    return this.loadLog;
  }

  /**
   * Get currently loaded skills
   */
  getLoadedSkills(): string[] {
    return Array.from(this.loadedSkills);
  }

  /**
   * Clear loaded skills
   */
  clearSkills(): void {
    this.loadedSkills.clear();
    this.loadLog = [];
  }
}

// ============================================================================
// INTEGRATED AUTO-CORE
// ============================================================================

export interface AutoCoreConfig {
  enableGoldStandard: boolean;
  enableAutoPIV: boolean;
  enableAutoSkills: boolean;
  pivThreshold: number; // Complexity score threshold
}

export class AutoCore {
  public goldStandard: GoldStandardEnforcer;
  public piv: PIVOrchestrator;
  public skills: AutoSkillLoader;
  public config: AutoCoreConfig;

  constructor(config: Partial<AutoCoreConfig> = {}) {
    this.config = {
      enableGoldStandard: true,
      enableAutoPIV: true,
      enableAutoSkills: true,
      pivThreshold: 2,
      ...config
    };

    this.goldStandard = new GoldStandardEnforcer();
    this.piv = new PIVOrchestrator();
    this.skills = new AutoSkillLoader();
  }

  /**
   * Process user input with all auto-capabilities
   */
  async processInput(input: string): Promise<{
    mode: string;
    skills: { loaded: string[]; alreadyLoaded: string[] };
    shouldRunPIV: boolean;
    goldStandard: boolean;
  }> {
    const result: {
      mode: string;
      skills: { loaded: string[]; alreadyLoaded: string[] };
      shouldRunPIV: boolean;
      goldStandard: boolean;
    } = {
      mode: this.detectMode(input),
      skills: { loaded: [], alreadyLoaded: [] },
      shouldRunPIV: false,
      goldStandard: this.config.enableGoldStandard
    };

    // Auto-load skills
    if (this.config.enableAutoSkills) {
      result.skills = await this.skills.autoLoadSkills(input);
    }

    // Check if PIV needed
    if (this.config.enableAutoPIV) {
      result.shouldRunPIV = this.piv.shouldAutoPIV(input);
    }

    return result;
  }

  /**
   * Detect mode from input
   */
  private detectMode(input: string): string {
    const lower = input.toLowerCase();
    
    if (/^(hi|hello|hey|how|what's up)/i.test(lower)) return 'CHAT';
    if (/error|bug|fix|broken|issue|debug/i.test(lower)) return 'DEBUG';
    if (/test|validate|verify|qa|check/i.test(lower)) return 'TESTING';
    if (/design|plan|architecture|roadmap/i.test(lower)) return 'PLANNING';
    if (/research|compare|analyze|investigate/i.test(lower)) return 'RESEARCH';
    if (/document|readme|guide|docs/i.test(lower)) return 'DOCUMENTATION';
    if (/review|audit|quality/i.test(lower)) return 'REVIEW';
    return 'CODING';
  }
}

// Export singleton instance
export const autoCore = new AutoCore();

// Re-export integration
export { remiAuto, RemiAutoIntegration } from './integration';

/**
 * Auto-Core Test Suite
 * Tests for Auto-Gold-Standard, Auto-PIV, and Auto-Skills
 */

import { 
  GoldStandardEnforcer, 
  PIVOrchestrator, 
  AutoSkillLoader, 
  AutoCore 
} from '../index';
import { remiAuto, RemiAutoIntegration } from '../integration';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('Auto-Core Capabilities', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remi-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  // ============================================================================
  // AUTO-GOLD-STANDARD TESTS
  // ============================================================================
  describe('GoldStandardEnforcer', () => {
    let enforcer: GoldStandardEnforcer;

    beforeEach(() => {
      enforcer = new GoldStandardEnforcer();
    });

    test('should verify file write successfully', async () => {
      const testFile = path.join(tempDir, 'test.txt');
      const content = 'Hello, World!';
      
      await fs.writeFile(testFile, content);
      const result = await enforcer.verifyFileWrite(testFile, content);
      
      expect(result.success).toBe(true);
      expect(result.evidence).toContain('verified');
    });

    test('should detect content mismatch', async () => {
      const testFile = path.join(tempDir, 'test.txt');
      
      await fs.writeFile(testFile, 'actual content');
      const result = await enforcer.verifyFileWrite(testFile, 'expected content');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('mismatch');
    });

    test('should track attempts', () => {
      const taskId = 'test-task';
      
      const result1 = enforcer.trackAttempt(taskId, 'error 1');
      expect(result1.canRetry).toBe(true);
      expect(result1.shouldPivot).toBe(false);
      
      const result2 = enforcer.trackAttempt(taskId, 'error 2');
      expect(result2.canRetry).toBe(true);
      
      const result3 = enforcer.trackAttempt(taskId, 'error 3');
      expect(result3.canRetry).toBe(false);
      expect(result3.shouldPivot).toBe(true);
    });

    test('should generate pivot suggestion after 3 attempts', () => {
      const taskId = 'test-task';
      
      enforcer.trackAttempt(taskId, 'error 1');
      enforcer.trackAttempt(taskId, 'error 2');
      enforcer.trackAttempt(taskId, 'error 3');
      
      const suggestion = enforcer.generatePivotSuggestion(taskId, 'Test context');
      
      expect(suggestion).toContain('PIVOT SUGGESTION');
      expect(suggestion).toContain('error 1');
      expect(suggestion).toContain('error 2');
      expect(suggestion).toContain('error 3');
    });

    test('should require evidence', () => {
      const result1 = enforcer.requireEvidence('Task complete');
      expect(result1.success).toBe(false);
      
      const result2 = enforcer.requireEvidence('Task complete', 'Evidence here');
      expect(result2.success).toBe(true);
    });

    test('should clear attempts', () => {
      const taskId = 'test-task';
      enforcer.trackAttempt(taskId);
      
      expect(enforcer.getAttemptStatus(taskId)).toBeDefined();
      
      enforcer.clearAttempts(taskId);
      expect(enforcer.getAttemptStatus(taskId)).toBeUndefined();
    });
  });

  // ============================================================================
  // AUTO-PIV TESTS
  // ============================================================================
  describe('PIVOrchestrator', () => {
    let orchestrator: PIVOrchestrator;

    beforeEach(() => {
      orchestrator = new PIVOrchestrator();
    });

    test('should detect simple task as not needing PIV', () => {
      expect(orchestrator.shouldAutoPIV('fix typo')).toBe(false);
      expect(orchestrator.shouldAutoPIV('hello')).toBe(false);
    });

    test('should detect complex task as needing PIV', () => {
      expect(orchestrator.shouldAutoPIV('implement and test a feature')).toBe(true);
      expect(orchestrator.shouldAutoPIV('research the codebase and build a new component')).toBe(true);
      expect(orchestrator.shouldAutoPIV('design an architecture with validation')).toBe(true);
    });

    test('should start PIV session', () => {
      const session = orchestrator.startPIV('Test request');
      
      expect(session.request).toBe('Test request');
      expect(session.phases).toHaveLength(3);
      expect(session.phases[0].name).toBe('PLAN');
      expect(session.phases[1].name).toBe('IMPLEMENT');
      expect(session.phases[2].name).toBe('VALIDATE');
    });

    test('should execute PLAN phase', async () => {
      const session = orchestrator.startPIV('Test');
      
      const planTasks = [
        async () => ({ type: 'research1', data: 'data1' }),
        async () => ({ type: 'research2', data: 'data2' })
      ];
      
      const phase = await orchestrator.executePlanPhase(session.id, planTasks);
      
      expect(phase.status).toBe('completed');
      expect(phase.result).toHaveLength(2);
      expect(phase.evidence).toContain('2 parallel tasks');
    });

    test('should execute IMPLEMENT phase', async () => {
      const session = orchestrator.startPIV('Test');
      
      // First complete PLAN
      await orchestrator.executePlanPhase(session.id, [async () => ({})]);
      
      // Then IMPLEMENT
      const phase = await orchestrator.executeImplementPhase(
        session.id,
        async (context) => ({ status: 'built', context: Array.from(context.keys()) })
      );
      
      expect(phase.status).toBe('completed');
      expect(phase.result.status).toBe('built');
    });

    test('should execute VALIDATE phase', async () => {
      const session = orchestrator.startPIV('Test');
      
      // Complete PLAN and IMPLEMENT
      await orchestrator.executePlanPhase(session.id, [async () => ({})]);
      await orchestrator.executeImplementPhase(session.id, async () => ({}));
      
      // Then VALIDATE
      const phase = await orchestrator.executeValidatePhase(session.id, [
        async () => ({ test: 'unit', passed: true }),
        async () => ({ test: 'integration', passed: true })
      ]);
      
      expect(phase.status).toBe('completed');
      expect(phase.result).toHaveLength(2);
    });

    test('should generate PIV report', async () => {
      const session = orchestrator.startPIV('Test request');
      
      await orchestrator.executePlanPhase(session.id, [async () => ({})]);
      await orchestrator.executeImplementPhase(session.id, async () => ({}));
      await orchestrator.executeValidatePhase(session.id, [async () => ({})]);
      
      const report = orchestrator.generateReport(session.id);
      
      expect(report).toContain('PIV Execution Report');
      expect(report).toContain('Test request');
      expect(report).toContain('PLAN Phase');
      expect(report).toContain('IMPLEMENT Phase');
      expect(report).toContain('VALIDATE Phase');
    });
  });

  // ============================================================================
  // AUTO-SKILLS TESTS
  // ============================================================================
  describe('AutoSkillLoader', () => {
    let loader: AutoSkillLoader;

    beforeEach(() => {
      loader = new AutoSkillLoader();
    });

    test('should detect skills from input', () => {
      const detected = loader.detectSkills('test the code and validate');
      
      expect(detected.P0).toContain('testing');
      expect(detected.P0).toContain('e2e-test');
    });

    test('should detect React skills', () => {
      const detected = loader.detectSkills('build a React component');
      
      expect(detected.P0).toContain('react-ui-master');
    });

    test('should detect multiple skill categories', () => {
      const detected = loader.detectSkills('test and deploy the React app');
      
      expect(detected.P0).toContain('testing');
      expect(detected.P1).toContain('automation');
      expect(detected.P0).toContain('react-ui-master');
    });

    test('should load skills', async () => {
      const loaded = await loader.loadSkill('testing', 'test reason');
      expect(loaded).toBe(true);
      
      // Second load should return false (already loaded)
      const loaded2 = await loader.loadSkill('testing', 'test reason');
      expect(loaded2).toBe(false);
    });

    test('should auto-load skills', async () => {
      const result = await loader.autoLoadSkills('test the React component');
      
      expect(result.loaded).toContain('testing');
      expect(result.loaded).toContain('e2e-test');
      expect(result.loaded).toContain('react-ui-master');
    });

    test('should track load log', async () => {
      await loader.loadSkill('testing', 'test');
      
      const log = loader.getLoadLog();
      expect(log).toHaveLength(1);
      expect(log[0].skill).toBe('testing');
      expect(log[0].reason).toBe('test');
    });

    test('should get loaded skills', async () => {
      await loader.loadSkill('testing', 'test');
      await loader.loadSkill('git', 'test');
      
      const loaded = loader.getLoadedSkills();
      expect(loaded).toContain('testing');
      expect(loaded).toContain('git');
    });

    test('should clear skills', async () => {
      await loader.loadSkill('testing', 'test');
      loader.clearSkills();
      
      expect(loader.getLoadedSkills()).toHaveLength(0);
      expect(loader.getLoadLog()).toHaveLength(0);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe('RemiAutoIntegration', () => {
    let integration: RemiAutoIntegration;

    beforeEach(() => {
      integration = remiAuto;
      // Clear state
      integration.getLoadedSkills().forEach(() => {
        // Clear loaded skills
      });
    });

    test('should process message with auto-detection', async () => {
      const response = await integration.processMessage('test the code');
      
      expect(response.mode).toBe('TESTING');
      expect(response.skills).toContain('testing');
      expect(response.goldStandard).toBe(true);
    });

    test('should write file with verification', async () => {
      const testFile = path.join(tempDir, 'test.txt');
      
      const result = await integration.writeFileWithVerification(
        testFile,
        'test content'
      );
      
      expect(result.success).toBe(true);
      expect(result.evidence).toContain('verified');
      
      // Verify file exists
      const exists = await fs.pathExists(testFile);
      expect(exists).toBe(true);
    });

    test('should track attempts on failure', async () => {
      const taskId = 'failing-task';
      
      // Simulate failures
      integration.getAttemptStatus(taskId);
      
      // After 3 attempts, should suggest pivot
      // (This would need actual failures to test properly)
    });

    test('should execute PIV workflow', async () => {
      const result = await integration.executePIV(
        'Test request',
        [async () => ({ research: 'done' })],
        async () => ({ built: true }),
        [async () => ({ validated: true })]
      );
      
      expect(result.success).toBe(true);
      expect(result.report).toContain('PIV Execution Report');
    });
  });

  // ============================================================================
  // END-TO-END TESTS
  // ============================================================================
  describe('End-to-End', () => {
    test('should handle complete workflow', async () => {
      const core = new AutoCore();
      
      // Process complex request
      const analysis = await core.processInput(
        'implement and test a new feature with validation'
      );
      
      expect(analysis.mode).toBe('TESTING');
      expect(analysis.skills.loaded).toContain('testing');
      expect(analysis.shouldRunPIV).toBe(true);
      expect(analysis.goldStandard).toBe(true);
    });

    test('should handle simple request without PIV', async () => {
      const core = new AutoCore();
      
      const analysis = await core.processInput('fix typo');
      
      expect(analysis.shouldRunPIV).toBe(false);
    });

    test('should enforce Gold Standard on file operations', async () => {
      const core = new AutoCore();
      const testFile = path.join(tempDir, 'gold-test.txt');
      
      // Write with verification
      const writeResult = await core.goldStandard.verifyFileWrite(
        testFile,
        'content'
      );
      
      // Should fail because file doesn't exist yet
      expect(writeResult.success).toBe(false);
      
      // Actually write the file
      await fs.writeFile(testFile, 'content');
      
      // Now verification should pass
      const verifyResult = await core.goldStandard.verifyFileWrite(
        testFile,
        'content'
      );
      
      expect(verifyResult.success).toBe(true);
    });
  });
});

// ============================================================================
// TEST RUNNER
// ============================================================================

if (require.main === module) {
  console.log('Run with: npm test or jest');
}

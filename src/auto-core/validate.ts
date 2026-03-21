/**
 * Validation Script for Remi v2 Auto-Capabilities
 * Tests all three systems without external dependencies
 */

import { AutoCore } from './index';
import { remiAuto } from './integration';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class AutoCoreValidator {
  private results: TestResult[] = [];
  private tempDir: string = '';

  async setup(): Promise<void> {
    this.tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remi-validate-'));
    console.log('📁 Temp directory:', this.tempDir);
  }

  async teardown(): Promise<void> {
    await fs.remove(this.tempDir);
    console.log('🗑️  Cleaned up temp directory');
  }

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - start
      });
      console.log(`✅ ${name} (${Date.now() - start}ms)`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: String(error),
        duration: Date.now() - start
      });
      console.log(`❌ ${name} (${Date.now() - start}ms)`);
      console.log(`   Error: ${error}`);
    }
  }

  // ============================================================================
  // AUTO-GOLD-STANDARD TESTS
  // ============================================================================

  async testGoldStandardVerification(): Promise<void> {
    const core = new AutoCore();
    const testFile = path.join(this.tempDir, 'gold-test.txt');
    const content = 'Hello, Gold Standard!';

    // Write file
    await fs.writeFile(testFile, content);

    // Verify
    const result = await core.goldStandard.verifyFileWrite(testFile, content);
    if (!result.success) {
      throw new Error(`Verification failed: ${result.error}`);
    }
    if (!result.evidence?.includes('verified')) {
      throw new Error('Evidence missing verification keyword');
    }
  }

  async testGoldStandardMismatchDetection(): Promise<void> {
    const core = new AutoCore();
    const testFile = path.join(this.tempDir, 'mismatch-test.txt');

    await fs.writeFile(testFile, 'actual content');
    const result = await core.goldStandard.verifyFileWrite(testFile, 'expected content');

    if (result.success) {
      throw new Error('Should have detected mismatch');
    }
    if (!result.error?.includes('mismatch')) {
      throw new Error('Error message should mention mismatch');
    }
  }

  async testAttemptTracking(): Promise<void> {
    const core = new AutoCore();
    const taskId = 'test-task';

    const result1 = core.goldStandard.trackAttempt(taskId, 'error 1');
    if (!result1.canRetry || result1.shouldPivot) {
      throw new Error('Attempt 1 should allow retry');
    }

    const result2 = core.goldStandard.trackAttempt(taskId, 'error 2');
    if (!result2.canRetry || result2.shouldPivot) {
      throw new Error('Attempt 2 should allow retry');
    }

    const result3 = core.goldStandard.trackAttempt(taskId, 'error 3');
    if (result3.canRetry || !result3.shouldPivot) {
      throw new Error('Attempt 3 should trigger pivot');
    }

    // Check status
    const status = core.goldStandard.getAttemptStatus(taskId);
    if (!status || status.attempts !== 3) {
      throw new Error('Status should show 3 attempts');
    }
  }

  async testPivotSuggestion(): Promise<void> {
    const core = new AutoCore();
    const taskId = 'pivot-task';

    core.goldStandard.trackAttempt(taskId, 'error 1');
    core.goldStandard.trackAttempt(taskId, 'error 2');
    core.goldStandard.trackAttempt(taskId, 'error 3');

    const suggestion = core.goldStandard.generatePivotSuggestion(taskId, 'Test context');
    if (!suggestion.includes('PIVOT SUGGESTION')) {
      throw new Error('Suggestion should contain PIVOT SUGGESTION');
    }
    if (!suggestion.includes('error 1') || !suggestion.includes('error 2') || !suggestion.includes('error 3')) {
      throw new Error('Suggestion should include all errors');
    }
  }

  // ============================================================================
  // AUTO-PIV TESTS
  // ============================================================================

  async testPIVComplexityDetection(): Promise<void> {
    const core = new AutoCore();

    // Simple tasks should not trigger PIV
    if (core.piv.shouldAutoPIV('fix typo')) {
      throw new Error('Simple task should not trigger PIV');
    }
    if (core.piv.shouldAutoPIV('hello')) {
      throw new Error('Greeting should not trigger PIV');
    }

    // Complex tasks should trigger PIV
    if (!core.piv.shouldAutoPIV('implement and test a feature')) {
      throw new Error('Complex task should trigger PIV');
    }
    if (!core.piv.shouldAutoPIV('research the codebase and build a new component')) {
      throw new Error('Research + build should trigger PIV');
    }
    if (!core.piv.shouldAutoPIV('design an architecture with validation')) {
      throw new Error('Architecture + validation should trigger PIV');
    }
  }

  async testPIVSessionCreation(): Promise<void> {
    const core = new AutoCore();
    const session = core.piv.startPIV('Test request');

    if (session.request !== 'Test request') {
      throw new Error('Session should store request');
    }
    if (session.phases.length !== 3) {
      throw new Error('Session should have 3 phases');
    }
    if (session.phases[0].name !== 'PLAN') {
      throw new Error('First phase should be PLAN');
    }
  }

  async testPIVPlanPhase(): Promise<void> {
    const core = new AutoCore();
    const session = core.piv.startPIV('Test');

    const planTasks = [
      async () => ({ type: 'research1', data: 'data1' }),
      async () => ({ type: 'research2', data: 'data2' })
    ];

    const phase = await core.piv.executePlanPhase(session.id, planTasks);
    if (phase.status !== 'completed') {
      throw new Error('Plan phase should complete');
    }
    if (phase.result.length !== 2) {
      throw new Error('Should have 2 research results');
    }
  }

  async testPIVFullWorkflow(): Promise<void> {
    const core = new AutoCore();
    const session = core.piv.startPIV('Full test');

    // PLAN
    await core.piv.executePlanPhase(session.id, [
      async () => ({ research: 'done' })
    ]);

    // IMPLEMENT
    await core.piv.executeImplementPhase(session.id, async () => ({
      built: true,
      timestamp: new Date()
    }));

    // VALIDATE
    await core.piv.executeValidatePhase(session.id, [
      async () => ({ test: 'unit', passed: true }),
      async () => ({ test: 'integration', passed: true })
    ]);

    // Generate report
    const report = core.piv.generateReport(session.id);
    if (!report.includes('PIV Execution Report')) {
      throw new Error('Report should have title');
    }
    if (!report.includes('PLAN Phase')) {
      throw new Error('Report should mention PLAN phase');
    }
  }

  // ============================================================================
  // AUTO-SKILLS TESTS
  // ============================================================================

  async testSkillDetection(): Promise<void> {
    const core = new AutoCore();

    const detected = core.skills.detectSkills('test the code');
    if (!detected.P0.includes('testing')) {
      throw new Error('Should detect testing skill');
    }
  }

  async testMultiCategorySkillDetection(): Promise<void> {
    const core = new AutoCore();

    const detected = core.skills.detectSkills('test and deploy the React app');
    if (!detected.P0.includes('testing')) {
      throw new Error('Should detect testing');
    }
    if (!detected.P0.includes('react-ui-master')) {
      throw new Error('Should detect react-ui-master');
    }
    if (!detected.P1.includes('automation')) {
      throw new Error('Should detect automation');
    }
  }

  async testSkillLoading(): Promise<void> {
    const core = new AutoCore();

    const loaded = await core.skills.loadSkill('testing', 'test');
    if (!loaded) {
      throw new Error('First load should succeed');
    }

    const loaded2 = await core.skills.loadSkill('testing', 'test');
    if (loaded2) {
      throw new Error('Second load should return false (already loaded)');
    }
  }

  async testAutoSkillLoading(): Promise<void> {
    const core = new AutoCore();

    const result = await core.skills.autoLoadSkills('test the React component');
    if (!result.loaded.includes('testing')) {
      throw new Error('Should auto-load testing');
    }
    if (!result.loaded.includes('react-ui-master')) {
      throw new Error('Should auto-load react-ui-master');
    }
  }

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  async testFullIntegration(): Promise<void> {
    const core = new AutoCore();

    const analysis = await core.processInput(
      'implement and test a new feature with validation'
    );

    if (analysis.mode !== 'TESTING') {
      throw new Error(`Expected TESTING mode, got ${analysis.mode}`);
    }
    if (!analysis.skills.loaded.includes('testing')) {
      throw new Error('Should load testing skill');
    }
    if (!analysis.shouldRunPIV) {
      throw new Error('Should trigger PIV for complex request');
    }
    if (!analysis.goldStandard) {
      throw new Error('Gold Standard should be enabled');
    }
  }

  async testIntegrationFileWrite(): Promise<void> {
    const testFile = path.join(this.tempDir, 'integration-test.txt');

    const result = await remiAuto.writeFileWithVerification(
      testFile,
      'integration test content'
    );

    if (!result.success) {
      throw new Error(`Write failed: ${result.error}`);
    }

    const exists = await fs.pathExists(testFile);
    if (!exists) {
      throw new Error('File should exist after write');
    }
  }

  async testIntegrationPIV(): Promise<void> {
    const result = await remiAuto.executePIV(
      'Test PIV',
      [async () => ({ research: 'done' })],
      async () => ({ built: true }),
      [async () => ({ validated: true })]
    );

    if (!result.success) {
      throw new Error(`PIV failed: ${result.error}`);
    }
    if (!result.report.includes('PIV Execution Report')) {
      throw new Error('Report should be generated');
    }
  }

  // ============================================================================
  // RUN ALL TESTS
  // ============================================================================

  async runAllTests(): Promise<void> {
    console.log('\n🚀 Starting Remi v2 Auto-Capabilities Validation\n');
    console.log('=' .repeat(60));

    await this.setup();

    // Gold Standard Tests
    console.log('\n📋 Gold Standard Tests\n');
    await this.runTest('File verification', () => this.testGoldStandardVerification());
    await this.runTest('Mismatch detection', () => this.testGoldStandardMismatchDetection());
    await this.runTest('Attempt tracking', () => this.testAttemptTracking());
    await this.runTest('Pivot suggestion', () => this.testPivotSuggestion());

    // PIV Tests
    console.log('\n📋 PIV Orchestration Tests\n');
    await this.runTest('Complexity detection', () => this.testPIVComplexityDetection());
    await this.runTest('Session creation', () => this.testPIVSessionCreation());
    await this.runTest('Plan phase execution', () => this.testPIVPlanPhase());
    await this.runTest('Full PIV workflow', () => this.testPIVFullWorkflow());

    // Skills Tests
    console.log('\n📋 Auto-Skills Tests\n');
    await this.runTest('Skill detection', () => this.testSkillDetection());
    await this.runTest('Multi-category detection', () => this.testMultiCategorySkillDetection());
    await this.runTest('Skill loading', () => this.testSkillLoading());
    await this.runTest('Auto-skill loading', () => this.testAutoSkillLoading());

    // Integration Tests
    console.log('\n📋 Integration Tests\n');
    await this.runTest('Full integration', () => this.testFullIntegration());
    await this.runTest('File write with verification', () => this.testIntegrationFileWrite());
    await this.runTest('PIV execution', () => this.testIntegrationPIV());

    await this.teardown();

    // Report
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Results\n');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('Failed Tests:\n');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  ❌ ${r.name}`);
        console.log(`     ${r.error}\n`);
      });
      process.exit(1);
    } else {
      console.log('🎉 All tests passed!\n');
      process.exit(0);
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const validator = new AutoCoreValidator();
  validator.runAllTests().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export { AutoCoreValidator };

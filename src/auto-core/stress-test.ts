/**
 * Stress Test for Remi v2 Auto-Capabilities
 * Identifies bottlenecks and performance limits
 */

import { autoCore } from './index';

interface StressResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  throughput: number;
  memoryDelta: number;
}

class StressTester {
  private results: StressResult[] = [];

  async run(): Promise<void> {
    console.log('🔥 Remi v2 Stress Test\n');
    console.log('='.repeat(70));

    // Test 1: Skill Detection Under Load
    await this.testSkillDetection();

    // Test 2: PIV Complexity Detection
    await this.testPIVDetection();

    // Test 3: Gold Standard Attempt Tracking
    await this.testAttemptTracking();

    // Test 4: Combined Load
    await this.testCombinedLoad();

    // Test 5: Memory Pressure
    await this.testMemoryPressure();

    // Test 6: Rapid Mode Switching
    await this.testModeSwitching();

    this.printSummary();
  }

  private async benchmark(
    name: string,
    fn: () => void | Promise<void>,
    iterations: number
  ): Promise<StressResult> {
    const times: number[] = [];

    // Warmup (max 100 iterations)
    const warmupCount = Math.min(100, Math.floor(iterations / 10));
    for (let i = 0; i < warmupCount; i++) {
      await fn();
    }

    // Actual benchmark
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      const iterStart = Date.now();
      await fn();
      times.push(Date.now() - iterStart);

      // Prevent stack overflow on huge iterations
      if (times.length > 100000) {
        times.splice(0, times.length - 1000);
      }
    }
    const totalTime = Date.now() - start;

    return {
      name,
      iterations,
      totalTime,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      throughput: (iterations / totalTime) * 1000,
      memoryDelta: 0,
    };
  }

  private async testSkillDetection(): Promise<void> {
    console.log('\n📋 Test 1: Skill Detection (100,000 iterations)');

    const inputs = [
      'test the React component',
      'fix the bug in login',
      'deploy to production',
      'research authentication patterns',
      'optimize database queries',
      'document the API',
      'refactor the codebase',
      'add security audit',
    ];

    const result = await this.benchmark(
      'Skill Detection',
      () => {
        const input = inputs[Math.floor(Math.random() * inputs.length)];
        autoCore.skills.detectSkills(input);
      },
      100000
    );

    this.results.push(result);
    this.printResult(result);
  }

  private async testPIVDetection(): Promise<void> {
    console.log('\n📋 Test 2: PIV Complexity Detection (100,000 iterations)');

    const inputs = [
      'fix typo',
      'implement and test a feature',
      'hello',
      'research and build a new authentication system with validation',
      'update readme',
      'design an architecture with testing and deployment',
    ];

    const result = await this.benchmark(
      'PIV Detection',
      () => {
        const input = inputs[Math.floor(Math.random() * inputs.length)];
        autoCore.piv.shouldAutoPIV(input);
      },
      100000
    );

    this.results.push(result);
    this.printResult(result);
  }

  private async testAttemptTracking(): Promise<void> {
    console.log('\n📋 Test 3: Attempt Tracking (1,000,000 iterations)');

    let taskId = 0;
    const result = await this.benchmark(
      'Attempt Tracking',
      () => {
        const id = `task-${taskId++ % 1000}`;
        autoCore.goldStandard.trackAttempt(id, 'error');
      },
      1000000
    );

    this.results.push(result);
    this.printResult(result);
  }

  private async testCombinedLoad(): Promise<void> {
    console.log('\n📋 Test 4: Combined Load (50,000 iterations)');

    const inputs = [
      'test and deploy the React app',
      'fix the authentication bug',
      'research and implement caching',
      'document the API endpoints',
    ];

    const result = await this.benchmark(
      'Combined Load',
      async () => {
        const input = inputs[Math.floor(Math.random() * inputs.length)];
        await autoCore.processInput(input);
      },
      50000
    );

    this.results.push(result);
    this.printResult(result);
  }

  private async testMemoryPressure(): Promise<void> {
    console.log('\n📋 Test 5: Memory Pressure (10,000 PIV sessions)');

    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
      autoCore.piv.startPIV(`Request ${i}`);
    }
    const duration = Date.now() - start;

    console.log(`  Created 10,000 sessions in ${duration}ms`);
    console.log(`  Rate: ${(10000 / duration * 1000).toFixed(0)} sessions/sec`);
  }

  private async testModeSwitching(): Promise<void> {
    console.log('\n📋 Test 6: Rapid Mode Detection (100,000 iterations)');

    const inputs = [
      'hi there',
      'fix the bug',
      'test the code',
      'plan the feature',
      'research alternatives',
      'write docs',
      'review the PR',
      'implement the feature',
    ];

    const result = await this.benchmark(
      'Mode Detection',
      () => {
        const input = inputs[Math.floor(Math.random() * inputs.length)];
        autoCore.processInput(input);
      },
      100000
    );

    this.results.push(result);
    this.printResult(result);
  }

  private printResult(result: StressResult): void {
    console.log(`  Iterations: ${result.iterations.toLocaleString()}`);
    console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`  Avg time: ${result.avgTime.toFixed(4)}ms`);
    console.log(`  Min/Max: ${result.minTime.toFixed(4)}ms / ${result.maxTime.toFixed(4)}ms`);
    console.log(`  Throughput: ${result.throughput.toFixed(0)} ops/sec`);
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Stress Test Summary\n');

    const totalTime = this.results.reduce((sum, r) => sum + r.totalTime, 0);
    const totalOps = this.results.reduce((sum, r) => sum + r.iterations, 0);

    console.log(`Total operations: ${totalOps.toLocaleString()}`);
    console.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`Overall throughput: ${(totalOps / totalTime * 1000).toFixed(0)} ops/sec\n`);

    // Find bottlenecks
    console.log('Performance Analysis:\n');

    const sorted = [...this.results].sort((a, b) => b.avgTime - a.avgTime);

    sorted.forEach((r, i) => {
      const status = r.avgTime < 0.01 ? '✅' : r.avgTime < 0.1 ? '⚡' : '⚠️';
      console.log(`  ${status} ${r.name}: ${r.avgTime.toFixed(4)}ms avg (${r.throughput.toFixed(0)} ops/sec)`);
    });

    // Recommendations
    console.log('\nRecommendations:\n');

    const slowest = sorted[0];
    if (slowest.avgTime > 0.1) {
      console.log(`  ⚠️  ${slowest.name} is slowest at ${slowest.avgTime.toFixed(4)}ms`);
      console.log(`      Consider: caching, pre-compiled regex, or lazy evaluation`);
    } else {
      console.log('  ✅ All operations under 0.1ms - no optimization needed');
    }

    // Check for outliers
    const highVariance = this.results.filter(r => r.maxTime > r.avgTime * 10);
    if (highVariance.length > 0) {
      console.log(`\n  ⚠️  High variance detected in:`);
      highVariance.forEach(r => {
        console.log(`      ${r.name}: max ${r.maxTime.toFixed(4)}ms vs avg ${r.avgTime.toFixed(4)}ms`);
      });
    }

    console.log('');
  }
}

// Run stress test
const tester = new StressTester();
tester.run().catch(console.error);

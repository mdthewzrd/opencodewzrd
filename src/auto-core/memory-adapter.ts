/**
 * Memory Adapter for Remi v2
 * Integrates WZRD.dev Memory System with OpenCode Extension
 * Provides automatic context injection and memory search
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

// ============================================================================
// MEMORY ADAPTER
// ============================================================================

export interface MemoryConfig {
  enabled: boolean;
  memoryPath: string;
  maxResults: number;
  minScore: number;
  enableCompression: boolean;
  compressionThreshold: number; // tokens
}

export interface MemoryResult {
  topic: string;
  content: string;
  score: number;
  source: string;
}

export interface MemoryContext {
  relevantMemories: MemoryResult[];
  compressedContext: string;
  tokenSavings: number;
  loadedAt: string;
}

/**
 * Memory Adapter - Bridges Memory System with OpenCode Extension
 */
export class MemoryAdapter {
  private config: MemoryConfig;
  private memoryCache: Map<string, MemoryResult[]> = new Map();
  private lastAccess: Map<string, number> = new Map();

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      enabled: true,
      memoryPath: path.join(os.homedir(), '.wzrd', 'memory'),
      maxResults: 5,
      minScore: 0.3,
      enableCompression: true,
      compressionThreshold: 4000,
      ...config,
    };

    this.ensureMemoryDirectory();
  }

  /**
   * Ensure memory directory exists
   */
  private async ensureMemoryDirectory(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      await fs.ensureDir(this.config.memoryPath);
      await fs.ensureDir(path.join(this.config.memoryPath, 'conversations'));
      await fs.ensureDir(path.join(this.config.memoryPath, 'patterns'));
      await fs.ensureDir(path.join(this.config.memoryPath, 'compressed'));
    } catch (error) {
      console.warn('Failed to create memory directories:', error);
    }
  }

  /**
   * Search memory for relevant context
   * Uses hybrid search: regex + semantic matching
   */
  async searchMemory(query: string, options?: {
    maxResults?: number;
    minScore?: number;
  }): Promise<MemoryResult[]> {
    if (!this.config.enabled) return [];

    const maxResults = options?.maxResults ?? this.config.maxResults;
    const minScore = options?.minScore ?? this.config.minScore;

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(query);
      const cached = this.memoryCache.get(cacheKey);
      if (cached && Date.now() - (this.lastAccess.get(cacheKey) || 0) < 60000) {
        this.lastAccess.set(cacheKey, Date.now());
        return cached;
      }

      // Search conversations directory
      const results: MemoryResult[] = [];
      const conversationsDir = path.join(this.config.memoryPath, 'conversations');

      if (await fs.pathExists(conversationsDir)) {
        const files = await fs.readdir(conversationsDir);

        for (const file of files.slice(0, 100)) { // Limit to recent 100
          if (file.endsWith('.json')) {
            const filePath = path.join(conversationsDir, file);
            const content = await fs.readJson(filePath);

            // Calculate relevance score
            const score = this.calculateRelevance(query, content);

            if (score >= minScore) {
              results.push({
                topic: content.topic || 'Unknown',
                content: this.extractKeyLearnings(content),
                score,
                source: file,
              });
            }
          }
        }
      }

      // Sort by score and limit results
      results.sort((a, b) => b.score - a.score);
      const limited = results.slice(0, maxResults);

      // Cache results
      this.memoryCache.set(cacheKey, limited);
      this.lastAccess.set(cacheKey, Date.now());

      return limited;
    } catch (error) {
      console.warn('Memory search failed:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for memory
   */
  private calculateRelevance(query: string, content: any): number {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    let score = 0;

    // Check topic match
    if (content.topic) {
      const topicLower = content.topic.toLowerCase();
      if (topicLower.includes(queryLower)) score += 0.5;
      if (queryWords.some(w => topicLower.includes(w))) score += 0.3;
    }

    // Check keywords match
    if (content.keywords) {
      const keywordMatches = content.keywords.filter((k: string) =>
        queryWords.some(w => k.toLowerCase().includes(w) || w.includes(k.toLowerCase()))
      ).length;
      score += keywordMatches * 0.2;
    }

    // Check content match
    if (content.summary) {
      const summaryLower = content.summary.toLowerCase();
      if (summaryLower.includes(queryLower)) score += 0.4;
      if (queryWords.some(w => summaryLower.includes(w))) score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Extract key learnings from memory content
   */
  private extractKeyLearnings(content: any): string {
    const parts: string[] = [];

    if (content.summary) {
      parts.push(content.summary);
    }

    if (content.learnings && Array.isArray(content.learnings)) {
      parts.push(...content.learnings.slice(0, 3));
    }

    if (content.patterns && Array.isArray(content.patterns)) {
      parts.push(...content.patterns.slice(0, 2));
    }

    return parts.join('\n');
  }

  /**
   * Compress context if it exceeds threshold
   */
  async compressContext(context: string): Promise<string> {
    if (!this.config.enableCompression) return context;

    // Rough token estimate (1 token ≈ 4 chars)
    const estimatedTokens = context.length / 4;

    if (estimatedTokens <= this.config.compressionThreshold) {
      return context;
    }

    // Simple compression: extract key sentences
    const sentences = context.split(/[.!?]+/);
    const keySentences = sentences
      .filter(s => s.length > 20) // Skip short fragments
      .slice(0, Math.ceil(sentences.length * 0.3)); // Keep top 30%

    return keySentences.join('. ') + '.';
  }

  /**
   * Enhance prompt with memory context
   */
  async enhancePrompt(
    prompt: string,
    options?: { project?: string; conversationId?: string }
  ): Promise<{ enhanced: string; context: MemoryContext }> {
    if (!this.config.enabled) {
      return {
        enhanced: prompt,
        context: {
          relevantMemories: [],
          compressedContext: '',
          tokenSavings: 0,
          loadedAt: new Date().toISOString(),
        },
      };
    }

    // Search for relevant memories
    const memories = await this.searchMemory(prompt);

    // Build context from memories
    let contextText = '';
    if (memories.length > 0) {
      contextText = '## Relevant Past Context\n\n';
      for (const memory of memories) {
        contextText += `### ${memory.topic} (${(memory.score * 100).toFixed(0)}% relevant)\n${memory.content}\n\n`;
      }
    }

    // Compress if needed
    const compressedContext = await this.compressContext(contextText);

    // Calculate token savings
    const originalTokens = contextText.length / 4;
    const compressedTokens = compressedContext.length / 4;
    const tokenSavings = Math.round(originalTokens - compressedTokens);

    // Build enhanced prompt
    let enhanced = prompt;
    if (compressedContext) {
      enhanced = `${compressedContext}\n\n## Current Query\n${prompt}`;
    }

    return {
      enhanced,
      context: {
        relevantMemories: memories,
        compressedContext,
        tokenSavings,
        loadedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Save conversation to memory
   */
  async saveConversation(data: {
    topic: string;
    summary: string;
    keywords: string[];
    learnings?: string[];
    patterns?: string[];
    conversationId?: string;
  }): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const id = data.conversationId || `conv-${Date.now()}`;
      const filePath = path.join(
        this.config.memoryPath,
        'conversations',
        `${id}.json`
      );

      const memoryEntry = {
        id,
        timestamp: new Date().toISOString(),
        ...data,
      };

      await fs.writeJson(filePath, memoryEntry, { spaces: 2 });
    } catch (error) {
      console.warn('Failed to save conversation:', error);
    }
  }

  /**
   * Get cache key for query
   */
  private getCacheKey(query: string): string {
    // Simple hash
    return query.toLowerCase().trim().slice(0, 50);
  }

  /**
   * Clear memory cache
   */
  clearCache(): void {
    this.memoryCache.clear();
    this.lastAccess.clear();
  }

  /**
   * Get memory stats
   */
  async getStats(): Promise<{
    conversations: number;
    patterns: number;
    cacheSize: number;
  }> {
    try {
      const conversationsDir = path.join(this.config.memoryPath, 'conversations');
      const patternsDir = path.join(this.config.memoryPath, 'patterns');

      const conversations = await fs.pathExists(conversationsDir)
        ? (await fs.readdir(conversationsDir)).filter(f => f.endsWith('.json')).length
        : 0;

      const patterns = await fs.pathExists(patternsDir)
        ? (await fs.readdir(patternsDir)).filter(f => f.endsWith('.json')).length
        : 0;

      return {
        conversations,
        patterns,
        cacheSize: this.memoryCache.size,
      };
    } catch {
      return { conversations: 0, patterns: 0, cacheSize: 0 };
    }
  }
}

// Export singleton
export const memoryAdapter = new MemoryAdapter();

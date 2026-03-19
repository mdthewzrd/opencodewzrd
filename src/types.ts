/**
 * Type definitions for WZRD.dev OpenCode extension
 */

export interface Skill {
  name: string;
  description: string;
  modes: string[];
  instructions: string;
  examples: string[];
  tags: string[];
  version: string;
  author?: string;
  dependencies?: string[];
}

export interface Mode {
  name: string;
  description: string;
  triggerKeywords: string[];
  responseStyle: string;
}

export interface Configuration {
  autoModeDetection: boolean;
  skillDirectory: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxResponseLength: number;
  enableSkills: boolean;
}

export interface OpenCodeContext {
  workspace?: string;
  files?: string[];
  environment?: Record<string, string>;
  permissions?: string[];
}
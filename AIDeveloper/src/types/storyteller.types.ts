/**
 * Type definitions for the StoryTeller AI Chain
 *
 * This module defines the interfaces and types used throughout the StoryTeller
 * multi-agent workflow system. These types ensure type safety and consistency
 * when processing user prompts through the plan, code, test, debug, and review agents.
 *
 * @security All inputs are validated using Zod schemas to prevent injection attacks
 * and ensure data integrity.
 */

import { z } from 'zod';

/**
 * Schema for validating user story prompts
 * Ensures prompts are non-empty strings with reasonable length limits
 */
export const StoryPromptSchema = z.object({
  prompt: z.string().min(1).max(1000),
  genre: z.enum(['fantasy', 'sci-fi', 'mystery', 'romance', 'adventure']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

export type StoryPrompt = z.infer<typeof StoryPromptSchema>;

/**
 * Interface for agent responses in the StoryTeller chain
 * Each agent (plan, code, test, debug, review) returns this structure
 */
export interface AgentResponse {
  /** Unique identifier for the agent step */
  agentId: string;
  /** Name of the agent (e.g., 'plan', 'code') */
  agentName: string;
  /** Success status of the agent execution */
  success: boolean;
  /** Output data from the agent */
  output: any;
  /** Error message if the agent failed */
  error?: string;
  /** Timestamp of execution */
  timestamp: Date;
  /** Metadata specific to the agent */
  metadata?: Record<string, any>;
}

/**
 * Interface for the final StoryTeller output
 * Combines all agent responses into a coherent story narrative
 */
export interface StoryTellerOutput {
  /** The original user prompt */
  originalPrompt: StoryPrompt;
  /** Array of all agent responses in execution order */
  agentResponses: AgentResponse[];
  /** The final generated story */
  story: {
    title: string;
    content: string;
    summary: string;
    wordCount: number;
  };
  /** Overall success status */
  success: boolean;
  /** Total execution time in milliseconds */
  executionTime: number;
  /** Any errors that occurred during the chain */
  errors?: string[];
}

/**
 * Configuration options for the StoryTeller chain
 * Allows customization of agent behavior and timeouts
 */
export interface StoryTellerConfig {
  /** Timeout for each agent in milliseconds */
  agentTimeout: number;
  /** Maximum number of retries for failed agents */
  maxRetries: number;
  /** Whether to continue execution on agent failure */
  continueOnFailure: boolean;
  /** Logging level for the chain execution */
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Default configuration for StoryTeller chains
 */
export const DEFAULT_STORYTELLER_CONFIG: StoryTellerConfig = {
  agentTimeout: 30000, // 30 seconds
  maxRetries: 2,
  continueOnFailure: false,
  logLevel: 'info',
};

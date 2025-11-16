/**
 * Core TypeScript types and interfaces for the ChainBuilder component.
 * 
 * This file defines the foundational types for workflow orchestration,
 * module communication, and state management within the ChainBuilder.
 * 
 * @security These types ensure type safety and prevent runtime errors,
 * but all implementations using these types must validate inputs to prevent
 * injection attacks and other vulnerabilities.
 */

/**
 * Represents a module in the chain that can be executed.
 */
export interface ChainModule {
  /** Unique identifier for the module */
  id: string;
  /** Human-readable name */
  name: string;
  /** Version of the module */
  version: string;
  /** Function to execute the module with context */
  execute: (context: ExecutionContext) => Promise<ExecutionResult>;
  /** Optional validation function for inputs */
  validate?: (context: ExecutionContext) => ValidationResult;
  /** Metadata about the module */
  metadata?: Record<string, unknown>;
}

/**
 * The execution context passed between modules in a chain.
 * Contains data, state, and configuration for the current execution.
 */
export interface ExecutionContext {
  /** Unique execution ID */
  executionId: string;
  /** Current step in the chain */
  step: number;
  /** Data shared between modules */
  data: Record<string, unknown>;
  /** Configuration options */
  config: Record<string, unknown>;
  /** User context (sanitized, no sensitive data) */
  user: {
    id: string;
    role: string;
  };
  /** Timestamp of execution start */
  startTime: Date;
}

/**
 * Result returned by a module's execution.
 */
export interface ExecutionResult {
  /** Success status */
  success: boolean;
  /** Output data */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Validation result for module inputs.
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors?: string[];
}

/**
 * Represents a chain of modules to be executed in sequence.
 */
export interface Chain {
  /** Unique identifier */
  id: string;
  /** Name of the chain */
  name: string;
  /** Description */
  description?: string;
  /** Ordered list of module IDs */
  modules: string[];
  /** Configuration for the chain */
  config: Record<string, unknown>;
  /** Version */
  version: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  updatedAt: Date;
}

/**
 * State of a chain execution.
 */
export enum ChainExecutionState {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Event types for the EventBus.
 */
export enum ChainEventType {
  MODULE_REGISTERED = 'module_registered',
  CHAIN_STARTED = 'chain_started',
  MODULE_EXECUTED = 'module_executed',
  CHAIN_COMPLETED = 'chain_completed',
  CHAIN_FAILED = 'chain_failed',
  CHAIN_CANCELLED = 'chain_cancelled',
}

/**
 * Base event interface.
 */
export interface ChainEvent {
  /** Event type */
  type: ChainEventType;
  /** Event payload */
  payload: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
  /** Source (e.g., module ID or 'system') */
  source: string;
}

/**
 * State of the ChainBuilder component.
 */
export interface ChainBuilderState {
  /** Currently loaded chain */
  currentChain?: Chain;
  /** Execution state */
  executionState: ChainExecutionState;
  /** Current execution context */
  executionContext?: ExecutionContext;
  /** Registered modules */
  registeredModules: Map<string, ChainModule>;
  /** Execution history */
  executionHistory: ExecutionResult[];
  /** Error messages */
  errors: string[];
}

/**
 * Configuration for the ChainBuilder.
 */
export interface ChainBuilderConfig {
  /** Maximum execution time in milliseconds */
  maxExecutionTime: number;
  /** Whether to enable debugging */
  debug: boolean;
  /** Rate limiting for module executions */
  rateLimit: {
    requests: number;
    windowMs: number;
  };
}
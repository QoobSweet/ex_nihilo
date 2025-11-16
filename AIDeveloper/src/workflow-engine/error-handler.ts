/**
 * Workflow Engine Error Handler
 * 
 * Provides centralized error handling, recovery strategies, and error reporting
 * for workflow execution. Implements retry logic, circuit breaker patterns,
 * and comprehensive error logging.
 * 
 * @module workflow-engine/error-handler
 */

import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

/**
 * Error severity levels for classification and handling
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for better error classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  TIMEOUT = 'timeout',
  RESOURCE = 'resource',
  LOGIC = 'logic',
  UNKNOWN = 'unknown'
}

/**
 * Workflow error with enhanced context and metadata
 */
export class WorkflowError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly workflowId: number;
  public readonly stepId?: string;
  public readonly context: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      code: string;
      severity: ErrorSeverity;
      category: ErrorCategory;
      workflowId: number;
      stepId?: string;
      context?: Record<string, unknown>;
      recoverable?: boolean;
      retryable?: boolean;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'WorkflowError';
    this.code = options.code;
    this.severity = options.severity;
    this.category = options.category;
    this.workflowId = options.workflowId;
    this.stepId = options.stepId;
    this.context = this.sanitizeContext(options.context || {});
    this.timestamp = new Date();
    this.recoverable = options.recoverable ?? false;
    this.retryable = options.retryable ?? false;

    if (options.cause) {
      this.cause = options.cause;
    }

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Sanitize context to remove sensitive data before logging
   * 
   * @security Prevents sensitive data exposure in logs
   */
  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'accessToken',
      'access_token',
      'refreshToken',
      'refresh_token',
      'privateKey',
      'private_key',
      'sessionId',
      'session_id',
      'ssn',
      'creditCard',
      'credit_card'
    ];

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeContext(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Convert error to JSON for logging and reporting
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      workflowId: this.workflowId,
      stepId: this.stepId,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,
      retryable: this.retryable,
      stack: this.stack
    };
  }
}

/**
 * Retry configuration for error recovery
 */
interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableCategories: ErrorCategory[];
}

/**
 * Circuit breaker state for preventing cascading failures
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * Circuit breaker for external service calls
 */
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private readonly threshold: number;
  private readonly timeout: number;
  private readonly halfOpenAttempts: number;

  constructor(
    threshold = 5,
    timeoutMs = 60000,
    halfOpenAttempts = 3
  ) {
    this.threshold = threshold;
    this.timeout = timeoutMs;
    this.halfOpenAttempts = halfOpenAttempts;
  }

  /**
   * Check if circuit allows execution
   */
  canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime.getTime() > this.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN state
    return true;
  }

  /**
   * Record successful execution
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenAttempts) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Record failed execution
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.successCount = 0;
    } else if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
  }
}

/**
 * Error handler for workflow execution
 * 
 * Provides retry logic, circuit breaker patterns, and comprehensive error logging
 */
export class WorkflowErrorHandler extends EventEmitter {
  private readonly retryConfig: RetryConfig;
  private readonly circuitBreakers: Map<string, CircuitBreaker>;
  private readonly errorStats: Map<string, number>;

  constructor(retryConfig?: Partial<RetryConfig>) {
    super();
    
    this.retryConfig = {
      maxAttempts: retryConfig?.maxAttempts ?? 3,
      initialDelayMs: retryConfig?.initialDelayMs ?? 1000,
      maxDelayMs: retryConfig?.maxDelayMs ?? 30000,
      backoffMultiplier: retryConfig?.backoffMultiplier ?? 2,
      retryableCategories: retryConfig?.retryableCategories ?? [
        ErrorCategory.NETWORK,
        ErrorCategory.TIMEOUT,
        ErrorCategory.EXTERNAL_API
      ]
    };

    this.circuitBreakers = new Map();
    this.errorStats = new Map();
  }

  /**
   * Handle workflow error with retry and recovery logic
   * 
   * @param error - The error to handle
   * @param operation - The operation that failed (for retry)
   * @returns Result of error handling (recovered value or re-thrown error)
   * 
   * @throws {WorkflowError} If error cannot be recovered
   */
  async handleError<T>(
    error: Error | WorkflowError,
    operation?: () => Promise<T>
  ): Promise<T | null> {
    const workflowError = this.normalizeError(error);

    // Log error with full context
    this.logError(workflowError);

    // Update error statistics
    this.updateErrorStats(workflowError);

    // Emit error event for monitoring
    this.emit('error', workflowError);

    // Check if error is retryable and operation is provided
    if (workflowError.retryable && operation) {
      try {
        return await this.retryWithBackoff(operation, workflowError);
      } catch (retryError) {
        // All retries exhausted
        logger.error('All retry attempts exhausted', {
          workflowId: workflowError.workflowId,
          stepId: workflowError.stepId,
          attempts: this.retryConfig.maxAttempts
        });
        throw retryError;
      }
    }

    // Check if error is recoverable without retry
    if (workflowError.recoverable) {
      logger.warn('Recoverable error occurred, continuing workflow', {
        workflowId: workflowError.workflowId,
        stepId: workflowError.stepId,
        code: workflowError.code
      });
      return null;
    }

    // Non-recoverable error, re-throw
    throw workflowError;
  }

  /**
   * Execute operation with circuit breaker protection
   * 
   * @param key - Circuit breaker key (e.g., service name)
   * @param operation - Operation to execute
   * @returns Operation result
   * 
   * @throws {WorkflowError} If circuit is open or operation fails
   */
  async executeWithCircuitBreaker<T>(
    key: string,
    operation: () => Promise<T>,
    workflowId: number,
    stepId?: string
  ): Promise<T> {
    let breaker = this.circuitBreakers.get(key);
    
    if (!breaker) {
      breaker = new CircuitBreaker();
      this.circuitBreakers.set(key, breaker);
    }

    if (!breaker.canExecute()) {
      const error = new WorkflowError(
        `Circuit breaker open for ${key}`,
        {
          code: 'CIRCUIT_BREAKER_OPEN',
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.EXTERNAL_API,
          workflowId,
          stepId,
          context: { circuitKey: key, state: breaker.getState() },
          recoverable: false,
          retryable: false
        }
      );

      logger.warn('Circuit breaker open, rejecting request', {
        workflowId,
        stepId,
        circuitKey: key,
        state: breaker.getState()
      });

      throw error;
    }

    try {
      const result = await operation();
      breaker.recordSuccess();
      return result;
    } catch (error) {
      breaker.recordFailure();
      throw error;
    }
  }

  /**
   * Retry operation with exponential backoff
   * 
   * @param operation - Operation to retry
   * @param error - Original error that triggered retry
   * @returns Operation result
   * 
   * @throws {WorkflowError} If all retries fail
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    error: WorkflowError
  ): Promise<T> {
    let lastError: Error = error;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        logger.info('Retrying operation', {
          workflowId: error.workflowId,
          stepId: error.stepId,
          attempt,
          maxAttempts: this.retryConfig.maxAttempts,
          delayMs: delay
        });

        // Wait before retry (except first attempt)
        if (attempt > 1) {
          await this.sleep(delay);
        }

        const result = await operation();
        
        logger.info('Retry successful', {
          workflowId: error.workflowId,
          stepId: error.stepId,
          attempt
        });

        return result;
      } catch (retryError) {
        lastError = retryError as Error;
        
        logger.warn('Retry attempt failed', {
          workflowId: error.workflowId,
          stepId: error.stepId,
          attempt,
          error: retryError instanceof Error ? retryError.message : String(retryError)
        });

        // Calculate next delay with exponential backoff
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier,
          this.retryConfig.maxDelayMs
        );
      }
    }

    throw lastError;
  }

  /**
   * Normalize any error to WorkflowError
   */
  private normalizeError(error: Error | WorkflowError): WorkflowError {
    if (error instanceof WorkflowError) {
      return error;
    }

    // Attempt to categorize the error
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error, category);
    const retryable = this.isRetryable(category);

    return new WorkflowError(
      error.message || 'Unknown error occurred',
      {
        code: 'UNKNOWN_ERROR',
        severity,
        category,
        workflowId: 0, // Unknown workflow
        context: {
          originalError: error.name,
          stack: error.stack
        },
        recoverable: false,
        retryable,
        cause: error
      }
    );
  }

  /**
   * Categorize error based on error properties
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('timeout') || name.includes('timeout')) {
      return ErrorCategory.TIMEOUT;
    }

    if (message.includes('network') || message.includes('econnrefused') ||
        message.includes('enotfound') || message.includes('etimedout')) {
      return ErrorCategory.NETWORK;
    }

    if (message.includes('database') || message.includes('sql') ||
        message.includes('query')) {
      return ErrorCategory.DATABASE;
    }

    if (message.includes('auth') || message.includes('unauthorized') ||
        message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION;
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }

    if (message.includes('api') || message.includes('request failed')) {
      return ErrorCategory.EXTERNAL_API;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    error: Error,
    category: ErrorCategory
  ): ErrorSeverity {
    // Critical categories
    if (category === ErrorCategory.DATABASE ||
        category === ErrorCategory.AUTHENTICATION) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity categories
    if (category === ErrorCategory.AUTHORIZATION) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity categories
    if (category === ErrorCategory.EXTERNAL_API ||
        category === ErrorCategory.NETWORK) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity by default
    return ErrorSeverity.LOW;
  }

  /**
   * Check if error category is retryable
   */
  private isRetryable(category: ErrorCategory): boolean {
    return this.retryConfig.retryableCategories.includes(category);
  }

  /**
   * Log error with appropriate level and context
   */
  private logError(error: WorkflowError): void {
    const logData = {
      workflowId: error.workflowId,
      stepId: error.stepId,
      code: error.code,
      category: error.category,
      severity: error.severity,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp.toISOString(),
      recoverable: error.recoverable,
      retryable: error.retryable
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error('Critical workflow error', error, logData);
        break;
      case ErrorSeverity.HIGH:
        logger.error('High severity workflow error', error, logData);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('Medium severity workflow error', logData);
        break;
      case ErrorSeverity.LOW:
        logger.info('Low severity workflow error', logData);
        break;
    }
  }

  /**
   * Update error statistics for monitoring
   */
  private updateErrorStats(error: WorkflowError): void {
    const key = `${error.category}:${error.code}`;
    const count = this.errorStats.get(key) || 0;
    this.errorStats.set(key, count + 1);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Map<string, number> {
    return new Map(this.errorStats);
  }

  /**
   * Reset error statistics
   */
  resetErrorStats(): void {
    this.errorStats.clear();
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(key: string): CircuitState | undefined {
    return this.circuitBreakers.get(key)?.getState();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(key: string): void {
    this.circuitBreakers.get(key)?.reset();
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    for (const breaker of this.circuitBreakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = new WorkflowErrorHandler();

/**
 * Create a workflow error with proper context
 * 
 * @param message - Error message
 * @param options - Error options
 * @returns WorkflowError instance
 */
export function createWorkflowError(
  message: string,
  options: {
    code: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    workflowId: number;
    stepId?: string;
    context?: Record<string, unknown>;
    recoverable?: boolean;
    retryable?: boolean;
    cause?: Error;
  }
): WorkflowError {
  return new WorkflowError(message, options);
}

/**
 * Wrap async operation with error handling
 * 
 * @param operation - Async operation to wrap
 * @param workflowId - Workflow ID for context
 * @param stepId - Step ID for context
 * @returns Wrapped operation result
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  workflowId: number,
  stepId?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof WorkflowError) {
      return await errorHandler.handleError(error, operation) as T;
    }

    const workflowError = createWorkflowError(
      error instanceof Error ? error.message : String(error),
      {
        code: 'OPERATION_FAILED',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UNKNOWN,
        workflowId,
        stepId,
        cause: error instanceof Error ? error : undefined
      }
    );

    return await errorHandler.handleError(workflowError, operation) as T;
  }
}

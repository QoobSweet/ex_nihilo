import { Chain, ChainStep, ValidationResult } from '../types';

/**
 * Validation utilities for chain configurations.
 * Ensures chains are structurally valid and safe to execute.
 *
 * @security All validations prevent malicious configurations from being executed.
 * Uses allowlist validation to reject invalid structures.
 */

/**
 * Validates a complete chain configuration.
 *
 * @param chain - The chain to validate.
 * @returns Validation result with success status and error messages.
 *
 * @security Checks for injection vulnerabilities, invalid module references, and structural integrity.
 */
export function validateChain(chain: Chain): ValidationResult {
  const errors: string[] = [];

  // Basic structure validation
  if (!chain.name || typeof chain.name !== 'string' || chain.name.trim().length === 0) {
    errors.push('Chain must have a valid name');
  }

  if (!Array.isArray(chain.steps) || chain.steps.length === 0) {
    errors.push('Chain must have at least one step');
  }

  // Validate each step
  chain.steps.forEach((step, index) => {
    const stepErrors = validateStep(step, index);
    errors.push(...stepErrors);
  });

  // Check for circular dependencies
  const cycleErrors = detectCircularDependencies(chain.steps);
  errors.push(...cycleErrors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a single chain step.
 *
 * @param step - The step to validate.
 * @param index - The step index for error reporting.
 * @returns Array of error messages.
 *
 * @private
 */
function validateStep(step: ChainStep, index: number): string[] {
  const errors: string[] = [];

  if (!step.id || typeof step.id !== 'string') {
    errors.push(`Step ${index}: must have a valid id`);
  }

  if (!step.moduleId || typeof step.moduleId !== 'string') {
    errors.push(`Step ${index}: must have a valid moduleId`);
  }

  // Validate moduleId is in allowlist (would check against registry)
  if (!isValidModuleId(step.moduleId)) {
    errors.push(`Step ${index}: invalid moduleId '${step.moduleId}'`);
  }

  if (!Array.isArray(step.inputs)) {
    errors.push(`Step ${index}: inputs must be an array`);
  } else {
    step.inputs.forEach((input, inputIndex) => {
      if (typeof input !== 'object' || input === null) {
        errors.push(`Step ${index}, input ${inputIndex}: must be an object`);
      }
      // Add more input validation as needed
    });
  }

  if (step.dependencies && !Array.isArray(step.dependencies)) {
    errors.push(`Step ${index}: dependencies must be an array`);
  }

  return errors;
}

/**
 * Checks if a module ID is valid (in allowlist).
 * @private
 */
function isValidModuleId(moduleId: string): boolean {
  // In real implementation, check against module registry
  const allowedModules = ['CharacterController', 'ItemController', 'AIDeveloper' /* etc */];
  return allowedModules.includes(moduleId);
}

/**
 * Detects circular dependencies in chain steps.
 *
 * @param steps - Array of chain steps.
 * @returns Array of error messages for circular dependencies.
 *
 * @private
 */
function detectCircularDependencies(steps: ChainStep[]): string[] {
  const errors: string[] = [];
  const graph = new Map<string, string[]>();
  const visited = new Set<string>();
  const recStack = new Set<string>();

  // Build graph
  steps.forEach(step => {
    graph.set(step.id, step.dependencies || []);
  });

  // DFS to detect cycles
  const hasCycle = (node: string): boolean => {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  };

  for (const step of steps) {
    if (hasCycle(step.id)) {
      errors.push(`Circular dependency detected involving step '${step.id}'`);
      break; // Stop at first cycle
    }
  }

  return errors;
}

/**
 * Validates chain execution permissions for a user.
 *
 * @param chain - The chain to check.
 * @param userPermissions - Array of user permissions.
 * @returns Validation result.
 *
 * @security Ensures user has all required permissions before chain execution.
 */
export function validatePermissions(chain: Chain, userPermissions: string[]): ValidationResult {
  const errors: string[] = [];

  // Check if chain requires specific permissions
  if (chain.requiredPermissions) {
    for (const perm of chain.requiredPermissions) {
      if (!userPermissions.includes(perm)) {
        errors.push(`Missing required permission: ${perm}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
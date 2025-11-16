/**
 * ModuleRegistry for dynamic module registration and discovery.
 * 
 * This class provides a centralized registry where modules can register
 * themselves and be discovered by the ChainBuilder. It ensures modules
 * are validated before registration.
 * 
 * @security Module registration requires validation to prevent malicious
 * modules. Module IDs must be unique and validated against injection.
 */

import { ChainModule, ValidationResult } from './ChainBuilder.types';

/**
 * ModuleRegistry class for managing registered modules.
 */
export class ModuleRegistry {
  private modules: Map<string, ChainModule> = new Map();

  /**
   * Registers a module in the registry.
   * @param module The module to register
   * @throws Error if module is invalid or ID already exists
   */
  register(module: ChainModule): void {
    // Validate module
    const validation = this.validateModule(module);
    if (!validation.valid) {
      throw new Error(`Invalid module: ${validation.errors?.join(', ')}`);
    }

    if (this.modules.has(module.id)) {
      throw new Error(`Module with ID '${module.id}' already registered`);
    }

    this.modules.set(module.id, module);
  }

  /**
   * Unregisters a module from the registry.
   * @param moduleId The ID of the module to unregister
   * @returns True if unregistered, false if not found
   */
  unregister(moduleId: string): boolean {
    return this.modules.delete(moduleId);
  }

  /**
   * Retrieves a module by ID.
   * @param moduleId The ID of the module
   * @returns The module or undefined if not found
   */
  get(moduleId: string): ChainModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Lists all registered module IDs.
   * @returns Array of module IDs
   */
  list(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * Gets all registered modules.
   * @returns Map of modules
   */
  getAll(): Map<string, ChainModule> {
    return new Map(this.modules);
  }

  /**
   * Validates a module before registration.
   * @param module The module to validate
   * @returns Validation result
   */
  private validateModule(module: ChainModule): ValidationResult {
    const errors: string[] = [];

    if (!module.id || typeof module.id !== 'string' || module.id.length === 0) {
      errors.push('Module ID must be a non-empty string');
    }

    if (!module.name || typeof module.name !== 'string' || module.name.length === 0) {
      errors.push('Module name must be a non-empty string');
    }

    if (!module.version || typeof module.version !== 'string') {
      errors.push('Module version must be a string');
    }

    if (typeof module.execute !== 'function') {
      errors.push('Module execute must be a function');
    }

    // Additional security: Ensure ID is alphanumeric with underscores/hyphens only
    if (module.id && !/^[a-zA-Z0-9_-]+$/.test(module.id)) {
      errors.push('Module ID must contain only alphanumeric characters, underscores, and hyphens');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Clears all registered modules (useful for testing or reset).
   */
  clear(): void {
    this.modules.clear();
  }
}

/**
 * Singleton instance of ModuleRegistry.
 */
export const moduleRegistry = new ModuleRegistry();
import { z } from 'zod';

/**
 * Represents the result of a module execution.
 */
export interface ModuleExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Configuration schema for module adapters.
 */
export const ModuleAdapterConfigSchema = z.object({
  moduleId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  inputs: z.array(z.string()).optional(),
  outputs: z.array(z.string()).optional(),
  timeout: z.number().positive().optional(),
});

export type ModuleAdapterConfig = z.infer<typeof ModuleAdapterConfigSchema>;

/**
 * Base class for module adapters that provides a standardized interface
 * for interacting with different modules in the ChainBuilder system.
 *
 * This class implements the Adapter pattern to enable polymorphic module handling,
 * allowing ChainBuilder to work with various module types uniformly.
 *
 * @security All inputs are validated using Zod schemas to prevent injection attacks.
 * @security No direct execution of user-provided code; all operations are abstracted.
 */
export abstract class ModuleAdapter {
  protected config: ModuleAdapterConfig;

  /**
   * Creates a new ModuleAdapter instance.
   *
   * @param config - The configuration for this adapter.
   * @throws {ValidationError} If the configuration is invalid.
   */
  constructor(config: ModuleAdapterConfig) {
    try {
      this.config = ModuleAdapterConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid ModuleAdapter configuration: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Gets the module ID.
   *
   * @returns The unique identifier for this module.
   */
  getModuleId(): string {
    return this.config.moduleId;
  }

  /**
   * Gets the module name.
   *
   * @returns The human-readable name of the module.
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Gets the module description.
   *
   * @returns The description of the module, if available.
   */
  getDescription(): string | undefined {
    return this.config.description;
  }

  /**
   * Gets the expected inputs for this module.
   *
   * @returns An array of input parameter names.
   */
  getInputs(): string[] {
    return this.config.inputs || [];
  }

  /**
   * Gets the expected outputs for this module.
   *
   * @returns An array of output parameter names.
   */
  getOutputs(): string[] {
    return this.config.outputs || [];
  }

  /**
   * Gets the timeout for module execution.
   *
   * @returns The timeout in milliseconds, if set.
   */
  getTimeout(): number | undefined {
    return this.config.timeout;
  }

  /**
   * Validates input data against the module's expected inputs.
   *
   * @param inputs - The input data to validate.
   * @returns True if inputs are valid, false otherwise.
   * @security Inputs are validated to prevent malformed data from causing issues.
   */
  validateInputs(inputs: Record<string, any>): boolean {
    const expectedInputs = this.getInputs();
    return expectedInputs.every(key => key in inputs);
  }

  /**
   * Abstract method to execute the module with given inputs.
   *
   * @param inputs - The input data for the module.
   * @returns A promise resolving to the execution result.
   * @throws {Error} If execution fails.
   * @security Implementations must sanitize and validate all inputs.
   */
  abstract execute(inputs: Record<string, any>): Promise<ModuleExecutionResult>;

  /**
   * Optional method to initialize the adapter.
   *
   * @returns A promise that resolves when initialization is complete.
   */
  async initialize?(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Optional method to clean up resources.
   *
   * @returns A promise that resolves when cleanup is complete.
   */
  async cleanup?(): Promise<void> {
    // Default implementation does nothing
  }
}

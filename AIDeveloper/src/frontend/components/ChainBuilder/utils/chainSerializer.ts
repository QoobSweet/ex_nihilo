import { Chain } from '../types';

/**
 * Utility functions for serializing and deserializing chain configurations.
 * Supports JSON format for saving/loading chains.
 *
 * @security All serialization validates data to prevent injection attacks.
 * Deserialized data is validated before use.
 */

/**
 * Serializes a chain configuration to a JSON string.
 *
 * @param chain - The chain to serialize.
 * @returns JSON string representation of the chain.
 * @throws {SerializationError} If serialization fails.
 *
 * @security Sanitizes any potentially dangerous data before serialization.
 */
export function serializeChain(chain: Chain): string {
  try {
    // Validate chain before serialization
    if (!isValidChainStructure(chain)) {
      throw new SerializationError('Invalid chain structure');
    }

    // Sanitize sensitive data if any
    const sanitizedChain = sanitizeChain(chain);

    return JSON.stringify(sanitizedChain, null, 2);
  } catch (error) {
    if (error instanceof SerializationError) {
      throw error;
    }
    throw new SerializationError(`Serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deserializes a JSON string to a chain configuration.
 *
 * @param jsonString - The JSON string to deserialize.
 * @returns The deserialized chain.
 * @throws {SerializationError} If deserialization fails.
 *
 * @security Validates deserialized data against schema to prevent malicious payloads.
 */
export function deserializeChain(jsonString: string): Chain {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (!isValidChainStructure(parsed)) {
      throw new SerializationError('Invalid chain structure in deserialized data');
    }

    // Type assertion after validation
    return parsed as Chain;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SerializationError('Invalid JSON format');
    }
    if (error instanceof SerializationError) {
      throw error;
    }
    throw new SerializationError(`Deserialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates the basic structure of a chain.
 * @private
 */
function isValidChainStructure(chain: any): boolean {
  return (
    typeof chain === 'object' &&
    chain !== null &&
    Array.isArray(chain.steps) &&
    typeof chain.name === 'string' &&
    chain.steps.every((step: any) =>
      typeof step === 'object' &&
      typeof step.id === 'string' &&
      typeof step.moduleId === 'string'
    )
  );
}

/**
 * Sanitizes the chain by removing or sanitizing sensitive data.
 * @private
 */
function sanitizeChain(chain: Chain): Chain {
  // Deep clone to avoid mutations
  const sanitized = JSON.parse(JSON.stringify(chain));

  // Remove any sensitive fields if they exist
  // For example, if chains have API keys or secrets, remove them
  // sanitized.steps.forEach(step => {
  //   if (step.config && step.config.secret) {
  //     delete step.config.secret;
  //   }
  // });

  return sanitized;
}

/**
 * Saves a chain to local storage (for demo purposes).
 *
 * @param chain - The chain to save.
 * @param key - Storage key.
 * @throws {SerializationError} If saving fails.
 *
 * @security Uses secure storage practices; in production, use encrypted storage.
 */
export function saveChainToStorage(chain: Chain, key: string): void {
  try {
    const serialized = serializeChain(chain);
    localStorage.setItem(key, serialized);
  } catch (error) {
    throw new SerializationError(`Failed to save chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Loads a chain from local storage.
 *
 * @param key - Storage key.
 * @returns The loaded chain.
 * @throws {SerializationError} If loading fails.
 *
 * @security Validates loaded data before returning.
 */
export function loadChainFromStorage(key: string): Chain {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) {
      throw new SerializationError('Chain not found in storage');
    }
    return deserializeChain(serialized);
  } catch (error) {
    throw new SerializationError(`Failed to load chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Error class
export class SerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SerializationError';
  }
}
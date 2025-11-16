import { useState, useCallback, useEffect } from 'react';
import { Chain, ChainExecutionResult, ChainExecutionContext } from '../types';
import { ChainExecutor } from '../ChainExecutor';
import { validateChain } from '../utils/validators';
import { serializeChain, deserializeChain } from '../utils/chainSerializer';

/**
 * Custom React hook for managing ChainBuilder state and operations.
 * Provides methods for creating, editing, validating, and executing chains.
 *
 * @param initialChain - Optional initial chain configuration.
 * @param context - Execution context with user permissions.
 * @returns Hook API for chain management.
 *
 * @security Validates all chain operations and ensures user permissions are checked.
 */
export function useChainBuilder(
  initialChain?: Chain,
  context: ChainExecutionContext
) {
  const [chain, setChain] = useState<Chain | null>(initialChain || null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ChainExecutionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [executor] = useState(() => new ChainExecutor(context));

  // Validate chain whenever it changes
  useEffect(() => {
    if (chain) {
      const validation = validateChain(chain);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [chain]);

  /**
   * Updates the current chain configuration.
   */
  const updateChain = useCallback((newChain: Chain) => {
    setChain(newChain);
  }, []);

  /**
   * Adds a new step to the chain.
   */
  const addStep = useCallback((step: Omit<ChainStep, 'id'>) => {
    if (!chain) return;

    const newStep: ChainStep = {
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setChain({
      ...chain,
      steps: [...chain.steps, newStep]
    });
  }, [chain]);

  /**
   * Removes a step from the chain.
   */
  const removeStep = useCallback((stepId: string) => {
    if (!chain) return;

    setChain({
      ...chain,
      steps: chain.steps.filter(step => step.id !== stepId)
    });
  }, []);

  /**
   * Executes the current chain.
   */
  const executeChain = useCallback(async () => {
    if (!chain || validationErrors.length > 0) {
      setExecutionResult({
        success: false,
        error: 'Chain is invalid or not set'
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const results = await executor.executeChain(chain);
      setExecutionResult({
        success: true,
        results
      });
    } catch (error) {
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed'
      });
    } finally {
      setIsExecuting(false);
    }
  }, [chain, validationErrors, executor]);

  /**
   * Saves the current chain to a string.
   */
  const saveChain = useCallback(() => {
    if (!chain) return null;
    try {
      return serializeChain(chain);
    } catch (error) {
      console.error('Failed to save chain:', error);
      return null;
    }
  }, [chain]);

  /**
   * Loads a chain from a string.
   */
  const loadChain = useCallback((chainString: string) => {
    try {
      const loadedChain = deserializeChain(chainString);
      setChain(loadedChain);
    } catch (error) {
      console.error('Failed to load chain:', error);
      setValidationErrors(['Failed to load chain: invalid format']);
    }
  }, []);

  /**
   * Resets the chain to initial state.
   */
  const resetChain = useCallback(() => {
    setChain(initialChain || null);
    setExecutionResult(null);
    setValidationErrors([]);
  }, [initialChain]);

  return {
    chain,
    updateChain,
    addStep,
    removeStep,
    executeChain,
    saveChain,
    loadChain,
    resetChain,
    isExecuting,
    executionResult,
    validationErrors,
    isValid: validationErrors.length === 0
  };
}
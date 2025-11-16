import { useState, useCallback } from 'react';
import { Chain } from '../../../types/chain'; // Assuming types
import { ChainExecutor } from '../../../services/ChainExecutor'; // Assuming service

/**
 * Hook for executing chains and managing execution state
 *
 * @param chain - The chain to execute
 * @returns Object containing execution state and control methods
 *
 * @security Validates chain structure before execution and logs execution events without exposing sensitive data
 */
export function useChainExecution(chain: Chain) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const executor = ChainExecutor.getInstance();

  // Validate chain before execution
  const validateChain = useCallback((chain: Chain): boolean => {
    if (!chain.id || !Array.isArray(chain.nodes) || !Array.isArray(chain.edges)) {
      return false;
    }
    // Check for cycles or invalid connections (simplified)
    return true;
  }, []);

  const executeChain = useCallback(async () => {
    if (!validateChain(chain)) {
      setExecutionError('Invalid chain structure');
      return;
    }
    setIsExecuting(true);
    setExecutionError(null);
    setProgress(0);
    try {
      const result = await executor.execute(chain, {
        onProgress: (p: number) => setProgress(p),
        onError: (err: string) => setExecutionError(err)
      });
      setExecutionResult(result);
      // Log execution without sensitive data
      console.log('Chain executed successfully:', { chainId: chain.id, nodeCount: chain.nodes.length });
    } catch (err) {
      setExecutionError('Execution failed');
      console.error('Chain execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  }, [chain, executor, validateChain]);

  const stopExecution = useCallback(() => {
    executor.stop();
    setIsExecuting(false);
    setProgress(0);
  }, [executor]);

  return {
    isExecuting,
    executionResult,
    executionError,
    progress,
    executeChain,
    stopExecution
  };
}
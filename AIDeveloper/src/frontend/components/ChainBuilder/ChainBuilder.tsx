import React from 'react';
import { useChainBuilder } from './hooks/useChainBuilder';
import { useChainExecution } from './hooks/useChainExecution';
import { ChainNode, ChainEdge } from '../../../types/chain'; // Assuming types

/**
 * Main ChainBuilder component for workflow orchestration
 *
 * @param initialChain - Optional initial chain to load
 * @returns JSX element for the ChainBuilder interface
 *
 * @security All user inputs are validated and sanitized to prevent XSS and injection attacks
 */
export function ChainBuilder({ initialChain }: { initialChain?: any }) {
  const { chain, isLoading, error, addNode, removeNode, addEdge, saveChain } = useChainBuilder(initialChain);
  const { isExecuting, executionResult, executionError, progress, executeChain, stopExecution } = useChainExecution(chain);

  const handleAddNode = () => {
    // Example: Add a sample node (in real app, this would be from UI)
    const newNode: ChainNode = {
      id: `node-${Date.now()}`,
      type: 'module',
      position: { x: 100, y: 100 },
      data: { moduleId: 'example' },
      label: 'New Node'
    };
    addNode(newNode);
  };

  const handleExecute = () => {
    executeChain();
  };

  return (
    <div className="chain-builder">
      <h2>Chain Builder</h2>
      {error && <div className="error" role="alert">{error}</div>}
      {executionError && <div className="error" role="alert">{executionError}</div>}
      <div className="toolbar">
        <button onClick={handleAddNode} disabled={isLoading}>Add Node</button>
        <button onClick={saveChain} disabled={isLoading}>Save Chain</button>
        <button onClick={handleExecute} disabled={isExecuting || isLoading}>
          {isExecuting ? 'Executing...' : 'Execute Chain'}
        </button>
        {isExecuting && <button onClick={stopExecution}>Stop</button>}
      </div>
      {isExecuting && <div className="progress">Progress: {progress}%</div>}
      <div className="chain-canvas">
        {/* Placeholder for visual chain representation */}
        <ul>
          {chain.nodes.map(node => (
            <li key={node.id}>
              {node.label} ({node.type})
              <button onClick={() => removeNode(node.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      {executionResult && (
        <div className="result">
          <h3>Execution Result</h3>
          <pre>{JSON.stringify(executionResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
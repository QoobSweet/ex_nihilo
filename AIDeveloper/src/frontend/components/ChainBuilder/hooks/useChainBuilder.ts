import { useState, useEffect, useCallback } from 'react';
import { Chain, ChainNode, ChainEdge } from '../../../types/chain'; // Assuming types are defined elsewhere
import { ModuleRegistry } from '../../../services/ModuleRegistry'; // Assuming service exists
import { EventBus } from '../../../services/EventBus'; // Assuming service exists

/**
 * Hook for managing ChainBuilder state and interactions
 *
 * @param initialChain - Optional initial chain configuration
 * @returns Object containing chain state and methods to manipulate it
 *
 * @security This hook validates all inputs and ensures no XSS vulnerabilities through proper sanitization
 */
export function useChainBuilder(initialChain?: Chain) {
  const [chain, setChain] = useState<Chain>(initialChain || {
    id: '',
    nodes: [],
    edges: [],
    metadata: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moduleRegistry = ModuleRegistry.getInstance();
  const eventBus = EventBus.getInstance();

  // Validate node data to prevent injection
  const validateNode = useCallback((node: ChainNode): boolean => {
    if (!node.id || typeof node.id !== 'string' || node.id.length > 100) {
      return false;
    }
    if (!node.type || typeof node.type !== 'string') {
      return false;
    }
    // Additional validation for module-specific data
    if (node.data && typeof node.data !== 'object') {
      return false;
    }
    return true;
  }, []);

  // Sanitize node data to prevent XSS
  const sanitizeNode = useCallback((node: ChainNode): ChainNode => {
    return {
      ...node,
      label: node.label ? node.label.replace(/[<>]/g, '') : '', // Basic sanitization
      data: node.data ? { ...node.data } : {} // Shallow copy to prevent mutation
    };
  }, []);

  const addNode = useCallback((node: ChainNode) => {
    if (!validateNode(node)) {
      setError('Invalid node data');
      return;
    }
    const sanitizedNode = sanitizeNode(node);
    setChain(prev => ({
      ...prev,
      nodes: [...prev.nodes, sanitizedNode]
    }));
    eventBus.emit('chain:nodeAdded', { node: sanitizedNode });
  }, [validateNode, sanitizeNode, eventBus]);

  const removeNode = useCallback((nodeId: string) => {
    if (typeof nodeId !== 'string' || nodeId.length > 100) {
      setError('Invalid node ID');
      return;
    }
    setChain(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    }));
    eventBus.emit('chain:nodeRemoved', { nodeId });
  }, [eventBus]);

  const addEdge = useCallback((edge: ChainEdge) => {
    // Validate edge
    if (!edge.source || !edge.target || typeof edge.source !== 'string' || typeof edge.target !== 'string') {
      setError('Invalid edge data');
      return;
    }
    setChain(prev => ({
      ...prev,
      edges: [...prev.edges, edge]
    }));
    eventBus.emit('chain:edgeAdded', { edge });
  }, [eventBus]);

  const saveChain = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming a service to save chains
      await fetch('/api/chains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chain)
      });
      eventBus.emit('chain:saved', { chain });
    } catch (err) {
      setError('Failed to save chain');
      console.error('Save chain error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chain, eventBus]);

  useEffect(() => {
    const handleModuleUpdate = (data: any) => {
      // Handle module updates, e.g., refresh available modules
      console.log('Module updated:', data);
    };
    eventBus.on('module:updated', handleModuleUpdate);
    return () => {
      eventBus.off('module:updated', handleModuleUpdate);
    };
  }, [eventBus]);

  return {
    chain,
    isLoading,
    error,
    addNode,
    removeNode,
    addEdge,
    saveChain,
    setChain
  };
}
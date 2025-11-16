// Assuming this is the existing store file structure
// Add imports and integration for ChainStateManager

import { ChainStateManager } from '../components/ChainBuilder/ChainStateManager';

// Existing store code...
// (Assuming a Redux-like store or similar)

// Add ChainStateManager instance to the store
export const chainStateManager = new ChainStateManager({
  enableRollback: true,
  maxRetries: 3,
});

// Integrate with existing store if needed
// For example, if using Redux:
// store.dispatch({ type: 'INIT_CHAIN_STATE_MANAGER', payload: chainStateManager });

// Export other existing items...

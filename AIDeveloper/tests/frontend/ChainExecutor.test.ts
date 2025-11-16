import { ChainExecutor } from '../../src/frontend/services/ChainExecutor';
import { ModuleRegistry } from '../../src/frontend/services/ModuleRegistry';
import { EventBus } from '../../src/frontend/services/EventBus';
import { WorkflowState } from '../../src/frontend/stores/WorkflowStore';
import { z } from 'zod';

describe('ChainExecutor Service', () => {
  let executor: ChainExecutor;
  let mockModuleRegistry: ModuleRegistry;
  let mockEventBus: EventBus;
  let mockWorkflowState: WorkflowState;

  beforeEach(() => {
    mockModuleRegistry = new ModuleRegistry();
    mockEventBus = new EventBus();
    mockWorkflowState = {
      nodes: [
        { id: '1', type: 'start', config: {} },
        { id: '2', type: 'module', config: { moduleId: 'testModule' } },
      ],
      edges: [{ from: '1', to: '2' }],
      isExecuting: false,
      errors: [],
    };
    executor = new ChainExecutor(mockModuleRegistry, mockEventBus);
  });

  it('executes a valid workflow successfully', async () => {
    const result = await executor.executeWorkflow(mockWorkflowState);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('validates workflow input using Zod schema', async () => {
    const invalidState = { ...mockWorkflowState, nodes: [] }; // Invalid: no nodes
    await expect(executor.executeWorkflow(invalidState)).rejects.toThrow('ValidationError');
  });

  it('handles module execution errors gracefully', async () => {
    // Mock a failing module
    jest.spyOn(mockModuleRegistry, 'executeModule').mockRejectedValue(new Error('Module failed'));
    const result = await executor.executeWorkflow(mockWorkflowState);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Module failed');
  });

  it('emits progress events during execution', async () => {
    const eventSpy = jest.fn();
    mockEventBus.on('execution:progress', eventSpy);

    await executor.executeWorkflow(mockWorkflowState);

    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({ step: expect.any(String) }));
  });

  it('prevents concurrent executions', async () => {
    const promise1 = executor.executeWorkflow(mockWorkflowState);
    const promise2 = executor.executeWorkflow(mockWorkflowState);
    await expect(promise2).rejects.toThrow('Execution already in progress');
  });

  it('sanitizes and validates all inputs to prevent injection', () => {
    const maliciousInput = { data: '<script>malicious</script>' };
    // Assuming executor validates/sanitizes
    expect(() => executor.validateInput(maliciousInput)).toThrow('Invalid input');
  });
});
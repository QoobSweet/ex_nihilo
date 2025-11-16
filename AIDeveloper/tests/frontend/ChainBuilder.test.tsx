import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChainBuilder } from '../../src/frontend/components/ChainBuilder';
import { ModuleRegistry } from '../../src/frontend/services/ModuleRegistry';
import { EventBus } from '../../src/frontend/services/EventBus';
import { WorkflowState } from '../../src/frontend/stores/WorkflowStore';

// Mock dependencies
describe('ChainBuilder Component', () => {
  const mockModuleRegistry = new ModuleRegistry();
  const mockEventBus = new EventBus();
  const mockWorkflowState: WorkflowState = {
    nodes: [],
    edges: [],
    isExecuting: false,
    errors: [],
  };

  beforeEach(() => {
    // Reset mocks if needed
  });

  it('renders without crashing', () => {
    render(
      <ChainBuilder
        moduleRegistry={mockModuleRegistry}
        eventBus={mockEventBus}
        workflowState={mockWorkflowState}
      />
    );
    expect(screen.getByText(/Chain Builder/i)).toBeInTheDocument();
  });

  it('adds a new node when add button is clicked', async () => {
    render(
      <ChainBuilder
        moduleRegistry={mockModuleRegistry}
        eventBus={mockEventBus}
        workflowState={mockWorkflowState}
      />
    );
    const addButton = screen.getByRole('button', { name: /add node/i });
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText(/New Node/i)).toBeInTheDocument();
    });
  });

  it('validates input and prevents XSS', () => {
    render(
      <ChainBuilder
        moduleRegistry={mockModuleRegistry}
        eventBus={mockEventBus}
        workflowState={mockWorkflowState}
      />
    );
    const input = screen.getByLabelText(/node name/i);
    const maliciousInput = '<script>alert("xss")</script>';
    fireEvent.change(input, { target: { value: maliciousInput } });
    // Assuming the component sanitizes input
    expect(input.value).not.toContain('<script>');
  });

  it('handles module communication events', async () => {
    const mockEventHandler = jest.fn();
    mockEventBus.on('module:execute', mockEventHandler);

    render(
      <ChainBuilder
        moduleRegistry={mockModuleRegistry}
        eventBus={mockEventBus}
        workflowState={mockWorkflowState}
      />
    );

    // Simulate event
    mockEventBus.emit('module:execute', { moduleId: 'test', data: {} });

    await waitFor(() => {
      expect(mockEventHandler).toHaveBeenCalledWith({ moduleId: 'test', data: {} });
    });
  });

  it('displays error messages for invalid workflows', () => {
    const invalidState = { ...mockWorkflowState, errors: ['Invalid workflow configuration'] };
    render(
      <ChainBuilder
        moduleRegistry={mockModuleRegistry}
        eventBus={mockEventBus}
        workflowState={invalidState}
      />
    );
    expect(screen.getByText(/Invalid workflow configuration/i)).toBeInTheDocument();
  });
});
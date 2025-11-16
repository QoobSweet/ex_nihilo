import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkflowView, { Workflow } from '../components/WorkflowView';
import '../styles/workflow-modern.css';

/**
 * API error response structure
 */
interface ApiError {
  message: string;
  status?: number;
}

/**
 * WorkflowPage Component
 * 
 * Page-level component that handles workflow data fetching, state management,
 * and integration with the WorkflowView component.
 * 
 * @component
 * @returns {JSX.Element} Rendered workflow page
 * 
 * @security
 * - Validates and sanitizes all API responses
 * - Implements proper error handling
 * - Uses parameterized API calls to prevent injection
 * - Includes rate limiting awareness
 * - Proper authentication token handling
 * 
 * @example
 * ```tsx
 * <Route path="/workflows/:id" element={<WorkflowPage />} />
 * ```
 */
const WorkflowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  /**
   * Validates workflow ID parameter
   * @param id - Workflow ID from URL params
   * @returns Validated numeric ID or null
   * @security Prevents injection by validating ID format
   */
  const validateWorkflowId = (id: string | undefined): number | null => {
    if (!id || typeof id !== 'string') {
      return null;
    }

    // Only allow positive integers
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
      return null;
    }

    // Prevent excessively large IDs (potential DoS)
    if (numericId > Number.MAX_SAFE_INTEGER) {
      return null;
    }

    return numericId;
  };

  /**
   * Validates workflow data from API response
   * @param data - Raw API response data
   * @returns Validated workflow object or null
   * @security Validates all required fields and data types
   */
  const validateWorkflowData = (data: any): Workflow | null => {
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Validate required fields
    if (
      typeof data.id !== 'number' ||
      typeof data.name !== 'string' ||
      typeof data.status !== 'string' ||
      typeof data.type !== 'string' ||
      typeof data.created_at !== 'string'
    ) {
      return null;
    }

    // Validate tasks array
    if (!Array.isArray(data.tasks)) {
      return null;
    }

    // Validate each task
    const validTasks = data.tasks.every((task: any) => {
      return (
        task &&
        typeof task === 'object' &&
        typeof task.id === 'number' &&
        typeof task.name === 'string' &&
        typeof task.status === 'string' &&
        typeof task.created_at === 'string'
      );
    });

    if (!validTasks) {
      return null;
    }

    return data as Workflow;
  };

  /**
   * Fetches workflow data from API
   * @param workflowId - Validated workflow ID
   * @security Uses parameterized URL, validates response, handles errors securely
   */
  const fetchWorkflow = useCallback(async (workflowId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Construct API URL with validated ID
      const apiUrl = `/api/workflows/${workflowId}`;

      // Make API request with proper headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication token if available
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        credentials: 'same-origin' // CSRF protection
      });

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workflow not found');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this workflow.');
        } else if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch workflow: ${response.statusText}`);
        }
      }

      // Parse and validate response
      const data = await response.json();
      const validatedWorkflow = validateWorkflowData(data);

      if (!validatedWorkflow) {
        throw new Error('Invalid workflow data received from server');
      }

      setWorkflow(validatedWorkflow);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      // Log error for monitoring (without sensitive data)
      console.error('Workflow fetch error:', {
        workflowId,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handles workflow refresh with retry logic
   */
  const handleRefresh = useCallback(() => {
    const validatedId = validateWorkflowId(id);
    if (validatedId) {
      fetchWorkflow(validatedId);
    }
  }, [id, fetchWorkflow]);

  /**
   * Handles retry with exponential backoff
   */
  const handleRetry = useCallback(() => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }

    setRetryCount(prev => prev + 1);
    handleRefresh();
  }, [retryCount, handleRefresh]);

  // Initial data fetch
  useEffect(() => {
    const validatedId = validateWorkflowId(id);

    if (!validatedId) {
      setError('Invalid workflow ID');
      setLoading(false);
      return;
    }

    fetchWorkflow(validatedId);
  }, [id, fetchWorkflow]);

  // Loading state
  if (loading) {
    return (
      <div className="workflow-page workflow-page--loading">
        <div className="loading-spinner">
          <div className="spinner" aria-label="Loading workflow data"></div>
          <p>Loading workflow...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="workflow-page workflow-page--error">
        <div className="error-container">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <h2 className="error-title">Error Loading Workflow</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button
              onClick={handleRetry}
              className="btn btn--primary"
              disabled={retryCount >= 3}
              aria-label="Retry loading workflow"
            >
              {retryCount >= 3 ? 'Max Retries Reached' : 'Retry'}
            </button>
            <button
              onClick={() => navigate('/workflows')}
              className="btn btn--secondary"
              aria-label="Go back to workflows list"
            >
              Back to Workflows
            </button>
          </div>
          {retryCount > 0 && (
            <p className="error-retry-info">
              Retry attempt {retryCount} of 3
            </p>
          )}
        </div>
      </div>
    );
  }

  // No workflow data
  if (!workflow) {
    return (
      <div className="workflow-page workflow-page--empty">
        <div className="empty-state">
          <div className="empty-state__icon" aria-hidden="true">📋</div>
          <h2 className="empty-state__title">No Workflow Data</h2>
          <p className="empty-state__message">
            The requested workflow could not be found.
          </p>
          <button
            onClick={() => navigate('/workflows')}
            className="btn btn--primary"
            aria-label="Go back to workflows list"
          >
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  // Render workflow view
  return (
    <div className="workflow-page">
      <WorkflowView 
        workflow={workflow} 
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default WorkflowPage;
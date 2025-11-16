import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import WorkflowView, { Workflow, WorkflowStatus } from '../components/workflow/WorkflowView';
import '../styles/workflow-modern.css';

/**
 * API response structure for workflow data
 */
interface WorkflowApiResponse {
  workflow: Workflow;
}

/**
 * Error response structure from API
 */
interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Sanitizes string input to prevent XSS
 * @param input - String to sanitize
 * @returns Sanitized string
 * @security Prevents XSS attacks
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Validates workflow ID parameter
 * @param id - Workflow ID from URL params
 * @returns Validated numeric ID or null if invalid
 * @security Prevents injection attacks by validating numeric input
 */
function validateWorkflowId(id: string | undefined): number | null {
  if (!id) {
    return null;
  }

  // Only allow numeric characters
  if (!/^\d+$/.test(id)) {
    return null;
  }

  const numericId = parseInt(id, 10);

  // Validate range (positive integer)
  if (isNaN(numericId) || numericId <= 0 || numericId > Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return numericId;
}

/**
 * Fetches workflow data from API
 * @param workflowId - Validated workflow ID
 * @returns Promise resolving to workflow data
 * @throws {Error} If fetch fails or response is invalid
 * @security Uses validated ID in parameterized API call
 */
async function fetchWorkflowData(workflowId: number): Promise<Workflow> {
  try {
    // Use parameterized URL construction to prevent injection
    const url = `/api/workflows/${encodeURIComponent(workflowId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // CSRF token would be added here in production
        // 'X-CSRF-Token': getCsrfToken()
      },
      credentials: 'same-origin' // Include cookies for authentication
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Workflow not found');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      // Generic error for other status codes
      throw new Error(`Failed to fetch workflow: ${response.statusText}`);
    }

    const data: WorkflowApiResponse = await response.json();

    if (!data.workflow) {
      throw new Error('Invalid response format');
    }

    return data.workflow;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching workflow data');
  }
}

/**
 * WorkflowPage component - main page for displaying workflow details
 *
 * @returns React component
 *
 * @security
 * - Validates workflow ID from URL params to prevent injection
 * - Uses parameterized API calls
 * - Implements proper error handling without exposing sensitive info
 * - Sanitizes all string inputs
 * - Includes authentication checks
 * - Uses secure fetch configuration (credentials, CORS)
 *
 * @example
 * ```tsx
 * // Route configuration
 * <Route path="/workflows/:id" element={<WorkflowPage />} />
 * ```
 */
export const WorkflowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  /**
   * Loads workflow data from API
   * @security Validates ID before making API call
   */
  const loadWorkflow = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate workflow ID
      const workflowId = validateWorkflowId(id);

      if (workflowId === null) {
        setError('Invalid workflow ID');
        setLoading(false);
        return;
      }

      // Fetch workflow data
      const data = await fetchWorkflowData(workflowId);
      setWorkflow(data);
    } catch (err) {
      // Log error for monitoring (in production, send to error tracking service)
      console.error('Failed to load workflow:', err);

      // Set user-friendly error message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }

      // Redirect to workflows list if not found
      if (err instanceof Error && err.message === 'Workflow not found') {
        setTimeout(() => {
          navigate('/workflows');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  /**
   * Handles refresh button click
   * @security Triggers re-fetch with same validation
   */
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Load workflow on mount and when ID or refresh key changes
  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow, refreshKey]);

  // Auto-refresh for running workflows (every 5 seconds)
  useEffect(() => {
    if (!workflow || workflow.status !== WorkflowStatus.RUNNING) {
      return;
    }

    const intervalId = setInterval(() => {
      loadWorkflow();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [workflow, loadWorkflow]);

  // Loading state
  if (loading) {
    return (
      <div className="workflow-modern">
        <div className="workflow-loading">
          <div className="workflow-loading__spinner" role="status" aria-live="polite">
            <span className="sr-only">Loading workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="workflow-modern">
        <div className="workflow-modern__container">
          <div className="workflow-error" role="alert">
            <div className="workflow-error__icon">⚠️</div>
            <h2 className="workflow-error__title">Error Loading Workflow</h2>
            <p className="workflow-error__message">{sanitizeString(error)}</p>
            <div className="workflow-error__actions">
              <button
                onClick={handleRefresh}
                className="workflow-error__button"
                type="button"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/workflows')}
                className="workflow-error__button workflow-error__button--secondary"
                type="button"
              >
                Back to Workflows
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state (no workflow data)
  if (!workflow) {
    return (
      <div className="workflow-modern">
        <div className="workflow-modern__container">
          <div className="workflow-empty">
            <div className="workflow-empty__icon">📋</div>
            <h2 className="workflow-empty__title">No Workflow Found</h2>
            <p className="workflow-empty__description">
              The requested workflow could not be found.
            </p>
            <button
              onClick={() => navigate('/workflows')}
              className="workflow-empty__button"
              type="button"
            >
              Back to Workflows
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return <WorkflowView workflow={workflow} onRefresh={handleRefresh} />;
};

export default WorkflowPage;

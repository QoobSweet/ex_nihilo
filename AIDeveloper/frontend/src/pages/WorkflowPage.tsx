import React from 'react';
import ModernWorkflowView from '../components/ModernWorkflowView';
import { authHelper } from '../utils/auth/authHelper';

/**
 * Workflow Page Component
 *
 * Renders the modern workflow view with auth guard.
 */
const WorkflowPage: React.FC = () => {
  const token = authHelper.getToken();
  if (!token || !authHelper.isValidToken(token)) {
    return <div>Please log in to view workflows.</div>;
  }

  return <ModernWorkflowView />;
};

export default WorkflowPage;
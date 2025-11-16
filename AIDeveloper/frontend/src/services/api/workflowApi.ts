import axios from 'axios';
import { validateAndSanitize } from '../utils/security/sanitizer';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

/**
 * Fetches workflow data securely.
 *
 * @param {string} token - JWT token for auth
 * @returns {Promise<Array>} Sanitized workflow data
 *
 * @security Uses JWT for auth, validates inputs
 */
export const getWorkflowData = async (token: string) => {
  const response = await axios.get(`${API_BASE}/workflows`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Assume backend returns validated data; additional client-side validation
  return response.data.map((wf: any) => ({
    ...wf,
    name: validateAndSanitize(wf.name, 'string'),
    tasks: wf.tasks.map((task: any) => ({
      ...task,
      name: validateAndSanitize(task.name, 'string')
    }))
  }));
};
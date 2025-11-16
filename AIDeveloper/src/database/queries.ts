import { QueryTypes } from 'sequelize';
import sequelize from './connection'; // Assume this exists
import Workflow from '../models/Workflow';

/**
 * Fetches workflows for a user using parameterized queries
 * @param userId - The user ID
 * @param limit - Maximum number of workflows to return
 * @returns Array of workflows
 */
export const getWorkflows = async (userId: number, limit: number) => {
  return await sequelize.query(
    'SELECT * FROM workflows WHERE userId = ? LIMIT ?',
    {
      replacements: [userId, limit],
      type: QueryTypes.SELECT,
    }
  );
};

/**
 * Fetches workflow stats for charts
 * @param userId - The user ID
 * @returns Aggregated stats
 */
export const getWorkflowStats = async (userId: number) => {
  const stats = await sequelize.query(
    'SELECT status, COUNT(*) as count FROM workflows WHERE userId = ? GROUP BY status',
    {
      replacements: [userId],
      type: QueryTypes.SELECT,
    }
  );
  return stats;
};

/**
 * Gets a workflow by ID
 * @param id - Workflow ID
 * @returns Workflow or null
 */
export const getWorkflowById = async (id: number) => {
  return await Workflow.findByPk(id);
};

/**
 * Updates a workflow securely
 * @param id - Workflow ID
 * @param updates - Fields to update
 */
export const updateWorkflow = async (id: number, updates: Partial<WorkflowAttributes>) => {
  await Workflow.update(updates, { where: { id } });
};
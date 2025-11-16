import { Router } from 'express';
import Joi from 'joi';
import { authenticate, authorize, csrfProtection } from '../security/middleware';
import { getWorkflows, getWorkflowStats } from '../database/queries';

const router = Router();

// Validation schemas
const workflowQuerySchema = Joi.object({
  userId: Joi.number().integer().positive(),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const workflowIdSchema = Joi.object({
  id: Joi.number().integer().positive(),
});

// Get workflows with security checks
router.get('/', authenticate, authorize(['user', 'admin']), async (req, res) => {
  try {
    const { error, value } = workflowQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { userId, limit } = value;
    // Ensure user can only access their own workflows unless admin
    const user = (req as any).user;
    if (user.role !== 'admin' && userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const workflows = await getWorkflows(userId, limit);
    res.json({ workflows });
  } catch (err) {
    console.error('Error fetching workflows:', err);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Get workflow stats for charts
router.get('/stats', authenticate, authorize(['user', 'admin']), async (req, res) => {
  try {
    const user = (req as any).user;
    const stats = await getWorkflowStats(user.id);
    res.json({ stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Update workflow with CSRF protection
router.put('/:id', authenticate, authorize(['user', 'admin']), csrfProtection, async (req, res) => {
  try {
    const { error: idError } = workflowIdSchema.validate({ id: req.params.id });
    if (idError) {
      return res.status(400).json({ error: idError.details[0].message });
    }
    const workflowId = parseInt(req.params.id);
    const user = (req as any).user;
    // Check ownership
    const workflow = await getWorkflowById(workflowId);
    if (!workflow || (workflow.userId !== user.id && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Update logic with parameterized query
    await updateWorkflow(workflowId, req.body);
    res.json({ message: 'Workflow updated' });
  } catch (err) {
    console.error('Error updating workflow:', err);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

export default router;
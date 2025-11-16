// Assuming this is an Express server

import express from 'express';
import { z } from 'zod';

// ... existing imports and setup ...

const app = express();

// Schema for API response validation
const WorkflowResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metrics: z.object({
    filesAnalyzed: z.number().int().min(0),
    linesOfCode: z.number().int().min(0),
    languages: z.record(z.string(), z.number().int().min(0)),
  }),
  timeline: z.array(z.object({
    event: z.string().min(1).max(200),
    timestamp: z.string().datetime(),
  })),
});

/**
 * API endpoint to fetch workflow data
 * @param req.params.id - The workflow ID (validated as UUID)
 * @returns JSON response with workflow data
 * @security Input is validated; no SQL injection as using parameterized queries (assuming ORM)
 */
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const validatedId = z.string().uuid().parse(id);

    // Assuming db is an ORM like Knex
    const workflow = await db('workflows').where('id', validatedId).first();

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Validate response data
    const validatedWorkflow = WorkflowResponseSchema.parse(workflow);

    res.json(validatedWorkflow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... existing routes ...

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
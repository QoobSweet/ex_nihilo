// Assuming this is an Express server
// Add these imports at the top if not already present
import express from 'express';
const app = express();

// Existing server code...

// New endpoints for workflow stats and timeline
app.get('/api/workflows/:workflowId/stats', (req, res) => {
  const { workflowId } = req.params;
  // Validate workflowId to prevent injection (assuming it's a string ID)
  if (!/^[a-zA-Z0-9_-]+$/.test(workflowId)) {
    return res.status(400).json({ error: 'Invalid workflow ID' });
  }

  // Sample data - in production, fetch from database or file system
  const stats = {
    totalFiles: 150,
    totalLines: 12000,
    languages: { TypeScript: 80, JavaScript: 50, CSS: 20 }
  };

  res.json(stats);
});

app.get('/api/workflows/:workflowId/timeline', (req, res) => {
  const { workflowId } = req.params;
  // Validate workflowId
  if (!/^[a-zA-Z0-9_-]+$/.test(workflowId)) {
    return res.status(400).json({ error: 'Invalid workflow ID' });
  }

  // Sample timeline data
  const timeline = [
    { id: '1', title: 'Planning', date: '2023-10-01', description: 'Defined requirements and scope.' },
    { id: '2', title: 'Coding', date: '2023-10-05', description: 'Implemented core features.' },
    { id: '3', title: 'Testing', date: '2023-10-10', description: 'Ran unit and integration tests.' },
    { id: '4', title: 'Deployment', date: '2023-10-15', description: 'Deployed to production.' }
  ];

  res.json(timeline);
});

// Existing app.listen or export...

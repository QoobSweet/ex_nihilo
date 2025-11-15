// Assuming Express server setup
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Existing routes...

// New endpoints for workflow stats and timeline
app.get('/api/workflows/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    // Validate id (assume numeric)
    if (!/^[0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }

    // Fetch stats securely (e.g., from database with parameterized query)
    // Placeholder: Replace with actual DB query
    const stats = {
      fileTypes: { ts: 50, js: 30, css: 20 },
      totalLines: 10000,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/workflows/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    // Validate id
    if (!/^[0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }

    // Fetch timeline securely
    // Placeholder: Replace with actual DB query
    const timeline = [
      { date: '2023-01-01', title: 'Project Start', description: 'Initial setup' },
      { date: '2023-06-01', title: 'Milestone 1', description: 'Core features complete' },
    ];

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... rest of server code

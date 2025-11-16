import express from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// JWT middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Example workflow endpoint with validation
const WorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(['pending', 'completed'])
});

app.get('/api/workflows', authenticate, async (req, res) => {
  // Use parameterized query (assuming Knex or similar)
  const workflows = await db('workflows').where('user_id', req.user.id).select('*');
  res.json(workflows);
});

app.listen(3000);
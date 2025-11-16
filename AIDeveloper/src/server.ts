import express from 'express';
import cookieParser from 'cookie-parser';
import { securityHeaders, rateLimiter, sanitizeInput } from './security/middleware';
import workflowRoutes from './routes/workflow';
// ... other imports

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(rateLimiter);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Routes
app.use('/api/workflows', workflowRoutes);
// ... other routes

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' }); // No stack traces exposed
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
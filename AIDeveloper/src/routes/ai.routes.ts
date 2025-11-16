// Assuming this is the existing ai.routes.ts file
// Add the following route

import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import rateLimit from 'express-rate-limit'; // Assuming rate limiting is available

// ... existing code ...

const router = Router();
const aiController = new AIController(/* logger instance */);

// ... existing routes ...

// Rate limiting for StoryTeller endpoint
const storytellerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many StoryTeller requests, please try again later.',
});

/**
 * POST /api/ai/storyteller
 * Generates a story using the multi-agent StoryTeller chain
 *
 * @security Rate limited to prevent abuse. All inputs validated server-side.
 */
router.post('/storyteller', storytellerLimiter, (req, res) => aiController.generateStoryTellerResponse(req, res));

// ... existing routes ...

export default router;

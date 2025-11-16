// Assuming this is the existing AIController.ts file
// Add the following imports and method

import { Request, Response } from 'express';
import { StoryTellerChain } from './samples/StoryTellerChain';
import { StoryPrompt, StoryPromptSchema } from '../types/storyteller.types';
import { Logger } from '../utils/logger'; // Assuming logger exists

// ... existing code ...

export class AIController {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // ... existing methods ...

  /**
   * Generates a StoryTeller response using the multi-agent chain
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise resolving to the API response
   *
   * @security Validates all inputs using Zod schema. No direct execution of user input.
   * Rate limiting should be applied at the route level.
   */
  async generateStoryTellerResponse(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedPrompt = StoryPromptSchema.parse(req.body);
      this.logger.info('StoryTeller request received', { promptLength: validatedPrompt.prompt.length });

      // Initialize and execute the chain
      const chain = new StoryTellerChain(undefined, this.logger);
      const result = await chain.execute(validatedPrompt);

      // Return sanitized response (no sensitive data)
      res.json({
        success: result.success,
        story: result.story,
        executionTime: result.executionTime,
        errors: result.errors,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.warn('Invalid StoryTeller input', { errors: error.errors });
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        this.logger.error('StoryTeller generation failed', error as Error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // ... existing methods ...
}

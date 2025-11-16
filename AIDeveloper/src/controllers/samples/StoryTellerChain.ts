/**
 * StoryTellerChain - A sample AI Chain demonstrating multi-agent workflow
 *
 * This class orchestrates the execution of multiple AI agents (plan, code, test, debug, review)
 * to process a user prompt and generate a cohesive story narrative. It serves as a comprehensive
 * example of the multi-agent workflow system in action.
 *
 * The chain follows this sequence:
 * 1. Plan Agent: Creates a story outline
 * 2. Code Agent: Generates story structure and content
 * 3. Test Agent: Validates coherence and quality
 * 4. Debug Agent: Fixes any identified issues
 * 5. Review Agent: Polishes the final narrative
 *
 * @security All inputs are validated using Zod schemas. Agent outputs are sanitized
 * before being passed to subsequent agents. No direct user input is executed.
 */

import { z } from 'zod';
import { Logger } from '../../utils/logger'; // Assuming a logger utility exists
import {
  StoryPrompt,
  StoryPromptSchema,
  AgentResponse,
  StoryTellerOutput,
  StoryTellerConfig,
  DEFAULT_STORYTELLER_CONFIG,
} from '../../types/storyteller.types';

// Assuming these agent classes exist in the codebase
export interface IAgent {
  execute(input: any, config?: any): Promise<AgentResponse>;
}

// Mock agent implementations - in real implementation, these would be the actual agents
export class PlanAgent implements IAgent {
  async execute(input: StoryPrompt): Promise<AgentResponse> {
    // Implementation would call actual plan agent
    return {
      agentId: 'plan-001',
      agentName: 'plan',
      success: true,
      output: { outline: 'Story outline here' },
      timestamp: new Date(),
    };
  }
}

export class CodeAgent implements IAgent {
  async execute(input: any): Promise<AgentResponse> {
    // Implementation would call actual code agent
    return {
      agentId: 'code-001',
      agentName: 'code',
      success: true,
      output: { structure: 'Story structure here' },
      timestamp: new Date(),
    };
  }
}

export class TestAgent implements IAgent {
  async execute(input: any): Promise<AgentResponse> {
    // Implementation would call actual test agent
    return {
      agentId: 'test-001',
      agentName: 'test',
      success: true,
      output: { validation: 'Story validation results' },
      timestamp: new Date(),
    };
  }
}

export class DebugAgent implements IAgent {
  async execute(input: any): Promise<AgentResponse> {
    // Implementation would call actual debug agent
    return {
      agentId: 'debug-001',
      agentName: 'debug',
      success: true,
      output: { fixes: 'Debug fixes applied' },
      timestamp: new Date(),
    };
  }
}

export class ReviewAgent implements IAgent {
  async execute(input: any): Promise<AgentResponse> {
    // Implementation would call actual review agent
    return {
      agentId: 'review-001',
      agentName: 'review',
      success: true,
      output: { polished: 'Polished story content' },
      timestamp: new Date(),
    };
  }
}

/**
 * Main StoryTellerChain class
 * Orchestrates the execution of all agents in sequence
 */
export class StoryTellerChain {
  private config: StoryTellerConfig;
  private logger: Logger;
  private agents: IAgent[];

  /**
   * Creates a new StoryTellerChain instance
   *
   * @param config - Configuration options for the chain
   * @param logger - Logger instance for tracking execution
   */
  constructor(config: StoryTellerConfig = DEFAULT_STORYTELLER_CONFIG, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.agents = [
      new PlanAgent(),
      new CodeAgent(),
      new TestAgent(),
      new DebugAgent(),
      new ReviewAgent(),
    ];
  }

  /**
   * Executes the complete StoryTeller chain
   *
   * @param prompt - The validated user prompt
   * @returns The final StoryTeller output with all agent responses
   * @throws {ValidationError} If the prompt fails validation
   * @throws {ChainExecutionError} If the chain fails to complete
   *
   * @security The prompt is validated using Zod schema before processing.
   * All agent outputs are logged without exposing sensitive data.
   */
  async execute(prompt: StoryPrompt): Promise<StoryTellerOutput> {
    const startTime = Date.now();
    const agentResponses: AgentResponse[] = [];
    const errors: string[] = [];

    try {
      // Validate input
      const validatedPrompt = StoryPromptSchema.parse(prompt);
      this.logger.info('StoryTellerChain started', { promptLength: validatedPrompt.prompt.length });

      let currentInput = validatedPrompt;

      // Execute each agent in sequence
      for (const agent of this.agents) {
        try {
          this.logger.debug(`Executing agent: ${agent.constructor.name}`);

          const response = await this.executeWithTimeout(agent, currentInput);
          agentResponses.push(response);

          if (!response.success) {
            const errorMsg = `Agent ${response.agentName} failed: ${response.error}`;
            errors.push(errorMsg);
            this.logger.error(errorMsg);

            if (!this.config.continueOnFailure) {
              throw new Error(errorMsg);
            }
          }

          // Pass output to next agent (sanitized)
          currentInput = this.sanitizeAgentOutput(response.output);

        } catch (agentError) {
          const errorMsg = `Agent execution error: ${(agentError as Error).message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);

          if (!this.config.continueOnFailure) {
            throw agentError;
          }
        }
      }

      // Generate final story from agent outputs
      const story = this.generateFinalStory(agentResponses);

      const executionTime = Date.now() - startTime;
      this.logger.info('StoryTellerChain completed', { executionTime, agentCount: agentResponses.length });

      return {
        originalPrompt: validatedPrompt,
        agentResponses,
        story,
        success: errors.length === 0,
        executionTime,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error('StoryTellerChain failed', error as Error);

      return {
        originalPrompt: prompt,
        agentResponses,
        story: { title: '', content: '', summary: '', wordCount: 0 },
        success: false,
        executionTime,
        errors: [...errors, (error as Error).message],
      };
    }
  }

  /**
   * Executes an agent with timeout protection
   *
   * @private
   * @param agent - The agent to execute
   * @param input - Input for the agent
   * @returns The agent response
   */
  private async executeWithTimeout(agent: IAgent, input: any): Promise<AgentResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Agent ${agent.constructor.name} timed out`));
      }, this.config.agentTimeout);

      agent.execute(input).then(resolve).catch(reject).finally(() => clearTimeout(timeout));
    });
  }

  /**
   * Sanitizes agent output before passing to next agent
   *
   * @private
   * @param output - Raw agent output
   * @returns Sanitized output
   *
   * @security Removes any potentially dangerous content from agent outputs
   */
  private sanitizeAgentOutput(output: any): any {
    // Basic sanitization - in real implementation, use DOMPurify or similar
    if (typeof output === 'string') {
      return output.replace(/[<>]/g, ''); // Basic HTML escaping
    }
    if (typeof output === 'object' && output !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(output)) {
        sanitized[key] = this.sanitizeAgentOutput(value);
      }
      return sanitized;
    }
    return output;
  }

  /**
   * Generates the final story from all agent responses
   *
   * @private
   * @param responses - All agent responses
   * @returns The compiled story
   */
  private generateFinalStory(responses: AgentResponse[]): StoryTellerOutput['story'] {
    // Combine outputs from all agents to create final story
    // This is a simplified implementation
    const title = 'Generated Story';
    const content = responses.map(r => r.output).join('\n');
    const summary = 'A story generated by the AI chain';
    const wordCount = content.split(' ').length;

    return { title, content, summary, wordCount };
  }
}

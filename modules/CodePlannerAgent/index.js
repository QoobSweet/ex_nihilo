/**
 * CodePlannerAgent
 * Analyzes codebase and creates implementation plans
 * Read-only access - can read files but not write or copy
 */
import axios from 'axios';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
dotenv.config();
const execAsync = promisify(exec);
/**
 * CodePlannerAgent
 */
export class CodePlannerAgent {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || '';
        this.model = process.env.OPENROUTER_MODEL_PLANNING || 'anthropic/claude-3.5-sonnet';
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY environment variable is required');
        }
    }
    /**
     * Execute the planner agent
     */
    async execute(input) {
        // Validate workingDir is provided
        if (!input.workingDir) {
            throw new Error('workingDir is required for CodePlannerAgent');
        }
        // Verify workingDir exists
        try {
            await fs.access(input.workingDir);
        }
        catch (error) {
            throw new Error(`Working directory does not exist: ${input.workingDir}`);
        }
        try {
            // Load tools.md to inform AI about available tools
            const toolsDoc = await this.loadToolsDocumentation();
            // Load system prompt
            const systemPrompt = this.buildSystemPrompt(toolsDoc);
            // Build user prompt
            const userPrompt = this.buildUserPrompt(input);
            // Call OpenRouter API
            const aiResponse = await this.callOpenRouter([
                {
                    role: 'user',
                    content: userPrompt,
                },
            ], {
                systemPrompt,
                maxTokens: 8192,
                temperature: 0.7,
            });
            // Parse and return response
            return this.parseResponse(aiResponse, input);
        }
        catch (error) {
            return {
                success: false,
                artifacts: [],
                summary: `CodePlannerAgent failed: ${error.message}`,
            };
        }
    }
    /**
     * Load tools.md documentation
     */
    async loadToolsDocumentation() {
        try {
            const toolsPath = path.join(__dirname, 'tools.md');
            return await fs.readFile(toolsPath, 'utf-8');
        }
        catch (error) {
            console.warn('Failed to load tools.md:', error.message);
            return 'No tools documentation available.';
        }
    }
    /**
     * Build system prompt
     */
    buildSystemPrompt(toolsDoc) {
        return `You are a CodePlannerAgent responsible for analyzing codebases and creating comprehensive implementation plans.

## Available Tools

${toolsDoc}

## Your Responsibilities

1. Analyze the codebase structure and understand the codebase
2. Read relevant files to understand context
3. Create detailed implementation plans
4. Identify risks and dependencies

## Restrictions

- You can ONLY read files - you cannot write, modify, or copy files
- Use the read-only tools provided to gather information
- Focus on analysis and planning, not implementation`;
    }
    /**
     * Build user prompt
     */
    buildUserPrompt(input) {
        return `
Workflow ID: ${input.workflowId}
Workflow Type: ${input.workflowType || 'unknown'}
Target Module: ${input.targetModule || 'none'}
Task Description: ${input.taskDescription || 'none'}
Working Directory: ${input.workingDir}

Please analyze the codebase and create a comprehensive implementation plan for this task.
    `.trim();
    }
    /**
     * Call OpenRouter API
     */
    async callOpenRouter(messages, options) {
        const apiMessages = [...messages];
        if (options?.systemPrompt) {
            apiMessages.unshift({
                role: 'system',
                content: options.systemPrompt,
            });
        }
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: this.model,
            messages: apiMessages,
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature || 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'CodePlannerAgent',
            },
        });
        return response.data.choices[0]?.message?.content || '';
    }
    /**
     * Execute a shell script tool
     */
    async executeTool(toolName, args, workingDir) {
        const toolPath = path.join(__dirname, 'tools', `${toolName}.sh`);
        try {
            // Check if tool exists
            await fs.access(toolPath);
            // Execute tool
            const { stdout, stderr } = await execAsync(`bash "${toolPath}" ${args.map(arg => `"${arg}"`).join(' ')}`, { cwd: workingDir });
            if (stderr) {
                console.warn(`Tool ${toolName} stderr:`, stderr);
            }
            return stdout;
        }
        catch (error) {
            throw new Error(`Failed to execute tool ${toolName}: ${error.message}`);
        }
    }
    /**
     * Parse AI response
     */
    parseResponse(response, input) {
        // Basic parsing - can be enhanced based on actual response format
        return {
            success: true,
            artifacts: [{
                    type: 'plan',
                    content: response,
                    metadata: {
                        workflowId: input.workflowId,
                    },
                }],
            summary: `Created implementation plan for workflow ${input.workflowId}`,
            metadata: {
                workflowId: input.workflowId,
                responseLength: response.length,
            },
        };
    }
}
export default CodePlannerAgent;
//# sourceMappingURL=index.js.map
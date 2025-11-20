/**
 * CodeTestingAgent
 * Generates and executes tests for code
 * Read, write, and execute access - can read code, write tests, and execute tests
 */
/**
 * Agent Input Interface
 */
export interface AgentInput {
    workflowId: number;
    workflowType?: string;
    targetModule?: string;
    taskDescription?: string;
    branchName?: string;
    workingDir: string;
    metadata?: Record<string, any>;
    context?: Record<string, any>;
}
/**
 * Agent Output Interface
 */
export interface AgentOutput {
    success: boolean;
    artifacts: Array<{
        type: string;
        content: string;
        filePath?: string;
        metadata?: Record<string, any>;
    }>;
    summary: string;
    suggestions?: string[];
    requiresRetry?: boolean;
    retryReason?: string;
    metadata?: Record<string, any>;
}
/**
 * CodeTestingAgent
 */
export declare class CodeTestingAgent {
    private model;
    private apiKey;
    constructor();
    /**
     * Execute the testing agent
     */
    execute(input: AgentInput): Promise<AgentOutput>;
    /**
     * Load tools.md documentation
     */
    private loadToolsDocumentation;
    /**
     * Build system prompt
     */
    private buildSystemPrompt;
    /**
     * Build user prompt
     */
    private buildUserPrompt;
    /**
     * Call OpenRouter API
     */
    private callOpenRouter;
    /**
     * Execute a shell script tool
     */
    executeTool(toolName: string, args: string[], workingDir: string): Promise<string>;
    /**
     * Parse AI response
     */
    private parseResponse;
}
export default CodeTestingAgent;
//# sourceMappingURL=index.d.ts.map
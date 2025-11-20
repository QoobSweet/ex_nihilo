/**
 * CodePlannerAgent
 * Analyzes codebase and creates implementation plans
 * Read-only access - can read files but not write or copy
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
 * CodePlannerAgent
 */
export declare class CodePlannerAgent {
    private model;
    private apiKey;
    constructor();
    /**
     * Execute the planner agent
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
export default CodePlannerAgent;
//# sourceMappingURL=index.d.ts.map
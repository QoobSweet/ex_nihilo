/**
 * ModuleImportAgent
 *
 * AI-powered agent that analyzes newly imported modules and automatically
 * generates appropriate module.json configuration files.
 */
/**
 * Agent input structure
 */
export interface AgentInput {
    modulePath: string;
    moduleName: string;
    workingDir: string;
    taskDescription?: string;
    workflowId?: number;
}
/**
 * Agent output structure
 */
export interface AgentOutput {
    success: boolean;
    message: string;
    artifacts: Artifact[];
    error?: string;
}
/**
 * Artifact structure for generated files
 */
export interface Artifact {
    type: string;
    content: string;
    filePath?: string;
    metadata?: Record<string, any>;
}
/**
 * ModuleImportAgent class
 */
declare class ModuleImportAgent {
    private apiKey;
    private model;
    private apiUrl;
    constructor();
    /**
     * Execute the agent to analyze a module and generate module.json
     */
    execute(input: AgentInput): Promise<AgentOutput>;
    /**
     * Analyze the module directory to gather information
     */
    private analyzeModule;
    /**
     * Use AI to generate module.json configuration based on analysis
     */
    private generateModuleConfig;
    /**
     * Build the analysis prompt for the AI
     */
    private buildAnalysisPrompt;
}
export default ModuleImportAgent;
//# sourceMappingURL=index.d.ts.map
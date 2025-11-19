/**
 * ModuleImportAgent
 *
 * AI-powered agent that analyzes newly imported modules and automatically
 * generates appropriate module.json configuration files.
 */
import axios from 'axios';
import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';
/**
 * ModuleImportAgent class
 */
class ModuleImportAgent {
    constructor() {
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = process.env.OPENROUTER_API_KEY || '';
        this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY environment variable is required');
        }
    }
    /**
     * Execute the agent to analyze a module and generate module.json
     */
    async execute(input) {
        try {
            console.log(`Analyzing module: ${input.moduleName} at ${input.modulePath}`);
            // Step 1: Analyze the module directory
            const analysis = await this.analyzeModule(input.modulePath);
            if (!analysis.hasPackageJson) {
                return {
                    success: false,
                    message: 'No package.json found - cannot generate module.json',
                    artifacts: [],
                    error: 'package.json is required for module analysis',
                };
            }
            // Step 2: Use AI to generate module.json configuration
            const moduleConfig = await this.generateModuleConfig(input.moduleName, analysis);
            // Step 3: Write module.json to the module directory
            const moduleJsonPath = join(input.modulePath, 'module.json');
            const moduleJsonContent = JSON.stringify(moduleConfig, null, 2);
            await writeFile(moduleJsonPath, moduleJsonContent, 'utf-8');
            return {
                success: true,
                message: `Successfully generated module.json for ${input.moduleName}`,
                artifacts: [
                    {
                        type: 'module-config',
                        content: moduleJsonContent,
                        filePath: moduleJsonPath,
                        metadata: {
                            moduleName: input.moduleName,
                            category: moduleConfig.category,
                            project: moduleConfig.project,
                            envVarsCount: moduleConfig.env?.length || 0,
                        },
                    },
                ],
            };
        }
        catch (error) {
            console.error('Error in ModuleImportAgent:', error);
            return {
                success: false,
                message: `Failed to generate module.json: ${error.message}`,
                artifacts: [],
                error: error.message,
            };
        }
    }
    /**
     * Analyze the module directory to gather information
     */
    async analyzeModule(modulePath) {
        const analysis = {
            hasPackageJson: false,
            hasReadme: false,
            hasEnvExample: false,
            hasSourceCode: false,
        };
        // Check for package.json
        try {
            const packageJsonPath = join(modulePath, 'package.json');
            await access(packageJsonPath);
            const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
            analysis.hasPackageJson = true;
            analysis.packageJson = JSON.parse(packageJsonContent);
        }
        catch (error) {
            // package.json not found
        }
        // Check for README.md
        try {
            const readmePath = join(modulePath, 'README.md');
            await access(readmePath);
            analysis.hasReadme = true;
            analysis.readmeContent = await readFile(readmePath, 'utf-8');
        }
        catch (error) {
            // README.md not found
        }
        // Check for .env.example
        try {
            const envExamplePath = join(modulePath, '.env.example');
            await access(envExamplePath);
            analysis.hasEnvExample = true;
            analysis.envExampleContent = await readFile(envExamplePath, 'utf-8');
        }
        catch (error) {
            // .env.example not found
        }
        return analysis;
    }
    /**
     * Use AI to generate module.json configuration based on analysis
     */
    async generateModuleConfig(moduleName, analysis) {
        const prompt = this.buildAnalysisPrompt(moduleName, analysis);
        const response = await axios.post(this.apiUrl, {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/ex-nihilo/aideveloper',
                'X-Title': 'ModuleImportAgent',
            },
        });
        const aiResponse = response.data.choices[0].message.content;
        // Extract JSON from the AI response
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch) {
            throw new Error('AI did not return valid JSON configuration');
        }
        const moduleConfig = JSON.parse(jsonMatch[1]);
        return moduleConfig;
    }
    /**
     * Build the analysis prompt for the AI
     */
    buildAnalysisPrompt(moduleName, analysis) {
        let prompt = `You are a module configuration expert. Analyze the following module and generate a complete module.json configuration file.

Module Name: ${moduleName}

`;
        if (analysis.packageJson) {
            prompt += `Package.json:
\`\`\`json
${JSON.stringify(analysis.packageJson, null, 2)}
\`\`\`

`;
        }
        if (analysis.readmeContent) {
            prompt += `README.md:
\`\`\`
${analysis.readmeContent.substring(0, 2000)}${analysis.readmeContent.length > 2000 ? '...' : ''}
\`\`\`

`;
        }
        if (analysis.envExampleContent) {
            prompt += `Environment Variables (.env.example):
\`\`\`
${analysis.envExampleContent}
\`\`\`

`;
        }
        prompt += `Generate a complete module.json configuration file with the following structure:

{
  "name": "ModuleName",
  "version": "1.0.0",
  "description": "Module description from package.json",
  "category": "Controllers|AI Services|Agents|Utilities",
  "project": "Ex Nihilo|AIDeveloper",
  "tags": ["tag1", "tag2"],
  "scripts": {
    "install": "npm install",
    "build": "npm run build",
    "start": "npm start",
    "dev": "npm run dev",
    "test": "npm test",
    "typecheck": "npm run typecheck"
  },
  "env": [
    {
      "key": "ENV_VAR_NAME",
      "description": "Description of the variable",
      "required": true|false,
      "defaultValue": "default value (if any)",
      "type": "string|number|boolean",
      "secret": true|false
    }
  ]
}

Instructions:
1. Use the exact name from package.json (converted to PascalCase for the name field)
2. Use version and description from package.json
3. Determine the appropriate category based on the module's purpose:
   - "Controllers" for backend controllers/services
   - "AI Services" for AI-powered services
   - "Agents" for AI agents
   - "Utilities" for utility modules
4. Set project to "Ex Nihilo" for game/RPG modules, "AIDeveloper" for development tools/agents
5. Use keywords from package.json as tags
6. For scripts section, map to the package.json scripts:
   - "install": Always "npm install"
   - "build": Use "npm run build" if build script exists, otherwise omit
   - "start": Use "npm start" if start script exists, "npm run start" as fallback
   - "dev": Use "npm run dev" if dev script exists, otherwise omit
   - "test": Use "npm test" if test script exists, otherwise omit
   - "typecheck": Use "npm run typecheck" if typecheck script exists, otherwise omit
   - Only include scripts that exist in package.json (except install which is always included)
7. For env variables:
   - Extract from .env.example if available
   - Infer from package.json dependencies (e.g., mysql2 = MySQL variables, express = PORT)
   - Mark API keys as secret: true
   - Mark passwords/tokens as secret: true
   - Provide sensible defaults where appropriate
8. Common environment variables to include based on dependencies:
   - If express: PORT (default based on module type)
   - If mysql2: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
   - If axios + mentions OpenRouter/AI: OPENROUTER_API_KEY, OPENROUTER_MODEL
   - If dotenv: Check .env.example first

Return ONLY the JSON configuration wrapped in \`\`\`json\`\`\` code blocks, no additional explanation.`;
        return prompt;
    }
}
export default ModuleImportAgent;
//# sourceMappingURL=index.js.map
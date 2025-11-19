# ModuleImportAgent Tools

This agent uses built-in Node.js file system tools for module analysis. No external tool scripts are required.

## Built-in Capabilities

The ModuleImportAgent has direct access to:

### File Reading
- Reads `package.json` to extract metadata
- Reads `README.md` for module description and purpose
- Reads `.env.example` for environment variable definitions
- Reads `tsconfig.json` for TypeScript configuration
- Analyzes source code structure

### File Writing
- Writes generated `module.json` to the module directory
- Creates properly formatted JSON with 2-space indentation

### Analysis Functions

1. **analyzeModule(modulePath: string)**
   - Scans the module directory for configuration files
   - Extracts metadata from package.json
   - Reads documentation from README.md
   - Parses environment variables from .env.example
   - Returns comprehensive ModuleAnalysis object

2. **generateModuleConfig(moduleName: string, analysis: ModuleAnalysis)**
   - Uses AI to analyze module purpose and requirements
   - Generates appropriate category and project assignment
   - Creates environment variable definitions with types
   - Returns complete ModuleJson configuration

3. **buildAnalysisPrompt(moduleName: string, analysis: ModuleAnalysis)**
   - Constructs detailed prompt for AI analysis
   - Includes all gathered module information
   - Provides examples and guidelines for configuration
   - Returns formatted prompt string

## AI Integration

The agent uses OpenRouter's Claude API to:
- Understand module purpose from documentation
- Determine appropriate categorization
- Infer required environment variables from dependencies
- Generate sensible defaults and descriptions
- Ensure configuration consistency

## No External Tools Required

Unlike other agents (CodingAgent, CodePlannerAgent), the ModuleImportAgent:
- Does NOT use shell scripts for file operations
- Relies entirely on Node.js built-in `fs/promises` APIs
- Operates directly within the TypeScript/JavaScript runtime
- Has no dependency on external tools or executables

This design choice ensures:
- **Reliability**: No shell script execution issues
- **Performance**: Direct file system access
- **Security**: No arbitrary command execution
- **Portability**: Works on any platform with Node.js
- **Simplicity**: Single TypeScript file implementation

## Usage Pattern

The agent is invoked programmatically:

```typescript
import ModuleImportAgent from './modules/ModuleImportAgent/index.js';

const agent = new ModuleImportAgent();
const result = await agent.execute({
  modulePath: '/path/to/modules/NewModule',
  moduleName: 'NewModule',
  workingDir: '/path/to/modules/NewModule'
});
```

No CLI tools or shell scripts are involved in the execution.

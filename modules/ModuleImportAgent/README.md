# ModuleImportAgent

AI-powered agent that automatically generates `module.json` configuration files for newly imported modules.

## Purpose

When a new module is imported into the Ex Nihilo project, this agent analyzes the module's structure, dependencies, and documentation to automatically generate an appropriate `module.json` configuration file. This eliminates the need for manual configuration and ensures consistency across all modules.

## How It Works

1. **Analyzes Module Structure**: Reads `package.json`, `README.md`, `.env.example`, and other configuration files
2. **AI-Powered Analysis**: Uses Claude AI to understand the module's purpose and requirements
3. **Generates Configuration**: Creates a complete `module.json` file with:
   - Proper categorization (Controllers, AI Services, Agents, Utilities)
   - Project assignment (Ex Nihilo or AIDeveloper)
   - Environment variable definitions with types and defaults
   - Appropriate tags from package.json keywords
   - Version and description metadata

4. **Writes Configuration**: Saves the generated `module.json` directly to the module directory

## Integration

This agent is designed to be called automatically by the module import functionality in AIDeveloper. When a new module is imported via Git URL:

1. Module is cloned to `modules/` directory
2. ModuleImportAgent is triggered
3. `module.json` is generated automatically
4. Module is immediately available in the frontend with environment variable management

## Input

```typescript
{
  modulePath: string;      // Absolute path to the module directory
  moduleName: string;      // Name of the module
  workingDir: string;      // Working directory for the agent
}
```

## Output

```typescript
{
  success: boolean;
  message: string;
  artifacts: [{
    type: 'module-config',
    content: string;        // Generated module.json content
    filePath: string;       // Path where it was saved
    metadata: {
      moduleName: string;
      category: string;
      project: string;
      envVarsCount: number;
    }
  }]
}
```

## Environment Variables

- `OPENROUTER_API_KEY` (required): API key for Claude AI analysis
- `OPENROUTER_MODEL` (optional): Model to use (default: `anthropic/claude-3.5-sonnet`)

## Features

### Smart Categorization

Automatically determines the appropriate category based on module analysis:
- **Controllers**: Backend services managing specific domains (characters, items, scenes)
- **AI Services**: AI-powered services (intent classification, storytelling)
- **Agents**: AI agents for development workflows
- **Utilities**: Helper modules and tools

### Project Assignment

Intelligently assigns modules to the correct project:
- **Ex Nihilo**: Game/RPG-related modules
- **AIDeveloper**: Development tools and workflow agents

### Environment Variable Detection

Automatically detects and configures environment variables based on:
- `.env.example` file content
- Package dependencies (mysql2 → database vars, express → PORT)
- Module purpose (AI services → API keys)
- Security requirements (passwords/keys marked as secret)

### Script/Hook Generation

Automatically generates a `scripts` section that maps to package.json scripts:
- **install**: Always `npm install`
- **build**: `npm run build` (if build script exists)
- **start**: `npm start` (if start script exists)
- **dev**: `npm run dev` (if dev script exists)
- **test**: `npm test` (if test script exists)
- **typecheck**: `npm run typecheck` (if typecheck script exists)

These hooks enable the AIDeveloper frontend to:
- Build modules before deployment
- Start/stop module servers
- Run development mode
- Execute tests
- Perform type checking

### Comprehensive Configuration

Generates complete `module.json` files including:
- Name, version, description from package.json
- Appropriate tags from keywords
- Script hooks for build/run/test operations
- Full environment variable definitions with:
  - Types (string, number, boolean)
  - Required/optional flags
  - Default values
  - Secret flags for sensitive data
  - Helpful descriptions

## Example Generated Configuration

```json
{
  "name": "CharacterController",
  "version": "2.0.0",
  "description": "AI-powered character sheet management system",
  "category": "Controllers",
  "project": "Ex Nihilo",
  "tags": ["character-sheet", "ai", "rpg", "dnd"],
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
      "key": "PORT",
      "description": "Port number for the server",
      "required": false,
      "defaultValue": "3031",
      "type": "number"
    },
    {
      "key": "OPENROUTER_API_KEY",
      "description": "OpenRouter API key for AI features",
      "required": true,
      "type": "string",
      "secret": true
    }
  ]
}
```

## Requirements

- Node.js >= 18.0.0
- OpenRouter API key

## Benefits

- **Saves Time**: No manual configuration needed for imported modules
- **Consistency**: All modules follow the same configuration structure
- **Smart Defaults**: AI-powered analysis provides sensible defaults
- **Immediate Availability**: Modules are ready to use right after import
- **Environment Management**: Generated configs enable frontend env var editing

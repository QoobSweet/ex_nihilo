# AI Chains Architecture

## Overview

AI Chains in our system provide a flexible mechanism for linking multiple AI-powered modules together, allowing for complex workflows that persist context, transform data, and generate content across module boundaries. Chains enable the creation of sophisticated AI-driven processes by connecting the input/output JSON contracts of various modules.

## Core Components

### AIController

The AIController (`/src/controllers/AIController.ts`) serves as the central orchestrator for chain execution. Key features include:

- **Chain Definition**: Chains are defined as JSON objects specifying a sequence of modules and their connections
- **Data Flow**: Input data flows through the chain, with each module's output becoming the input for the next
- **Context Persistence**: Global context can be maintained across modules using shared state objects
- **Error Handling**: Robust error handling with rollback capabilities for failed chain executions

### Module Interfaces

Each AI module implements a standardized interface (`/src/interfaces/IModule.ts`) with:

- `inputSchema`: JSON schema defining expected input structure
- `outputSchema`: JSON schema defining output structure
- `execute(input: any, context: ChainContext): Promise<any>`: Main execution method

### Chain Structure

A typical chain definition includes:

```json
{
  "id": "story-generation-chain",
  "name": "Story Generation Workflow",
  "modules": [
    {
      "id": "story-generator",
      "module": "StoryGenerator",
      "config": { "genre": "fantasy" },
      "inputs": { "prompt": "${initialPrompt}" }
    },
    {
      "id": "character-creator",
      "module": "CharacterCreator",
      "config": {},
      "inputs": { "storyContext": "${story-generator.output}" }
    }
  ],
  "context": {
    "persist": ["worldState", "characterList"]
  }
}
```

## Data Flow and Linking

### Input/Output Linking

Modules are linked through template expressions in their input definitions:

- `${moduleId.output}`: References the complete output of a previous module
- `${moduleId.output.fieldName}`: References a specific field from a module's output
- `${context.variableName}`: References persisted context variables

### Context Persistence

The chain maintains a shared context object that persists across module executions:

- **Automatic Persistence**: Specified fields from module outputs are automatically saved to context
- **Manual Updates**: Modules can explicitly update context variables
- **Access**: Any module can read from the shared context

## Module Types and Capabilities

### Content Generation Modules

- **StoryGenerator**: Creates narrative content based on prompts
- **CharacterCreator**: Generates character profiles and backstories
- **ScenePainter**: Produces visual descriptions for scenes
- **DialogueWriter**: Creates conversations between characters

### Analysis Modules

- **SentimentAnalyzer**: Analyzes emotional tone in text
- **EntityExtractor**: Identifies and categorizes entities in content
- **StyleAnalyzer**: Evaluates writing style and consistency

### Processing Modules

- **ContentFilter**: Applies content moderation and filtering
- **FormatConverter**: Transforms content between different formats
- **Summarizer**: Creates concise summaries of longer content

## Best Practices

### Chain Design

1. **Start Simple**: Begin with linear chains before introducing branching
2. **Define Clear Contracts**: Ensure input/output schemas are well-documented
3. **Handle Errors Gracefully**: Include fallback modules for error scenarios
4. **Optimize for Context**: Minimize redundant data transfer between modules

### Performance Considerations

1. **Parallel Execution**: Use parallel branches for independent modules
2. **Caching**: Cache expensive computations when possible
3. **Resource Limits**: Set appropriate timeouts and resource constraints

### Security

1. **Input Validation**: All module inputs are validated against schemas
2. **Output Sanitization**: Sensitive data is filtered from outputs
3. **Access Control**: Chains respect user permissions and module access controls

## Common Patterns

### Sequential Processing

```json
{
  "modules": [
    "input-processor",
    "content-generator",
    "output-formatter"
  ]
}
```

### Parallel Processing

```json
{
  "modules": [
    {
      "parallel": [
        "sentiment-analysis",
        "entity-extraction"
      ]
    },
    "result-aggregator"
  ]
}
```

### Conditional Branching

```json
{
  "modules": [
    "content-analyzer",
    {
      "conditional": {
        "condition": "${analyzer.output.needsFiltering}",
        "true": "content-filter",
        "false": "direct-output"
      }
    }
  ]
}
```

## Implementation Details

### Chain Execution Flow

1. **Initialization**: Load chain definition and initialize context
2. **Module Resolution**: Resolve module references to actual implementations
3. **Input Preparation**: Substitute template expressions with actual data
4. **Sequential Execution**: Execute modules in order, passing outputs forward
5. **Context Updates**: Persist specified data to shared context
6. **Error Handling**: Rollback or skip failed modules based on configuration

### Error Handling Strategies

- **Fail-Fast**: Stop execution on first error
- **Continue-on-Error**: Skip failed modules and continue with remaining
- **Fallback Modules**: Execute alternative modules when primary ones fail

## Monitoring and Debugging

Chains include built-in monitoring:

- **Execution Logs**: Detailed logs of each module's execution
- **Performance Metrics**: Timing and resource usage statistics
- **Error Tracking**: Comprehensive error reporting with context

Debug mode provides additional insights:

- **Data Flow Visualization**: See how data transforms through the chain
- **Intermediate Outputs**: Inspect outputs at each step
- **Context Snapshots**: View context state at any point

## Future Enhancements

- **Dynamic Chains**: Runtime modification of chain structure
- **Machine Learning Integration**: Chains that learn and optimize themselves
- **Distributed Execution**: Running chains across multiple servers
- **Visual Chain Builder**: GUI for creating and editing chains
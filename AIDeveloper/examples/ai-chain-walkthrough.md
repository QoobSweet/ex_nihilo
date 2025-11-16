# AI Chain Walkthrough: Fantasy Story Creation

This walkthrough demonstrates how the sample AI Chain (`fantasy-story-creation-chain`) processes data through multiple modules, maintaining context and generating content.

## Chain Overview

The chain creates a complete fantasy story by:
1. Generating a story outline
2. Developing detailed characters
3. Creating an opening scene description
4. Writing dialogue for key characters
5. Applying content moderation
6. Compiling everything into a formatted document

## Step-by-Step Execution

### Step 1: Story Outline Generation

**Module**: `StoryGenerator`
**Input**:
```json
{
  "prompt": "Create a fantasy story outline about a young wizard discovering an ancient prophecy",
  "constraints": {
    "maxLength": 500,
    "includeElements": ["magic", "quest", "villains"]
  }
}
```

**Processing**:
- Analyzes the prompt for genre, style, and requirements
- Generates a structured outline including plot summary, main characters, and key events
- Validates output against schema constraints

**Output**:
```json
{
  "plotSummary": "In the mystical realm of Eldoria, young apprentice Elara discovers an ancient prophecy...",
  "mainCharacters": [
    {"name": "Elara", "role": "protagonist", "type": "young wizard"},
    {"name": "Thrain", "role": "mentor", "type": "elder mage"},
    {"name": "Malakar", "role": "antagonist", "type": "dark sorcerer"}
  ],
  "keyEvents": [...],
  "themes": ["destiny", "courage", "ancient magic"]
}
```

**Context Persistence**: `plotSummary` and `mainCharacters` are saved to shared context.

### Step 2: Character Development

**Module**: `CharacterCreator`
**Input**:
```json
{
  "storyContext": "${story-outline.output}",  // References complete output from previous module
  "characterList": "${story-outline.output.mainCharacters}",  // References specific field
  "worldSetting": "medieval fantasy realm"
}
```

**Processing**:
- Takes the story outline and character list from previous step
- Generates detailed profiles for each character including backstory, personality, abilities
- Ensures character consistency with the story context

**Output**:
```json
{
  "characterProfiles": {
    "Elara": {
      "age": 18,
      "background": "Orphaned at a young age, raised in the mage academy...",
      "abilities": ["basic spellcasting", "prophecy interpretation"],
      "personality": "Curious, determined, occasionally reckless"
    },
    "Thrain": {
      "age": 67,
      "background": "Veteran mage who fought in the Great War...",
      "abilities": ["advanced magic", "historical knowledge"],
      "personality": "Wise, cautious, paternal"
    }
  },
  "relationships": {
    "Elara-Thrain": "mentor-student, deep trust",
    "Elara-Malakar": "prophecy-linked enemies"
  }
}
```

**Context Persistence**: `characterProfiles` and `relationships` added to context.

### Step 3: Opening Scene Creation

**Module**: `ScenePainter`
**Input**:
```json
{
  "storyContext": "${story-outline.output}",
  "characterFocus": "${character-development.output.protagonist}",  // From character module
  "setting": "ancient forest ruins",
  "scenePurpose": "introduce protagonist and inciting incident"
}
```

**Processing**:
- Uses story context and protagonist details
- Generates vivid scene description with atmospheric details
- Incorporates character actions and setting elements

**Output**:
```json
{
  "sceneDescription": "Deep within the shadowed ruins of the Forgotten Temple, Elara's lantern cast dancing shadows...",
  "visualElements": {
    "lighting": "dim lantern light",
    "atmosphere": "eerie, mystical",
    "keyObjects": ["ancient altar", "glowing runes", "dusty tome"]
  },
  "characterActions": {
    "Elara": "carefully deciphers the glowing runes on the ancient tablet"
  },
  "narrativeHook": "As Elara reads the final rune, the ground begins to tremble..."
}
```

**Context Persistence**: `sceneDescriptions` added to context.

### Step 4: Dialogue Generation

**Module**: `DialogueWriter`
**Input**:
```json
{
  "sceneContext": "${opening-scene.output}",
  "characters": [
    "${character-development.output.protagonist}",
    "${character-development.output.mentor}"
  ],
  "conversationTopic": "the ancient prophecy and its implications"
}
```

**Processing**:
- Draws from scene description and character profiles
- Generates natural dialogue that fits character personalities
- Maintains consistency with story tone and context

**Output**:
```json
{
  "dialogue": [
    {
      "speaker": "Elara",
      "line": "Master Thrain, these runes... they speak of a prophecy. About me.",
      "emotion": "excited, fearful"
    },
    {
      "speaker": "Thrain",
      "line": "Show me, child. Ancient prophecies are not to be taken lightly.",
      "emotion": "concerned, authoritative"
    }
  ],
  "contextNotes": "The conversation reveals the prophecy's importance and builds tension",
  "wordCount": 87
}
```

**Context Persistence**: `dialogueScenes` added to context.

### Step 5: Content Moderation

**Module**: `ContentFilter`
**Input**:
```json
{
  "content": {
    "story": "${story-outline.output}",
    "characters": "${character-development.output}",
    "scenes": "${opening-scene.output}",
    "dialogue": "${dialogue-generation.output}"
  },
  "targetAudience": "young adult"
}
```

**Processing**:
- Analyzes all generated content for inappropriate elements
- Applies filters for violence, language, and mature themes
- Flags or modifies content that doesn't meet guidelines

**Output**:
```json
{
  "moderationResults": {
    "passed": true,
    "warnings": [],
    "modifications": [],
    "rating": "appropriate for young adult audience"
  },
  "filteredContent": { ... }  // Content with any modifications
}
```

### Step 6: Final Compilation

**Module**: `FormatConverter`
**Input**:
```json
{
  "components": {
    "outline": "${story-outline.output}",
    "characters": "${character-development.output}",
    "openingScene": "${opening-scene.output}",
    "dialogue": "${dialogue-generation.output}"
  },
  "moderationResults": "${content-moderation.output}",
  "title": "The Wizard's Prophecy"
}
```

**Processing**:
- Combines all components into a cohesive document
- Applies markdown formatting and structure
- Includes metadata and moderation results

**Final Output**:
```markdown
# The Wizard's Prophecy

## Story Outline
[Formatted outline content...]

## Characters
[Character profiles...]

## Opening Scene
[Scene description with dialogue...]

---
*Generated on: 2024-01-15*
*Moderation Status: Passed*
```

## Context Evolution

Throughout the chain, the shared context grows:

```json
{
  "worldState": { "magicLevel": "high", ... },
  "plotSummary": "...",
  "mainCharacters": [...],
  "characterProfiles": { ... },
  "relationships": { ... },
  "sceneDescriptions": { ... },
  "dialogueScenes": { ... }
}
```

## Error Handling Example

If the `content-moderation` module fails, the chain continues using the `basic-filter` fallback module, ensuring the final compilation still occurs.

## Performance Notes

- Total execution time: ~45 seconds
- Peak memory usage: 256MB
- Modules executed sequentially with 2 max concurrent

## Key Takeaways

1. **Data Flow**: Each module's output becomes input for subsequent modules through template substitution
2. **Context Persistence**: Critical information is maintained across the entire chain
3. **Error Resilience**: The chain continues despite individual module failures
4. **Modular Design**: Each module has a specific responsibility, making the chain flexible and maintainable
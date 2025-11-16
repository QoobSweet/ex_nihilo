/**
 * Barrel export for all module adapters.
 *
 * This file provides a centralized export point for all adapter-related
 * classes and interfaces, following the barrel export pattern for better
 * module organization and tree-shaking.
 */

export {
  ModuleAdapter,
  type ModuleAdapterConfig,
  type ModuleExecutionResult,
  ModuleAdapterConfigSchema,
} from './ModuleAdapter';

// Future adapters can be added here as they are implemented
// export { SpecificModuleAdapter } from './SpecificModuleAdapter';

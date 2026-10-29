// Canonical implementation is shared with Apollo v4.
export * from '../../../Apollo/packages/component-contract-core/src/index';
export * from './validation-export';
export { compileManualSource, buildExportBundle, dependencyUsageErrors } from './dependency-usage';
export type { DependencyUsage } from './dependency-usage';
export { prepareValidationSnapshot, evaluateCompiledContract, validationSnapshotHash } from './runtime';
export { buildEditorValidationReport } from './validation-report';

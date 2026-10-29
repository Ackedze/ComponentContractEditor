import type { AnatomyNode, CompiledContract, CompileResult, ManualSource, PreviewSnapshot } from './types';
import { slug, stableHash } from './stable';
import { buildEvaluationDetails } from './evaluation-view';
import { buildEditorValidationReport } from './validation-report';
import { prepareValidationSnapshot, validationSnapshotHash } from './runtime';
import { EDITOR_VERSION } from '../version';

export type ValidationCapture = {
  kind: 'preview' | 'selection' | 'selected-instance';
  requestId: string;
  warnings: string[];
  componentKey?: string;
  matchedBaselineNodes?: number;
  unmatchedBaselineNodeIds?: string[];
};

export type ValidationReportDownload = { fileName: string; json: string };

/** Serialize at evaluation time. Never rebuild an old report from current UI state. */
export function buildValidationReportDownload(input: {
  manual: ManualSource;
  compiled: CompileResult;
  evaluatedContract: CompiledContract;
  snapshot: PreviewSnapshot;
  anatomy: AnatomyNode[];
  engineResult: Record<string, unknown>;
  result: ReturnType<typeof buildEditorValidationReport>;
  capture: ValidationCapture | null;
  trigger: 'preview' | 'selected-instance';
  generatedAt?: string;
}): ValidationReportDownload {
  const { manual, compiled, evaluatedContract, anatomy, engineResult, result } = input;
  const snapshot = prepareValidationSnapshot(input.snapshot, evaluatedContract);
  const engineSnapshotHash = validationSnapshotHash(snapshot, evaluatedContract);
  if (engineResult.snapshotHash !== engineSnapshotHash) {
    throw new Error('Снимок отчёта не совпадает со снимком движка. Повторите проверку.');
  }
  const manualHash = stableHash(manual);
  if (compiled.contract.package.manualSourceHash !== manualHash || evaluatedContract.package.manualSourceHash !== manualHash) {
    throw new Error('Нельзя экспортировать отчёт: контракт и manual source относятся к разным ревизиям. Повторите проверку.');
  }
  const generatedAt = input.generatedAt || new Date().toISOString();
  const classifications: Record<string, number> = {};
  result.evaluations.forEach((entry) => {
    const key = String(entry.classification || 'unknown');
    classifications[key] = (classifications[key] || 0) + 1;
  });
  const activatedDraftRuleIds = compiled.contract.rules.filter((rule) => (
    (rule.authority as Record<string, unknown> | undefined)?.status === 'draft'
    && (evaluatedContract.rules.find((entry) => entry.ruleId === rule.ruleId)?.authority as Record<string, unknown> | undefined)?.status === 'active'
  )).map((rule) => rule.ruleId);
  const report = {
    schemaVersion: 'apollo.editor-validation-report.v1',
    documentType: 'component-contract-validation-report',
    generatedAt,
    editorVersion: EDITOR_VERSION,
    component: manual.component,
    run: {
      trigger: input.trigger,
      capture: input.capture,
      snapshotCapturedAt: snapshot.generatedAt,
      context: snapshot.context,
      manualRevision: manual.metadata.revision,
      manualSourceHash: manualHash,
      snapshotHash: stableHash(snapshot),
      engineSnapshotHash,
      snapshotEncoding: 'json-canonical-v1',
      evaluatedContractHash: stableHash(evaluatedContract),
    },
    summary: {
      ...result.editorCoverage,
      coverageModel: 'contract-and-scenario-v1',
      contractReadiness: result.contractReadiness,
      scenarioCoverage: result.scenarioCoverage,
      ...(result.ownershipCoverage ? { ownershipCoverage: result.ownershipCoverage } : {}),
      classifications,
      sourceRules: manual.rules.length,
      compiledChecks: compiled.contract.rules.length,
      capturedNodes: snapshot.nodes.length,
      compilerCoverage: compiled.contract.coverage,
      ...(snapshot.source?.nativeSlotCaptureScope?{captureScope:{kind:'component-owned-with-external-native-slots',externalContentsChecked:false,omissions:snapshot.source.nativeSlotCaptureScope.omissions}}:{}),
    },
    sources: { manual, compiledContract: compiled.contract, compilerIssues: compiled.issues },
    runtime: { evaluatedContract, activatedDraftRuleIds },
    snapshot,
    // Snapshot already carries observed properties. Keep only diagnostic target locators here.
    anatomy: anatomy.map(({ properties: _properties, ...locator }) => locator),
    results: {
      engine: engineResult,
      editor: result,
      details: buildEvaluationDetails(result, evaluatedContract, anatomy),
    },
    privacy: {
      containsLayerTextAndProperties: true,
      containsManualSource: true,
      includesPreviewImage: false,
      automaticallyUploaded: false,
    },
  };
  return {
    fileName: `${slug(manual.component.family)}.validation-report.${generatedAt.replace(/[^0-9TZ-]/g, '-')}.json`,
    json: JSON.stringify(report, null, 2),
  };
}

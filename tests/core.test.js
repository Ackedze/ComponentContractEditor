const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MANUAL_SCHEMA_VERSION,
  allowPublicComponentProperties,
  applyProtectInternalsPolicy,
  capabilitiesForSet,
  buildExportBundle,
  compileManualSource,
  createZip,
  evaluateCompiledContract,
  materializeEffectiveBaseline,
  allowedComponentPropertyNames,
  matchesComponentIdentity,
  buildEvaluationDetails,
  importWorkspace,
  prepareAuthoringPreviewContract,
  readZip,
  sameManualComponentFamily,
  samePreviewComponent,
  textZipEntry,
  validateManualSource,
  zipEntryText,
  stableHash,
  createEditorSession,
  parseEditorSession,
  mergeEditedApplicability,
  validateRuleEdit,
  buildEditorValidationReport,
  buildValidationReportDownload,
  prepareValidationSnapshot,
  validationSnapshotHash,
  paintDiagnosticSummary,
  buildContractReadiness,
  diagnoseRuleApplicability,
  inspectRuleFacts,
  captureSupplementalFacts,
} = require('../dist/core.cjs');

function singleIconFixture() {
  const { manual, observed } = semanticFixture();
  const representationId = manual.representations[0].id;
  manual.semanticApi.push(
    { id: 'singleIcon', kind: 'state', valueType: 'boolean', bindings: [{ representationId, path: 'component.properties.SingleIcon', transform: 'boolean-string' }] },
    { id: 'labelVisible', kind: 'visibility', valueType: 'boolean', bindings: [{ representationId, path: 'component.properties.Label' }] },
  );
  manual.targets = ['root', 'left-addon', 'right-addon', 'label', 'hint'].map((role) => ({
    id: `target.${role}`, semanticRole: role, label: role, lineage: [], resolution: 'resolved',
  }));
  manual.rules = [{ ...manual.rules[0], id: 'single-icon', targetId: 'target.root', targetScope: 'self',
    capability: 'composition.single-icon', permission: 'constrained', execution: { route: 'predicate' },
    applicability: { variants: 'all', modes: 'all', platforms: ['desktop'], conditionSubject: 'component-root', context: { 'semanticApi.singleIcon': true } },
    constraints: [
      { type: 'quantity', targetRoles: ['left-addon', 'right-addon'], visibleOnly: true, min: 1, max: 1 },
      { type: 'propertyDomain', fact: 'semanticApi.labelVisible', values: [false] },
      { type: 'propertyDomain', fact: 'semanticApi.hintVisible', values: [false] },
      { type: 'quantity', targetRoles: ['label', 'hint'], visibleOnly: true, min: 0, max: 0 },
    ],
  }];
  const root = observed.nodes[0];
  root.component.properties = { SingleIcon: 'True', Label: false, 'Hint#4:8': false };
  observed.nodes = [root, ...['left-addon', 'right-addon', 'label', 'hint'].map((role, i) => ({
    id: `node:${role}`, parentId: root.id, childIds: [], order: i + 1, name: role,
    type: 'FRAME', visible: role === 'left-addon', semantic: { role }, unknownFacts: [],
  }))];
  root.childIds = observed.nodes.slice(1).map((node) => node.id);
  const run = () => {
    const compiled = compileManualSource(manual);
    assert.deepEqual(compiled.issues.filter(i => i.level === 'error'), []);
    const contract = prepareAuthoringPreviewContract(compiled.contract);
    const engine = evaluateCompiledContract(observed, contract);
    return { compiled, contract, engine, report: buildEditorValidationReport(engine, compiled, manual, observed) };
  };
  return { manual, observed, run };
}

test('synthetic composition fixture: four independent assertions (not a reachable Button variant)', () => {
  const f = singleIconFixture();
  assert.deepEqual(f.run().engine.evaluations.map(e => e.classification), Array(4).fill('compliant'));
  f.observed.nodes[0].component.properties.Label = true;
  f.observed.nodes[0].component.properties['Hint#4:8'] = true;
  f.observed.nodes.find(n => n.name === 'label').visible = true;
  f.observed.nodes.find(n => n.name === 'hint').visible = true;
  assert.equal(f.run().engine.evaluations.filter(e => e.classification === 'violation').length, 3);
  assert.equal(f.run().engine.evaluations.some(e => e.classification === 'not-applicable'), false);
});

test('synthetic quantity fixture detects zero/two slots; either single slot is allowed', () => {
  for (const [left, right, verdict] of [[false,false,'violation'],[true,true,'violation'],[true,false,'compliant'],[false,true,'compliant']]) {
    const f = singleIconFixture();
    f.observed.nodes[1].visible = left; f.observed.nodes[2].visible = right;
    assert.equal(f.run().engine.evaluations[0].classification, verdict);
  }
});

test('SingleIcon False excludes the rule even when Label/Hint are visible; unknown never excludes', () => {
  const f = singleIconFixture();
  f.observed.nodes[0].component.properties.SingleIcon = 'False';
  f.observed.nodes[0].component.properties.Label = true;
  assert.ok(f.run().engine.evaluations.every(e => e.classification === 'not-applicable'));
  f.observed.nodes[0].unknownFacts.push('component.properties.SingleIcon');
  assert.ok(f.run().engine.evaluations.every(e => e.classification === 'human-review'));
  assert.equal(f.run().report.scenarioCoverage.complete, false);
});

test('quantity never passes on missing, duplicate, unresolved, truncated or unknown visibility targets', () => {
  const mutations = [
    f => { f.observed.nodes = f.observed.nodes.filter(n => n.name !== 'right-addon'); },
    f => { f.observed.nodes.push({ ...f.observed.nodes[2], id:'duplicate' }); },
    f => { f.manual.targets[2].resolution = 'ambiguous'; },
    f => { f.observed.source.truncated = true; },
    f => { f.observed.nodes[2].unknownFacts = ['visible']; },
    f => { f.observed.nodes[2].parentId = 'missing-parent'; },
  ];
  for (const mutate of mutations) {
    const f = singleIconFixture(); mutate(f);
    assert.equal(f.run().engine.evaluations[0].classification, 'human-review');
    assert.equal(f.run().report.scenarioCoverage.complete, false);
  }
});

test('effective visibility respects hidden ancestry and refuses cycles', () => {
  const f = singleIconFixture();
  const left = f.observed.nodes[1];
  f.observed.nodes.push({ id:'wrapper',parentId:f.observed.nodes[0].id,childIds:[left.id],order:6,visible:false,semantic:{role:'wrapper'},unknownFacts:[] });
  left.parentId = 'wrapper'; f.observed.nodes[0].childIds[0] = 'wrapper';
  assert.equal(f.run().engine.evaluations[0].classification, 'violation');
  assert.equal(prepareValidationSnapshot(f.observed,f.run().contract).nodes[1].visibility.effective,false);
  // Do not execute the engine on cyclic input; the factual adapter must stop safely.
  left.parentId=left.id;
  const prepared=prepareValidationSnapshot(f.observed,compileManualSource(f.manual).contract);
  assert.ok(prepared.nodes[1].unknownFacts.includes('visibility.effective'));
});

test('explicit component-root variant/context conditions do not read a nested target or all descendants', () => {
  const f = singleIconFixture();
  f.manual.rules[0].constraints=[{type:'propertyDomain',fact:'visible',values:[true]}];
  f.manual.rules[0].targetId='target.left-addon';
  f.manual.rules[0].applicability.variants={ SingleIcon:['True'] };
  f.observed.nodes[1].component={properties:{SingleIcon:'False'}};
  assert.equal(f.run().engine.evaluations[0].classification,'compliant');
  const prepared=prepareValidationSnapshot(f.observed,f.run().contract);
  assert.equal(diagnoseRuleApplicability(f.manual,f.manual.rules[0],prepared).status,'applicable');
  f.manual.rules[0].applicability.conditionSubject='target';
  assert.equal(f.run().engine.evaluations[0].classification,'not-applicable');
  f.manual.rules[0].applicability.conditionSubject='component-root';
  f.observed.nodes[0].unknownFacts.push('component.properties.SingleIcon');
  assert.equal(f.run().engine.evaluations[0].classification,'human-review');
});

test('component facts are idempotent, exported and replayed; legacy contracts do not receive them', () => {
  const f=singleIconFixture(), {contract}=f.run();
  const before=JSON.stringify(f.observed);
  const once=prepareValidationSnapshot(f.observed,contract);
  assert.equal(JSON.stringify(f.observed),before);
  assert.deepEqual(prepareValidationSnapshot(once,contract),once);
  assert.deepEqual(evaluateCompiledContract(once,contract),evaluateCompiledContract(f.observed,contract));
  delete contract.package.snapshotProfile;
  const legacy=prepareValidationSnapshot(f.observed,contract);
  assert.equal(legacy.nodes[0].host,undefined);
  assert.equal(legacy.nodes[0].semanticTargets,undefined);
});

test('hidden target can be excluded by an explicit false component-root condition, never by absence alone', () => {
  const f = singleIconFixture();
  f.manual.rules[0].constraints = [{ type: 'propertyDomain', fact: 'visible', values: [true] }];
  f.manual.rules[0].targetId = 'target.left-addon';
  f.observed.nodes[1].visible = false;
  f.observed.nodes[0].component.properties.SingleIcon = 'False';
  const run = () => {
    const result = f.run();
    const prepared = prepareValidationSnapshot(f.observed, result.contract);
    return { result, evidence: diagnoseRuleApplicability(f.manual, f.manual.rules[0], prepared) };
  };
  assert.equal(run().evidence.status, 'not-applicable');
  assert.equal(run().result.report.scenarioCoverage.complete, true);
  assert.match(run().evidence.evaluations[0].ruleId, /component-root-condition$/);
  f.observed.nodes[0].component.properties.SingleIcon = 'True';
  assert.equal(run().evidence.status, 'unknown');
  assert.equal(run().result.report.scenarioCoverage.complete, false);
  delete f.observed.nodes[0].component.properties.SingleIcon;
  assert.equal(run().evidence.status, 'unknown');
});

test('root-condition fallback preserves target conditions, ambiguous mapping and truncated evidence as unknown', () => {
  for (const mutate of [
    f => { f.manual.rules[0].applicability.conditionSubject = 'target'; },
    f => { f.manual.targets[1].resolution = 'ambiguous'; },
    f => { f.observed.source.truncated = true; },
    f => { f.observed.nodes[0].unknownFacts.push('component.properties.SingleIcon'); },
    f => { f.observed.selection.push('missing-root'); },
    f => { f.manual.rules[0].applicability.context = { unsupported: false }; },
  ]) {
    const f = singleIconFixture();
    f.manual.rules[0].constraints = [{ type: 'propertyDomain', fact: 'visible', values: [true] }];
    f.manual.rules[0].targetId = 'target.left-addon';
    f.observed.nodes[1].visible = false;
    f.observed.nodes[0].component.properties.SingleIcon = 'False';
    mutate(f);
    const compiled = compileManualSource(f.manual);
    const prepared = prepareValidationSnapshot(f.observed, compiled.contract);
    assert.equal(diagnoseRuleApplicability(f.manual, f.manual.rules[0], prepared).status, 'unknown', String(mutate));
  }
});

test('hidden target uses root variant condition rather than nested variant properties', () => {
  const f = singleIconFixture();
  f.manual.rules[0].targetId = 'target.left-addon';
  f.manual.rules[0].constraints = [{ type: 'propertyDomain', fact: 'visible', values: [true] }];
  f.manual.rules[0].applicability.context = {};
  f.manual.rules[0].applicability.variants = { SingleIcon: ['True'] };
  f.observed.nodes[0].component.properties.SingleIcon = 'False';
  f.observed.nodes[1].visible = false;
  f.observed.nodes[1].component = { properties: { SingleIcon: 'True' } };
  const prepared = prepareValidationSnapshot(f.observed, compileManualSource(f.manual).contract);
  assert.equal(diagnoseRuleApplicability(f.manual, f.manual.rules[0], prepared).status, 'not-applicable');
});

test('new quantity target union validates declared roles and explicit visible counting', () => {
  for (const extra of [{targetRoles:[]},{targetRoles:['typo']},{targetRoles:['left-addon','left-addon']},{visibleOnly:false},{targetRole:'left-addon'}]) {
    const f=singleIconFixture();Object.assign(f.manual.rules[0].constraints[0],extra);
    assert.ok(compileManualSource(f.manual).issues.some(i=>i.level==='error'));
    assert.equal(compileManualSource(f.manual).contract.rules.length,0);
  }
});

test('capture text and real parent layout without inventing defaults', () => {
  const mixed=Symbol('mixed');
  const facts=captureSupplementalFacts({type:'TEXT',textAutoResize:'HEIGHT',textAlignHorizontal:'CENTER',textAlignVertical:'TOP',textTruncation:'DISABLED',maxLines:null,paragraphSpacing:0,maxHeight:null,parent:{type:'FRAME',layoutMode:'HORIZONTAL',clipsContent:false}},mixed);
  assert.equal(facts.text.textAutoResize,'HEIGHT');assert.equal(facts.text.maxLines,null);
  assert.deepEqual(facts.parent,{layout:{mode:'HORIZONTAL'},clipsContent:false});
  assert.deepEqual(facts.unknownFacts,[]);
  assert.equal(facts.text.paragraphSpacing,0);assert.equal(facts.text.maxHeight,null);
  const missing=captureSupplementalFacts({type:'TEXT',textAutoResize:mixed,parent:{type:'PAGE'}},mixed);
  assert.equal(missing.text.textAutoResize,undefined);assert.ok(missing.unknownFacts.includes('text.textAutoResize'));
  assert.ok(missing.unknownFacts.includes('text.paragraphSpacing'));assert.ok(missing.unknownFacts.includes('text.maxHeight'));
  assert.equal(missing.parent.layout.mode,'NONE');
  assert.ok(!missing.unknownFacts.includes('parent'));
  assert.deepEqual(captureSupplementalFacts({type:'FRAME',parent:{type:'FRAME',layoutMode:'NONE',clipsContent:true}},mixed).text,{});
});

function reportFixture() {
  const manual = manualSource();
  const observed = snapshot(0.2);
  observed.context.product = 'ab';
  observed.source = { fileName: 'Test', fileKey: 'file-key', pageId: '1:2', rootNodeId: '3:4', truncated: false, nodeLimit: 500 };
  const compiled = compileManualSource(manual);
  const evaluatedContract = prepareAuthoringPreviewContract(compiled.contract);
  const engineResult = evaluateCompiledContract(observed, evaluatedContract);
  const result = buildEditorValidationReport(engineResult, compiled, manual, observed);
  return {
    manual, compiled, evaluatedContract, engineResult, result, snapshot: observed,
    anatomy: [{ id: 'preview:0', figmaNodeId: '3:4', parentId: null, name: 'BackgroundPlate', type: 'INSTANCE', path: 'BackgroundPlate', semanticRole: 'root', visible: true, order: 0, depth: 0, childIds: [], properties: { text: 'snapshot owns this' }, unknownFacts: [] }],
    capture: { kind: 'selected-instance', requestId: 'test:1', warnings: ['Baseline warning'], matchedBaselineNodes: 2, unmatchedBaselineNodeIds: [] },
    trigger: 'selected-instance', generatedAt: '2026-09-25T12:30:00.000Z',
  };
}

test('validation download is self-contained and replays the same engine and editor results', () => {
  const input = reportFixture();
  const before = JSON.stringify(input);
  const download = buildValidationReportDownload(input);
  const report = JSON.parse(download.json);
  assert.equal(JSON.stringify(input), before);
  assert.equal(report.schemaVersion, 'apollo.editor-validation-report.v1');
  assert.equal(report.run.context.product, 'ab');
  assert.equal(report.run.manualSourceHash, stableHash(input.manual));
  assert.equal(report.run.snapshotHash, stableHash(report.snapshot));
  assert.equal(report.run.evaluatedContractHash, stableHash(report.runtime.evaluatedContract));
  assert.equal(report.summary.classifications.violation, 1);
  assert.equal(report.anatomy[0].figmaNodeId, '3:4');
  assert.equal(report.anatomy[0].properties, undefined);
  assert.equal(report.snapshot.source.rootNodeId, '3:4');
  assert.deepEqual(report.run.capture.warnings, ['Baseline warning']);
  assert.deepEqual(report.results.engine, evaluateCompiledContract(report.snapshot, report.runtime.evaluatedContract));
  const rebuilt = compileManualSource(report.sources.manual);
  assert.deepEqual(JSON.parse(JSON.stringify(rebuilt.contract)), report.sources.compiledContract);
  assert.deepEqual(report.results.editor, buildEditorValidationReport(report.results.engine, rebuilt, report.sources.manual, report.snapshot));
  assert.match(download.fileName, /^background-plate\.validation-report\.[\w-]+\.json$/);
});

test('serialized report is immutable when session data changes and includes no preview image', () => {
  const input = reportFixture();
  const download = buildValidationReportDownload(input);
  input.manual.rules[0].rationale = 'Changed after run';
  input.snapshot.context.product = 'other';
  input.snapshot.nodes[1].appearance.opacity = 1;
  input.capture.warnings.push('Later warning');
  const report = JSON.parse(download.json);
  assert.equal(report.run.context.product, 'ab');
  assert.equal(report.snapshot.nodes[1].appearance.opacity, 0.2);
  assert.notEqual(report.sources.manual.rules[0].rationale, 'Changed after run');
  assert.deepEqual(report.run.capture.warnings, ['Baseline warning']);
  assert.equal(report.privacy.includesPreviewImage, false);
  assert.equal(report.privacy.automaticallyUploaded, false);
  assert.equal(report.imageDataUrl, undefined);
});

test('report records temporary draft activation without changing the compiled contract', () => {
  const input = reportFixture();
  input.manual.rules[0].status = 'draft';
  input.compiled = compileManualSource(input.manual);
  input.evaluatedContract = prepareAuthoringPreviewContract(input.compiled.contract);
  input.engineResult = evaluateCompiledContract(input.snapshot, input.evaluatedContract);
  input.result = buildEditorValidationReport(input.engineResult, input.compiled, input.manual);
  const report = JSON.parse(buildValidationReportDownload(input).json);
  assert.deepEqual(report.runtime.activatedDraftRuleIds, [input.compiled.contract.rules[0].ruleId]);
  assert.equal(report.sources.compiledContract.rules[0].authority.status, 'draft');
  assert.equal(report.runtime.evaluatedContract.rules[0].authority.status, 'active');
});

test('export rejects mismatched manual or runtime revisions', () => {
  const input = reportFixture();
  input.manual.metadata.revision++;
  assert.throws(() => buildValidationReportDownload(input), /разным ревизиям/);
  const other = reportFixture();
  other.evaluatedContract.package = { ...other.evaluatedContract.package, manualSourceHash: 'stale' };
  assert.throws(() => buildValidationReportDownload(other), /разным ревизиям/);
});

test('incomplete reports preserve compiler exclusions and concrete reasons', () => {
  const input = reportFixture();
  input.manual.rules[0].rationale = '';
  input.compiled = compileManualSource(input.manual);
  input.evaluatedContract = prepareAuthoringPreviewContract(input.compiled.contract);
  input.engineResult = evaluateCompiledContract(input.snapshot, input.evaluatedContract);
  input.result = buildEditorValidationReport(input.engineResult, input.compiled, input.manual);
  const report = JSON.parse(buildValidationReportDownload(input).json);
  assert.equal(report.summary.complete, false);
  assert.equal(report.summary.notExecuted, 1);
  assert.equal(report.summary.compiledChecks, 0);
  assert.ok(report.sources.compilerIssues.some((entry) => entry.code === 'RULE_RATIONALE'));
  assert.match(report.results.editor.evaluations[0].trace.reason, /обоснование/);
  assert.equal(report.results.details[0].showComparison, false);
});

test('truncated capture is never reported as complete', () => {
  const input = reportFixture();
  input.snapshot.source.truncated = true;
  input.engineResult = evaluateCompiledContract(input.snapshot, input.evaluatedContract);
  input.result = buildEditorValidationReport(input.engineResult, input.compiled, input.manual, input.snapshot);
  const report = JSON.parse(buildValidationReportDownload(input).json);
  assert.equal(report.summary.complete, false);
  assert.ok(report.results.editor.evaluations.some((entry) => entry.ruleId === 'snapshot-capture' && /500/.test(entry.trace.reason)));
});

test('reviewed save validates rationale without mutating manual or blocking on unrelated rules', () => {
  const manual = manualSource();
  const before = JSON.stringify(manual);
  const rule = { ...manual.rules[0], rationale: '  ' };
  assert.ok(validateRuleEdit(manual, rule, rule.id).some((i) => i.code === 'RULE_RATIONALE'));
  assert.equal(JSON.stringify(manual), before);
  manual.rules.push({ ...rule, id: 'other-invalid' });
  assert.deepEqual(validateRuleEdit(manual, manual.rules[0], manual.rules[0].id), []);
  assert.deepEqual(validateRuleEdit(manual, { ...rule, status: 'draft' }, rule.id), []);
});

test('reviewed save highlights empty constraints, execution fields, scope and duplicate IDs', () => {
  const manual = manualSource();
  const base = manual.rules[0];
  const cases = [
    [{ constraints: [{ type: 'propertyDomain', values: [] }] }, 'CONSTRAINT_VALUES'],
    [{ execution: { route: 'delegated', externalRuleIds: [] } }, 'RULE_DELEGATION'],
    [{ execution: { route: 'context-only', missingFacts: [] } }, 'RULE_CONTEXT_FACTS'],
    [{ applicability: { ...base.applicability, scopeStatus: 'needs-confirmation' } }, 'RULE_SCOPE_UNCONFIRMED'],
  ];
  for (const [patch, code] of cases) assert.ok(validateRuleEdit(manual, { ...base, ...patch }, base.id).some((i) => i.code === code), code);
  assert.ok(validateRuleEdit(manual, base, null).some((i) => i.code === 'RULE_DUPLICATE'));
});

test('excluded reviewed rule becomes a visible not-executed diagnostic with no fake comparison', () => {
  const manual = manualSource();
  manual.rules[0].rationale = '';
  const compiled = compileManualSource(manual);
  const report = buildEditorValidationReport({ evaluations: [] }, compiled, manual);
  assert.equal(report.editorCoverage.complete, false);
  assert.equal(report.editorCoverage.notExecuted, 1);
  const [detail] = buildEvaluationDetails(report, compiled.contract, []);
  assert.equal(detail.classificationLabel, 'Не выполнено');
  assert.match(detail.reasonLabel, /обоснование/);
  assert.equal(detail.showComparison, false);
  assert.equal(detail.nodeId, '');
});

test('partial checks stay incomplete, context-only and delegated rules remain visible', () => {
  const manual = manualSource();
  manual.rules.push({ ...manual.rules[0], id: 'context', execution: { route: 'context-only', missingFacts: ['semanticApi.loading'] } });
  manual.rules.push({ ...manual.rules[0], id: 'delegated', execution: { route: 'delegated', externalRuleIds: ['external.rule'] } });
  const compiled = compileManualSource(manual);
  const engine = evaluateCompiledContract(snapshot(1), compiled.contract);
  const before = JSON.stringify(engine);
  const report = buildEditorValidationReport(engine, compiled, manual);
  assert.equal(JSON.stringify(engine), before);
  assert.equal(report.editorCoverage.complete, false);
  assert.equal(report.editorCoverage.notExecuted, 2);
  assert.ok(report.evaluations.some((e) => e.classification === 'compliant'));
  assert.ok(report.evaluations.some((e) => e.trace.reason.includes('semanticApi.loading')));
  assert.ok(report.evaluations.some((e) => e.trace.reason.includes('external.rule')));
});

test('complete means evaluated, not compliant; scope mismatch is not a coverage failure', () => {
  const manual = manualSource();
  const compiled = compileManualSource(manual);
  for (const value of [1, 0.2]) {
    const result = evaluateCompiledContract(snapshot(value), compiled.contract);
    assert.equal(buildEditorValidationReport(result, compiled, manual).editorCoverage.complete, true);
  }
  const otherPlatform = snapshot(1);
  otherPlatform.context.platform = 'mobile-web';
  const report = buildEditorValidationReport(evaluateCompiledContract(otherPlatform, compiled.contract), compiled, manual);
  assert.equal(report.editorCoverage.complete, true);
  assert.equal(report.evaluations[0].classification, 'not-applicable');
});

test('unknown facts, missing results and unmatched targets cannot produce complete checks', () => {
  const manual = manualSource();
  const compiled = compileManualSource(manual);
  const unknown = evaluateCompiledContract(snapshot(undefined, ['appearance.opacity']), compiled.contract);
  assert.equal(buildEditorValidationReport(unknown, compiled, manual).editorCoverage.complete, false);
  const missing = buildEditorValidationReport({ evaluations: [] }, compiled, manual);
  assert.equal(missing.editorCoverage.notExecuted, 1);
  const unmatched = { evaluations: [{ ruleId: compiled.contract.rules[0].ruleId, classification: 'not-applicable', trace: { reason: 'selector matched no visible nodes' } }] };
  assert.equal(buildEditorValidationReport(unmatched, compiled, manual).editorCoverage.complete, false);
});

test('global errors and no executable checks cannot look complete; policy-only is not excluded', () => {
  const manual = manualSource();
  manual.rules[0].permission = 'allowed';
  manual.rules[0].constraints = [];
  let compiled = compileManualSource(manual);
  let report = buildEditorValidationReport({ evaluations: [] }, compiled, manual);
  assert.equal(report.editorCoverage.complete, false);
  assert.equal(report.editorCoverage.notExecuted, 0);
  compiled.issues.push({ level: 'error', code: 'BROKEN_COMPONENT', path: '/component', message: 'Invalid component' });
  report = buildEditorValidationReport({ evaluations: [] }, compiled, manual);
  assert.equal(report.editorCoverage.notExecuted, 1);
});

test('JSON replay keeps snapshot hash and evaluation IDs with undefined fields and stale cached hashes', () => {
  const input = reportFixture();
  input.snapshot.source.fileKey = undefined;
  input.snapshot.nodes[0].component.optional = undefined;
  input.snapshot.snapshotHash = 'stale-cache';
  input.engineResult = evaluateCompiledContract(input.snapshot, input.evaluatedContract);
  input.result = buildEditorValidationReport(input.engineResult, input.compiled, input.manual, input.snapshot);
  const report = JSON.parse(buildValidationReportDownload(input).json);
  assert.equal(report.snapshot.snapshotHash, undefined);
  assert.equal(input.snapshot.snapshotHash, 'stale-cache');
  assert.equal(report.run.engineSnapshotHash, report.results.engine.snapshotHash);
  assert.equal(report.run.snapshotEncoding, 'json-canonical-v1');
  assert.deepEqual(evaluateCompiledContract(report.snapshot, report.runtime.evaluatedContract), report.results.engine);
});

test('report rejects a snapshot changed after evaluation', () => {
  const input = reportFixture();
  input.snapshot.nodes[1].appearance.opacity = 0.9;
  assert.throws(() => buildValidationReportDownload(input), /Снимок отчёта/);
});

test('paint diagnostics expose complete token IDs for every paint without shortening evidence', () => {
  const id = `VariableID:${'f'.repeat(40)}/2011:244`;
  const summary = paintDiagnosticSummary([
    { type: 'SOLID', color: { r: 239, g: 49, b: 36 }, tokenId: id, opacity: 1, visible: true },
    { type: 'SOLID', color: { r: 13, g: 147, b: 54 }, tokenId: null, visible: false },
  ]);
  assert.ok(summary.includes(id));
  assert.match(summary, /#EF3124/);
  assert.match(summary, /2\. SOLID · #0D9336/);
  assert.match(summary, /нет привязки в снимке/);
  assert.match(summary, /Скрыта/);
  assert.equal(paintDiagnosticSummary(false), null);
});

function semanticFixture() {
  const manual = manualSource();
  const representationId = manual.representations[0].id;
  manual.semanticApi = [
    { id: 'hintVisible', kind: 'visibility', valueType: 'boolean', bindings: [{ representationId, path: 'component.properties.Hint#4:8' }] },
    { id: 'size', kind: 'variant', valueType: 'enum', domain: [48, 56, 64, 72], bindings: [{ representationId, path: 'component.properties.Size', transform: 'number-to-string' }] },
    { id: 'view', kind: 'variant', valueType: 'enum', domain: ['accent', 'secondary'], bindings: [{ representationId, path: 'component.properties.View', transform: 'pascal-case' }] },
    { id: 'loading', kind: 'state', valueType: 'boolean', defaultValue: false, bindings: [{ representationId, path: 'derived.loading' }] },
    { id: 'leftAddon', kind: 'slot', valueType: 'node', bindings: [{ representationId, path: 'component.properties.LeftAddon#4:10' }] },
  ];
  manual.targets = [{ ...manual.targets[0], id: 'target.root', semanticRole: 'root', nameHint: 'BackgroundPlate', pathHint: 'BackgroundPlate' }];
  manual.rules = [{ ...manual.rules[0], id: 'hint-size', targetId: 'target.root', capability: 'semanticApi.size',
    constraints: [{ type: 'propertyDomain', values: [56, 64, 72] }],
    applicability: { variants: 'all', modes: 'all', platforms: ['desktop'], context: { 'semanticApi.hintVisible': true } },
  }];
  const observed = snapshot(1);
  observed.source = { componentSetKey: manual.component.componentKey };
  observed.nodes[0].semantic.role = 'root';
  observed.nodes[0].component.properties = { 'Hint#4:8': true, Size: '48', View: 'Accent', 'LeftAddon#4:10': true };
  return { manual, observed };
}

test('explicit representation bindings materialize root semantic facts, never infer loading or slot nodes', () => {
  const { manual, observed } = semanticFixture();
  const contract = compileManualSource(manual).contract;
  const before = JSON.stringify(observed);
  const prepared = prepareValidationSnapshot(observed, contract);
  assert.equal(JSON.stringify(observed), before);
  assert.equal(prepared.nodes[0].semanticApi.hintVisible, true);
  assert.equal(prepared.nodes[0].semanticApi.size, 48);
  assert.equal(prepared.nodes[0].semanticApi.view, 'accent');
  assert.equal(prepared.nodes[0].semanticApi.loading, undefined);
  assert.equal(prepared.nodes[0].semanticApi.leftAddon, undefined);
  assert.ok(prepared.nodes[0].unknownFacts.includes('semanticApi.loading'));
  assert.equal(prepared.nodes[1].semanticApi, undefined);
  assert.equal(validationSnapshotHash(prepared, contract), validationSnapshotHash(JSON.parse(JSON.stringify(prepared)), contract));
  observed.nodes[0].component.properties.Size = '9'.repeat(400);
  assert.equal(prepareValidationSnapshot(observed, contract).nodes[0].semanticApi.size, undefined);
});

test('semantic conditions distinguish violation, compliant, not-applicable and unknown', () => {
  const { manual, observed } = semanticFixture();
  const compiled = compileManualSource(manual);
  assert.equal(compiled.issues.filter(i => i.level === 'error').length, 0);
  const classify = () => evaluateCompiledContract(observed, compiled.contract).evaluations[0].classification;
  assert.equal(classify(), 'violation');
  observed.nodes[0].component.properties.Size = '56';
  assert.equal(classify(), 'compliant');
  observed.nodes[0].component.properties['Hint#4:8'] = false;
  assert.equal(classify(), 'not-applicable');
  delete observed.nodes[0].component.properties['Hint#4:8'];
  assert.equal(classify(), 'human-review');
});

test('semantic projection is fail-closed for missing identity, ambiguous representation or unknown raw facts', () => {
  const { manual, observed } = semanticFixture();
  let contract = compileManualSource(manual).contract;
  delete observed.source.componentSetKey;
  assert.equal(evaluateCompiledContract(observed, contract).evaluations[0].classification, 'human-review');
  observed.source.componentSetKey = manual.component.componentKey;
  observed.nodes[0].unknownFacts = ['component.properties.Hint#4:8'];
  assert.equal(evaluateCompiledContract(observed, contract).evaluations[0].classification, 'human-review');
  observed.nodes[0].unknownFacts = [];
  manual.representations.push({ ...manual.representations[0], id: 'ambiguous-copy' });
  contract = compileManualSource(manual).contract;
  assert.equal(evaluateCompiledContract(observed, contract).evaluations[0].classification, 'human-review');
});

test('semantic projection respects representation-specific property IDs and platform', () => {
  const { manual, observed } = semanticFixture();
  manual.representations.push({ ...manual.representations[0], id: 'inverted', locator: { componentSetKey: 'inverted-key' } });
  manual.semanticApi[0].bindings.push({ representationId: 'inverted', path: 'component.properties.Hint#650:4' });
  observed.source.componentSetKey = 'inverted-key';
  observed.nodes[0].component.properties['Hint#650:4'] = false;
  const contract = compileManualSource(manual).contract;
  assert.equal(prepareValidationSnapshot(observed, contract).nodes[0].semanticApi.hintVisible, false);
  observed.context.platform = 'mobile-web';
  assert.equal(prepareValidationSnapshot(observed, contract).nodes[0].semanticApi.hintVisible, undefined);
});

test('unmapped prose conditions remain excluded; deprecated rules are historical, not coverage gaps', () => {
  const { manual } = semanticFixture();
  manual.rules[0].applicability.context = { hintVisible: true };
  assert.ok(compileManualSource(manual).issues.some(i => i.code === 'RULE_CONTEXT_UNMAPPED'));
  manual.rules[0].status = 'deprecated';
  const compiled = compileManualSource(manual);
  assert.equal(compiled.contract.rules.length, 0);
  assert.equal(compiled.contract.status, 'ready');
  const report = buildEditorValidationReport({ evaluations: [] }, compiled, manual);
  assert.equal(report.editorCoverage.notExecuted, 0);
});

function coverageFixture(patch = {}) {
  const manual = manualSource();
  manual.rules.push({ ...structuredClone(manual.rules[0]), id: 'pending', execution: { route: 'context-only', missingFacts: ['appearance.opacity', 'nested.size'] }, ...patch });
  const observed = snapshot(1);
  observed.context.product = 'ab';
  const compiled = compileManualSource(manual);
  const engine = evaluateCompiledContract(observed, compiled.contract);
  return { manual, observed, compiled, engine };
}

test('package stays draft when a deferred mobile rule is not applicable to a complete desktop scenario', () => {
  const { manual, observed, compiled, engine } = coverageFixture({ applicability: { variants: 'all', modes: 'all', platforms: ['mobile-web'] } });
  const before = JSON.stringify({ manual, observed, compiled, engine });
  const report = buildEditorValidationReport(engine, compiled, manual, observed);
  assert.equal(JSON.stringify({ manual, observed, compiled, engine }), before);
  assert.equal(report.contractReadiness.status, 'draft');
  assert.equal(report.contractReadiness.unimplementedRules, 1);
  assert.equal(report.scenarioCoverage.complete, true);
  assert.equal(report.scenarioCoverage.notExecuted, 0);
  assert.equal(report.scenarioCoverage.excludedRules, 1);
  assert.equal(report.scenarioCoverage.engineEvaluations, engine.evaluations.length);
  assert.deepEqual(report.editorCoverage, report.scenarioCoverage);
  const detail = buildEvaluationDetails(report, compiled.contract, []).find(e => e.ruleId === 'pending');
  assert.equal(detail.classification, 'not-applicable');
  assert.match(detail.reasonLabel, /платформа/);
  assert.equal(detail.actual, 'desktop');
  assert.deepEqual(detail.expected, ['mobile-web']);
});

test('partial dependencies list known facts separately and never auto-enable context-only execution', () => {
  const { manual, observed, compiled, engine } = coverageFixture();
  const report = buildEditorValidationReport(engine, compiled, manual, observed);
  const entry = report.evaluations.find(e => e.ruleId === 'pending');
  assert.equal(entry.classification, 'not-executed');
  assert.match(entry.trace.reason, /Недостаточно runtime-данных: nested.size\./);
  assert.match(entry.trace.reason, /Уже доступны: appearance.opacity\./);
  assert.doesNotMatch(entry.trace.reason, /Недостаточно runtime-данных: appearance.opacity/);
  assert.equal(entry.factAvailability.find(f => f.path === 'appearance.opacity').state, 'available');
  observed.nodes[1].nested = { size: 24 };
  const completeFacts = buildEditorValidationReport(engine, compiled, manual, observed).evaluations.find(e => e.ruleId === 'pending');
  assert.equal(completeFacts.classification, 'not-executed');
  assert.match(completeFacts.trace.reason, /Все заявленные факты доступны/);
  assert.doesNotMatch(completeFacts.trace.reason, /Недостаточно runtime-данных/);
});

test('false, zero, empty collections and null are present evidence; unknown flags take precedence', () => {
  const { manual, observed } = coverageFixture();
  const rule = manual.rules[1];
  rule.execution.missingFacts = ['sample.flag', 'sample.zero', 'sample.empty', 'sample.null'];
  observed.nodes[1].sample = { flag: false, zero: 0, empty: [], null: null };
  assert.ok(inspectRuleFacts(manual, rule, observed).every(f => f.state === 'available'));
  observed.nodes[1].unknownFacts.push('sample');
  assert.ok(inspectRuleFacts(manual, rule, observed).every(f => f.state === 'unknown'));
});

test('component semantic facts are inspected at the root, not falsely missing on a nested target', () => {
  const { manual, observed } = coverageFixture();
  manual.rules[1].execution.missingFacts = ['semanticApi.size', 'nested.size'];
  observed.nodes[0].semanticApi = { size: 56 };
  const facts = inspectRuleFacts(manual, manual.rules[1], observed);
  assert.equal(facts[0].state, 'available');
  assert.deepEqual(facts[0].subjects, [{ nodeId: 'preview:0', state: 'known' }]);
  assert.equal(facts[1].state, 'unavailable');
});

test('unknown product cannot exclude a rule; a known platform mismatch dominates unknown product', () => {
  const { manual, observed, compiled, engine } = coverageFixture({ applicability: { variants: 'all', modes: 'all', platforms: ['desktop'], products: ['ao'] } });
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[1], observed).status, 'not-applicable');
  delete observed.context.product;
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[1], observed).status, 'unknown');
  const report = buildEditorValidationReport(engine, compiled, manual, observed);
  assert.equal(report.scenarioCoverage.complete, false);
  assert.equal(report.scenarioCoverage.unknownApplicabilityRules, 1);
  observed.context.platform = 'mobile-web';
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[1], observed).status, 'not-applicable');
});

test('legacy Product IDs remain unmapped rather than being silently treated as another product', () => {
  const { manual, observed } = coverageFixture({ applicability: { variants: 'all', modes: 'all', platforms: ['desktop'], products: ['alfa-business'], scopeStatus: 'needs-confirmation' } });
  const evidence = diagnoseRuleApplicability(manual, manual.rules[1], observed);
  assert.equal(evidence.status, 'unknown');
  assert.ok(evidence.unsupportedConditions.includes('products:unmapped:alfa-business'));
  observed.context.platform = 'mobile-web';
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[1], observed).status, 'not-applicable');
});

test('variant, collection mode and declared semantic conditions use canonical three-valued evaluation', () => {
  const { manual, observed } = semanticFixture();
  manual.rules[0].execution = { route: 'context-only', missingFacts: ['nested.size'] };
  let prepared = prepareValidationSnapshot(observed, compileManualSource(manual).contract);
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[0], prepared).status, 'applicable');
  prepared.nodes[0].semanticApi.hintVisible = false;
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[0], prepared).status, 'not-applicable');
  manual.rules[0].applicability.context = {};
  manual.rules[0].applicability.variants = { Size: ['56'] };
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[0], prepared).status, 'not-applicable');
  delete prepared.nodes[0].component.properties.Size;
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[0], prepared).status, 'unknown');
  manual.rules[0].applicability.modes = { theme: ['dark'] };
  prepared.context.modes = { theme: 'light' };
  assert.equal(diagnoseRuleApplicability(manual, manual.rules[0], prepared).status, 'not-applicable');
});

test('unmapped conditions and malformed domains do not accidentally exclude rules', () => {
  const { manual, observed } = coverageFixture();
  const rule = manual.rules[1];
  rule.applicability.context = { loading: true };
  observed.nodes[1].loading = false;
  assert.equal(diagnoseRuleApplicability(manual, rule, observed).status, 'unknown');
  rule.applicability.variants = { Size: [] };
  assert.equal(diagnoseRuleApplicability(manual, rule, observed).status, 'unknown');
  rule.applicability.platforms = ['mobile-web'];
  assert.equal(diagnoseRuleApplicability(manual, rule, observed).status, 'not-applicable');
});

test('missing or ambiguous targets and partially unknown selections are not evidence of non-applicability', () => {
  const { manual, observed } = coverageFixture();
  const rule = manual.rules[1];
  observed.nodes[1].semantic.role = 'other';
  assert.equal(diagnoseRuleApplicability(manual, rule, observed).status, 'unknown');
  observed.nodes[1].semantic.role = 'surface';
  manual.targets[0].resolution = 'ambiguous';
  rule.applicability.variants = { Size: ['56'] };
  observed.nodes[1].component.properties = { Size: '48' };
  assert.equal(diagnoseRuleApplicability(manual, rule, observed).status, 'unknown');
  manual.targets[0].resolution = 'unknown';
  assert.equal(diagnoseRuleApplicability(manual, rule, observed).status, 'unknown');
  manual.targets[0].resolution = 'resolved';
  observed.nodes.push({ ...structuredClone(observed.nodes[1]), id: 'preview:2', component: {}, order: 2 });
  observed.nodes[0].childIds.push('preview:2');
  assert.equal(diagnoseRuleApplicability(manual, rule, observed).status, 'unknown');
});

test('compiler exclusions and delegations may be out of scope without making the package ready', () => {
  const { manual, observed } = coverageFixture({ applicability: { variants: 'all', modes: 'all', platforms: ['mobile-web'] } });
  manual.rules[1].execution = { route: 'predicate' };
  manual.rules[1].rationale = '';
  manual.rules.push({ ...manual.rules[0], id: 'delegated', execution: { route: 'delegated', externalRuleIds: ['external.rule'] }, applicability: manual.rules[1].applicability });
  const compiled = compileManualSource(manual);
  const engine = evaluateCompiledContract(observed, compiled.contract);
  const report = buildEditorValidationReport(engine, compiled, manual, observed);
  assert.equal(report.scenarioCoverage.complete, true);
  assert.equal(report.scenarioCoverage.excludedRules, 2);
  assert.equal(report.contractReadiness.status, 'draft');
  assert.equal(report.contractReadiness.unimplementedRules, 2);
  assert.equal(report.contractReadiness.validationErrors, 1);
  assert.equal(buildEditorValidationReport(engine, compiled, manual).scenarioCoverage.complete, false);
});

test('export carries independent package/scenario coverage and replays both deterministically', () => {
  const input = reportFixture();
  input.manual.rules.push({ ...input.manual.rules[0], id: 'mobile', applicability: { variants: 'all', modes: 'all', platforms: ['mobile-web'] }, execution: { route: 'context-only', missingFacts: ['nested.size'] } });
  input.compiled = compileManualSource(input.manual);
  input.evaluatedContract = prepareAuthoringPreviewContract(input.compiled.contract);
  input.engineResult = evaluateCompiledContract(input.snapshot, input.evaluatedContract);
  input.result = buildEditorValidationReport(input.engineResult, input.compiled, input.manual, input.snapshot);
  const report = JSON.parse(buildValidationReportDownload(input).json);
  assert.equal(report.summary.coverageModel, 'contract-and-scenario-v1');
  assert.equal(report.summary.complete, true);
  assert.equal(report.summary.contractReadiness.status, 'draft');
  assert.equal(report.summary.scenarioCoverage.excludedRules, 1);
  const replay = buildEditorValidationReport(report.results.engine, compileManualSource(report.sources.manual), report.sources.manual, report.snapshot);
  assert.deepEqual(JSON.parse(JSON.stringify(replay)), report.results.editor);
});

function manualSource(overrides = {}) {
  return {
    schemaVersion: MANUAL_SCHEMA_VERSION,
    documentType: 'component-contract-manual',
    component: {
      componentId: 'core.web.background-plate',
      familyId: 'core.web.background-plate',
      contractId: 'web-core.background-plate',
      family: 'BackgroundPlate',
      layer: 'core',
      library: 'Web Core',
      platform: 'desktop',
      platforms: ['desktop'],
      lifecycle: 'active',
      componentKey: '01234567890123456789012345678901',
    },
    semantics: {
      purpose: 'Container surface for page content.',
      useWhen: [],
      doNotUseWhen: [],
      relatedComponentIds: [],
      keywords: [],
    },
    representations: [{
      id: 'core.web.background-plate.figma.desktop',
      kind: 'figma',
      platform: 'desktop',
      status: 'verified',
      locator: { componentKey: '01234567890123456789012345678901' },
    }],
    semanticApi: [],
    documentation: [],
    examples: [],
    decisions: [],
    generation: { profiles: [], instructions: [] },
    source: {
      kind: 'athena-package',
      importedFiles: ['BackgroundPlate/source/contract.generated.json'],
      sourceHash: 'source-checksum',
      importedAt: '2026-09-04T00:00:00.000Z',
    },
    targets: [{
      id: 'target.surface',
      semanticRole: 'surface',
      label: 'Surface',
      componentFamily: 'BackgroundPlate',
      lineage: ['background-plate'],
      nameHint: 'Surface',
      pathHint: 'BackgroundPlate / Surface',
      nodeIdHint: 'preview:1',
      resolution: 'resolved',
    }],
    controlPorts: [],
    rules: [{
      id: 'rule.surface.opacity',
      targetId: 'target.surface',
      capability: 'appearance.opacity',
      permission: 'constrained',
      controlPaths: [{ kind: 'direct', exclusive: true }],
      constraints: [{ type: 'propertyDomain', values: [1, 0.64] }],
      applicability: { variants: 'all', modes: 'all', platforms: ['desktop'] },
      severity: 'error',
      rationale: 'Surface opacity follows the supported design states.',
      remediationIntent: 'restore-supported-opacity',
      status: 'reviewed',
      owner: 'design-system-authors',
    }],
    metadata: {
      owners: {
        generated: 'athena-cli',
        manual: 'design-system-authors',
        runtime: 'apollo-runtime',
      },
      revision: 1,
    },
    ...overrides,
  };
}

function snapshot(opacity, unknownFacts = []) {
  return {
    schemaVersion: 'apollo.predicate-snapshot.v2',
    generatedAt: '2026-09-04T00:00:00.000Z',
    selection: ['preview:0'],
    context: { platform: 'desktop', modes: {}, unknownFacts: [] },
    nodes: [
      {
        id: 'preview:0',
        parentId: null,
        childIds: ['preview:1'],
        order: 0,
        name: 'BackgroundPlate',
        type: 'INSTANCE',
        visible: true,
        semantic: { role: 'background-plate' },
        component: { properties: {} },
        appearance: {},
        layout: {},
        variable: {},
        baseline: { effective: {} },
        relations: { surface: 'preview:1' },
        unknownFacts: [],
      },
      {
        id: 'preview:1',
        parentId: 'preview:0',
        childIds: [],
        order: 1,
        name: 'Surface',
        type: 'RECTANGLE',
        visible: true,
        semantic: { role: 'surface' },
        component: {},
        appearance: opacity === undefined ? {} : { opacity },
        layout: {},
        variable: {},
        baseline: { effective: { appearance: { opacity: 1 } } },
        relations: { surface: 'preview:1' },
        unknownFacts,
      },
    ],
  };
}

test('manual source compiles deterministically into active RuleIR and coverage', () => {
  const manual = manualSource();
  const first = compileManualSource(manual);
  const second = compileManualSource(manual);

  assert.deepEqual(second, first);
  assert.equal(first.issues.length, 0);
  assert.equal(first.contract.status, 'ready');
  assert.equal(first.contract.rules.length, 1);
  assert.equal(first.contract.rules[0].authority.status, 'active');
  assert.equal(first.contract.rules[0].select.where[0].predicate, 'equals');
  assert.equal(first.contract.rules[0].assert.predicate, 'one-of');
  assert.equal(first.contract.runtimePolicy.compiledIsSourceOfTruth, false);
  assert.deepEqual(first.contract.coverage, {
    sourceRules: 1,
    policyRules: 1,
    policyOnlyRules: 0,
    compiledRules: 1,
    nonExecutableRules: 0,
    byConstraintType: { propertyDomain: 1 },
    byExecutionRoute: { predicate: 1 },
  });
});

test('variant values and Figma variable modes compile as explicit applicability conditions', () => {
  const manual = manualSource();
  manual.rules[0].applicability = {
    variants: { View: ['Primary', 'Secondary'], Size: ['48', '56'] },
    modes: {
      'VariableCollection:color': ['Mode:light', 'Mode:dark'],
      'VariableCollection:grid': ['Mode:1280'],
    },
    platforms: ['desktop'],
    products: ['alfa-business', 'ao'],
    channels: ['adaptive'],
  };
  const compiled = compileManualSource(manual).contract;
  assert.deepEqual(compiled.rules[0].scope, {
    platform: ['desktop'],
    product: ['alfa-business', 'ao'],
    channel: ['adaptive'],
  });
  assert.deepEqual(compiled.rules[0].when, {
    predicate: 'all',
    args: [
      {
        predicate: 'one-of',
        actual: { fact: 'component.properties.View' },
        expected: { literal: ['Primary', 'Secondary'] },
        missingPolicy: 'unknown',
      },
      {
        predicate: 'one-of',
        actual: { fact: 'component.properties.Size' },
        expected: { literal: ['48', '56'] },
        missingPolicy: 'unknown',
      },
      {
        predicate: 'one-of',
        actual: { fact: 'page.context.modes.VariableCollection:color' },
        expected: { literal: ['Mode:light', 'Mode:dark'] },
        missingPolicy: 'unknown',
      },
      {
        predicate: 'one-of',
        actual: { fact: 'page.context.modes.VariableCollection:grid' },
        expected: { literal: ['Mode:1280'] },
        missingPolicy: 'unknown',
      },
    ],
  });
});

test('legacy unscoped mode lists remain readable but require remapping', () => {
  const manual = manualSource();
  manual.rules[0].applicability.modes = ['dark'];
  const issues = validateManualSource(manual);
  assert.ok(issues.some((issue) => issue.code === 'RULE_MODES_LEGACY' && issue.level === 'warning'));
  assert.deepEqual(compileManualSource(manual).contract.rules[0].when, {
    predicate: 'one-of',
    actual: { fact: 'page.context.modes.active' },
    expected: { literal: ['dark'] },
    missingPolicy: 'unknown',
  });
});

test('Product selected for validation controls product-scoped RuleIR applicability', () => {
  const manual = manualSource();
  manual.rules[0].applicability.products = ['ab'];
  const compiled = compileManualSource(manual).contract;
  const matching = snapshot(1);
  matching.context.product = 'ab';
  const different = structuredClone(matching);
  different.context.product = 'ao';
  const missing = structuredClone(matching);
  delete missing.context.product;

  const differentResult = evaluateCompiledContract(different, compiled);
  const detail = buildEvaluationDetails(differentResult, compiled, [])[0];
  assert.equal(evaluateCompiledContract(matching, compiled).evaluations[0].classification, 'compliant');
  assert.equal(differentResult.evaluations[0].classification, 'not-applicable');
  assert.equal(detail.scopeMismatch, true);
  assert.equal(detail.factPath, 'page.context.product');
  assert.equal(detail.actual, 'ao');
  assert.deepEqual(detail.expected, ['ab']);
  assert.equal(detail.actualLabel, 'Контекст проверки');
  assert.equal(detail.expectedLabel, 'Правило действует для');
  assert.match(detail.reasonLabel, /Product/);
  const missingResult = evaluateCompiledContract(missing, compiled);
  assert.equal(missingResult.evaluations[0].classification, 'human-review');
  assert.equal(missingResult.evaluations[0].applicability, 'unknown');
  assert.match(buildEvaluationDetails(missingResult, compiled, [])[0].reasonLabel, /Product/);
});

test('channel scope is enforced by the bundled engine, including missing evidence', () => {
  const manual = manualSource();
  manual.rules[0].applicability.channels = ['adaptive'];
  const compiled = compileManualSource(manual).contract;
  for (const [channel, classification] of [['adaptive', 'compliant'], ['desktop', 'not-applicable'], [undefined, 'human-review']]) {
    const actual = snapshot(1);
    actual.context.channel = channel;
    assert.equal(evaluateCompiledContract(actual, compiled).evaluations[0].classification, classification);
  }
});

test('unmapped contextual conditions cannot silently become unconditional checks', () => {
  const manual = manualSource();
  manual.rules[0].applicability.context = { loading: true };
  const result = compileManualSource(manual);
  assert.ok(result.issues.some((issue) => issue.code === 'RULE_CONTEXT_UNMAPPED' && issue.level === 'error'));
  assert.equal(result.contract.rules.length, 0);
  assert.equal(result.contract.nonExecutableRules.length, 1);
  assert.equal(result.contract.status, 'draft');
  assert.deepEqual(result.contract.customizationPolicy[0].applicability.context, { loading: true });
});

test('unconfirmed scope and unknown applicability fields cannot activate a predicate', () => {
  for (const applicability of [{scopeStatus: 'needs-confirmation'}, {region: ['ru']}, {variants: {Size: []}}]) {
    const manual = manualSource();
    Object.assign(manual.rules[0].applicability, applicability);
    const result = compileManualSource(manual);
    assert.equal(result.contract.rules.length, 0);
    assert.equal(result.contract.status, 'draft');
    assert.ok(result.issues.some((issue) => issue.level === 'error'));
  }
});

test('variant and mode conditions distinguish missing evidence from known mismatch', () => {
  for (const dimension of ['variant', 'mode']) {
    const manual = manualSource();
    if (dimension === 'variant') manual.rules[0].applicability.variants = {View: ['Primary']};
    else manual.rules[0].applicability.modes = {colors: ['dark']};
    const contract = compileManualSource(manual).contract;
    for (const [value, expected] of [[undefined, 'human-review'], ['other', 'not-applicable'], [dimension === 'variant' ? 'Primary' : 'dark', 'compliant']]) {
      const actual = snapshot(1);
      if (value !== undefined) {
        if (dimension === 'variant') actual.nodes[1].component = {properties: {View: value}};
        else actual.context.modes.colors = value;
      }
      assert.equal(evaluateCompiledContract(actual, contract).evaluations[0].classification, expected, dimension);
    }
  }
});

test('applicability intent survives Editor export/import without promoting unsupported context', () => {
  const manual = manualSource();
  manual.rules[0].applicability.context = {loading: true};
  const before = stableHash(manual);
  const bundle = buildExportBundle(manual);
  const restored = importWorkspace([{name: 'contract.manual.json', text: JSON.stringify(bundle.manual)}]);
  assert.equal(stableHash(manual), before);
  assert.deepEqual(restored.manual.rules[0].applicability, manual.rules[0].applicability);
  assert.equal(compileManualSource(restored.manual).contract.rules.length, 0);
});

test('saving a rule form preserves unedited context and does not bypass compilation gates', () => {
  const manual = manualSource();
  const previous = {...manual.rules[0].applicability, context: {loading: true}, futureDimension: ['retained']};
  const edited = {...manual.rules[0].applicability, products: ['ab']};
  manual.rules[0].applicability = mergeEditedApplicability(previous, edited);
  assert.deepEqual(manual.rules[0].applicability.context, {loading: true});
  assert.deepEqual(manual.rules[0].applicability.futureDimension, ['retained']);
  assert.equal(compileManualSource(manual).contract.rules.length, 0);
  assert.equal(previous.products, undefined);
});

test('Button Hint golden scenarios preserve the distinction between scope and constraint', () => {
  const manual = manualSource();
  manual.component.family = 'Button';
  const rule = manual.rules[0];
  rule.id = 'fixture.button.hint-forbidden-in-ab';
  rule.capability = 'component-property.Hint';
  rule.constraints = [{type: 'propertyDomain', values: [false]}];
  rule.applicability.products = ['ab'];
  const compiled = compileManualSource(manual).contract;
  const cases = [
    {product: 'ab', hint: true, expected: 'violation'},
    {product: 'ab', hint: false, expected: 'compliant'},
    {product: 'ao', hint: true, expected: 'not-applicable'},
    {product: undefined, hint: true, expected: 'human-review'},
  ];
  for (const scenario of cases) {
    const actual = snapshot(1);
    actual.context.product = scenario.product;
    actual.nodes[1].component = {properties: {Hint: scenario.hint}};
    const result = evaluateCompiledContract(actual, compiled);
    assert.equal(result.evaluations[0].classification, scenario.expected, JSON.stringify(scenario));
  }
});

test('allowed permission remains policy-only and does not invent RuleIR', () => {
  const manual = manualSource();
  manual.rules[0].permission = 'allowed';
  manual.rules[0].constraints = [];
  const result = compileManualSource(manual);

  assert.equal(result.contract.customizationPolicy[0].permission, 'allowed');
  assert.equal(result.contract.rules.length, 0);
  assert.equal(result.contract.nonExecutableRules.length, 0);
  assert.equal(result.contract.coverage.policyOnlyRules, 1);
});

test('manual passport fields survive compilation and explicit execution routes stay separate', () => {
  const manual = manualSource();
  manual.examples = [{
    id: 'example.background-plate.default',
    kind: 'generation',
    intent: 'Default plate',
    input: {},
    expected: { opacity: 1 },
    status: 'reviewed',
  }];
  manual.decisions = [{
    id: 'decision.background-plate.opacity',
    status: 'accepted',
    summary: 'Opacity follows the public state.',
    rationale: 'Prevents manual drift.',
    sourceRefs: ['docs.background-plate'],
  }];
  manual.rules.push({
    ...manual.rules[0],
    id: 'rule.background-plate.pattern-port',
    execution: { route: 'delegated', externalRuleIds: ['pattern:surface-usage'] },
  });
  const result = compileManualSource(manual);

  assert.deepEqual(result.contract.facts.examples, manual.examples);
  assert.deepEqual(result.contract.facts.decisions, manual.decisions);
  assert.equal(result.contract.coverage.byExecutionRoute.delegated, 1);
  assert.equal(result.contract.rules.length, 1);
});

test('legacy manual v1 is migrated in memory without becoming compiled truth', () => {
  const legacy = manualSource();
  legacy.schemaVersion = 'apollo.component-contract.manual.v1-experimental';
  delete legacy.component.componentId;
  delete legacy.component.familyId;
  delete legacy.component.layer;
  delete legacy.component.platforms;
  delete legacy.component.lifecycle;
  delete legacy.semantics;
  delete legacy.representations;
  delete legacy.semanticApi;
  delete legacy.documentation;
  delete legacy.examples;
  delete legacy.decisions;
  delete legacy.generation;

  const imported = importWorkspace([{ name: 'contract.manual.json', text: JSON.stringify(legacy) }]);
  assert.equal(imported.manual.schemaVersion, MANUAL_SCHEMA_VERSION);
  assert.equal(imported.manual.component.componentId, legacy.component.contractId);
  assert.deepEqual(imported.manual.examples, []);
  assert.ok(imported.warnings.some((warning) => warning.includes('migrated in memory')));
});

test('the bundled Apollo Predicate Engine reports pass, violation, and unknown', () => {
  const contract = compileManualSource(manualSource()).contract;
  const pass = evaluateCompiledContract(snapshot(1), contract);
  const violation = evaluateCompiledContract(snapshot(0.2), contract);
  const unknown = evaluateCompiledContract(snapshot(undefined, ['appearance.opacity']), contract);

  assert.equal(pass.evaluations[0].classification, 'compliant');
  assert.equal(violation.evaluations[0].classification, 'violation');
  assert.equal(unknown.evaluations[0].classification, 'human-review');
});

test('authoring preview evaluates draft RuleIR without changing exported authority', () => {
  const manual = manualSource();
  manual.rules[0].status = 'draft';
  manual.rules[0].rationale = '';
  const compiled = compileManualSource(manual).contract;
  const runtimeResult = evaluateCompiledContract(snapshot(1), compiled);
  const authoring = prepareAuthoringPreviewContract(compiled);
  const previewResult = evaluateCompiledContract(snapshot(1), authoring);

  assert.equal(runtimeResult.evaluations[0].classification, 'not-evaluable');
  assert.equal(previewResult.evaluations[0].classification, 'compliant');
  assert.equal(compiled.rules[0].authority.status, 'draft');
  assert.equal(authoring.rules[0].authority.status, 'active');
});

test('forbidden capability compiles to effective-baseline comparison', () => {
  const manual = manualSource();
  manual.rules[0].permission = 'forbidden';
  manual.rules[0].constraints = [];
  const result = compileManualSource(manual);

  assert.equal(result.contract.rules[0].assert.predicate, 'matches-effective-baseline');
  assert.deepEqual(result.contract.rules[0].select.where[1], {
    predicate: 'fact-present',
    actual: { fact: 'baseline.effective.appearance.opacity' },
  });
  assert.equal(result.contract.rules[0].manual.permission, 'forbidden');
});

test('forbidden boolean component property can require the property to stay off', () => {
  const manual = manualSource();
  manual.targets[0].semanticRole = 'button';
  manual.rules[0].permission = 'forbidden';
  manual.rules[0].capability = 'component.properties.Hint#4:8';
  manual.rules[0].constraints = [{ type: 'propertyDomain', values: [false] }];
  const compiled = compileManualSource(manual).contract;

  assert.equal(compiled.rules[0].assert.predicate, 'one-of');
  assert.equal(compiled.rules[0].assert.actual.fact, 'component.properties.Hint#4:8');
  assert.deepEqual(compiled.rules[0].assert.expected.literal, [false]);
  assert.equal(compiled.rules[0].select.where.length, 1);

  const enabled = snapshot(1);
  enabled.nodes[1].semantic.role = 'button';
  enabled.nodes[1].component = { properties: { 'Hint#4:8': true } };
  const disabled = structuredClone(enabled);
  disabled.nodes[1].component.properties['Hint#4:8'] = false;
  assert.equal(evaluateCompiledContract(enabled, compiled).evaluations[0].classification, 'violation');
  assert.equal(evaluateCompiledContract(disabled, compiled).evaluations[0].classification, 'compliant');
});

test('forbidden paint groups preserve an empty array as baseline; missing paint is unknown', () => {
  const manual = manualSource();
  manual.rules[0].targetScope = 'self-and-descendants';
  manual.rules[0].capability = '';
  manual.rules[0].capabilitySet = 'visual-style@1';
  manual.rules[0].permission = 'forbidden';
  manual.rules[0].constraints = [];
  const compiled = compileManualSource(manual).contract;

  const current = snapshot(1);
  current.nodes[1].childIds = ['preview:2'];
  current.nodes.push({
    id: 'preview:2',
    parentId: 'preview:1',
    childIds: [],
    order: 2,
    name: 'Borderless detail',
    type: 'RECTANGLE',
    visible: true,
    semantic: { role: 'borderless-detail' },
    component: {},
    appearance: { stroke: [] },
    layout: {},
    variable: {},
    baseline: { effective: { appearance: { stroke: [] } } },
    relations: { surface: 'preview:1', 'borderless-detail': 'preview:2' },
    unknownFacts: [],
  });

  const unchanged = evaluateCompiledContract(current, compiled);
  assert.equal(unchanged.coverage.byClassification.compliant, 2);
  assert.equal(unchanged.coverage.byClassification['not-applicable'], 3);
  assert.equal(unchanged.coverage.byClassification.violation, undefined);

  current.nodes[2].appearance = { stroke: [{ type: 'SOLID' }] };
  const addedStroke = evaluateCompiledContract(current, compiled);
  const changedStrokeEvaluation = addedStroke.evaluations.find((entry) => entry.subjectNodeId === 'preview:2');
  assert.equal(changedStrokeEvaluation.classification, 'violation');
  assert.equal(changedStrokeEvaluation.trace.reason, 'actual value differs from effective baseline');

  current.nodes[2].appearance = {};
  const missingPaint = evaluateCompiledContract(current, compiled);
  const strokeEvaluation = missingPaint.evaluations.find((entry) => entry.subjectNodeId === 'preview:2');
  assert.equal(strokeEvaluation.classification, 'human-review');
  assert.equal(strokeEvaluation.trace.reason, 'comparison value is absent');
});

test('legacy baseline adapter materializes an independent reference snapshot', () => {
  const actual = snapshot(0.2);
  const reference = snapshot(1);
  actual.nodes[1].baseline.effective.appearance.opacity = 0.2;

  const materialized = materializeEffectiveBaseline(actual, reference, false);
  const compiled = compileManualSource(manualSource()).contract;
  const result = evaluateCompiledContract(materialized.snapshot, compiled);

  assert.equal(materialized.matchedNodes, 2);
  assert.deepEqual(materialized.unmatchedNodeIds, []);
  assert.equal(materialized.snapshot.nodes[1].appearance.opacity, 0.2);
  assert.equal(materialized.snapshot.nodes[1].baseline.effective.appearance.opacity, 1);
  assert.equal(result.evaluations[0].classification, 'violation');
});

test('legacy baseline adapter preserves normative null and marks unmatched nodes inapplicable', () => {
  const actual = snapshot(1);
  const reference = snapshot(1);
  reference.nodes[1].appearance.stroke = null;
  actual.nodes[1].appearance.stroke = [{ type: 'SOLID' }];
  actual.nodes.push({
    id: 'preview:2',
    parentId: 'preview:1',
    childIds: [],
    order: 2,
    name: 'Unexpected',
    type: 'RECTANGLE',
    visible: true,
    semantic: { role: 'unexpected' },
    appearance: { stroke: [{ type: 'SOLID' }] },
  });

  const materialized = materializeEffectiveBaseline(actual, reference, false);
  assert.equal(materialized.snapshot.nodes[1].baseline.effective.appearance.stroke, null);
  assert.deepEqual(materialized.snapshot.nodes[2].baseline, { effective: {} });
  assert.deepEqual(materialized.unmatchedNodeIds, ['preview:2']);
});

test('allowed public component properties are forwarded to reference materialization', () => {
  const manual = manualSource();
  manual.rules = [
    {
      ...manual.rules[0],
      id: 'rule.label',
      capability: 'component.properties.✎ Label#16:294',
      permission: 'allowed',
      constraints: [],
      controlPaths: [{ kind: 'host-property', property: '✎ Label#16:294', exclusive: true }],
    },
    {
      ...manual.rules[0],
      id: 'rule.addon',
      capability: 'component-property.LeftAddon#4:10',
      permission: 'constrained',
      controlPaths: [{ kind: 'nested-property', property: 'LeftAddon#4:10', exclusive: true }],
    },
    {
      ...manual.rules[0],
      id: 'rule.padding',
      capability: 'layout.padding.top',
      permission: 'forbidden',
      constraints: [],
      controlPaths: [],
    },
  ];

  assert.deepEqual(allowedComponentPropertyNames(compileManualSource(manual).contract), [
    '✎ Label#16:294',
    'LeftAddon#4:10',
  ]);
});

test('component identity accepts a concrete variant key or its parent Component Set key', () => {
  const setKey = 'f9979d6cc8598aec25f721e0a45b7eef2eeb0088';
  const variantKey = '51cf83fa531b6675f8692f0f7b873371c57760bb';

  assert.equal(matchesComponentIdentity(variantKey, setKey, [setKey]), true);
  assert.equal(matchesComponentIdentity(variantKey, setKey, [variantKey]), true);
  assert.equal(matchesComponentIdentity(variantKey, setKey, ['another-component']), false);
});

test('predicate evaluations become human-readable diagnostic details without losing trace data', () => {
  const manual = manualSource();
  manual.rules[0].permission = 'forbidden';
  manual.rules[0].constraints = [];
  manual.rules[0].rationale = 'Не менять прозрачность Surface';
  const compiled = compileManualSource(manual).contract;
  const result = evaluateCompiledContract(snapshot(0.2), compiled);
  const anatomy = [{
    id: 'preview:1',
    parentId: 'preview:0',
    childIds: [],
    name: 'Surface',
    type: 'RECTANGLE',
    path: 'BackgroundPlate / Surface',
    semanticRole: 'surface',
    visible: true,
    order: 1,
    depth: 1,
    properties: {},
    unknownFacts: [],
  }];

  const details = buildEvaluationDetails(result, compiled, anatomy);
  assert.equal(details[0].classificationLabel, 'Нарушение');
  assert.equal(details[0].ruleTitle, 'Не менять прозрачность Surface');
  assert.equal(details[0].capability, 'appearance.opacity');
  assert.equal(details[0].nodePath, 'BackgroundPlate / Surface');
  assert.equal(details[0].factPath, 'appearance.opacity');
  assert.equal(details[0].actual, 0.2);
  assert.equal(details[0].expected, 1);
  assert.equal(details[0].reasonLabel, 'Значение отличается от эталона компонента');
});

test('versioned capability groups expand from one shared registry', () => {
  assert.deepEqual(capabilitiesForSet('fill@1'), [
    'appearance.fill',
    'appearance.fillStyleId',
  ]);
  assert.deepEqual(capabilitiesForSet('stroke@1'), [
    'appearance.stroke',
    'appearance.strokeStyleId',
    'appearance.strokeWeight',
    'appearance.strokeAlign',
    'appearance.dashPattern',
  ]);
  assert.deepEqual(capabilitiesForSet('visual-style@1'), [
    'appearance.fill',
    'appearance.stroke',
    'appearance.opacity',
    'appearance.radius',
    'appearance.effects',
  ]);
  assert.equal(require('../dist/core.cjs').capabilitySetLabel('visual-style@1'), 'Внешний вид');
  assert.equal(capabilitiesForSet('auto-layout@1').length, 10);
  assert.deepEqual(capabilitiesForSet('missing@1'), []);

  const manual = manualSource();
  manual.rules[0].capability = '';
  manual.rules[0].capabilitySet = 'visual-style@1';
  manual.rules[0].permission = 'forbidden';
  manual.rules[0].constraints = [];
  const compiled = compileManualSource(manual).contract;
  assert.equal(compiled.rules.length, 5);
  assert.deepEqual(compiled.rules.map((rule) => rule.presentation.group), capabilitiesForSet('visual-style@1'));
});

test('semantic capability sets compile only their explicitly selected properties', () => {
  const manual = manualSource();
  manual.rules[0].capability = '';
  manual.rules[0].capabilitySet = 'stroke@1';
  manual.rules[0].capabilitySelection = [
    'appearance.stroke',
    'appearance.strokeWeight',
  ];
  manual.rules[0].permission = 'forbidden';
  manual.rules[0].constraints = [];

  const result = compileManualSource(manual);
  assert.equal(result.issues.length, 0);
  assert.equal(result.contract.rules.length, 2);
  assert.deepEqual(result.contract.rules.map((rule) => rule.presentation.group), [
    'appearance.stroke',
    'appearance.strokeWeight',
  ]);
  assert.deepEqual(result.contract.customizationPolicy[0].capabilitySelection, manual.rules[0].capabilitySelection);

  const imported = importWorkspace([{ name: 'contract.manual.json', text: JSON.stringify(manual) }]);
  assert.deepEqual(imported.manual.rules[0].capabilitySelection, manual.rules[0].capabilitySelection);
});

test('capability selections must be non-empty, unique, and belong to their set', () => {
  const manual = manualSource();
  manual.rules[0].capability = '';
  manual.rules[0].capabilitySet = 'fill@1';
  manual.rules[0].capabilitySelection = [];
  assert.ok(validateManualSource(manual).some((issue) => issue.code === 'RULE_CAPABILITY_SELECTION_EMPTY'));

  manual.rules[0].capabilitySelection = ['appearance.fill', 'appearance.fill', 'appearance.stroke'];
  const issues = validateManualSource(manual);
  assert.ok(issues.some((issue) => issue.code === 'RULE_CAPABILITY_SELECTION_DUPLICATE'));
  assert.ok(issues.some((issue) => issue.code === 'RULE_CAPABILITY_SELECTION_UNKNOWN'));
});

test('quick internal protection creates deterministic manual rules and is idempotent', () => {
  const manual = manualSource();
  const target = manual.targets[0];
  const first = applyProtectInternalsPolicy(manual, target);

  assert.equal(first.changed, true);
  assert.equal(first.createdRuleIds.length, 2);
  assert.equal(first.manual.metadata.revision, 2);
  assert.deepEqual(first.manual.rules.filter((rule) => rule.capabilitySet).map((rule) => rule.capabilitySet), [
    'auto-layout@1',
    'visual-style@1',
  ]);
  assert.ok(first.manual.rules.filter((rule) => rule.capabilitySet).every((rule) => (
    rule.permission === 'forbidden'
    && rule.targetScope === 'self-and-descendants'
    && rule.status === 'draft'
  )));

  const second = applyProtectInternalsPolicy(first.manual, target);
  assert.equal(second.changed, false);
  assert.equal(second.manual.metadata.revision, 2);
  assert.deepEqual(second.manual, first.manual);
});

test('quick public-property policy only adds unset properties and reports conflicts', () => {
  const manual = manualSource({ rules: [] });
  const target = manual.targets[0];
  const first = allowPublicComponentProperties(manual, target, ['Label#1:2', 'LeftAddon#3:4', 'Label#1:2']);

  assert.equal(first.changed, true);
  assert.equal(first.createdRuleIds.length, 2);
  assert.deepEqual(first.manual.rules.map((rule) => rule.capability), [
    'component.properties.Label#1:2',
    'component.properties.LeftAddon#3:4',
  ]);
  assert.ok(first.manual.rules.every((rule) => (
    rule.permission === 'allowed'
    && rule.controlPaths[0].kind === 'host-property'
    && rule.severity === 'info'
  )));
  assert.equal(compileManualSource(first.manual).contract.coverage.policyOnlyRules, 2);

  first.manual.rules[0].permission = 'forbidden';
  first.manual.rules[0].controlPaths = [];
  const second = allowPublicComponentProperties(first.manual, target, ['Label#1:2', 'Hint#5:6']);
  assert.equal(second.createdRuleIds.length, 1);
  assert.deepEqual(second.conflictingRuleIds, [first.manual.rules[0].id]);
  assert.equal(second.manual.rules.find((rule) => rule.id === first.manual.rules[0].id).permission, 'forbidden');
});

test('manual rules may reuse a preview only for the same component identity', () => {
  const current = manualSource();
  const same = manualSource({
    component: { ...current.component, contractId: 'another-stable-id' },
  });
  const other = manualSource({
    component: { ...current.component, family: 'CorporateContent' },
  });

  assert.equal(samePreviewComponent(current, same), true);
  assert.equal(samePreviewComponent(current, other), false);
});

test('manual state is reused only within one logical component family', () => {
  const current = manualSource();
  const mobile = manualSource({
    component: { ...current.component, platform: 'mobile-web' },
  });
  const inverted = manualSource({
    component: { ...current.component, family: 'BackgroundPlate_Inverted' },
  });
  const section = manualSource({
    component: { ...current.component, family: 'Section' },
  });
  const otherComponent = manualSource({
    component: { ...current.component, componentId: 'core.web.other' },
  });

  assert.equal(sameManualComponentFamily(current, mobile), true);
  assert.equal(sameManualComponentFamily(current, inverted), true);
  assert.equal(sameManualComponentFamily(current, section), false);
  assert.equal(sameManualComponentFamily(current, otherComponent), false);
});

test('self-and-descendants scope selects the semantic target and its descendants', () => {
  const manual = manualSource();
  manual.rules[0].targetScope = 'self-and-descendants';
  const compiled = compileManualSource(manual).contract;
  const rule = compiled.rules[0];

  assert.equal(rule.select.traverse, 'self-and-descendants');
  assert.equal(rule.select.where[0].predicate, 'any');
  assert.equal(rule.manual.targetScope, 'self-and-descendants');

  const descendantSnapshot = snapshot(1);
  descendantSnapshot.nodes[1].childIds = ['preview:2'];
  descendantSnapshot.nodes.push({
    id: 'preview:2',
    parentId: 'preview:1',
    childIds: [],
    order: 2,
    name: 'Surface detail',
    type: 'RECTANGLE',
    visible: true,
    semantic: { role: 'surface-detail' },
    component: {},
    appearance: { opacity: 0.64 },
    layout: {},
    variable: {},
    baseline: { effective: { appearance: { opacity: 0.64 } } },
    relations: { surface: 'preview:1', 'surface-detail': 'preview:2' },
    unknownFacts: [],
  });
  const result = evaluateCompiledContract(descendantSnapshot, compiled);
  assert.equal(result.evaluations.length, 2);
  assert.deepEqual(result.evaluations.map((entry) => entry.subjectNodeId), ['preview:1', 'preview:2']);
  assert.ok(result.evaluations.every((entry) => entry.classification === 'compliant'));
});

test('unknown target scope fails manual validation', () => {
  const manual = manualSource();
  manual.rules[0].targetScope = 'page';
  assert.ok(validateManualSource(manual).some((issue) => issue.code === 'RULE_TARGET_SCOPE'));
});

test('descendants-only scope excludes its anchor and unrelated nodes without a new runtime predicate', () => {
  const manual = manualSource();
  manual.rules[0].targetScope = 'descendants';
  const compiled = compileManualSource(manual);
  assert.deepEqual(compiled.issues.filter(i => i.level === 'error'), []);
  const s = snapshot(1);
  s.nodes[1].childIds = ['preview:2'];
  s.nodes.push({
    ...JSON.parse(JSON.stringify(s.nodes[1])), id: 'preview:2', parentId: 'preview:1', childIds: [],
    semantic: { role: 'detail' }, relations: { surface: 'preview:1' },
    appearance: { opacity: .5 }, baseline: { effective: { appearance: { opacity: 1 } } },
  });
  const r = evaluateCompiledContract(s, compiled.contract);
  assert.deepEqual(r.evaluations.map(e => [e.subjectNodeId,e.classification]), [['preview:2','violation']]);
  const imported = importWorkspace([{name:'contract.manual.json',text:JSON.stringify(manual)}]);
  assert.equal(imported.manual.rules[0].targetScope, 'descendants');
  assert.equal(compiled.contract.customizationPolicy[0].targetScope, 'descendants');
  manual.rules[0].constraints = [{type:'presence'}];
  assert.ok(validateManualSource(manual).some(i => i.code === 'RULE_DESCENDANT_CONSTRAINT'));
});

test('inherited control path must reference a component-local port', () => {
  const manual = manualSource();
  manual.rules[0].controlPaths = [{ kind: 'inherited-port', port: 'port.surface-style' }];
  const missing = validateManualSource(manual);
  assert.ok(missing.some((issue) => issue.code === 'CONTROL_PORT' && issue.level === 'error'));

  manual.controlPorts.push({
    id: 'port.surface-style',
    label: 'Surface style owner',
    targetId: 'target.surface',
    capability: 'appearance.opacity',
    required: true,
  });
  assert.ok(!validateManualSource(manual).some((issue) => issue.code === 'CONTROL_PORT'));
});

test('canonical manual JSON round-trips without losing authored data', () => {
  const manual = manualSource();
  const imported = importWorkspace([{ name: 'contract.manual.json', text: JSON.stringify(manual) }]);
  assert.deepEqual(imported.manual, manual);
  assert.equal(imported.hasVariantEvidence, false);

  const bundle = buildExportBundle(imported.manual);
  assert.deepEqual(bundle.manual, manual);
  assert.equal(bundle.validation.valid, true);
});

test('manual source hash is stable across JSON serialization of optional fields', () => {
  const manual = manualSource();
  manual.rules[0].remediationIntent = undefined;
  manual.rules[0].capabilitySet = undefined;
  const serialized = JSON.parse(JSON.stringify(manual));

  assert.equal(stableHash(manual), stableHash(serialized));
  assert.equal(
    compileManualSource(manual).contract.package.manualSourceHash,
    compileManualSource(serialized).contract.package.manualSourceHash,
  );
});

test('editor session preserves current manual revision but excludes compiled evidence', () => {
  const imported = importWorkspace([{ name: 'contract.manual.json', text: JSON.stringify(manualSource()) }]);
  imported.manual.metadata.revision = 7;
  imported.manual.rules[0].message = 'Session edit';
  imported.compiledInput = { documentType: 'component-contract', oversized: true };
  const session = createEditorSession(imported, {
    workspaceMode: 'validation',
    validationProduct: 'ab',
    scenarioProperties: { Size: 'M' },
    activeModes: { color: 'dark' },
  }, '2026-09-06T00:00:00.000Z');
  const restored = parseEditorSession(JSON.parse(JSON.stringify(session)));

  assert.equal(restored.workspace.manual.metadata.revision, 7);
  assert.equal(restored.workspace.manual.rules[0].message, 'Session edit');
  assert.equal(restored.workspace.compiledInput, undefined);
  assert.equal(restored.ui.validationProduct, 'ab');
  assert.equal(restored.ui.workspaceMode, 'validation');
  assert.equal(
    compileManualSource(restored.workspace.manual).contract.package.manualSourceHash,
    compileManualSource(imported.manual).contract.package.manualSourceHash,
  );
});

test('editor ignores incompatible or malformed persisted sessions', () => {
  assert.equal(parseEditorSession(null), null);
  assert.equal(parseEditorSession({ schemaVersion: 'legacy' }), null);
  assert.equal(parseEditorSession({
    schemaVersion: 'apollo.component-contract-editor.session.v1',
    workspace: {},
    ui: { workspaceMode: 'authoring' },
  }), null);
});

test('Athena anatomy stays generated evidence until the author focuses a target', () => {
  const generated = {
    contracts: [{
      id: 'button.desktop',
      name: '[D] Button',
      normalizedName: 'button',
      componentKey: '01234567890123456789012345678901',
      platform: 'desktop',
      role: 'main',
      figma: {
        variants: { variantKeys: [] },
        structureSignature: [{ nodeId: 1, parentId: null, type: 'COMPONENT', name: '[D] Button', path: '[D] Button', visible: true }],
        tokens: {},
      },
    }, {
      id: 'button.mobile-web',
      name: '[M] Button',
      normalizedName: 'button',
      componentKey: '11234567890123456789012345678901',
      platform: 'mobile-web',
      role: 'main',
      figma: {
        variants: { variantKeys: [] },
        structureSignature: [{ nodeId: 2, parentId: null, type: 'COMPONENT', name: '[M] Button', path: '[M] Button', visible: true }],
        tokens: {},
      },
    }],
  };
  const imported = importWorkspace([{ name: 'Button/source/contract.generated.json', text: JSON.stringify(generated) }]);
  const mobile = importWorkspace(
    [{ name: 'Button/source/contract.generated.json', text: JSON.stringify(generated) }],
    'button.mobile-web',
  );
  const desktopManual = manualSource();
  desktopManual.component = {
    componentId: 'core.web.button',
    familyId: 'core.web.button',
    contractId: 'button.desktop',
    family: 'Button',
    layer: 'core',
    library: 'Web Core',
    platform: 'desktop',
    platforms: ['desktop'],
    lifecycle: 'active',
    componentKey: '01234567890123456789012345678901',
  };
  desktopManual.representations = [{
    id: 'core.web.button.figma.desktop',
    kind: 'figma',
    platform: 'desktop',
    status: 'verified',
    locator: { componentKey: '01234567890123456789012345678901' },
  }];
  const mobileBesideDesktopManual = importWorkspace([
    { name: 'Button/source/contract.generated.json', text: JSON.stringify(generated) },
    { name: 'Button/contract.manual.json', text: JSON.stringify(desktopManual) },
  ], 'button.mobile-web');

  assert.equal(imported.anatomy.length, 1);
  assert.equal(imported.manual.targets.length, 0);
  assert.deepEqual(imported.componentChoices.map((choice) => choice.contractId), ['button.desktop', 'button.mobile-web']);
  assert.equal(mobile.manual.component.contractId, 'button.mobile-web');
  assert.equal(mobile.manual.component.platform, 'mobile-web');
  assert.equal(mobile.anatomy[0].name, '[M] Button');
  assert.equal(mobileBesideDesktopManual.manual.component.contractId, 'button.mobile-web');
  assert.equal(mobileBesideDesktopManual.manual.rules.length, 0);
  desktopManual.metadata.publicRepresentationBoundaryVersion = 1;
  const explicitFiles = () => [
    { name: 'Button/source/contract.generated.json', text: JSON.stringify(generated) },
    { name: 'Button/contract.manual.json', text: JSON.stringify(desktopManual) },
  ];
  assert.deepEqual(importWorkspace(explicitFiles()).componentChoices.map(c => c.contractId), ['button.desktop']);
  assert.throws(() => importWorkspace(explicitFiles(), 'button.mobile-web'), /internal/);
  desktopManual.representations[0].locator.componentKey = 'foreign';
  assert.throws(() => importWorkspace(explicitFiles()), /No generated component/);
  desktopManual.representations = [];
  assert.throws(() => importWorkspace(explicitFiles()), /boundary is empty/);
  assert.ok(validateManualSource(desktopManual).some(i => i.code === 'PUBLIC_REPRESENTATION_BOUNDARY_EMPTY'));
  desktopManual.metadata.publicRepresentationBoundaryVersion = 2;
  assert.ok(validateManualSource(desktopManual).some(i => i.code === 'PUBLIC_REPRESENTATION_BOUNDARY_VERSION'));
});

test('Button family exposes default and inverted representations for desktop and mobile', () => {
  const main = (id, name, normalizedName, platform, componentKey) => ({
    id,
    name,
    normalizedName,
    platform,
    componentKey,
    role: 'main',
    source: { library: 'Web Core' },
    figma: { variants: { variantKeys: [] }, structureSignature: [], tokens: {} },
  });
  const generated = { contracts: [
    main('button.desktop', '[D] Button', 'button', 'desktop', 'd-default'),
    main('button-inverted.desktop', '[D] Button_Inverted', 'button-inverted', 'desktop', 'd-inverted'),
    main('button.mobile-web', '[M] Button', 'button', 'mobile-web', 'm-default'),
    main('button-inverted.mobile-web', '[M] Button_Inverted', 'button-inverted', 'mobile-web', 'm-inverted'),
    {
      ...main('button-inverted.desktop.corporate', '[D][Corporate] Button_Inverted', 'button-inverted', 'desktop', 'd-corporate'),
    },
  ] };
  const manual = manualSource();
  manual.representations = [
    ['desktop', 'default', 'd-default'],
    ['desktop', 'inverted', 'd-inverted'],
    ['mobile-web', 'default', 'm-default'],
    ['mobile-web', 'inverted', 'm-inverted'],
  ].map(([platform, surface, componentKey]) => ({
    id: `core.web.button.figma.${platform}.${surface}`,
    kind: 'figma',
    platform,
    surface,
    status: 'verified',
    locator: { componentKey },
  }));
  const files = [
    { name: 'Button/evidence/contract.generated.json', text: JSON.stringify(generated) },
    { name: 'Button/contract.manual.json', text: JSON.stringify(manual) },
  ];
  const imported = importWorkspace(files);
  assert.deepEqual(
    imported.componentChoices.map((choice) => choice.contractId),
    ['button.desktop', 'button-inverted.desktop', 'button.mobile-web', 'button-inverted.mobile-web'],
  );
  const inverted = importWorkspace(files, 'button-inverted.mobile-web');
  assert.equal(inverted.activeContractId, 'button-inverted.mobile-web');
  assert.equal(inverted.manual.component.contractId, manual.component.contractId);
});

test('compiled v2 is evidence, never reconstructed as manual truth', () => {
  const compiled = compileManualSource(manualSource()).contract;
  const imported = importWorkspace([{ name: 'contract.compiled.json', text: JSON.stringify(compiled) }]);

  assert.equal(imported.compiledInput.documentType, 'component-contract');
  assert.equal(imported.manual.source.kind, 'component-contract-v2');
  assert.equal(imported.manual.rules.length, 0);
  assert.ok(imported.warnings.some((warning) => warning.includes('cannot be reconstructed losslessly')));
});

test('compiled componentApi selects active package-family representations instead of a supporting component', () => {
  const compiled = {
    documentType: 'component-contract',
    package: { id: 'web-corp.corporate-content', family: 'CorporateContent', library: 'Web Corp' },
    facts: { componentApi: [
      { id: 'section.desktop', name: '[D] Section', platform: 'desktop', status: 'active', componentKey: 'section-key' },
      { id: 'corporate-content.desktop', name: '[D] CorporateContent', platform: 'desktop', status: 'active', componentKey: 'corporate-desktop-key' },
      { id: 'corporate-content.mobile-web', name: '[M] CorporateContent', platform: 'mobile-web', status: 'active', componentKey: 'corporate-mobile-key' },
      { id: 'corporate-content.universal', name: '❌ [T] CorporateContent', platform: 'universal', status: 'deprecated', componentKey: 'corporate-tablet-key' },
    ] },
  };
  const files = [{ name: 'CorporateContent/compiled/component-contract.v2.json', text: JSON.stringify(compiled) }];
  const imported = importWorkspace(files);
  assert.equal(imported.activeContractId, 'corporate-content.desktop');
  assert.deepEqual(
    imported.componentChoices.map((choice) => choice.contractId),
    ['section.desktop', 'corporate-content.desktop', 'corporate-content.mobile-web'],
  );
  assert.equal(imported.manual.source.kind, 'component-contract-v2');
  assert.deepEqual(imported.compiledInput, compiled);
  const mobile = importWorkspace(files, 'corporate-content.mobile-web');
  assert.equal(mobile.activeContractId, 'corporate-content.mobile-web');
  assert.equal(mobile.manual.component.componentKey, 'corporate-mobile-key');
});

test('raw Athena package exposes every active main component and hides deprecated entries', () => {
  const main = (id, name, normalizedName, platform, componentKey, status = 'active') => ({
    id,
    name,
    normalizedName,
    platform,
    componentKey,
    status,
    role: 'main',
    source: { library: 'Web Corp' },
    figma: { variants: { variantKeys: [] }, structureSignature: [], tokens: {} },
  });
  const generated = { contracts: [
    main('section.desktop', '[D] Section', 'section', 'desktop', 'section-key'),
    main('corporate-content.desktop', '[D] CorporateContent', 'corporate-content', 'desktop', 'corporate-desktop-key'),
    main('corporate-content.mobile-web', '[M] CorporateContent', 'corporate-content', 'mobile-web', 'corporate-mobile-key'),
    main('corporate-content.universal', '❌ [T] CorporateContent', 'corporate-content', 'universal', 'corporate-tablet-key', 'deprecated'),
  ] };
  const files = [{ name: 'CorporateContent/source/contract.generated.json', text: JSON.stringify(generated) }];
  const imported = importWorkspace(files);

  assert.equal(imported.activeContractId, 'corporate-content.desktop');
  assert.deepEqual(
    imported.componentChoices.map((choice) => choice.contractId),
    ['section.desktop', 'corporate-content.desktop', 'corporate-content.mobile-web'],
  );
  const section = importWorkspace(files, 'section.desktop');
  assert.equal(section.activeContractId, 'section.desktop');
  assert.equal(section.manual.component.componentKey, 'section-key');
});

test('export ZIP is deterministic and preserves all canonical artifacts', async () => {
  const manual = manualSource();
  const bundle = buildExportBundle(manual);
  const entries = [
    textZipEntry('contract.manual.json', bundle.manual),
    textZipEntry('contract.compiled.json', bundle.compiled),
    textZipEntry('coverage.json', bundle.coverage),
    textZipEntry('validation.json', bundle.validation),
  ];
  const first = createZip(entries);
  const second = createZip(entries.slice().reverse());

  assert.deepEqual(first, second);
  const restored = await readZip(first);
  assert.deepEqual(restored.map((entry) => entry.name), [
    'contract.compiled.json',
    'contract.manual.json',
    'coverage.json',
    'validation.json',
  ]);
  assert.deepEqual(JSON.parse(zipEntryText(restored[1])), manual);
});

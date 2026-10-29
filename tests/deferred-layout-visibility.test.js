const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const fixture = require('./fixtures/button-variants.json');
const clone = x => JSON.parse(JSON.stringify(x));

function scenario() {
  const manual = clone(fixture.manual);
  manual.component.componentKey = 'widget-set';
  manual.generation.profiles = [];
  manual.componentDependencies = [];
  manual.controlPorts = [];
  manual.semanticApi = [];
  manual.representations = [{ id: 'figma:widget', kind: 'figma', platform: 'desktop', status: 'verified', locator: { componentSetKey: 'widget-set' } }];
  manual.targets = [
    { id: 'root', semanticRole: 'root', label: 'Widget', pathHint: 'Widget', lineage: [], resolution: 'resolved' },
    { id: 'body', semanticRole: 'body', label: 'Body', pathHint: 'Widget / Body', lineage: [], resolution: 'resolved' },
  ];
  manual.rules = [{
    ...clone(fixture.manual.rules[0]), id: 'widget-deferred-layout', targetId: 'body', targetScope: 'self',
    targetApplicability: 'visible-target@1', capability: 'layout.wrapping', permission: 'constrained',
    status: 'draft', owner: 'test', rationale: 'Mapping is relevant only when its target is visible.',
    constraints: [{ type: 'layoutConstraint', fact: 'derived.wrapping', operator: 'equals', value: true }],
    applicability: { variants: 'all', modes: 'all', platforms: ['desktop'], validationMode: 'specification' },
    execution: { route: 'context-only', missingFacts: ['derived.wrapping'] },
  }];
  const snapshot = {
    schemaVersion: 'apollo.predicate-snapshot.v2', generatedAt: '2026-09-29T00:00:00Z',
    source: { rootNodeId: 'instance', pageId: 'page', componentKey: 'variant', componentSetKey: 'widget-set', truncated: false },
    selection: ['root'], context: { platform: 'desktop', modes: {}, unknownFacts: [] },
    validationRequest: { version: 1, mode: 'specification' },
    nodes: [
      { id: 'root', parentId: null, childIds: ['body'], order: 0, name: 'Widget', type: 'INSTANCE', visible: true, semantic: { role: 'root', path: 'Widget' }, component: { identity: { componentKey: 'variant', componentSetKey: 'widget-set' } }, unknownFacts: [] },
      { id: 'body', parentId: 'root', childIds: [], order: 1, name: 'Body', type: 'FRAME', visible: false, semantic: { role: 'body', path: 'Widget / Body' }, unknownFacts: [] },
    ],
  };
  for (const n of snapshot.nodes) {
    const target = manual.targets.find(t => t.semanticRole === n.semantic.role);
    target.lineage = n.semantic.path.split('/').slice(0, -1).map(s => core.slug(s.trim()));
    target.structuralFingerprint = core.stableHash({ type: n.type, path: n.semantic.path, order: n.order }).slice(0, 16);
  }
  function run() {
    const compiled = core.compileManualSource(manual);
    assert.deepEqual(compiled.issues.filter(i => i.level === 'error'), []);
    const engine = core.evaluateCompiledContract(snapshot, compiled.contract);
    const report = core.buildEditorValidationReport(engine, compiled, manual, snapshot);
    return { compiled, engine, report, result: report.evaluations.find(e => e.ruleId === 'widget-deferred-layout') };
  }
  return { manual, snapshot, run };
}

test('hidden deferred layout is not applicable, never passed; package remains unimplemented', () => {
  const f = scenario(), before = JSON.stringify(f);
  const { report, result, compiled } = f.run();
  assert.equal(result.classification, 'not-applicable');
  assert.equal(report.scenarioCoverage.notExecuted, 0);
  assert.equal(report.scenarioCoverage.complete, true);
  assert.equal(report.contractReadiness.unimplementedRules, 1);
  assert.equal(report.contractReadiness.status, 'draft');
  assert.equal(compiled.contract.rules.length, 0);
  assert.equal(JSON.stringify(f), before);
});

test('visible deferred layout stays not executed even with all declared facts available', () => {
  const f = scenario(); f.snapshot.nodes[1].visible = true;
  assert.equal(f.run().result.classification, 'not-executed');
  f.snapshot.nodes[1].derived = { wrapping: true };
  assert.equal(f.run().result.classification, 'not-executed');
  assert.equal(f.run().report.scenarioCoverage.complete, false);
});

for (const kind of ['visibility', 'target', 'ambiguous', 'missing', 'truncated']) {
  test(`deferred layout ${kind} evidence stays unknown, not a hidden-target exemption`, () => {
    const f = scenario();
    if (kind === 'visibility') { delete f.snapshot.nodes[1].visible; f.snapshot.nodes[1].unknownFacts.push('visible'); }
    if (kind === 'target') f.manual.targets[1].resolution = 'unknown';
    if (kind === 'ambiguous') f.manual.targets.push({ ...clone(f.manual.targets[1]), id: 'other-body' });
    if (kind === 'missing') { f.snapshot.nodes.pop(); f.snapshot.nodes[0].childIds = []; }
    if (kind === 'truncated') f.snapshot.source.truncated = true;
    const r = f.run();
    assert.equal(r.result.classification, 'not-executed');
    assert.equal(r.result.applicability, 'unknown');
    assert.equal(r.report.scenarioCoverage.complete, false);
  });
}

test('ordinary audit still excludes specification; missing opt-in cannot invent a visibility exemption', () => {
  const f = scenario(); f.snapshot.validationRequest.mode = 'component-audit';
  assert.equal(f.run().result.classification, 'not-applicable');
  f.snapshot.validationRequest.mode = 'specification';
  delete f.manual.rules[0].targetApplicability;
  assert.equal(f.run().result.classification, 'not-executed');
});

for (const constraint of [
  { type: 'presence', expected: true },
  { type: 'quantity', min: 1 },
  { type: 'layoutConstraint', fact: 'visibility.effective', value: true },
]) test(`visibility exemption cannot hide deferred ${constraint.type}/${constraint.fact || ''}`, () => {
  const f = scenario(); f.manual.rules[0].constraints = [constraint];
  assert.ok(core.validateManualSource(f.manual).some(i => i.code === 'RULE_TARGET_APPLICABILITY'));
  const compiled = core.compileManualSource(f.manual);
  const engine = core.evaluateCompiledContract(f.snapshot, compiled.contract);
  const report = core.buildEditorValidationReport(engine, compiled, f.manual, f.snapshot);
  assert.equal(report.evaluations.find(e => e.ruleId === f.manual.rules[0].id).classification, 'not-executed');
  assert.equal(report.scenarioCoverage.complete, false);
});

test('deferred layout opt-in does not widen executable layout permissions', () => {
  const f = scenario(); f.manual.rules[0].execution = { route: 'predicate' };
  assert.ok(core.validateManualSource(f.manual).some(i => i.code === 'RULE_TARGET_APPLICABILITY'));
});

// Reuse immutable captures; do not rewrite accepted contracts/reports or invent
// a visible/absent target from a layer name. This is compiler QA, not live acceptance.
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const button = path.resolve(__dirname, '../../../shared/design-system_ab/experiments/web-core/core/Button');
const nowrapId = 'component:web-core.button.nowrap-maps-to-figma-layout';
for (const series of ['loading', 'single-icon']) {
  const review = JSON.parse(fs.readFileSync(path.join(button, `qa/${series}-r28-editor-0.2.49-live-review.2026-09-29.json`)));
  for (const item of review.reportResults) test(`${series} ${item.mode}: r28 replays exactly; visibility opt-in changes only deferred nowrap`, () => {
    const report = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(button, item.fixtureFile))));
    const compiledBefore = { contract: report.sources.compiledContract, issues: report.sources.compilerIssues };
    const engineBefore = core.evaluateCompiledContract(report.snapshot, report.runtime.evaluatedContract);
    assert.deepEqual(engineBefore, report.results.engine);
    assert.deepEqual(core.buildEditorValidationReport(engineBefore, compiledBefore, report.sources.manual, report.snapshot), report.results.editor);

    const manual = clone(report.sources.manual), snapshot = clone(report.snapshot);
    manual.rules.find(r => r.id === nowrapId).targetApplicability = 'visible-target@1';
    const compiled = core.compileManualSource(manual, compiledBefore.contract.facts.variantEvidence, compiledBefore.contract.componentDependencies.map(d => d.contract));
    assert.deepEqual(compiled.issues.filter(i => i.level === 'error'), []);
    if (snapshot.validationIntent) snapshot.validationIntent = core.createValidationIntent(snapshot, compiled.contract, snapshot.validationIntent.values);
    const contract = core.prepareAuthoringPreviewContract(compiled.contract);
    const engine = core.evaluateCompiledContract(snapshot, contract);
    const checked = core.buildEditorValidationReport(engine, compiled, manual, snapshot);
    assert.equal(checked.evaluations.find(e => e.ruleId === nowrapId).classification, 'not-applicable');
    // All intrinsic and child Spinner classifications are unchanged.
    const verdicts = r => r.evaluations.map(e => [e.ruleId, e.subjectNodeId, e.classification]);
    assert.deepEqual(verdicts(engine), verdicts(engineBefore));
    assert.equal(checked.scenarioCoverage.notExecuted,
      report.results.editor.scenarioCoverage.notExecuted - (series === 'loading' && item.mode === 'specification' ? 1 : 0));
    assert.equal(checked.contractReadiness.unimplementedRules, report.results.editor.contractReadiness.unimplementedRules);
    assert.equal(checked.contractReadiness.status, 'draft');
  });
}

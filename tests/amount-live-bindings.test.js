const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), crypto = require('node:crypto');
const core = require('../dist/core.cjs');
const root = path.resolve(__dirname, '../../../shared/design-system_ab/experiments/web-core/core/Amount/authoring');
const review = JSON.parse(fs.readFileSync(path.join(root, 'reports/live-review-r2.2026-09-29.json')));
const clone = x => JSON.parse(JSON.stringify(x));
function read(id) {
  const entry = review.reportResults.find(r => r.caseId === id);
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, entry.fixtureFile)));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), entry.sha256);
  const r = JSON.parse(bytes);
  assert.equal(core.stableHash(r.sources.manual), r.run.manualSourceHash);
  assert.equal(core.stableHash(r.snapshot), r.run.snapshotHash);
  return r;
}
function run(r) {
  const engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
  const compiled = { contract: r.sources.compiledContract, issues: r.sources.compilerIssues };
  return { engine, compiled, prepared: core.prepareValidationSnapshot(r.snapshot, r.runtime.evaluatedContract),
    editor: core.buildEditorValidationReport(engine, compiled, r.sources.manual, r.snapshot) };
}
const violations = r => r.engine.evaluations.filter(e => e.classification === 'violation');
for (const entry of review.reportResults) test(`real Amount ${entry.caseId}: fixed-core outcome, preserving raw evidence`, () => {
  const r = read(entry.caseId), before = JSON.stringify(r), result = run(r);
  const swapped = entry.caseId.startsWith('A17');
  assert.equal(result.editor.scenarioCoverage.complete, !swapped);
  assert.equal(result.editor.scenarioCoverage.notExecuted, 0);
  assert.equal(result.editor.scenarioCoverage.inconclusive, swapped ? 28 : 0);
  const expected = entry.caseId === 'A15' ? ['component:web-core.amount.layer-properties-use-effective-baseline.1.6']
    : entry.caseId === 'A16' ? ['component:web-core.amount.fixed-part-order.visibility-011.1.1', 'component:web-core.amount.major-required.1.1'] : [];
  assert.deepEqual(violations(result).map(e => e.ruleId).sort(), expected.sort());
  assert.equal(result.editor.contractReadiness.status, 'draft');
  assert.equal(r.snapshot.source.instanceIdentityVersion, 1);
  for (const [publicName, semantic] of [['Minor', 'minorEnabled'], ['Currency', 'currencyEnabled'], ['Addon', 'addonEnabled']]) {
    const key = Object.keys(r.snapshot.nodes[0].component.properties).find(k => k.startsWith(publicName + '#'));
    assert(key);
    assert.equal(result.prepared.nodes[0].semanticApi[semantic], r.snapshot.nodes[0].component.properties[key]);
    assert.equal(result.prepared.nodes[0].semanticBindingEvidence[semantic].resolvedPath, `component.properties.${key}`);
    assert(!Object.hasOwn(result.prepared.nodes[0].component.properties, publicName));
  }
  assert.deepEqual(core.prepareValidationSnapshot(result.prepared, r.runtime.evaluatedContract), result.prepared);
  assert.deepEqual(core.evaluateCompiledContract(result.prepared, r.runtime.evaluatedContract), result.engine);
  assert.equal(JSON.stringify(r), before);
});
test('missing, ambiguous, incompatible or unknown public bindings do not become false/pass', () => {
  for (const mutate of [
    r => { delete r.snapshot.nodes[0].component.properties['Minor#72085:2']; },
    r => { r.snapshot.nodes[0].component.properties['Minor#other'] = true; r.snapshot.nodes[0].component.propertyTypes['Minor#other'] = 'BOOLEAN'; },
    r => { delete r.snapshot.nodes[0].component.propertyTypes['Minor#72085:2']; },
    r => { r.snapshot.nodes[0].component.propertyTypes['Minor#72085:2'] = 'TEXT'; },
    r => { r.snapshot.nodes[0].component.properties['Minor#72085:2'] = 'true'; },
    r => { r.snapshot.nodes[0].unknownFacts.push('component.properties.Minor#72085:2'); },
    r => { r.snapshot.nodes[0].unknownFacts.push('component.propertyTypes.Minor#72085:2'); },
  ]) {
    const r = read('A05'); mutate(r); const result = run(r);
    assert.equal(result.prepared.nodes[0].semanticApi.minorEnabled, undefined);
    assert.equal(result.editor.scenarioCoverage.complete, false);
    assert(!violations(result).some(e => e.ruleId.includes('minor-visibility')));
  }
});
test('reference alias collisions leave availability unknown, not unsupported', () => {
  const r = read('A05'); r.snapshot.variantReference.definedProperties.push('Minor#other');
  const result = run(r);
  assert.equal(result.prepared.nodes[0].variantAvailability.properties.minorEnabled, undefined);
  assert.equal(result.editor.scenarioCoverage.complete, false);
});
test('resolved boolean is independent of actual visibility: both mismatch directions violate', () => {
  for (const enabled of [true, false]) {
    const r = read('A05'); r.snapshot.nodes[0].component.properties['Minor#72085:2'] = enabled;
    r.snapshot.nodes.find(n => n.semantic.path === 'Amount / Minor').visible = !enabled;
    const result = run(r);
    assert(result.editor.scenarioCoverage.complete);
    assert(violations(result).some(e => e.ruleId.includes(`minor-visibility-${enabled ? 'on' : 'off'}`)));
  }
});
test('same-set target stays unknown without independently revalidated host evidence, even with forged cached results', () => {
  for (const mutate of [
    r => { r.snapshot.instanceContentReferences.attempts = []; },
    r => { delete r.snapshot.instanceContentReferences; },
    r => { r.snapshot.instanceContentReferences.attempts[0].reference.nodes[0].appearance.opacity = 0.25; },
    r => { r.snapshot.instanceContentReferences.attempts.push(clone(r.snapshot.instanceContentReferences.attempts[0])); },
    r => { r.snapshot.instanceContentReferences.attempts[0].failure = 'import-unavailable'; },
    r => { r.snapshot.instanceContentReferences.attempts[0].strategy = undefined; },
    r => { r.snapshot.nodes.find(n => n.semantic.path === 'Amount / Currency').component.identity.componentSetKey = 'foreign-set'; },
  ]) {
    const r = read('A14B'); mutate(r); const result = run(r);
    assert.equal(result.prepared.nodes[0].semanticApi.currencyVisible, undefined);
    assert.equal(result.prepared.nodes[0].variantAvailability.targets.currency, undefined);
    assert.equal(result.editor.scenarioCoverage.complete, false);
  }
});
test('verified nested variant restores only its root, never a name-derived descendant role', () => {
  const r = read('A12');
  const child = r.snapshot.nodes.find(n => n.semantic.path === 'Amount / Currency / Currency');
  child.semantic.role = 'major';
  const p = run(r).prepared;
  assert.equal(p.nodes.find(n => n.id === child.id).semantic.role, undefined);
  assert.equal(p.nodes[0].semanticApi.currencyVisible, true);
  assert.equal(p.nodes[0].semanticApi.minorVisible, true);
  assert.equal(p.nodes[0].variantAvailability.targets.currency.evidence, 'independent-host-variant-root');
});
test('nested variant semantic identity does not permit a manual visual override', () => {
  const r = read('A12'), m = clone(r.sources.manual);
  m.rules.push({ ...clone(m.rules.find(r => r.id.endsWith('layer-properties-use-effective-baseline'))),
    id: 'fixture:nested-opacity', targetId: 'target.minor', capability: 'appearance.opacity',
    constraints: [{ type: 'propertyForbidden', fact: 'appearance.opacity' }], propertyApplicability: {} });
  const compiled = core.compileManualSource(m, r.sources.compiledContract.facts.variantEvidence);
  assert.deepEqual(compiled.issues.filter(i => i.level === 'error'), []);
  const c = core.prepareAuthoringPreviewContract(compiled.contract);
  const minor = r.snapshot.nodes.find(n => n.semantic.path === 'Amount / Minor');
  const baseline = core.prepareValidationSnapshot(r.snapshot, c).nodes.find(n => n.id === minor.id).baseline.effective.appearance.opacity;
  minor.appearance.opacity = baseline === 0.25 ? 0.5 : 0.25;
  const engine = core.evaluateCompiledContract(r.snapshot, c);
  assert.equal(engine.evaluations.find(e => e.ruleId.startsWith('fixture:nested-opacity')).classification, 'violation');
  assert.equal(core.prepareValidationSnapshot(r.snapshot, c).nodes.find(n => n.id === minor.id).baseline.effective.appearance.opacity, baseline);
});
test('new JSON export carries the corrected result and replays exactly', () => {
  const r = read('A12'), result = run(r);
  const exported = JSON.parse(core.buildValidationReportDownload({ manual: r.sources.manual, compiled: result.compiled,
    evaluatedContract: r.runtime.evaluatedContract, snapshot: r.snapshot, anatomy: r.anatomy,
    engineResult: result.engine, result: result.editor, capture: null, trigger: 'selected-instance' }).json);
  assert.equal(exported.summary.complete, true);
  const replay = run(exported);
  assert.deepEqual(clone(replay.engine), exported.results.engine);
  assert.deepEqual(clone(replay.editor), exported.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(replay.editor, exported.runtime.evaluatedContract, exported.anatomy)), exported.results.details);
  assert.equal(core.stableHash(exported.sources.manual), r.run.manualSourceHash);
});

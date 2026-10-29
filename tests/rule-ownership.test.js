const test = require('node:test'), assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const fixture = require('./fixtures/button-dependencies.json');
const clone = value => JSON.parse(JSON.stringify(value));

test('new authoring documents require ownership; intrinsic quick policies declare their owner explicitly', () => {
  const workspace = core.createWorkspaceFromPreview(clone(fixture.manual.component), []);
  assert.equal(workspace.manual.metadata.ruleOwnershipVersion, 1);
  const target = clone(fixture.manual.targets[0]);
  workspace.manual.targets = [target];
  const next = core.applyProtectInternalsPolicy(workspace.manual, target).manual;
  assert.ok(next.rules.length > 0);
  assert.ok(next.rules.every(rule => core.ruleOwnershipGroup(rule, next.component.componentId) === 'component'));
  const raw = clone(next.rules[0]); delete raw.ownership; raw.status = 'reviewed';
  assert.ok(core.validateRuleEdit(next, raw, raw.id).some(issue => issue.code === 'RULE_OWNERSHIP_REQUIRED'));
});

function scenario() {
  const manual = clone(fixture.manual), snapshot = clone(fixture.regularSnapshot);
  manual.metadata.ruleOwnershipVersion = 1;
  const base = { ...manual.rules[0], targetId: 'target.root', capability: 'appearance.opacity',
    constraints: [{ type: 'propertyDomain', fact: 'appearance.opacity', values: [1] }],
    applicability: { variants: 'all', modes: 'all', platforms: [] },
    ownership: { kind: 'component', ownerId: manual.component.componentId }, execution: { route: 'predicate' } };
  manual.rules = [{ ...clone(base), id: 'intrinsic' }, { ...clone(base), id: 'component:legacy-product-id',
    ownership: { kind: 'product-policy', ownerId: 'product.ab' },
    applicability: { ...base.applicability, products: ['ab'] },
    constraints: [{ type: 'propertyDomain', fact: 'appearance.opacity', values: [0.5] }] }];
  snapshot.context.product = 'ab';
  const run = () => {
    const compiled = core.compileManualSource(manual);
    const contract = core.prepareAuthoringPreviewContract(compiled.contract);
    const engine = core.evaluateCompiledContract(snapshot, contract);
    return { compiled, contract, engine, report: core.buildEditorValidationReport(engine, compiled, manual, snapshot) };
  };
  return { manual, snapshot, run };
}

test('intrinsic success and product violation coexist, without changing the shared interpreter', () => {
  const f = scenario(), r = f.run();
  assert.deepEqual(r.compiled.issues.filter(i => i.level === 'error'), []);
  assert.equal(r.report.ownershipCoverage.component.status, 'checked');
  assert.equal(r.report.ownershipCoverage.usage.status, 'violations');
  assert.equal(r.report.scenarioCoverage.complete, true); // complete is not compliant
  for (const policy of r.compiled.contract.customizationPolicy) assert.deepEqual(policy.ownership, f.manual.rules.find(r => r.id === policy.id).ownership);
  const legacy = clone(f.manual); delete legacy.metadata.ruleOwnershipVersion;
  legacy.rules.forEach(r => delete r.ownership);
  const old = core.evaluateCompiledContract(f.snapshot, core.compileManualSource(legacy).contract);
  assert.deepEqual(r.engine.evaluations, old.evaluations);
});

test('Product switches only usage applicability, unknown Product is never a pass', () => {
  const f = scenario(), first = f.run().engine.evaluations.find(e => e.ruleId === 'intrinsic.1.1');
  f.snapshot.context.product = 'ao';
  let r = f.run();
  // Evaluation IDs include the whole snapshot hash; compare the normative verdict and evidence.
  const { evaluationId: ignoredA, ...actual } = r.engine.evaluations.find(e => e.ruleId === 'intrinsic.1.1');
  const { evaluationId: ignoredB, ...expected } = first;
  assert.deepEqual(actual, expected);
  assert.equal(r.report.ownershipCoverage.usage.status, 'not-applicable');
  delete f.snapshot.context.product;
  r = f.run();
  assert.equal(r.report.ownershipCoverage.usage.status, 'incomplete');
  assert.equal(r.report.scenarioCoverage.complete, false);
});

test('external execution gap blocks usage, not intrinsic readiness; no inferred ownership', () => {
  const f = scenario(); f.manual.rules[1].execution = { route: 'delegated', externalRuleIds: ['external:policy'] };
  const r = f.run();
  assert.equal(r.report.contractReadiness.ownership.component.status, 'ready');
  assert.equal(r.report.contractReadiness.ownership.usage.status, 'draft');
  assert.equal(r.report.ownershipCoverage.component.status, 'checked');
  assert.equal(r.report.ownershipCoverage.usage.notExecuted, 1);
  assert.equal(r.report.scenarioCoverage.complete, false);
  assert.equal(core.ruleOwnershipGroup({ ...f.manual.rules[1], ownership: undefined }, f.manual.component.componentId), 'unclassified');
});

test('reviewed ownership is required in explicit mode; drafts stay incomplete and bad IDs are rejected', () => {
  const f = scenario(); delete f.manual.rules[0].ownership;
  assert.ok(core.validateRuleEdit(f.manual, f.manual.rules[0], 'intrinsic').some(i => i.code === 'RULE_OWNERSHIP_REQUIRED'));
  assert.equal(f.run().engine.evaluations.find(e => e.ruleId === 'intrinsic.1.1').classification, 'compliant');
  f.manual.rules[0].status = 'draft';
  let r = f.run();
  assert.equal(r.report.contractReadiness.ownership.unclassified.rules, 1);
  assert.equal(r.report.scenarioCoverage.complete, false);
  f.manual.rules[0].ownership = { kind: 'component', ownerId: 'another-component' };
  assert.ok(f.run().compiled.issues.some(i => i.code === 'RULE_OWNERSHIP'));
  assert.equal(core.validRuleOwnership({kind:'pattern',ownerId:' p '}, 'c'), false);
});

test('legacy packages are unchanged and do not pretend to have classified ownership', () => {
  const f = scenario(); delete f.manual.metadata.ruleOwnershipVersion;
  f.manual.rules.forEach(r => delete r.ownership);
  const r = f.run();
  assert.equal(r.report.ownershipCoverage, undefined);
  assert.equal(r.report.contractReadiness.ownership, undefined);
  assert.equal(r.compiled.contract.runtimePolicy.ruleOwnershipVersion, undefined);
});

test('manual import/export round-trip preserves ownership, IDs, scope and execution', () => {
  const f = scenario(), before = clone(f.manual);
  const imported = core.importWorkspace([{ name: 'contract.manual.json', text: JSON.stringify(f.manual) }]);
  const bundle = core.buildExportBundle(imported.manual);
  assert.deepEqual(bundle.manual, before);
  for (const atomic of bundle.compiled.rules) {
    const source = before.rules.find(r => r.id === atomic.source.anchor);
    assert.deepEqual(atomic.manual.ownership, source.ownership);
  }
});

test('nested runtime verdicts and capture gaps are separate from parent usage', () => {
  const f = scenario(), r = f.run();
  const report = core.buildOwnershipCoverage([
    ...r.report.evaluations,
    { ruleId: 'child-rule', classification: 'violation', dependency: { componentId: 'child' } },
    { ruleId: 'snapshot-capture', origin: 'editor-coverage', classification: 'not-executed' },
  ], r.compiled, f.manual);
  assert.equal(report.dependencies.violations, 1);
  assert.equal(report.infrastructure.notExecuted, 1);
  assert.equal(report.usage.violations, 1);
  assert.equal(report.unclassified.evaluations, 0);
});

test('unclassified not-applicable rules still prevent claiming complete ownership coverage', () => {
  const f = scenario(); delete f.manual.rules[1].ownership; f.manual.rules[1].status = 'draft';
  f.snapshot.context.product = 'ao';
  const r = f.run();
  assert.ok(r.report.ownershipCoverage.unclassified.evaluations > 0);
  assert.equal(r.report.scenarioCoverage.complete, false);
});

test('editor JSON export retains the ownership split alongside untouched engine output', () => {
  const f = scenario(), r = f.run();
  const download = core.buildValidationReportDownload({ manual:f.manual, compiled:r.compiled,
    evaluatedContract:r.contract, snapshot:core.prepareValidationSnapshot(f.snapshot,r.contract), anatomy:[],
    engineResult:r.engine, result:r.report, trigger:'preview' });
  const report = JSON.parse(download.json);
  assert.deepEqual(report.summary.ownershipCoverage, r.report.ownershipCoverage);
  assert.deepEqual(report.sources.manual.rules, f.manual.rules);
  assert.deepEqual(report.results.engine, clone(r.engine));
});

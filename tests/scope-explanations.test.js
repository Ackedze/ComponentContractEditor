const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const core = require('../dist/core.cjs');
const clone = x => JSON.parse(JSON.stringify(x));
const localPath = 'ruleScopeV1.local';
const visiblePath = 'ruleScopeV1.targets.text.visible';
const leaf = (factPath, actual = false, truth = 'false') => ({
  predicate: 'equals', truth, actual, expected: true, factPaths: [factPath], reason: 'values differ',
});
const all = (...children) => ({ predicate: 'all', truth: 'false', reason: 'logical all evaluated',
  actual: children.map(c => c.truth), expected: 'all true', children,
  factPaths: [...new Set(children.flatMap(c => c.factPaths))] });
const ownerPolicy = { boundaryPolicy: 'component-owned@1' };
const visibilityPolicy = { targetApplicability: 'visible-target@1' };
const genericReason = 'Условие применения правила не выполнено; ограничение не проверялось';
function detail(trace, presentation = ownerPolicy, overrides = {}) {
  return core.buildEvaluationDetails({ evaluations: [{ ruleId: 'scope-test', subjectNodeId: 'node',
    classification: 'not-applicable', severity: 'error', trace, ...overrides }] },
  { rules: [{ ruleId: 'scope-test', presentation }] }, [])[0];
}

test('proven primitive false gives specific hidden-target and child-owned reasons without a comparison', () => {
  for (const [factPath, policy, reason] of [
    [localPath, ownerPolicy, /подтверждённому вложенному контракту/],
    [visiblePath, visibilityPolicy, /Цель доказанно скрыта/],
  ]) for (const trace of [leaf(factPath), all(leaf('variantAvailability.targets.root.present', true, 'true'), all(leaf(factPath)))]) {
    const d = detail(trace, policy);
    assert.match(d.reasonLabel, reason); assert.equal(d.showComparison, false);
    assert.equal(d.classification, 'not-applicable');
    assert.deepEqual(d.actual, trace.actual); assert.deepEqual(d.expected, trace.expected);
  }
});

test('false scope inside a successful OR is not the reason an unrelated condition failed', () => {
  for (const [factPath, policy] of [[localPath, ownerPolicy], [visiblePath, visibilityPolicy]]) {
    const successfulOr = { ...all(leaf(factPath), leaf('context.allowed', true, 'true')), predicate: 'any', truth: 'true' };
    const d = detail(all(successfulOr, leaf('context.other')), policy);
    assert.equal(d.reasonLabel, genericReason); assert.equal(d.showComparison, true);
    const failedOr = { ...all(leaf(factPath), leaf('context.other')), predicate: 'any' };
    assert.equal(detail(all(failedOr), policy).showComparison, false);
  }
});

test('unknown, absent, wrapped or string false is never proof of a scope exemption', () => {
  for (const [factPath, policy] of [[localPath, ownerPolicy], [visiblePath, visibilityPolicy]]) {
    for (const actual of [undefined, null, 'false', 0, { state: 'unknown', value: false }, { value: false }]) {
      // Pass undefined explicitly: default parameters must not turn it into false.
      const t = all({ ...leaf(factPath), actual });
      const d = detail(t, policy);
      assert.equal(d.reasonLabel, genericReason); assert.equal(d.showComparison, true);
    }
    const d = detail(all(leaf(factPath, false, 'unknown'), leaf('context.other')), policy);
    assert.equal(d.reasonLabel, genericReason);
    for (const classification of ['human-review', 'not-evaluable', 'not-executed', 'violation', 'compliant']) {
      const d = detail(leaf(factPath), policy, { classification });
      assert.equal(d.classification, classification); assert.equal(d.showComparison, true);
    }
  }
});

test('scope display requires the exact opted-in policy, equals false-to-true and matching fact path', () => {
  for (const policy of [{}, { boundaryPolicy: 'future@2' }, visibilityPolicy]) {
    assert.equal(detail(leaf(localPath), policy).reasonLabel, genericReason);
  }
  for (const trace of [
    { ...leaf(localPath), expected: false },
    { ...leaf(localPath), predicate: 'not-equals' },
    leaf(localPath + '.unrelated'),
    { ...leaf(localPath), factPaths: null },
    { ...all(leaf(localPath)), children: {} },
    { ...all(leaf(localPath)), children: [null, 'false', 0] },
  ]) assert.equal(detail(trace).reasonLabel, genericReason);
});

test('Product/platform exclusions retain their own reason, not ownership or visibility', () => {
  for (const dimension of ['product', 'platform', 'channel', 'page type']) {
    const d = detail({ ...leaf(localPath), reason: `rule ${dimension} scope does not apply` });
    assert.equal(d.scopeMismatch, true); assert.equal(d.showComparison, true);
    assert.doesNotMatch(d.reasonLabel, /вложенному контракту|Цель доказанно скрыта/);
  }
});

test('nested provenance uses the pinned child rule presentation, not a colliding parent RuleID', () => {
  const trace = leaf(visiblePath), result = { evaluations: [{ ruleId: 'same-id', subjectNodeId: 'node',
    classification: 'not-applicable', trace, dependency: { compiledHash: 'child-hash' } }] };
  const contract = { rules: [{ ruleId: 'same-id', presentation: ownerPolicy }], componentDependencies: [
    { compiledHash: 'child-hash', contract: { rules: [{ ruleId: 'same-id', presentation: visibilityPolicy }] } },
  ] };
  const before = JSON.stringify({ result, contract });
  const d = core.buildEvaluationDetails(result, contract, [])[0];
  assert.match(d.reasonLabel, /Цель доказанно скрыта/); assert.equal(d.showComparison, false);
  assert.equal(JSON.stringify({ result, contract }), before);
  result.evaluations[0].dependency.compiledHash = 'missing';
  assert.equal(core.buildEvaluationDetails(result, contract, [])[0].reasonLabel, genericReason);
});

const root = path.resolve(__dirname, '../../../shared/design-system_ab/experiments/web-core/core/Button');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'qa/ownership-scope-live-review.2026-09-27.json')));
const r = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, manifest.reportResults[0].fixtureFile))));

test('export identifies current Editor independently of imported compiler version; original evidence stays immutable', () => {
  const before = JSON.stringify(r);
  const exported = JSON.parse(core.buildValidationReportDownload({ manual: r.sources.manual,
    compiled: { contract: r.sources.compiledContract, issues: r.sources.compilerIssues },
    evaluatedContract: r.runtime.evaluatedContract, snapshot: r.snapshot, anatomy: r.anatomy,
    engineResult: r.results.engine, result: r.results.editor, capture: r.run.capture,
    trigger: r.run.trigger, generatedAt: '2026-09-28T00:00:00.000Z',
  }).json);
  assert.equal(exported.editorVersion, 'component-contract-editor@' + require('../package.json').version);
  assert.equal(exported.sources.compiledContract.package.sourceExportVersion, 'component-contract-editor@0.2.35');
  assert.equal(exported.run.manualRevision, 17);
  assert.deepEqual(exported.results.engine, r.results.engine);
  assert.deepEqual(exported.results.editor, r.results.editor);
  assert.deepEqual(exported.runtime, r.runtime);
  assert.deepEqual(exported.sources, r.sources);
  const hidden = exported.results.details.find(d => d.ruleId === 'component:web-core.button.label-text-style-locked.1.1');
  assert.equal(hidden.showComparison, false); assert.match(hidden.reasonLabel, /Цель доказанно скрыта/);
  assert.equal(JSON.stringify(r), before);
});

test('r17 recompilation preserves normative data and pins; only producer and dependency presentation metadata advance', () => {
  const compiled = core.compileManualSource(r.sources.manual, r.sources.compiledContract.facts.variantEvidence,
    r.sources.compiledContract.componentDependencies.map(d => d.contract));
  const current=clone(compiled.contract);
  assert.equal(current.package.sourceExportVersion,'component-contract-editor@0.2.37');
  current.package.sourceExportVersion=r.sources.compiledContract.package.sourceExportVersion;
  const enriched=current.rules.filter(rule=>rule.presentation?.dependency?.contractDependencyId);
  assert.equal(enriched.length,2);
  for(const rule of enriched){assert.equal(rule.presentation.dependency.contractDependencyId,'spinner');delete rule.presentation.dependency.contractDependencyId;}
  assert.deepEqual(current, r.sources.compiledContract);
  assert.deepEqual(clone(compiled.issues), r.sources.compilerIssues);
});

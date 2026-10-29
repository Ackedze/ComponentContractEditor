const test = require('node:test'), assert = require('node:assert/strict');
const editor = require('../dist/core.cjs');
const {fixture, switchVariant, absentFixture} = require('../../Apollo/packages/component-contract-core/tests/helpers/declared-configured.cjs');

test('Editor reopens configured target policy v3 and preserves every permission', () => {
  const f = fixture(editor), bundle = editor.buildExportBundle(f.manual, f.evidence);
  assert.equal(bundle.compiled.runtimePolicy.declaredTargetIdentityVersion, 3);
  assert.equal(bundle.compiled.package.sourceExportVersion, 'component-contract-editor@0.2.95');
  const workspace = editor.importWorkspace([
    {name: 'contract.manual.json', text: JSON.stringify(bundle.manual)},
    {name: 'compiled/component-contract.v2.json', text: JSON.stringify(bundle.compiled)},
  ]);
  assert.deepEqual(workspace.manual.rules, f.manual.rules);
  assert.deepEqual(editor.compileManualSource(workspace.manual, workspace.variantEvidence).contract, bundle.compiled);
  switchVariant(f, editor);
  assert.equal(editor.evaluateCompiledContract(f.snapshot, bundle.compiled).evaluations[0].classification, 'violation');
});

test('Editor configured profile excludes missing children only with proven false root conditions', () => {
  const f = absentFixture(editor), c = f.compile().contract;
  assert.equal(editor.evaluateCompiledContract(f.snapshot, c).evaluations[0].classification, 'not-applicable');
  f.snapshot.nodes[0].unknownFacts = ['component.properties.Background'];
  assert.equal(editor.evaluateCompiledContract(f.snapshot, c).evaluations[0].classification, 'human-review');
});

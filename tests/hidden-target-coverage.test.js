const test = require('node:test'), assert = require('node:assert/strict'), editor = require('../dist/core.cjs');
const {fixture, configure} = require('../../Apollo/packages/component-contract-core/tests/helpers/declared-target-configuration.cjs');
test('Editor download preserves raw engine and explicitly versions hidden-target coverage', () => {
  const f = fixture(editor); Object.assign(f.snapshot.source.captureTopology, {limitReached:false,issues:[]});
  configure(f, 'Public label', false);
  const compiled = f.compile(), engineResult = editor.evaluateCompiledContract(f.snapshot, compiled.contract);
  const result = editor.buildEditorValidationReport(engineResult, compiled, f.manual, f.snapshot, {hiddenTargetCoverageVersion:1});
  const download = editor.buildValidationReportDownload({manual:f.manual,compiled,evaluatedContract:compiled.contract,
    snapshot:f.snapshot,anatomy:[],engineResult,result,capture:null,trigger:'selected-instance'});
  const d = JSON.parse(download.json);
  assert.equal(d.editorVersion, `component-contract-editor@${require('../package.json').version}`);
  assert.equal(d.summary.hiddenTargetCoverageVersion, 1);
  assert.equal(d.summary.notExecuted, 0);
  assert.deepEqual(d.results.engine, JSON.parse(JSON.stringify(engineResult)));
  assert.deepEqual(d.results.editor, JSON.parse(JSON.stringify(editor.buildEditorValidationReport(
    d.results.engine,{contract:d.sources.compiledContract,issues:d.sources.compilerIssues},d.sources.manual,d.snapshot,
    {hiddenTargetCoverageVersion:d.summary.hiddenTargetCoverageVersion}))));
  assert.equal(d.results.editor.evaluations.find(e => e.ruleId === 'synthetic.font-size.1.1').classification, 'not-applicable');
  const detail = d.results.details.find(e => e.ruleId === 'synthetic.font-size.1.1');
  assert.equal(detail.reasonLabel, 'Слой найден и подтверждён, но скрыт. Эта проверка не применяется.');
  assert.equal(detail.showComparison, false);
});
test('unmarked historical report coverage remains incomplete without the new diagnostic option', () => {
  const f = fixture(editor); Object.assign(f.snapshot.source.captureTopology, {limitReached:false,issues:[]}); configure(f, 'Default', false);
  const compiled = f.compile(), engine = editor.evaluateCompiledContract(f.snapshot, compiled.contract);
  const report = editor.buildEditorValidationReport(engine, compiled, f.manual, f.snapshot);
  assert.equal(report.scenarioCoverage.hiddenTargetCoverageVersion, undefined);
  assert.equal(report.scenarioCoverage.notExecuted, 1);
});

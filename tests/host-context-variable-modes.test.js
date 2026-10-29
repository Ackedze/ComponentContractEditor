const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
const core = require('../dist/core.cjs'), shared = require('../../Apollo/packages/component-contract-core/dist/core.cjs');
const { runNativeOccurrenceCapture } = require('../../Apollo/packages/component-contract-core/tests/helpers/native-occurrence-capture.cjs');
const { hostModeContract } = require('../../Apollo/packages/component-contract-core/tests/helpers/host-mode-contract.cjs');

for (const direction of ['remove', 'add']) for (const reset of [false, true]) for (const aliasMode of [false, true])
  test(`Editor bundled host context: collection ${direction}, reset=${reset}, alias=${aliasMode}, exact shared verdict`, async () => {
    const f = hostModeContract(core, direction);
    const { result } = await runNativeOccurrenceCapture(async (figma, actual, request) => {
      const messages = []; figma.showUI = () => {}; figma.on = () => {}; figma.ui = { postMessage: m => messages.push(m) };
      vm.runInNewContext(fs.readFileSync(require.resolve('../dist/code.js'), 'utf8'), { figma, __html__: '', TextEncoder });
      await figma.ui.onmessage(Object.assign({ type: 'test-selection', requestId: 'host-modes' }, request));
      assert.deepEqual(messages.filter(m => m.type === 'plugin-error'), []);
      const result = messages.find(m => m.type === 'selection-test-result'); assert(result); return result;
    }, { modeCatalogDrift: direction, modePair: direction === 'remove', aliasMode, selectedIndex: direction === 'remove' ? 0 : 1, reset });
    const snapshot = JSON.parse(JSON.stringify(result.snapshot));
    assert.equal(snapshot.instanceContentReferences.hostContextVariableModesVersion, 1);
    assert.equal(result.matchedBaselineNodes, 9);
    const engine = core.evaluateCompiledContract(snapshot, f.contract);
    assert.deepEqual(engine, shared.evaluateCompiledContract(snapshot, f.contract));
    assert.equal(engine.evaluations.find(e => e.ruleId.startsWith('synthetic.primary-position')).classification, reset ? 'compliant' : 'violation');
    const report = core.buildEditorValidationReport(engine, f.compiled, f.manual, snapshot);
    assert.equal(report.scenarioCoverage.complete, true);
    const download = core.buildValidationReportDownload({ manual: f.manual, compiled: f.compiled, evaluatedContract: f.contract,
      snapshot, anatomy: JSON.parse(JSON.stringify(result.anatomy)), engineResult: engine, result: report, capture: null, trigger: 'selected-instance' });
    const saved = JSON.parse(download.json);
    assert.equal(saved.snapshot.instanceContentReferences.hostContextVariableModesVersion, 1);
    assert.deepEqual(core.evaluateCompiledContract(saved.snapshot, saved.runtime.evaluatedContract), saved.results.engine);
  });

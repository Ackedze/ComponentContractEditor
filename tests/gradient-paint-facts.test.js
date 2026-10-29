const test = require('node:test'), assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const { reports, clone, capture, evidence } = require('./helpers/spinner-geometry');
const types = ['GRADIENT_LINEAR', 'GRADIENT_RADIAL', 'GRADIENT_ANGULAR', 'GRADIENT_DIAMOND'];
// Explicit synthetic Plugin API paints, independently assigned to actual and
// reference. These values are NOT claimed to be the library's original gradient.
const paint = (type = 'GRADIENT_ANGULAR') => ({ type, visible: true, opacity: 1, blendMode: 'NORMAL',
  gradientTransform: [[1, 0, 0], [0, 1, 0]],
  gradientStops: [
    { position: 0, color: { r: 0.123456789, g: 0, b: 1, a: 0.4 }, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'gradient-token' } } },
    { position: 1, color: { r: 1, g: 1, b: 1, a: 1 } },
  ],
});
const findGradient = root => root.fills?.some(p => p.type.startsWith('GRADIENT_')) ? root
  : (root.children || []).map(findGradient).find(Boolean);
const manual = clone(reports[0].sources.manual);
for (const r of manual.rules) {
  const paths = core.baselineFactsForRule(r), gates = {};
  if (paths.includes('appearance.strokeWeight')) gates['appearance.strokeWeight'] = 'stroke-present-either@1';
  if (paths.includes('layout.itemSpacing')) gates['layout.itemSpacing'] = 'flow-gap-either@1';
  if (Object.keys(gates).length) r.propertyApplicability = gates;
}
const compiled = core.compileManualSource(manual, evidence), contract = core.prepareAuthoringPreviewContract(compiled.contract);
function run(snapshot) {
  const engine = core.evaluateCompiledContract(snapshot, contract);
  return { engine, report: core.buildEditorValidationReport(engine, compiled, manual, snapshot) };
}
async function scenario({ type, mutate, referenceMutate, stroke = false, preview = false } = {}) {
  const install = (root, change) => {
    const n = findGradient(root); assert.ok(n);
    const value = paint(type); if (change) change(value);
    if (stroke) n.strokes = [value]; else n.fills = [value];
  };
  return capture(reports[0], { preview, mutateActual: root => install(root, mutate), mutateReference: root => install(root, referenceMutate) });
}
const paintChecks = out => out.engine.evaluations.filter(e => e.trace.factPaths.some(f => /^appearance\.(fill|stroke)$/.test(f)));

for (const type of types) test(`${type}: preserves exact stops, order, alpha, transform, bindings`, () => {
  const input = paint(type), before = clone(input), facts = core.captureGradientPaintDetails(input);
  assert.equal(facts.gradientStops[0].color.r, 0.123456789);
  assert.equal(facts.gradientStops[0].color.a, 0.4);
  assert.equal(facts.gradientStops[0].tokenId, 'gradient-token');
  assert.equal(facts.gradientStops[1].tokenId, null);
  assert.deepEqual(facts.gradientTransform, input.gradientTransform);
  assert.deepEqual(core.gradientPaintIssues([{ type, ...facts }]), []);
  facts.gradientTransform[0][0] = 9; facts.gradientStops[0].color.r = 9;
  assert.deepEqual(input, before);
});

test('invalid/missing geometry, colors and bindings are not replaced with valid-looking defaults', () => {
  for (const change of [p => delete p.gradientTransform, p => p.gradientTransform = [[1, 0, NaN], [0, 1, 0]],
    p => p.gradientStops = [], p => delete p.gradientStops[0].position, p => p.gradientStops[0].color.a = Infinity,
    p => p.gradientStops[0].boundVariables.color = {}, p => p.gradientStops[0].boundVariables = null]) {
    const p = paint(); change(p);
    const f = { type: p.type, ...core.captureGradientPaintDetails(p) };
    assert.ok(core.gradientPaintIssues(f && [f]).length);
  }
  assert.deepEqual(core.captureGradientPaintDetails({ type: 'SOLID', color: {} }), {});
});

for (const type of types) test(`${type}: new bundled controller + independent reference pass`, async () => {
  const { output, created, pages } = await scenario({ type });
  assert.equal(output.snapshot.source.gradientPaintCaptureVersion, 1);
  const result = run(output.snapshot);
  assert.equal(result.report.scenarioCoverage.complete, true);
  assert.equal(result.engine.evaluations.filter(e => e.classification === 'violation').length, 0);
  assert.ok(created.every(n => n.removed) && pages.every(p => p.removed));
});

const mutations = {
  position: p => p.gradientStops[0].position = 0.2,
  rgb: p => p.gradientStops[0].color.r = 0.123456790,
  alpha: p => p.gradientStops[0].color.a = 0.5,
  transform: p => p.gradientTransform[0][2] = 0.25,
  tokenDetach: p => delete p.gradientStops[0].boundVariables,
  tokenSwapSameColor: p => p.gradientStops[0].boundVariables.color.id = 'another-token',
  stopOrder: p => p.gradientStops.reverse(),
  blendMode: p => p.blendMode = 'MULTIPLY',
};
for (const [name, mutate] of Object.entries(mutations)) test(`gradient ${name}: real capture detects override, reset restores pass`, async () => {
  const { output } = await scenario({ mutate });
  const result = run(output.snapshot), violations = paintChecks(result).filter(e => e.classification === 'violation');
  assert.equal(violations.length, 2);
  assert.equal(result.report.scenarioCoverage.complete, true);
  const details = core.buildEvaluationDetails(result.report, contract, output.anatomy).filter(d => d.classification === 'violation');
  assert.equal(core.groupEvaluationDetails(details).length, 1);
  assert.notEqual(core.paintDiagnosticSummary(violations[0].trace.actual), core.paintDiagnosticSummary(violations[0].trace.expected));
  const reset = run((await scenario()).output.snapshot);
  assert.equal(reset.engine.evaluations.filter(e => e.classification === 'violation').length, 0);
});

test('stroke gradients use the same capture and independent comparison', async () => {
  // Populate fills too: the legacy fixture deliberately lacks gradient geometry.
  const base = clone(reports[0]);
  const install = (root, changed) => { const n = findGradient(root); n.fills = [paint()]; n.strokes = [paint('GRADIENT_LINEAR')]; if (changed) n.strokes[0].gradientTransform[1][2] = 0.2; };
  const { output } = await capture(base, { mutateActual: r => install(r, true), mutateReference: r => install(r, false) });
  const result = run(output.snapshot);
  assert.equal(paintChecks(result).filter(e => e.classification === 'violation' && e.trace.factPaths.includes('appearance.stroke')).length, 2);
  assert.equal(result.report.scenarioCoverage.complete, true);
});

test('missing actual OR independent reference gradient facts is incomplete with explicit paths', async () => {
  for (const options of [{ mutate: p => delete p.gradientTransform }, { referenceMutate: p => delete p.gradientStops }]) {
    const { output } = await scenario(options), result = run(output.snapshot);
    assert.equal(result.report.scenarioCoverage.complete, false);
    assert.ok(result.report.scenarioCoverage.inconclusive > 0);
    const details = core.buildEvaluationDetails(result.report, contract, output.anatomy);
    assert.ok(details.some(d => /Недостаточно данных градиента:/.test(d.reasonLabel) && /gradient(Stops|Transform)/.test(d.reasonLabel)));
  }
});

test('old compiled reports retain exact replay; newly compiled contract exposes old missing gradient data', () => {
  for (const r of reports) {
    assert.deepEqual(core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract), r.results.engine);
    const current = run(r.snapshot);
    assert.equal(current.report.scenarioCoverage.complete, false);
    assert.ok(current.report.evaluations.some(e => e.evidenceIssues?.some(p => p.includes('gradientTransform'))));
  }
});

test('missing whole paint field and mixed/malformed capture are unknown, never an empty paint or a violation', async () => {
  const { output } = await scenario();
  for (const reference of [false, true]) for (const value of [undefined, null, {}]) {
    const s = clone(output.snapshot), n = s.nodes.find(n => n.appearance.fill.some(p => p.type.startsWith('GRADIENT_')));
    const a = reference ? n.baseline.effective.appearance : n.appearance;
    if (value === undefined) delete a.fill; else a.fill = value;
    const result = run(s);
    assert.equal(result.report.scenarioCoverage.complete, false);
    assert.ok(paintChecks(result).some(e => e.subjectNodeId === n.id && e.classification === 'human-review'));
    assert.ok(!paintChecks(result).some(e => e.subjectNodeId === n.id && e.classification === 'violation'));
  }
  const mixed = await capture(reports[0], { mutateActual: root => { findGradient(root).fills = Symbol('mixed'); },
    mutateReference: root => { findGradient(root).fills = [paint()]; } });
  assert.ok(mixed.output.snapshot.nodes.some(n => n.appearance.fill === null));
  const mixedResult = run(mixed.output.snapshot);
  assert.equal(mixedResult.report.scenarioCoverage.complete, false);
  assert.ok(core.buildEvaluationDetails(mixedResult.report, contract, mixed.output.anatomy)
    .some(d => /Недостаточно данных заливки или обводки:/.test(d.reasonLabel)));
});

test('preview and JSON export preserve evidence; replay and materialization are idempotent', async () => {
  const { output } = await scenario({ preview: true }), s = output.snapshot, before = JSON.stringify(s);
  const prepared = core.prepareValidationSnapshot(s, contract);
  assert.deepEqual(core.prepareValidationSnapshot(prepared, contract), prepared);
  const result = run(s);
  assert.equal(result.report.scenarioCoverage.complete, true);
  const exported = JSON.parse(core.buildValidationReportDownload({ manual, compiled, evaluatedContract: contract, snapshot: s,
    anatomy: output.anatomy, engineResult: result.engine, result: result.report, capture: null, trigger: 'preview' }).json);
  assert.deepEqual(core.evaluateCompiledContract(exported.snapshot, exported.runtime.evaluatedContract), exported.results.engine);
  assert.deepEqual(core.buildEditorValidationReport(exported.results.engine, compiled, manual, exported.snapshot), exported.results.editor);
  assert.equal(JSON.stringify(s), before);
  const broken = clone(s); delete broken.nodes.find(n => n.appearance.fill.some(p => p.type.startsWith('GRADIENT_'))).appearance.fill[0].gradientStops;
  const incomplete = core.prepareValidationSnapshot(broken, contract);
  assert.deepEqual(core.prepareValidationSnapshot(incomplete, contract), incomplete);
});

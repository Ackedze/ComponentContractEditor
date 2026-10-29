// Browser-only replay of archived Figma facts through the real built Editor UI.
// No live Figma access and no file/canvas mutations. Playwright comes from NODE_PATH.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const os = require('node:os');
const editor = path.resolve(__dirname, '..');
const root = path.resolve(editor, '../../shared/design-system_ab/experiments/web-core/core/Button');
const core = require(path.join(editor, 'dist/core.cjs'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'qa/ownership-scope-live-review.2026-09-27.json')));
const read = caseId => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, manifest.reportResults.find(x => x.caseId === caseId).fixtureFile))));
(async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + path.join(editor, 'dist/ui.html'));
    await page.evaluate(() => {
      window.sent = [];
      window.addEventListener('message', e => { if (e.data?.pluginMessage) window.sent.push(e.data.pluginMessage); });
      window.postMessage({ pluginMessage: { type: 'plugin-ready', selectionAvailable: true, instanceSelectionAvailable: true } }, '*');
    });
    await page.locator('#fileInput').setInputFiles(path.join(root, 'editor/Button.editor-input.zip'));
    await page.waitForFunction(() => document.querySelector('#ruleCount').textContent === '26');
    await page.locator('#validationModeButton').click();
    await page.locator('#validationProductSelect').selectOption('ab', { force: true });
    const results = [];
    for (const caseId of ['BS01', 'BS05']) {
      const original = read(caseId);
      await page.locator('#testSelectionButton').click();
      await page.evaluate(r => {
        const req = window.sent.findLast(m => m.type === 'test-selection');
        window.postMessage({ pluginMessage: { type: 'selection-test-result', requestId: req.requestId,
          manualSourceHash: req.manualSourceHash, componentKey: r.snapshot.source.componentKey,
          snapshot: r.snapshot, anatomy: r.anatomy.map(n => ({ ...n, properties: r.snapshot.nodes.find(x => x.id === n.id) })),
          matchedBaselineNodes: r.snapshot.nodes.length, unmatchedBaselineNodeIds: [], warnings: [],
          width: 128, height: 56, imageDataUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="56"/>' } }, '*');
      }, original);
      await page.waitForFunction(() => !document.querySelector('#downloadReportButton').disabled);
      const pending = page.waitForEvent('download'); await page.locator('#downloadReportButton').click();
      const stream = await (await pending).createReadStream(), chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const report = JSON.parse(Buffer.concat(chunks));
      assert.equal(report.editorVersion, 'component-contract-editor@0.2.36');
      assert.equal(report.sources.compiledContract.package.sourceExportVersion, 'component-contract-editor@0.2.35');
      assert.deepEqual(report.sources.manual, original.sources.manual);
      assert.deepEqual(report.results.engine, core.evaluateCompiledContract(report.snapshot, report.runtime.evaluatedContract));
      assert.deepEqual(report.results.engine, original.results.engine);
      assert.deepEqual(report.results.editor, original.results.editor);
      assert.deepEqual(report.results.details, JSON.parse(JSON.stringify(core.buildEvaluationDetails(report.results.editor, report.runtime.evaluatedContract, report.anatomy))));
      await page.locator('.result-chip.not-applicable').click();
      const hidden = page.locator('.test-detail-card').filter({ hasText: 'Цель доказанно скрыта' });
      const owned = page.locator('.test-detail-card').filter({ hasText: 'Область принадлежит подтверждённому вложенному контракту' });
      assert.equal(await hidden.count(), 2); assert.ok(await owned.count() > 0);
      assert.equal(await hidden.locator('.test-value-diff').count(), 0);
      assert.equal(await owned.locator('.test-value-diff').count(), 0);
      if (caseId === 'BS01') {
        await hidden.first().screenshot({ path: path.join(os.tmpdir(), 'editor-0.2.36-hidden-target.png') });
        await owned.first().screenshot({ path: path.join(os.tmpdir(), 'editor-0.2.36-child-owned.png') });
      }
      results.push({ caseId, hiddenCards: await hidden.count(), ownedCards: await owned.count(),
        atomicViolations: report.results.details.filter(d => d.classification === 'violation').length });
      await page.locator('#closeTestDetailsButton').click();
      if (caseId === 'BS05') {
        await page.locator('.result-chip.violation').click();
        assert.equal(await page.locator('.test-detail-card.violation').count(), 1);
        assert.equal(await page.locator('.test-detail-card.violation .test-value-diff').count(), 1);
        const values = await page.locator('.test-detail-card.violation .test-value-box').allTextContents();
        assert.ok(values[0].endsWith('0.5')); assert.ok(values[1].endsWith('1'));
        await page.locator('#closeTestDetailsButton').click();
      }
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ status: 'passed', source: 'archived facts via simulated Plugin API message; not a fresh Figma capture', results, errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0,6000)); process.exitCode = 1; });

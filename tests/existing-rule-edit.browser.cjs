const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { core, clone, scenario } = require('./helpers/direct-group');

const unpack = async bytes => (await core.readZip(bytes)).map(entry => ({ name: entry.name, text: core.zipEntryText(entry) }));
const imageDataUrl = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');

(async () => {
  const f = scenario(2);
  f.evidence.variants.push({ ...clone(f.evidence.variants[0]), componentKey: 'other-group-variant', properties: { Size: '40' } });
  const rule = f.manual.rules[0];
  rule.status = 'draft';
  rule.controlPaths = [{ kind: 'direct', required: false, exclusive: true }];
  rule.applicability.scopeStatus = 'confirmed';
  rule.ownership = { kind: 'component', ownerId: f.manual.component.componentId };
  f.manual.metadata.ruleOwnershipVersion = 1;
  const nested = { ...clone(rule), id: 'fixture.nested', targetId: 'target-1', rationale: 'Keep the declared child target when preview arrives.' };
  const missing = { ...clone(rule), id: 'fixture.missing', targetId: 'missing-target' };
  f.manual.rules.push(nested, missing);
  const compiled = core.compileManualSource(f.manual, f.evidence, [f.childContract]).contract;
  const zip = core.createZip([
    core.textZipEntry('contract.manual.json', f.manual),
    core.textZipEntry('compiled/component-contract.v2.json', compiled),
  ]);
  const imported = core.importWorkspace(await unpack(zip));
  assert.equal(imported.anatomy.length, 0, 'A component set with several variants has no uniquely selected offline tree.');
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => window.addEventListener('message', event => {
      const message = event.data?.pluginMessage;
      if (message?.type === 'save-session') window.__session = message.session;
      if (message?.type === 'render-preview') window.__previewRequest = message.requestId;
    }));
    await page.goto('file://' + path.resolve(__dirname, '../dist/ui.html'));
    const upload = () => page.locator('#fileInput').setInputFiles({ name: 'synthetic.component-contract.zip', mimeType: 'application/zip', buffer: Buffer.from(zip) });
    await upload();
    await page.waitForFunction(() => window.__session?.workspace.manual.component.componentId === 'fixture.group');
    const before = await page.evaluate(() => window.__session.workspace.manual);
    assert.equal(await page.locator('#anatomyTree .tree-item').count(), 0);
    await page.locator('#newRuleButton').click();
    assert(await page.locator('#saveRuleButton').isDisabled(), 'A new rule still needs a selected layer.');
    await page.locator('#backToRulesButton').click();
    await page.locator('#ruleSelect').selectOption(rule.id, { force: true });
    assert(!(await page.locator('#saveRuleButton').isDisabled()), 'An existing rule must be editable without a live node.');
    await page.locator('#ruleStatus').selectOption('reviewed', { force: true });
    await page.locator('#saveRuleButton').click();
    await page.waitForFunction(id => window.__session.workspace.manual.rules.find(rule => rule.id === id)?.status === 'reviewed', rule.id);
    let saved = await page.evaluate(() => window.__session.workspace.manual);
    const updated = saved.rules.find(entry => entry.id === rule.id);
    assert.equal(updated.targetId, rule.targetId);
    assert.deepEqual(updated.constraints, rule.constraints);
    assert.deepEqual(updated.controlPaths, rule.controlPaths);
    assert.deepEqual(saved.targets, before.targets);
    assert.deepEqual(saved.componentDependencies, before.componentDependencies);
    assert.equal(saved.metadata.revision, before.metadata.revision + 1);

    await page.locator('#ruleSelect').selectOption(missing.id, { force: true });
    assert(await page.locator('#saveRuleButton').isDisabled(), 'A missing declared target cannot silently become another target.');
    assert.match(await page.locator('#saveRuleButton').getAttribute('title'), /Цель правила отсутствует/);
    await page.locator('#backToRulesButton').click();
    await page.locator('#ruleSelect').selectOption(nested.id, { force: true });
    await page.locator('#rationale').fill('Edited before asynchronous preview.');
    await page.waitForFunction(() => window.__previewRequest);
    const paths = core.snapshotPaths(f.snapshot);
    const anatomy = f.snapshot.nodes.map(node => ({
      id: node.id, parentId: node.parentId, childIds: node.childIds, name: node.name, type: node.type,
      visible: node.visible, order: node.order, depth: node.parentId === null ? 0 : 1,
      path: ['Group', paths.get(node.id)].filter(Boolean).join(' / '), semanticRole: '', properties: node, unknownFacts: [],
    }));
    await page.evaluate(({ anatomy, snapshot, imageDataUrl }) => window.postMessage({ pluginMessage: {
      type: 'preview-result', requestId: window.__previewRequest, anatomy, snapshot, imageDataUrl, width: 1, height: 1, warnings: [], variableModes: [],
    } }, '*'), { anatomy, snapshot: f.snapshot, imageDataUrl });
    await page.waitForFunction(() => document.querySelectorAll('#anatomyTree .tree-item').length === 3);
    assert.equal(await page.locator('#rationale').inputValue(), 'Edited before asynchronous preview.');
    await page.locator('#saveRuleButton').click();
    await page.waitForFunction(id => window.__session.workspace.manual.rules.find(rule => rule.id === id)?.rationale === 'Edited before asynchronous preview.', nested.id);
    saved = await page.evaluate(() => window.__session.workspace.manual);
    assert.equal(saved.rules.find(entry => entry.id === nested.id).targetId, nested.targetId);
    assert.deepEqual(saved.targets, before.targets);
    assert.deepEqual(saved.componentDependencies, before.componentDependencies);
    assert.equal(await page.locator('#anatomyTree .tree-item.selected').count(), 1);
    assert.match(await page.locator('#anatomyTree .tree-item.selected').textContent(), /Button/);

    const pending = page.waitForEvent('download');
    await page.locator('#exportButton').click();
    const downloaded = await pending;
    const reopened = core.importWorkspace(await unpack(fs.readFileSync(await downloaded.path())));
    assert.deepEqual(reopened.manual, saved);
    assert.deepEqual(reopened.manual.targets, before.targets);
    assert.deepEqual(reopened.manual.componentDependencies, before.componentDependencies);
    assert.deepEqual(reopened.dependencyContracts, imported.dependencyContracts);

    // Reimporting the same package keeps the already captured tree; no missing-tree warning is appropriate.
    await page.evaluate(() => document.querySelector('#toastRegion').replaceChildren());
    await upload();
    await page.waitForFunction(() => window.__session.workspace.manual.metadata.revision === 1);
    assert.equal(await page.locator('#anatomyTree .tree-item').count(), 3);
    assert(!/No structure signature|Дерево слоёв появится/.test(await page.locator('#toastRegion').textContent()));
    assert.deepEqual(await page.evaluate(() => window.__session.workspace.manual), before);

    // Optional local author package: read in memory, never stored as a fixture or overwritten.
    if (process.env.AUTHORING_PACKAGE_PATH) {
      const originalBytes = fs.readFileSync(process.env.AUTHORING_PACKAGE_PATH);
      const authorWorkspace = core.importWorkspace(await unpack(originalBytes));
      const authorRule = authorWorkspace.manual.rules.find(entry => entry.id === process.env.SOURCE_RULE_ID);
      assert(authorRule, 'SOURCE_RULE_ID must select an existing rule.');
      await page.locator('#fileInput').setInputFiles(process.env.AUTHORING_PACKAGE_PATH);
      await page.waitForFunction(id => window.__session.workspace.manual.component.contractId === id, authorWorkspace.manual.component.contractId);
      await page.locator('#ruleSearch').fill(authorRule.id);
      await page.locator('.rule-card').click();
      assert(!(await page.locator('#saveRuleButton').isDisabled()));
      await page.locator('#ruleStatus').selectOption('reviewed', { force: true });
      await page.locator('#saveRuleButton').click();
      await page.waitForFunction(id => window.__session.workspace.manual.rules.find(rule => rule.id === id)?.status === 'reviewed', authorRule.id);
      const authorSaved = await page.evaluate(() => window.__session.workspace);
      assert.deepEqual(authorSaved.manual.rules.find(entry => entry.id === authorRule.id), { ...authorRule, status: 'reviewed' });
      assert.deepEqual(authorSaved.manual.targets, authorWorkspace.manual.targets);
      assert.deepEqual(authorSaved.manual.componentDependencies, authorWorkspace.manual.componentDependencies);
      assert.deepEqual(authorSaved.dependencyContracts, authorWorkspace.dependencyContracts);
      assert.equal(core.compileManualSource(authorSaved.manual, authorSaved.variantEvidence, authorSaved.dependencyContracts).issues.filter(issue => issue.level === 'error').length, 0);
      assert.deepEqual(fs.readFileSync(process.env.AUTHORING_PACKAGE_PATH), originalBytes);
      console.log('PASS: optional local package reviewed edit changes only the rule status, preserving source targets, constraints, pins and dependency closure; archive bytes unchanged.');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: offline existing edit/review, new-rule and missing-target guards, asynchronous preview without rebinding, target/pin preservation, ZIP roundtrip and retained-preview import message.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

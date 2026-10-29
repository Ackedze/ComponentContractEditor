const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const core = require('../dist/core.cjs');

// The caller supplies a local package; private captures are never test fixtures.
(async () => {
  assert(process.env.AUTHORING_PACKAGE_PATH, 'AUTHORING_PACKAGE_PATH is required.');
  const bytes = fs.readFileSync(process.env.AUTHORING_PACKAGE_PATH);
  const unpack = async value => (await core.readZip(value)).map(entry => ({name: entry.name, text: core.zipEntryText(entry)}));
  const before = core.importWorkspace(await unpack(bytes));
  const rule = before.manual.rules.find(rule => rule.constraints.some(c => c.type === 'instanceReplacementDomain'));
  assert(rule, 'The package must contain a native replacement domain.');
  const browser = await chromium.launch({headless: true, ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}, acceptDownloads: true});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => window.addEventListener('message', event => {
      if (event.data?.pluginMessage?.type === 'save-session') window.__session = event.data.pluginMessage.session;
    }));
    await page.goto('file://' + path.resolve(__dirname, '../dist/ui.html'));
    await page.locator('#fileInput').setInputFiles(process.env.AUTHORING_PACKAGE_PATH);
    await page.waitForFunction(id => window.__session?.workspace.manual.component.componentId === id, before.manual.component.componentId);
    await page.locator('#ruleSearch').fill(rule.id);
    await page.locator('.rule-card').click();
    assert.equal(await page.locator('#constraintType').inputValue(), 'instanceReplacementDomain');
    assert.equal(await page.locator('#instanceReplacementDomain').isVisible(), false);
    assert.equal(await page.locator('#saveRuleButton').isDisabled(), false);
    await page.locator('#rationale').fill(rule.rationale + ' [UI preservation check]');
    for (const width of [1440, 960]) {
      await page.setViewportSize({width, height: 1000});
      await page.locator('#constraintSection').scrollIntoViewIfNeeded();
      assert.match(await page.locator('#constraintFields').textContent(), /Допустимые замены сохранены из пакета/);
      const bounds = await page.locator('#constraintFields').evaluate(element => ({width: element.clientWidth, content: element.scrollWidth}));
      assert(bounds.content <= bounds.width + 1, 'Replacement summary must wrap inside the form.');
      if (process.env.ARTIFACT_DIR) await page.locator('#constraintSection').screenshot({path: path.join(process.env.ARTIFACT_DIR, `replacement-${width}.png`)});
    }
    await page.locator('#saveRuleButton').click();
    await page.waitForFunction(id => window.__session.workspace.manual.rules.find(rule => rule.id === id)?.rationale.endsWith('[UI preservation check]'), rule.id);
    const saved = await page.evaluate(() => window.__session.workspace.manual);
    const savedRule = saved.rules.find(entry => entry.id === rule.id);
    assert.equal(savedRule.rationale, rule.rationale + ' [UI preservation check]');
    for (const key of ['constraints', 'controlPaths', 'targetId', 'targetScope', 'capability', 'permission', 'severity', 'status', 'ownership', 'sourceRefs']) assert.deepEqual(savedRule[key], rule[key]);
    for (const [key, value] of Object.entries(rule.applicability)) assert.deepEqual(savedRule.applicability[key], value);
    // Editor materializes empty/default applicability fields; assert the actual IR remains exact.
    const recompiled = core.compileManualSource(saved, before.variantEvidence).contract;
    const project = contract => contract.rules.map(({ruleId, select, when, assert, severity, unknownPolicy}) => ({ruleId, select, when, assert, severity, unknownPolicy}));
    assert.deepEqual(project(recompiled), project(before.compiledInput));
    assert.deepEqual(saved.targets, before.manual.targets);
    const download = page.waitForEvent('download');
    await page.locator('#exportButton').click();
    const exported = await download;
    const reopened = core.importWorkspace(await unpack(fs.readFileSync(await exported.path())));
    assert.deepEqual(reopened.manual, saved);
    assert.deepEqual(reopened.manual.rules.find(entry => entry.id === rule.id).constraints, rule.constraints);
    assert.equal(reopened.compiledInput.runtimePolicy.nativeInstanceReplacementsVersion, 1);
    assert.deepEqual(errors, []);
    assert.deepEqual(fs.readFileSync(process.env.AUTHORING_PACKAGE_PATH), bytes);
    console.log('PASS: native replacement domain survives open/edit/save/export/reopen with exact constraints, targets and control paths; two viewport summaries wrap.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});

// Local download integration; original contract archives are read-only.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../dist/core.cjs');

const editor = path.resolve(__dirname, '..');
const packages = path.resolve(editor, '../../shared/design-system_ab/experiments/current-contract-packages');
const unpack = async bytes => (await core.readZip(bytes)).map(entry => ({ name: entry.name, text: core.zipEntryText(entry) }));

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    for (const filename of ['CorporateContent.component-contract.zip', 'CorporateContent.mobile-web.component-contract.zip']) {
      const page = await browser.newPage({ acceptDownloads: true });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const archive = path.join(packages, filename);
      const original = core.importWorkspace(await unpack(fs.readFileSync(archive)));
      await page.goto('file://' + path.join(editor, 'dist/ui.html'));
      await page.locator('#fileInput').setInputFiles(archive);
      await page.waitForFunction(() => !document.getElementById('exportButton').disabled);
      const pendingDownload = page.waitForEvent('download');
      await page.locator('#exportButton').click();
      const download = await pendingDownload;
      assert.equal(download.suggestedFilename(), filename);
      const exported = await unpack(fs.readFileSync(await download.path()));
      const reopened = core.importWorkspace(exported);
      assert.deepEqual(reopened.manual, original.manual);
      const expectedCompiled = JSON.parse(JSON.stringify(core.buildExportBundle(original.manual, original.variantEvidence, original.dependencyContracts).compiled));
      assert.deepEqual(reopened.compiledInput, expectedCompiled);
      assert.deepEqual(errors, []);
      console.log(filename + ': download name and manual/compiled roundtrip verified');
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

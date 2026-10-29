const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const esbuild = require('esbuild');

const source = esbuild.buildSync({
  entryPoints: [path.resolve(__dirname, '../src/export-file-name.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  write: false,
}).outputFiles[0].text;
const namingModule = { exports: {} };
new Function('module', 'exports', source)(namingModule, namingModule.exports);
const { componentContractFilename } = namingModule.exports;
const component = { family: 'CorporateContent', contractId: 'corporate-content.desktop', platform: 'desktop', platforms: ['desktop'] };

test('desktop and mobile archives keep the family name and cannot overwrite each other by default', () => {
  const desktop = componentContractFilename(component);
  const mobile = componentContractFilename({ ...component, contractId: 'corporate-content.mobile-web', platform: 'mobile-web', platforms: ['mobile-web'] });
  assert.equal(desktop, 'CorporateContent.component-contract.zip');
  assert.equal(mobile, 'CorporateContent.mobile-web.component-contract.zip');
  assert.notEqual(desktop, mobile);
});

test('a package with several platforms is named by its full scope, independent of preview and platform order', () => {
  const all = { ...component, platforms: ['mobile-web', 'desktop', 'mobile-web'] };
  const before = JSON.stringify(all);
  assert.equal(componentContractFilename(all), 'CorporateContent.desktop.mobile-web.component-contract.zip');
  assert.equal(componentContractFilename({ ...all, platform: 'mobile-web', platforms: ['desktop', 'mobile-web'] }), componentContractFilename(all));
  assert.equal(JSON.stringify(all), before);
});

test('empty platform lists use the declared platform and universal packages keep their family name', () => {
  assert.equal(componentContractFilename({ ...component, platform: 'mobile-web', platforms: [] }), 'CorporateContent.mobile-web.component-contract.zip');
  assert.equal(componentContractFilename({ ...component, platform: 'universal', platforms: ['universal'] }), 'CorporateContent.component-contract.zip');
});

test('filename delimiters are sanitized while case is retained and empty names have a fallback', () => {
  assert.equal(componentContractFilename({ ...component, family: 'Corporate/Content' }), 'Corporate-Content.component-contract.zip');
  assert.equal(componentContractFilename({ ...component, family: '  Amount Styles  ' }), 'Amount-Styles.component-contract.zip');
  assert.equal(componentContractFilename({ ...component, family: '', contractId: 'shared-component' }), 'shared-component.component-contract.zip');
  assert.equal(componentContractFilename({ ...component, family: '', contractId: '' }), 'Component.component-contract.zip');
});

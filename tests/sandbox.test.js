const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');

const shaBundle = esbuild.buildSync({
  entryPoints: [path.join(__dirname, '../src/vendor/sha256.ts')],
  bundle: true, write: false, format: 'iife', globalName: 'sandboxHash', target: 'es2019',
}).outputFiles[0].text;
const pluginBundle = fs.readFileSync(path.join(__dirname, '../dist/code.js'), 'utf8');
const environments = [
  ['absent', {}],
  ['non-constructible', { TextEncoder: () => { throw new Error('TextEncoder must not be used'); } }],
];

for (const [environment, globals] of environments) {
  test(`SHA-256 matches Node UTF-8 without TextEncoder (${environment})`, () => {
    const sandbox = vm.createContext({ ...globals });
    vm.runInContext(shaBundle, sandbox);
    const inputs = [
      '', 'abc', '\0', 'Button / Кнопка / 填充 / 🔒 / 𝄞',
      '\ud800', '\udfff', '\ud800A', 'A\udfff', '\ud800\ud800\udfff',
      '\udbff\udfff', '\udfff\ud800', 'е\u0301',
      ...[55, 56, 63, 64, 65, 127, 128, 129, 10000].map(n => 'a'.repeat(n)),
      'Привет 🌍'.repeat(1000),
      Array.from({ length: 65536 }, (_, code) => String.fromCharCode(code)).join(''),
      Array.from({ length: 4096 }, (_, i) => String.fromCodePoint(0x10000 + i * 251)).join(''),
    ];
    for (const input of inputs) {
      assert.equal(sandbox.sandboxHash.sha256Hex(input),
        crypto.createHash('sha256').update(input, 'utf8').digest('hex'));
    }
  });

  for (const changedChild of [false, true]) {
    test(`main plugin captures strict baseline without TextEncoder (${environment}, changed child: ${changedChild})`, async () => {
      const messages = [];
      const createdPages = [];
      const createdReferences = [];
      const page = { type: 'PAGE', id: 'page', parent: null, selection: [] };
      const set = { type: 'COMPONENT_SET', key: 'button-set', componentPropertyDefinitions: {} };
      const iconMain = { id: 'icon-main', key: 'icon-key', parent: null };
      const main = { id: 'button-main', key: 'button-key', parent: set };
      const makeInstance = (id, parent, actual) => {
        const root = {
          id, name: '[D] Кнопка', type: 'INSTANCE', parent,
          visible: true, width: 100, height: 56, opacity: actual ? 0.5 : 1,
          resolvedVariableModes: {}, componentProperties: {},
          getMainComponentAsync: async () => main,
          exportAsync: async () => new Uint8Array([1, 2, 3]),
          remove() { this.removed = true; },
        };
        const icon = {
          id: `${id}:icon`, name: 'Иконка 🔒', type: 'INSTANCE', parent: root,
          visible: true, componentProperties: {},
          getMainComponentAsync: async () => actual && changedChild
            ? { ...iconMain, id: 'other-main', key: 'other-key' } : iconMain,
        };
        icon.children = [{ id: `${id}:vector`, name: 'Контур', type: 'VECTOR', parent: icon, visible: true }];
        root.children = [icon];
        return root;
      };
      main.createInstance = () => {
        const reference = makeInstance('reference', null, false);
        createdReferences.push(reference);
        return reference;
      };
      const subject = makeInstance('subject', page, true);
      page.selection = [subject];
      const figma = {
        mixed: Symbol('mixed'), fileKey: 'fixture-file', root: { name: 'Sandbox fixture' }, currentPage: page,
        ui: { postMessage: message => messages.push(message) },
        showUI() {}, on() {},
        base64Encode: bytes => Buffer.from(bytes).toString('base64'),
        createPage() {
          const temporary = {
            type: 'PAGE', id: 'temporary', parent: null,
            appendChild(node) { node.parent = this; },
            remove() { this.removed = true; },
          };
          createdPages.push(temporary);
          return temporary;
        },
      };
      const sandbox = vm.createContext({ ...globals, figma, __html__: '' });
      vm.runInContext(pluginBundle, sandbox);
      await figma.ui.onmessage({
        type: 'test-selection', requestId: 'sandbox-test', componentKey: main.key,
        acceptedComponentKeys: [], allowedComponentProperties: [], platform: 'desktop',
        manualSourceHash: 'unchanged-manual-hash',
      });
      assert.deepEqual(messages.filter(m => m.type === 'plugin-error'), []);
      const result = messages.find(m => m.type === 'selection-test-result');
      assert.ok(result, 'selection must return a snapshot, not a plugin error');
      assert.equal(result.matchedBaselineNodes, changedChild ? 1 : 3);
      assert.equal(result.unmatchedBaselineNodeIds.length, changedChild ? 2 : 0);
      assert.equal(result.snapshot.nodes[0].appearance.opacity, 0.5);
      assert.equal(result.snapshot.nodes[0].baseline.effective.appearance.opacity, 1);
      if (changedChild) {
        for (const node of result.snapshot.nodes.slice(1)) {
          assert.equal(Object.keys(node.baseline.effective).length, 0);
          assert.equal(node.baselineProvenance.reason, 'component-identity-changed');
        }
      }
      assert.equal(result.snapshot.variantReference.complete, true);
      assert.equal(result.manualSourceHash, 'unchanged-manual-hash');
      assert.equal(createdPages[0].removed, true);
      assert.equal(createdReferences[0].removed, true);
      assert.equal(subject.removed, undefined);
    });
  }
}

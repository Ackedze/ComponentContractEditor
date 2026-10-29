const test=require('node:test'),assert=require('node:assert/strict'),editor=require('../dist/core.cjs'),apollo=require('../../Apollo/packages/component-contract-core/dist/core.cjs');
const {scenario}=require('../../Apollo/packages/component-contract-core/tests/helpers/direct-code-group.cjs'),{ownBindings}=require('../../Apollo/packages/component-contract-core/tests/helpers/code-passport.cjs');
test('Editor reexports the same typed schema/compiler and lossless exporter without promoting Code Draft',async()=>{
 const f=ownBindings(scenario()),e=editor.buildExportBundle(f.manual,f.evidence,[f.childContract]),a=apollo.buildExportBundle(f.manual,f.evidence,[f.childContract]);assert.deepEqual(e,a);assert.equal(e.compiled.status,'ready');assert.equal(e.compiled.facts.representations.at(-1).status,'draft');
 const files=(await editor.readZip(editor.buildAuthoringZip(e))).map(z=>({name:z.name,text:editor.zipEntryText(z)})),reopened=editor.importWorkspace(files);
 assert.deepEqual(reopened.manual,f.manual);assert.deepEqual(reopened.manual.semanticApi,f.manual.semanticApi);assert.equal(editor.stableHash(reopened.compiledInput),editor.stableHash(e.compiled));
 const legacy=JSON.parse(JSON.stringify(e.compiled));delete legacy.runtimePolicy.crossRepresentationBindingsVersion;assert.equal(editor.dependencyPinIssue({componentId:legacy.package.componentId,revision:1,manualSourceHash:legacy.package.manualSourceHash,compiledHash:editor.stableHash(legacy)},legacy),'dependency-representation-unsupported');
});

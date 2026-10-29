const test=require('node:test'),assert=require('node:assert/strict');
const editor=require('../dist/core.cjs');const {fixture,clone}=require('../../Apollo/packages/component-contract-core/tests/helpers/declared-target.cjs');
const configured = require('../../Apollo/packages/component-contract-core/tests/helpers/declared-target-configuration.cjs');
const publicSwap = require('../../Apollo/packages/component-contract-core/tests/helpers/declared-public-swap.cjs');
test('Editor reopens v2 public swap pins and retains slot and host constraints', async () => {
 const f=publicSwap.fixture(editor), bundle=editor.buildExportBundle(f.manual,f.evidence);
 const files=(await editor.readZip(editor.buildAuthoringZip(bundle))).map(f=>({name:f.name,text:new TextDecoder().decode(f.data)}));
 const reopened=editor.importWorkspace(files,f.manual.component.contractId);
 const c=editor.buildExportBundle(reopened.manual,reopened.variantEvidence).compiled;
 assert.deepEqual(reopened.manual,f.manual);assert.deepEqual(c,bundle.compiled);
 publicSwap.swap(f,'left');publicSwap.swap(f,'right');
 assert(editor.prepareValidationSnapshot(f.snapshot,c).declaredTargetIdentitiesV1.targets.every(t=>t.status==='resolved'));
 assert(editor.evaluateCompiledContract(f.snapshot,c).evaluations.every(e=>e.classification==='compliant'));
 f.snapshot.nodes.find(n=>n.id==='right').bounds.height=32;
 assert(editor.evaluateCompiledContract(f.snapshot,c).evaluations.some(e=>e.ruleId==='synthetic.right-height.1.1'&&e.classification==='violation'));
});
test('Editor configuration identity survives ZIP roundtrip and public TEXT/BOOLEAN changes', async () => {
 const f = configured.fixture(editor), bundle = editor.buildExportBundle(f.manual, f.evidence);
 const files = (await editor.readZip(editor.buildAuthoringZip(bundle))).map(f => ({name:f.name,text:new TextDecoder().decode(f.data)}));
 const reopened = editor.importWorkspace(files,f.manual.component.contractId);
 assert.deepEqual(reopened.manual,f.manual);
 const c = editor.buildExportBundle(reopened.manual,reopened.variantEvidence).compiled;
 assert.deepEqual(c,bundle.compiled);
 configured.configure(f,'Public label',false);
 assert(editor.evaluateCompiledContract(f.snapshot,c).evaluations.every(e=>['compliant','not-applicable'].includes(e.classification)));
 configured.configure(f,'Public label',true);
 f.snapshot.nodes[2].text.fontSize=18;
 assert(editor.evaluateCompiledContract(f.snapshot,c).evaluations.some(e=>e.classification==='violation'));
});
test('private Editor export/import compiles explicit typed target opt-in with unchanged permissions',()=>{
 const f=fixture(editor),bundle=editor.buildExportBundle(f.manual,f.evidence);assert.equal(bundle.compiled.runtimePolicy.declaredTargetIdentityVersion,1);
 const workspace=editor.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(bundle.manual)},{name:'compiled/component-contract.v2.json',text:JSON.stringify(bundle.compiled)}]);
 assert.deepEqual(editor.compileManualSource(workspace.manual,workspace.variantEvidence).contract,bundle.compiled);
 assert.deepEqual(bundle.manual.rules,f.manual.rules);assert.equal(editor.evaluateCompiledContract(f.snapshot,bundle.compiled).evaluations[0].classification,'compliant');
 f.snapshot.nodes[2].visible=false;assert.equal(editor.evaluateCompiledContract(f.snapshot,bundle.compiled).evaluations[0].classification,'violation');
});
test('private Editor fails closed on unsupported/inconsistent source and runtime marker',()=>{const f=fixture(editor),c=f.compile().contract;for(const version of [4,undefined]){const bad=clone(c);bad.runtimePolicy.declaredTargetIdentityVersion=version;assert.throws(()=>editor.evaluateCompiledContract(f.snapshot,bad),{code:'DECLARED_TARGET_IDENTITY_UNSUPPORTED'});}f.manual.metadata.declaredTargetIdentityVersion=4;assert.throws(()=>editor.buildExportBundle(f.manual,f.evidence),{code:'DECLARED_TARGET_IDENTITY_UNSUPPORTED'});});

test('Editor exports and reopens explicit portable target bindings without changing permission',()=>{
 const f=fixture(editor);f.manual.metadata.declaredTargetIdentityVersion=2;
 for(const t of f.manual.targets)for(const b of t.identityBindingsV1)b.portableReferenceHash=editor.portableDeclaredTargetReferenceHash(f.snapshot.variantReference);
 const bundle=editor.buildExportBundle(f.manual,f.evidence);
 assert.equal(bundle.compiled.runtimePolicy.declaredTargetIdentityVersion,2);
 assert.equal(bundle.compiled.package.sourceExportVersion,'component-contract-editor@0.2.93');
 const imported=editor.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(bundle.manual)},{name:'compiled/component-contract.v2.json',text:JSON.stringify(bundle.compiled)}],f.manual.component.contractId);
 assert.deepEqual(imported.manual,f.manual);
 assert.deepEqual(editor.compileManualSource(imported.manual,imported.variantEvidence).contract,bundle.compiled);
 assert.equal(editor.evaluateCompiledContract(f.snapshot,bundle.compiled).evaluations[0].classification,'compliant');
});

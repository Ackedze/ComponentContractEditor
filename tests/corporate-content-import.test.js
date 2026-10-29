const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../dist/core.cjs');
const ds=path.resolve(__dirname,'../../../shared/design-system_ab');
const archive=path.join(ds,'experiments/web-corp/CorporateContent/authoring/corporate-content.component-contract.zip');
const sourceDir=path.join(ds,'JSONS/web/components/web-corp/CorporateContent');
const unpack=async bytes=>(await core.readZip(bytes)).map(entry=>({name:entry.name,text:core.zipEntryText(entry)}));

test('existing CorporateContent draft ZIP preserves rules and restores compact anatomy',async()=>{
 const files=await unpack(fs.readFileSync(archive)),workspace=core.importWorkspace(files);
 const sourceManual=JSON.parse(files.find(entry=>entry.name.endsWith('contract.manual.json')).text);
 assert.equal(workspace.manual.component.contractId,'corporate-content.desktop');
 assert(sourceManual.rules.length>0);
 assert.deepEqual(workspace.manual.rules,sourceManual.rules);
 assert.deepEqual(workspace.manual.targets,sourceManual.targets);
 assert.equal(workspace.hasVariantEvidence,true);
 assert(workspace.anatomy.length>1);
 assert(workspace.anatomy.some(node=>node.name==='[D] Body'));
 assert(!workspace.warnings.some(w=>w.startsWith('No structure signature found')));
});

test('reexport with original Athena sources reopens with full anatomy and unchanged manual',async()=>{
 const original=await unpack(fs.readFileSync(archive));
 const athena=['agent-context.json','audit-mapping.json','composition-contract.json','contract.generated.json','contract.overrides.json','examples.json','rules.json','semantic-targets.json']
  .map(name=>({name,text:fs.readFileSync(path.join(sourceDir,name),'utf8')}));
 const first=core.importWorkspace([...original,...athena]);
 const zip=core.buildAuthoringZip(core.buildExportBundle(first.manual,first.variantEvidence,first.dependencyContracts),[...original,...athena]);
 const exported=await unpack(zip),second=core.importWorkspace(exported);
 assert.equal(exported.length,12);
 assert(exported.some(entry=>entry.name==='corporate-content/source/contract.generated.json'));
 assert.deepEqual(second.manual,first.manual);
 assert.deepEqual(second.manual.rules,JSON.parse(original.find(entry=>entry.name.endsWith('contract.manual.json')).text).rules);
 assert.deepEqual(second.anatomy,first.anatomy);
 assert.equal(second.hasVariantEvidence,true);
 assert.equal(second.activeContractId,'corporate-content.desktop');
 assert(!second.warnings.some(w=>w.startsWith('No structure signature found')));
});

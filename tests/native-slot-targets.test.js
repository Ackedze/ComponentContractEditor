const test=require('node:test'),assert=require('node:assert/strict'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));
const property='Body#1:0';
function scenario(){
 const manual=clone(fixture.manual);manual.component.componentKey='host';
 manual.generation.profiles=[];manual.componentDependencies=[];manual.controlPorts=[];manual.semanticApi=[];
 manual.representations=[{id:'figma:host',kind:'figma',platform:'desktop',status:'verified',locator:{componentKey:'host'}}];
 manual.targets=[{id:'root',semanticRole:'root',label:'Root',pathHint:'Root',lineage:[],resolution:'resolved'},
  {id:'body',semanticRole:'body',label:'Body',pathHint:'Root / Body',lineage:['root'],resolution:'resolved'}];
 const template={...clone(fixture.manual.rules[0]),status:'reviewed',owner:'test',rationale:'Open native slot',
  applicability:{variants:'all',modes:'all',platforms:['desktop']},execution:{route:'auto'}};
 manual.rules=[{...template,id:'open-body',targetId:'body',targetScope:'self',capability:'composition.content',permission:'allowed',
  controlPaths:[{kind:'slot-api',target:'body',property,contentOwnership:'external',required:true,exclusive:true}],constraints:[]},
  {...template,id:'protect-host',targetId:'root',targetScope:'self-and-descendants',capability:'appearance.opacity',permission:'forbidden',
   boundaryPolicy:'component-owned@1',controlPaths:[],constraints:[{type:'propertyForbidden',fact:'appearance.opacity'}]}];
 const node=(id,name,type,parentId,order,path)=>({id,name,type,parentId,childIds:[],order,visible:true,
  semantic:{role:id,path},component:{propertyReferences:[],propertyReferenceBindings:{}},appearance:{opacity:1},
  baseline:{effective:{appearance:{opacity:1}}},unknownFacts:[]});
 const root=node('root','Root','INSTANCE',null,0,'Root'),body=node('body','Body','SLOT','root',0,'Root / Body'),placeholder=node('placeholder','Placeholder','FRAME','body',0,'Root / Body / Placeholder');
 root.childIds=['body'];body.childIds=['placeholder'];
 root.component={properties:{},propertyTypes:{[property]:'SLOT'},propertyReferences:[property],propertyReferenceBindings:{},identity:{componentKey:'host'}};
 body.component.propertyReferences=[property];body.component.propertyReferenceBindings.slotContentId=property;
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-30T15:00:00Z',selection:['root'],
  source:{rootNodeId:'live',pageId:'page',componentKey:'host',truncated:false,instanceIdentityVersion:1,propertyReferenceIdentityVersion:1},
  context:{platform:'desktop',modes:{},unknownFacts:[]},nodes:[root,body,placeholder]};
 const ref=clone(core.captureVariantReference(snapshot,'host',''));snapshot.variantReference=ref;
 const evidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:core.stableHash('native-slot-test'),
  structures:{shape:ref.nodes},variants:[{componentKey:'host',componentSetKey:'',structureId:'shape',properties:{}}]};
 const compiled=core.compileManualSource(manual,evidence);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 const prepare=()=>core.prepareValidationSnapshot(snapshot,compiled.contract);
 const run=()=>core.evaluateCompiledContract(snapshot,compiled.contract).evaluations.filter(e=>e.ruleId.startsWith('protect-host.'));
 return{manual,evidence,compiled,snapshot,prepare,run};
}
test('native SLOT proves an external payload boundary but not a child contract',()=>{
 const f=scenario(),raw=JSON.stringify(f.snapshot),prepared=f.prepare();
 assert.equal(prepared.nodes[1].slotBoundaryV1.evidence,'native-slot-content-reference');
 assert.equal(prepared.nodes[1].slotBoundaryV1.property,property);
 assert.equal(prepared.nodes[0].ruleScopeV1.local,true);assert.equal(prepared.nodes[1].ruleScopeV1.local,true);
 assert.equal(prepared.nodes[2].ruleScopeV1.local,false);
 assert.equal(JSON.stringify(f.snapshot),raw);
 assert.deepEqual(core.prepareValidationSnapshot(prepared,f.compiled.contract),prepared);
 assert.equal((f.compiled.contract.componentDependencies||[]).length,0);
});
test('arbitrary payload and multiple children do not inherit placeholder constraints; host and SLOT remain protected',()=>{
 const f=scenario(),body=f.snapshot.nodes[1],first=f.snapshot.nodes[2];
 first.name='Arbitrary';first.semantic.path='Root / Body / Arbitrary';first.appearance.opacity=.2;
 const second=clone(first);second.id='second';second.name='Section';second.order=1;second.semantic={role:'caller',path:'Root / Body / Section'};
 second.type='INSTANCE';second.component.identity={componentKey:'foreign-caller-component'};second.appearance.opacity=.4;
 body.childIds.push('second');f.snapshot.nodes.push(second);
 assert.equal(f.prepare().nodes[1].slotBoundaryV1.contentOwnership,'external');
 assert(!f.run().some(e=>['violation','human-review'].includes(e.classification)),JSON.stringify(f.run()));
 f.snapshot.nodes[0].appearance.opacity=.5;assert(f.run().some(e=>e.subjectNodeId==='root'&&e.classification==='violation'));
 body.appearance.opacity=.5;assert(f.run().some(e=>e.subjectNodeId==='body'&&e.classification==='violation'));
});
for(const [name,change] of [
 ['missing native anchor',f=>delete f.snapshot.nodes[1].component.propertyReferenceBindings.slotContentId],
 ['wrong native anchor',f=>f.snapshot.nodes[1].component.propertyReferenceBindings.slotContentId='Other#1'],
 ['wrong owner property type',f=>f.snapshot.nodes[0].component.propertyTypes[property]='BOOLEAN'],
 ['unknown native anchor',f=>f.snapshot.nodes[1].unknownFacts.push('component.propertyReferenceBindings.slotContentId')],
 ['unknown owner identity',f=>f.snapshot.nodes[0].unknownFacts.push('component.identity')],
 ['foreign owner identity',f=>f.snapshot.nodes[0].component.identity.componentKey='foreign'],
 ['incomplete reference',f=>f.snapshot.variantReference.complete=false],
 ['truncated capture',f=>f.snapshot.source.truncated=true],
 ['duplicate native consumer',f=>{const n=clone(f.snapshot.nodes[1]);n.id='duplicate';n.name='Other';n.childIds=[];n.order=1;n.semantic.path='Root / Other';f.snapshot.nodes[0].childIds.push(n.id);f.snapshot.nodes.push(n);}],
])test('native SLOT boundary fails closed: '+name,()=>{
 const f=scenario();change(f);assert.equal(f.prepare().nodes[1].slotBoundaryV1,undefined);
 assert(!f.run().every(e=>e.classification==='compliant'));
});
test('native boundary needs explicit author permission and compiler opt-in, not a matching name',()=>{
 const f=scenario();delete f.compiled.contract.runtimePolicy.nativeSlotTargetsVersion;
 assert.equal(f.prepare().nodes[1].slotBoundaryV1,undefined);
 const g=scenario();g.manual.rules[0].controlPaths[0].contentOwnership=undefined;
 g.compiled=core.compileManualSource(g.manual,g.evidence);
 assert.equal(core.prepareValidationSnapshot(g.snapshot,g.compiled.contract).nodes[1].slotBoundaryV1,undefined);
});
test('cached boundary cannot survive a failed recapture',()=>{
 const f=scenario();f.snapshot=f.prepare();f.snapshot.source.truncated=true;
 const prepared=core.prepareValidationSnapshot(f.snapshot,f.compiled.contract);
 assert.equal(prepared.nodes[1].slotBoundaryV1,undefined);
});
test('policy-only native slot cannot report a complete audit when its anchor is unproven',()=>{
 const f=scenario();f.manual.rules[1].targetScope='self';delete f.manual.rules[1].boundaryPolicy;
 f.compiled=core.compileManualSource(f.manual,f.evidence);
 const report=()=>core.buildEditorValidationReport(core.evaluateCompiledContract(f.snapshot,f.compiled.contract),f.compiled,f.manual,f.snapshot);
 assert.equal(report().editorCoverage.complete,true);
 delete f.snapshot.nodes[1].component.propertyReferenceBindings.slotContentId;
 const result=report();assert.equal(result.editorCoverage.complete,false);assert.equal(result.editorCoverage.notExecuted,1);
 assert(result.evaluations.some(e=>e.ruleId==='open-body'&&e.classification==='not-executed'));
});
test('nested native SLOT requires its explicit, identity-proven owner',()=>{
 const f=scenario(),root=f.snapshot.nodes[0],body=f.snapshot.nodes[1];
 const owner=clone(root);owner.id='owner';owner.name='Owner';owner.parentId='root';owner.semantic={role:'owner',path:'Root / Owner'};
 owner.childIds=['body'];owner.component.identity={componentKey:'nested-owner'};
 root.childIds=['owner'];root.component.propertyTypes={};root.component.propertyReferences=[];
 body.parentId='owner';body.semantic.path='Root / Owner / Body';
 f.snapshot.nodes[2].semantic.path='Root / Owner / Body / Placeholder';f.snapshot.nodes.push(owner);
 f.manual.targets[1].pathHint='Root / Owner / Body';f.manual.targets[1].lineage=['root','owner'];
 f.manual.targets.push({id:'owner',semanticRole:'owner',label:'Owner',pathHint:'Root / Owner',lineage:['root'],resolution:'resolved'});
 f.manual.rules[0].controlPaths[0].ownerTargetId='owner';
 f.snapshot.variantReference=clone(core.captureVariantReference(f.snapshot,'host',''));
 f.evidence.structures.shape=f.snapshot.variantReference.nodes;f.compiled=core.compileManualSource(f.manual,f.evidence);
 assert.deepEqual(f.compiled.issues.filter(i=>i.level==='error'),[]);
 let result=core.prepareValidationSnapshot(f.snapshot,f.compiled.contract);
 assert.equal(result.nodes[1].slotBoundaryV1.ownerTargetId,'owner');
 assert.equal(result.nodes[1].variantAvailability.targets.body.present,true);
 assert(!result.nodes[1].unknownFacts.includes('variantAvailability.targets.body.present'));
 owner.component.identity.componentKey='foreign';
 result=core.prepareValidationSnapshot(f.snapshot,f.compiled.contract);assert.equal(result.nodes[1].slotBoundaryV1,undefined);
});
test('native SLOT manual, compiler flag and boundary declaration round-trip without normative rewriting',async()=>{
 const f=scenario(),exported=core.buildAuthoringZip(core.buildExportBundle(f.manual,f.evidence));
 const files=(await core.readZip(exported)).map(entry=>({name:entry.name,text:core.zipEntryText(entry)}));
 const workspace=core.importWorkspace(files);
 assert.deepEqual(workspace.manual,f.manual);
 assert.equal(core.compileManualSource(workspace.manual,workspace.variantEvidence).contract.runtimePolicy.nativeSlotTargetsVersion,1);
});

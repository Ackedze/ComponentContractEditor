const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../dist/core.cjs');
const dir=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-corp/AmountStyles/authoring');
const manual=JSON.parse(fs.readFileSync(path.join(dir,'contract.manual.json')));
const generated=JSON.parse(fs.readFileSync(path.join(dir,'evidence/contract.generated.json')));
const clone=v=>JSON.parse(JSON.stringify(v));
const token='53f842b1771349c5dca692351edfc422e8f081b5',other='1'.repeat(40);
const roles=['sign','major-text','minor-text','currency-text'];
const evidence=core.extractVariantEvidence(generated.contracts,true);

// Synthetic observations from pinned Athena topology. NOT live Figma acceptance.
function fixture(index=0) {
 const m=clone(manual);m.rules=m.rules.filter(r=>r.constraints.some(c=>c.type==='bindingConsistency'));delete m.componentDependencies;
 const v=evidence.variants[index],shape=evidence.structures[v.structureId],rep=m.representations.find(r=>r.locator.componentKey===v.componentSetKey);
 const styles=evidence.textBindings.find(b=>b.componentKey===v.componentKey).styleKeysByPath;
 const ids=Object.fromEntries(shape.map((n,i)=>[n.path,'n'+i]));
 const rootName=rep.id.includes('paragraph')?'🔒 AmountParagraph':rep.id.includes('desktop')?'🔒 [D] AmountHeadline':'🔒 [M] AmountHeadline';
 const nodes=shape.map((n,i)=>{
  const hint=m.targets.find(t=>(t.representationHints.find(h=>h.representationId===rep.id)?.pathHint||'').split(' / ').slice(1).join(' / ')===n.path);
  const parentPath=n.path.split(' / ').slice(0,-1).join(' / ');
  return {id:ids[n.path],parentId:n.path?ids[parentPath]:null,childIds:shape.filter(x=>x.path&&x.path.split(' / ').slice(0,-1).join(' / ')===n.path).map(x=>ids[x.path]),
   order:i,name:n.path?n.path.split(' / ').pop():rootName,type:n.path?n.type:'INSTANCE',visible:true,unknownFacts:[],
   semantic:{role:hint?.semanticRole||'unowned-'+i,path:[rootName,n.path].filter(Boolean).join(' / ')},
   component:{properties:n.path?{}:{Style:v.properties.Style,Operation:true},propertyTypes:n.path?{}:{Style:'VARIANT',Operation:'BOOLEAN'},propertyReferences:[],
    ...(n.path?(n.type==='INSTANCE'?{identity:{componentKey:core.stableHash(n.path).slice(0,40)}}:{}):{identity:{componentKey:v.componentKey,componentSetKey:v.componentSetKey}})},
   appearance:{fill:[{type:'SOLID',visible:true,opacity:1,tokenId:'VariableID:'+token+'/1:2'}],typography:{styleId:styles[n.path]||''}},
   text:{characters:n.type==='TEXT'?'123':''},layout:{},bounds:{width:40,height:20}};
 });
 const snapshot={schemaVersion:'apollo.preview-snapshot.v1',source:{componentKey:v.componentKey,componentSetKey:v.componentSetKey,truncated:false},selection:[ids['']],context:{platform:rep.platform,modes:{},unknownFacts:[]},nodes};
 snapshot.variantReference=core.captureVariantReference(snapshot,v.componentKey,v.componentSetKey);
 const compiled=core.compileManualSource(m,evidence);
 assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 const contract=core.prepareAuthoringPreviewContract(compiled.contract);
 const run=()=>core.evaluateCompiledContract(snapshot,contract).evaluations;
 const node=role=>snapshot.nodes.find(n=>n.semantic.role===role);
 return {manual:m,snapshot,compiled,contract,run,node,v};
}
const result=(f,suffix)=>f.run().find(e=>e.ruleId.includes('.'+suffix+'.'));
for(let i=0;i<19;i++)test(`pinned preset variant ${i+1}: bindings agree with selected library variant`,()=>{
 const f=fixture(i);assert.equal(f.run().length,3);assert.ok(f.run().every(e=>e.classification==='compliant'),JSON.stringify({availability:core.prepareValidationSnapshot(f.snapshot,f.contract).nodes[0].variantAvailability,expected:core.prepareValidationSnapshot(f.snapshot,f.contract).nodes[0].selectedTextBindingV1}));
});
test('all parts may switch to the same non-default token; IDs and labels do not define identity',()=>{
 const f=fixture();roles.forEach((r,i)=>f.node(r).appearance.fill[0].tokenId='VariableID:'+other+'/'+i+':99');
 assert.equal(result(f,'parts-share-color').classification,'compliant');
 f.node('minor-text').appearance.fill[0].tokenId='VariableID:'+token+'/77:1';
 assert.equal(result(f,'parts-share-color').classification,'violation');
});
test('raw RGB, equal RGB with another token, detach and mixed range bindings fail',()=>{
 for(const change of [n=>delete n.appearance.fill[0].tokenId,n=>n.appearance.fill[0].tokenId='VariableID:'+other+'/1:2',
  n=>n.textFillEvidenceV1={version:1,segments:[{start:0,end:1,paints:n.appearance.fill},{start:1,end:3,paints:[{...n.appearance.fill[0],tokenId:'VariableID:'+other+'/1:2'}]}]}]) {
  const f=fixture();change(f.node('major-text'));assert.equal(result(f,'parts-share-color').classification,'violation');
 }
});
test('same wrong Text Style passes equality but fails selected-variant reference',()=>{
 const f=fixture();roles.forEach((r,i)=>f.node(r).appearance.typography.styleId='S:'+other+','+i+':1');
 assert.equal(result(f,'parts-share-text-style').classification,'compliant');
 assert.equal(result(f,'manual-text-style-is-layer-property').classification,'violation');
});
test('single foreign style and detach are detected independently of font metrics',()=>{
 for(const style of ['','S:'+other+',1:2']){const f=fixture();f.node('minor-text').appearance.typography.styleId=style;
  assert.equal(result(f,'parts-share-text-style').classification,'violation');assert.equal(result(f,'manual-text-style-is-layer-property').classification,'violation');}
});
test('hidden parent/text is excluded, unknown visibility is never accepted',()=>{
 for(const role of ['minor','minor-text']) {const f=fixture();f.node(role).visible=false;f.node('minor-text').appearance.typography.styleId='';delete f.node('minor-text').appearance.fill[0].tokenId;
  assert.ok(f.run().every(e=>e.classification==='compliant'));}
 const f=fixture();delete f.node('minor-text').visible;assert.ok(f.run().every(e=>e.classification==='human-review'));
});
test('external Addon is not collected by text type or matching name',()=>{
 const f=fixture(),addon=f.node('addon');const id='external';addon.childIds.push(id);
 f.snapshot.nodes.push({id,parentId:addon.id,childIds:[],order:999,name:'Major',type:'TEXT',visible:true,semantic:{role:'external',path:addon.semantic.path+' / Major'},component:{propertyReferences:[]},appearance:{fill:[],typography:{styleId:''}},text:{characters:'addon'},unknownFacts:[]});
 // Explicit external subtree is not one of the four declared targets. New shape
 // is captured as independent reference for this isolated scope regression.
 const shape=core.captureVariantReference(f.snapshot,f.v.componentKey,f.v.componentSetKey);
 f.snapshot.variantReference=shape;const e=clone(evidence),idShape=core.stableHash(shape.nodes);e.structures[idShape]=shape.nodes;e.variants[0].structureId=idShape;
 f.contract=core.prepareAuthoringPreviewContract(core.compileManualSource(f.manual,e).contract);
 assert.ok(core.evaluateCompiledContract(f.snapshot,f.contract).evaluations.every(e=>e.classification==='compliant'));
});
test('unknown local IDs, missing or malformed range capture remain incomplete',()=>{
 for(const change of [n=>n.appearance.fill[0].tokenId='VariableID:123:4',n=>n.textFillEvidenceV1={version:1},
  n=>n.textFillEvidenceV1={version:1,segments:[{start:1,end:3,paints:n.appearance.fill}]}]) {
  const f=fixture();change(f.node('major-text'));assert.equal(result(f,'parts-share-color').classification,'human-review');
 }
 for(const change of [n=>n.appearance.typography.styleId='123:4',n=>n.textStyleEvidenceV1={version:1},n=>n.unknownFacts.push('textStyleEvidenceV1')]){
  const f=fixture();change(f.node('major-text'));assert.equal(result(f,'parts-share-text-style').classification,'human-review');
 }
});
test('file-local IDs resolve by captured key; style instance suffixes are ignored',()=>{
 const f=fixture(),n=f.node('major-text'),key=n.appearance.typography.styleId.slice(2).split(',')[0];
 n.appearance.typography.styleId='123:4';n.textStyleEvidenceV1={version:1,keysById:{'123:4':key},segments:[{start:0,end:3,styleId:'123:4'}]};
 n.textFillEvidenceV1={version:1,keysById:{'VariableID:123:4':token},segments:[{start:0,end:3,paints:[{...n.appearance.fill[0],tokenId:'VariableID:123:4'}]}]};
 assert.ok(f.run().every(e=>e.classification==='compliant'));
});
test('stale derived identities are recomputed, raw capture remains unchanged',()=>{
 const f=fixture(),before=JSON.stringify(f.snapshot),p=core.prepareValidationSnapshot(f.snapshot,f.contract);
 assert.deepEqual(core.prepareValidationSnapshot(p,f.contract),p);assert.equal(JSON.stringify(f.snapshot),before);
 p.nodes.find(n=>n.semantic.role==='major-text').appearance.fill[0].tokenId='VariableID:'+other+'/1:2';
 assert.equal(core.evaluateCompiledContract(p,f.contract).evaluations.find(e=>e.ruleId.includes('.parts-share-color.')).classification,'violation');
});
test('missing/duplicate variant binding reference cannot fall back to the actual style',()=>{
 for(const mutate of [c=>delete c.facts.variantEvidence.textBindings,c=>c.facts.variantEvidence.textBindings.push(clone(c.facts.variantEvidence.textBindings[0]))]){
  const f=fixture();mutate(f.contract);assert.equal(result(f,'manual-text-style-is-layer-property').classification,'human-review');
 }
});
test('invalid manual scopes/kinds/roles are rejected at reviewed save',()=>{
 for(const change of [c=>c.bindingKind='rgb',c=>c.targetRoles=['missing'],c=>c.targetRoles.push(c.targetRoles[0]),c=>c.visibleOnly=false,c=>c.bindingReference='default']){
  const f=fixture();change(f.manual.rules[0].constraints[0]);assert.ok(core.validateManualSource(f.manual).some(i=>i.level==='error'));
 }
});
test('missing pinned reference excludes the selected-style rule at compilation',()=>{
 const f=fixture(),e=clone(evidence);delete e.textBindings;
 const c=core.compileManualSource(f.manual,e);
 assert.ok(c.issues.some(i=>i.code==='TEXT_BINDING_REFERENCE_MISSING'));
 assert.equal(c.contract.nonExecutableRules.length,1);
});
test('empty Custom text keeps its binding but has no content restriction',()=>{
 const f=fixture(),n=f.node('currency-text');n.text.characters='';
 n.textStyleEvidenceV1={version:1,segments:[]};n.textFillEvidenceV1={version:1,segments:[],emptyPaints:n.appearance.fill};
 assert.ok(f.run().every(e=>e.classification==='compliant'));
});
test('a missing/ambiguous target, invalid node type or foreign root never gives a complete pass',()=>{
 for(const mutate of [f=>f.snapshot.source.componentKey='foreign',f=>f.node('major-text').name='renamed-unmapped',
  f=>f.node('major-text').type='FRAME',f=>delete f.node('major-text').semantic,
  f=>f.snapshot.source.truncated=true]) {
  const f=fixture();mutate(f);assert.ok(f.run().some(e=>e.classification!=='compliant'));
 }
});
test('range color capture resolves duplicate local IDs once and keeps failures explicit',async()=>{
 let calls=0;const paints=[{type:'SOLID',visible:true,opacity:1,tokenId:'VariableID:123:4'}];
 const native={fills:paints,getStyledTextSegments:()=>[{start:0,end:1,fills:paints},{start:1,end:3,fills:paints}]};
 const e=await core.captureTextFillEvidence(native,x=>x,async()=>{calls++;return token});assert.equal(calls,1);assert.equal(e.keysById['VariableID:123:4'],token);
 const f=fixture();f.node('major-text').textFillEvidenceV1=e;assert.equal(result(f,'parts-share-color').classification,'compliant');
 f.node('major-text').textFillEvidenceV1=await core.captureTextFillEvidence({},x=>x,async()=>undefined);
 assert.equal(result(f,'parts-share-color').classification,'human-review');
});

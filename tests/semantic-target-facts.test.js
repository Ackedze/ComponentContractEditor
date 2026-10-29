const test=require('node:test'),assert=require('node:assert/strict'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));
// Synthetic component, deliberately not named Button/Hint; tests the shared mechanism.
function scenario(){
 const manual=clone(fixture.manual);manual.generation.profiles=[];manual.controlPorts=[];
 manual.component.componentKey='set';manual.componentDependencies=[];
 manual.representations=[{id:'figma:test',kind:'figma',platform:'desktop',status:'verified',locator:{componentSetKey:'set'}}];
 const nodes=[['root',null,'Widget','INSTANCE'],['container','root','Container','FRAME'],['badge','container','Badge','TEXT']]
  .map(([id,parentId,name,type],order)=>({id,parentId,name,type,order,childIds:[],visible:true,semantic:{role:id,path:order===0?'Widget':order===1?'Widget / Container':'Widget / Container / Badge'},unknownFacts:[]}));
 nodes.forEach(n=>{if(n.parentId)nodes.find(p=>p.id===n.parentId).childIds.push(n.id)});
 nodes[0].component={identity:{componentKey:'variant',componentSetKey:'set'},properties:{'Enabled#1':true}};
 manual.targets=[nodes[0],nodes[2]].map(n=>({id:'target.'+n.id,semanticRole:n.id,label:n.name,lineage:n.semantic.path.split('/').slice(0,-1).map(s=>core.slug(s.trim())),pathHint:n.semantic.path,resolution:'resolved',structuralFingerprint:core.stableHash({type:n.type,path:n.semantic.path,order:n.order}).slice(0,16)}));
 manual.semanticApi=[{id:'badgeEnabled',kind:'state',valueType:'boolean',bindings:[{representationId:'figma:test',path:'component.properties.Enabled#1'}]},
  {id:'badgeVisible',kind:'visibility',valueType:'boolean',bindings:[{representationId:'figma:test',targetId:'target.badge',path:'visibility.effective'}]}];
 manual.rules=[{...clone(fixture.manual.rules[0]),id:'badge-policy',targetId:'target.root',targetScope:'self',capability:'semanticApi.badgeVisible',permission:'constrained',constraints:[{type:'propertyDomain',values:[false]}],status:'reviewed',execution:{route:'predicate'},rationale:'Do not show badge',owner:'test',applicability:{variants:'all',modes:'all',platforms:['desktop']}}];
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-28T00:00:00Z',source:{rootNodeId:'root',componentKey:'variant',componentSetKey:'set',truncated:false},selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},nodes};
 const run=()=>{const compiled=core.compileManualSource(manual);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);const prepared=core.prepareValidationSnapshot(snapshot,compiled.contract);const engine=core.evaluateCompiledContract(snapshot,compiled.contract);return{compiled,prepared,engine,classification:engine.evaluations[0]?.classification};};
 return{manual,snapshot,nodes,run};
}
test('explicit target binding separates configuration from ancestor-aware visibility; no name heuristic',()=>{
 const f=scenario();f.nodes[1].visible=false;const before=clone(f.snapshot),r=f.run();
 assert.deepEqual(f.snapshot,before);assert.equal(r.prepared.nodes[0].semanticApi.badgeEnabled,true);
 assert.equal(r.prepared.nodes[0].semanticApi.badgeVisible,false);assert.equal(r.classification,'compliant');
 assert.equal(r.compiled.contract.runtimePolicy.semanticTargetVisibilityVersion,1);
 f.nodes[1].visible=true;assert.equal(f.run().classification,'violation');
 f.nodes[0].component.properties['Enabled#1']=false;assert.equal(f.run().classification,'violation');
 f.nodes[2].visible=false;assert.equal(f.run().classification,'compliant');
});
test('unknown visibility is not hidden; a proven hidden ancestor dominates a local unknown',()=>{
 const f=scenario();f.nodes[2].unknownFacts=['visible'];let r=f.run();
 assert.equal(r.prepared.nodes[0].semanticApi.badgeVisible,undefined);assert.equal(r.classification,'human-review');
 assert.equal(r.prepared.nodes[0].semanticBindingEvidence.badgeVisible.reason,'target-visibility-unknown');
 f.nodes[1].visible=false;r=f.run();assert.equal(r.classification,'compliant');
 assert.equal(r.prepared.nodes[2].host.semanticApi.badgeVisible,false);
 assert.ok(!r.prepared.nodes[2].unknownFacts.includes('host.semanticApi.badgeVisible'));
});
test('standalone target visibility uses the component key without inventing a set',()=>{
 for(const sourceSetKey of [undefined,'']){
  const f=scenario();f.manual.component.componentKey='variant';f.manual.representations[0].locator={componentKey:'variant'};
  f.snapshot.source.componentSetKey=sourceSetKey;delete f.nodes[0].component.identity.componentSetKey;
  const before=clone(f.snapshot),r=f.run();
  assert.equal(r.prepared.nodes[0].semanticApi.badgeVisible,true);
  assert.equal(r.classification,'violation');assert.deepEqual(clone(f.snapshot),before);
 }
 for(const mutate of [
  f=>{f.nodes[0].component.identity.componentKey='wrong'},
  f=>{f.nodes[0].component.identity.componentSetKey='unexpected-set'},
  f=>{f.nodes[0].unknownFacts=['component.identity.componentKey']},
  f=>{f.nodes[0].unknownFacts=['component.identity.componentSetKey']},
  f=>{f.manual.representations[0].locator.componentSetKey='variant'},
 ]){
  const f=scenario();f.manual.component.componentKey='variant';f.manual.representations[0].locator={componentKey:'variant'};
  delete f.snapshot.source.componentSetKey;delete f.nodes[0].component.identity.componentSetKey;
  mutate(f);const r=f.run();assert.equal(r.prepared.nodes[0].semanticApi.badgeVisible,undefined);
  assert.notEqual(r.classification,'compliant');assert.notEqual(r.classification,'violation');
 }
});
test('target/identity/topology uncertainty refuses configured-false fallback',()=>{
 for(const mutate of [
  f=>{f.manual.targets[1].resolution='unknown'},
  f=>{f.manual.targets[1].pathHint='Widget / Container / Missing'},
  f=>{f.nodes[0].component.identity.componentKey='wrong'},
  f=>{f.snapshot.context.platform='mobile-web'},
  f=>{f.snapshot.source.truncated=true},
  f=>{f.nodes[2].parentId='missing'},
  f=>{f.nodes.push({...clone(f.nodes[2]),id:'duplicate'});f.nodes[1].childIds.push('duplicate')},
  f=>{f.nodes.pop();f.nodes[1].childIds=[]},
 ]){const f=scenario();f.nodes[0].component.properties['Enabled#1']=false;mutate(f);const r=f.run();assert.equal(r.prepared.nodes[0].semanticApi.badgeVisible,undefined);assert.notEqual(r.classification,'compliant');}
});
test('stale exported derived facts are recomputed; JSON replay and source immutability hold',()=>{
 const f=scenario();f.nodes[1].visible=false;let r=f.run();
 assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.compiled.contract),r.prepared);
 const stale=clone(r.prepared);stale.nodes[1].visible=true;stale.nodes[0].semanticApi.badgeVisible=false;
 const next=core.prepareValidationSnapshot(stale,r.compiled.contract);assert.equal(next.nodes[0].semanticApi.badgeVisible,true);
 assert.equal(core.evaluateCompiledContract(stale,r.compiled.contract).evaluations[0].classification,'violation');
});
test('effective binding validation rejects unknown targets, duplicate roles, transforms and writers',()=>{
 for(const mutate of [
  f=>{f.manual.semanticApi[1].bindings[0].targetId='missing'},
  f=>{f.manual.semanticApi[1].bindings[0].transform='boolean-string'},
  f=>{f.manual.semanticApi[1].valueType='string'},
  f=>{f.manual.semanticApi[1].bindings[0].path='component.properties.Enabled#1'},
  f=>{f.manual.semanticApi[1].bindings.push(clone(f.manual.semanticApi[1].bindings[0]))},
  f=>{f.manual.targets.push({...clone(f.manual.targets[1]),id:'duplicate-role'})},
 ]){const f=scenario();mutate(f);assert.ok(core.validateManualSource(f.manual).some(i=>i.level==='error'&&i.code.startsWith('SEMANTIC_TARGET_BINDING')));}
 const f=scenario();f.manual.generation.profiles=[{id:'generation',intent:'test',platform:'desktop',representationId:'figma:test',properties:{badgeVisible:false}}];
 assert.ok(core.validateManualSource(f.manual).some(i=>i.code==='GENERATION_READ_ONLY_FACT'));
 f.manual.generation.profiles[0].properties={badgeEnabled:false};assert.ok(!core.validateManualSource(f.manual).some(i=>i.level==='error'));
});

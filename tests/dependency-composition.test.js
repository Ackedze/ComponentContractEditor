const test=require('node:test'),assert=require('node:assert/strict');
const {scenario,clone,core,childContract}=require('./helpers/button-spinner');
const id='component:fixture.loading-composition';
function setup(){
 const f=scenario();
 f.manual.rules=[{...f.manual.rules[0],id,targetId:'target.root',targetScope:'self',capability:'composition.loading',
  constraints:[{type:'quantity',contractDependencyId:'spinner',min:1,max:1}],
  applicability:{variants:'all',modes:'all',platforms:['desktop'],activeDependency:'spinner'}}];
 return f;
}
const own=r=>r.engine.evaluations.filter(e=>e.ruleId.startsWith(id+'.'));
function twoSides(){
 const f=setup(),right=scenario({side:'right'});
 f.manual.componentDependencies[0].bindings.push(clone(right.manual.componentDependencies[0].bindings[0]));
 const prefix=f.root.name+' / RightAddon';
 f.snapshot.nodes=f.snapshot.nodes.filter(n=>!n.semantic.path.startsWith(prefix));
 f.snapshot.nodes.push(...clone(right.snapshot.nodes.filter(n=>n.semantic.path.startsWith(prefix))));
 f.snapshot.variantReference=core.captureVariantReference(f.snapshot,f.snapshot.source.componentKey,f.snapshot.source.componentSetKey);
 const shape=f.snapshot.variantReference.nodes,structureId=core.stableHash(shape);
 f.evidence.structures={[structureId]:shape};f.evidence.variants[0].structureId=structureId;
 return {f,right:f.snapshot.nodes.find(n=>n.id===right.owner.id)};
}
test('two bindings count two distinct children; uncertain second binding never becomes a complete one-child pass',()=>{
 const {f,right}=twoSides();let r=f.run();assert.equal(own(r)[0].classification,'violation');
 assert.equal(core.prepareValidationSnapshot(f.snapshot,r.contract).nodes[0].dependencyCompositionV1.spinner.visibleInstances.length,2);
 right.unknownFacts.push('component.properties.Type');r=f.run();
 assert.equal(own(r)[0].classification,'human-review');
 assert.equal(core.prepareValidationSnapshot(f.snapshot,r.contract).nodes[0].dependencyCompositionV1.spinner.active,true);
 assert.equal(r.report.scenarioCoverage.complete,false);
});
test('proven visible fixed child counts once; hidden child is zero, not inactive',()=>{
 const f=setup();let r=f.run();assert.deepEqual(r.compiled.issues.filter(i=>i.level==='error'),[]);
 assert.equal(own(r)[0].classification,'compliant');
 f.child.nodes[0].visible=false;f.syncActual();r=f.run();
 assert.equal(own(r)[0].classification,'violation');
 assert.equal(core.prepareValidationSnapshot(f.snapshot,r.contract).nodes[0].dependencyCompositionV1.spinner.active,true);
});
test('foreign child fails count, but unknown identity, missing child and topology never pass or become inactive',()=>{
 const foreign=setup();foreign.child.nodes[0].component.identity.componentSetKey='foreign';foreign.syncActual();
 assert.equal(own(foreign.run())[0].classification,'violation');
 for(const mutate of [
  f=>{f.child.nodes[0].unknownFacts.push('component.identity');f.syncActual();},
  f=>{delete f.child.nodes[0].component.identity.componentSetKey;f.syncActual();},
  f=>{f.child.nodes[0].unknownFacts.push('visibility');f.syncActual();},
  f=>{f.snapshot.source.truncated=true;},
  f=>{delete f.snapshot.variantReference;},
  f=>{f.owner.component.identity.componentSetKey='foreign';},
  f=>{f.owner.unknownFacts.push('component.identity');},
  f=>{f.owner.unknownFacts.push('component.propertyTypes');},
  f=>{f.snapshot.nodes=f.snapshot.nodes.filter(n=>n.id!==f.nodeMap[f.child.selection[0]]);},
 ]){const f=setup();mutate(f);const r=f.run();assert.equal(own(r)[0].classification,'human-review');assert.equal(r.report.scenarioCoverage.complete,false);}
});
test('known hidden slot or inactive owner is not applicable; an uncertain owner is not false',()=>{
 const hidden=setup();hidden.target.visible=false;assert.equal(own(hidden.run())[0].classification,'not-applicable');
 const icon=setup();icon.owner.component.properties.Type='Icon-24';icon.snapshot.variantReference.nodeProperties['LeftAddon / LeftAddon'].properties.Type='Icon-24';
 assert.equal(own(icon.run())[0].classification,'not-applicable');
 const unknown=setup();unknown.owner.unknownFacts.push('component.properties.Type');assert.equal(own(unknown.run())[0].classification,'human-review');
});
test('count is shared data; manual bounds and activation determine the assertion',()=>{
 const f=setup();f.manual.rules[0].constraints[0].min=2;f.manual.rules[0].constraints[0].max=2;
 assert.equal(own(f.run())[0].classification,'violation');
 delete f.manual.rules[0].applicability.activeDependency;f.target.visible=false;
 assert.equal(own(f.run())[0].classification,'violation');
 f.manual.rules[0].constraints[0].min=0;f.manual.rules[0].constraints[0].max=0;
 assert.equal(own(f.run())[0].classification,'compliant');
});
test('missing pin, bad selectors and invalid bounds are fail-closed',()=>{
 for(const change of [r=>r.applicability.activeDependency='unknown',r=>r.targetScope='self-and-descendants',
  r=>r.constraints[0].contractDependencyId='unknown',r=>r.constraints[0].min=-1,
  r=>r.constraints[0].max=0,r=>r.constraints[0].min=0.5,r=>r.constraints[0].targetRoles=['left-addon'],
  r=>r.constraints[0].fact='anything',r=>r.constraints[0].visibleOnly=true]){
  const f=setup();change(f.manual.rules[0]);assert.ok(f.run().compiled.issues.some(i=>i.level==='error'));
 }
 const f=setup();const r=f.run([]);assert.ok(r.compiled.issues.some(i=>i.code==='COMPONENT_DEPENDENCY_LINK'));
 assert.notEqual(own(r)[0]?.classification,'compliant');
});
test('new data is opt-in; package/session/report replay is stable and the child contract stays pinned',()=>{
 const f=setup(),r=f.run(),prepared=core.prepareValidationSnapshot(f.snapshot,r.contract);
 assert.deepEqual(core.prepareValidationSnapshot(prepared,r.contract),prepared);
 assert.deepEqual(core.evaluateCompiledContract(prepared,r.contract),r.engine);
 const ws=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)},
  {name:'compiled/component-contract.v2.json',text:JSON.stringify(r.compiled.contract)}]);
 const session=core.parseEditorSession(core.createEditorSession(ws,{workspaceMode:'validation',validationProduct:'ab',scenarioProperties:{},activeModes:{}}));
 assert.deepEqual(session.workspace.manual.rules[0],f.manual.rules[0]);
 assert.deepEqual(r.contract.componentDependencies[0].contract,childContract);
 const old=scenario(),oldResult=old.run();assert.equal(core.prepareValidationSnapshot(old.snapshot,oldResult.contract).nodes[0].dependencyCompositionV1,undefined);
});

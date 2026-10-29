const test=require('node:test'),assert=require('node:assert/strict');
const {core,clone,scenario}=require('./helpers/direct-group');

function collections(f){
 const base={version:1,ownerTargetRole:f.manual.targets[0].semanticRole,memberTargetRoles:f.manual.targets.slice(1).map(t=>t.semanticRole),representationIds:['desktop'],visibleOnly:true};
 for(const [id,assertion] of [['members',{kind:'membership'}],['count',{kind:'count',min:1,max:4}],['view',{kind:'propertyDomain',property:'View',propertyType:'VARIANT',values:['Primary','Secondary']}]])
  f.manual.rules.push({...clone(f.manual.rules[0]),id:'fixture.'+id,capability:'composition.members',permission:'constrained',
   constraints:[{type:'memberCollection',collection:{...base,visibleOnly:id!=='members',assertion}}]});
}

test('production Figma provenance IDs do not invalidate the local collection graph; Accent focuses its own occurrence and reset passes',()=>{
 const f=scenario(4);f.snapshot.source.rootNodeId='900:100';collections(f);
 f.snapshot.nodes[2].component.properties.View='Accent';f.children[1].nodes[0].component.properties.View='Accent';
 f.snapshot.nodes[3].visible=false;f.snapshot.nodes[4].visible=false;
 const result=f.run();const rows=result.engine.evaluations.filter(e=>e.collection);
 assert.deepEqual(rows.map(e=>e.classification),['compliant','compliant','violation']);
 assert.equal(rows[2].focusNodeId,'member-1');assert.deepEqual(rows[2].collection.missing,[]);
 f.snapshot.nodes[2].component.properties.View='Secondary';assert.ok(f.run().engine.evaluations.filter(e=>e.collection).every(e=>e.classification==='compliant'));
 f.snapshot.source.captureTopology={version:1,complete:false,issues:[]};assert.ok(f.run().engine.evaluations.filter(e=>e.collection).every(e=>e.classification==='human-review'));
});

test('two explicit root aliases execute separate root rules without granting aliases to nested collisions',()=>{
 const f=scenario(2),alias={...clone(f.manual.targets[0]),id:'variant-root',semanticRole:'group-variant-root'};
 f.manual.targets[0].semanticRole='buttons-group';f.manual.componentDependencies[0].bindings.forEach(b=>b.ownerTargetRole='buttons-group');
 f.manual.targets.push(alias);f.manual.rules.push({...clone(f.manual.rules[0]),id:'fixture.alias-root',targetId:alias.id});
 const result=f.run();assert.equal(result.contract.runtimePolicy.rootTargetAliasesVersion,1);
 assert.ok(result.engine.evaluations.filter(e=>!e.dependency).every(e=>e.classification==='compliant'));
 assert.equal(result.contract.package.sourceExportVersion,'component-contract-editor@0.2.80');
 assert.deepEqual(Object.keys(result.prepared.nodes[0].rootTargetAliasesV1).sort(),['buttons-group','group-variant-root']);
 f.snapshot.nodes[0].appearance.opacity=.4;assert.ok(f.run().engine.evaluations.filter(e=>!e.dependency).every(e=>e.classification==='violation'));
 f.snapshot.nodes[0].appearance.opacity=1;assert.ok(f.run().engine.evaluations.filter(e=>!e.dependency).every(e=>e.classification==='compliant'));
 f.manual.rules.push({...clone(f.manual.rules[0]),id:'fixture.alias-count',capability:'composition.members',permission:'constrained',
  constraints:[{type:'quantity',targetRoles:['buttons-group'],visibleOnly:true,min:1,max:1}]});
 assert.equal(f.run().engine.evaluations.find(e=>e.ruleId==='fixture.alias-count.1.1').classification,'compliant');
 f.manual.rules.at(-1).constraints[0]={type:'quantity',targetRoles:['buttons-group','group-variant-root','button-0'],visibleOnly:true,min:2,max:2};
 assert.equal(f.run().engine.evaluations.find(e=>e.ruleId==='fixture.alias-count.1.1').classification,'compliant');
 const bad=clone(f.manual.targets[1]);bad.id='nested-alias';bad.semanticRole='nested-alias';f.manual.targets.push(bad);
 const negative=f.run();assert.equal(core.variantAvailability(f.snapshot,negative.contract).targets['button-0'].state,'unknown');
 const legacy=clone(result.contract);delete legacy.runtimePolicy.rootTargetAliasesVersion;
 assert.equal(core.variantAvailability(f.snapshot,legacy).targets['buttons-group'].state,'unknown');
});

test('direct child capture ignores only unused mode catalog entries and rejects actual mode, required catalog, binding and style changes',()=>{
 const collection='a'.repeat(40),unused='b'.repeat(40),catalog={collectionId:'collection:used',collectionName:'Used',defaultModeId:'mode:1',modes:[{modeId:'mode:1',name:'One'}]};
 function fixture(){const f=scenario(2);for(let i=0;i<2;i++){
  const n=f.snapshot.nodes[i+1],c=f.children[i].nodes[0];n.variable={modes:{[collection]:'mode:1'},modeCatalog:{[collection]:clone(catalog),[unused]:{collectionId:'collection:unused'}},bindings:{}};
  c.variable={modes:{[collection]:'mode:1'},modeCatalog:{[collection]:clone(catalog)},bindings:{}};
 }return f;}
 const f=fixture();assert.ok(f.run().engine.dependencyRuns.every(r=>r.status==='executed'));
 for(const mutate of [n=>n.variable.modes[collection]='mode:2',n=>delete n.variable.modeCatalog[collection],n=>n.variable.modeCatalog[collection].collectionName='Changed',n=>n.variable.bindings.opacity={tokenIds:['foreign']},n=>n.appearance.opacity=.4]){
  const g=fixture();mutate(g.children[0].nodes[0]);assert.equal(g.run().engine.dependencyRuns[0].status,'not-executed');
 }
});

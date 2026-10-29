const test=require('node:test'),assert=require('node:assert/strict');
const {core,clone,scenario}=require('./helpers/direct-group');

function fixture(count=4){
 const f=scenario(count);f.manual.componentDependencies=[];
 const root=f.snapshot.nodes[0];root.component.properties={Size:'48',Overflow:'false'};root.component.propertyTypes={Size:'VARIANT',Overflow:'VARIANT'};
 for(const n of f.snapshot.nodes.slice(1)){Object.assign(n.component.properties,{Size:'48',SingleIcon:'False'});Object.assign(n.component.propertyTypes,{Size:'VARIANT',SingleIcon:'VARIANT'});}
 f.snapshot.variantReference=clone(core.captureVariantReference(f.snapshot,'group-variant','group-set'));
 const base={version:1,ownerTargetRole:'root',memberTargetRoles:f.manual.targets.slice(1).map(t=>t.semanticRole),representationIds:['desktop'],visibleOnly:true};
 const add=(id,assertion,extra={})=>{
  f.manual.rules.push({...clone(f.manual.rules[0]),id:'fixture.'+id,rationale:id,message:id,
   constraints:[{type:'memberCollection',collection:{...clone(base),...extra,assertion}}]});return 'fixture.'+id;
 };
 const evaluate=id=>{const r=f.run();assert.equal(r.compiled.issues.filter(i=>i.level==='error').length,0,JSON.stringify(r.compiled.issues));
  const e=r.engine.evaluations.find(e=>e.ruleId.startsWith(id+'.'));assert.ok(e);return {...r,e};};
 const prop=(property,values,propertyType='VARIANT')=>({property,propertyType,values});
 return {...f,add,evaluate,prop,base};
}

test('a declared root role can author and execute a collection without being named root',()=>{
 const f=fixture(),root=f.manual.targets[0];root.semanticRole='buttons-group';
 f.base.ownerTargetRole='buttons-group';
 const id=f.add('membership',{kind:'membership'},{ownerTargetRole:'buttons-group',visibleOnly:false});
 assert.equal(f.evaluate(id).e.classification,'compliant');
 const extra=clone(f.snapshot.nodes[1]);extra.id='extra';extra.visible=false;
 f.snapshot.nodes.push(extra);f.snapshot.nodes[0].childIds.push(extra.id);
 assert.equal(f.evaluate(id).e.classification,'violation');
 f.snapshot.nodes.pop();f.snapshot.nodes[0].childIds.pop();assert.equal(f.evaluate(id).e.classification,'compliant');
});

test('root aliases do not allow collection rules on nested, unresolved or conflicting anchors',()=>{
 for(const mutate of [t=>{t.pathHint='Group / Child';},t=>{t.lineage=['group'];},t=>{t.resolution='unknown';},
  t=>{delete t.pathHint;},t=>{t.representationHints=[{representationId:'desktop',pathHint:'Group / Child'}];},
  t=>{t.variantHints=[{representationId:'desktop',componentKey:'group-variant',pathHint:'Group / @source:100%3A2'}];}]){
  const f=fixture();f.manual.targets[0].semanticRole='buttons-group';mutate(f.manual.targets[0]);
  const id=f.add('membership',{kind:'membership'},{ownerTargetRole:'buttons-group',visibleOnly:false});
  const r=f.run();assert.ok(r.compiled.issues.some(i=>i.code==='MEMBER_COLLECTION_SCOPE'));
  assert.ok(!r.contract.rules.some(rule=>rule.source.anchor===id));
 }
});

test('nested dependency subjects also compile from a declared host root alias and reject a nested rule anchor',()=>{
 const f=scenario(2);f.manual.targets[0].semanticRole='buttons-group';
 f.manual.componentDependencies[0].bindings.forEach(b=>b.ownerTargetRole='buttons-group');
 const rule={...clone(f.manual.rules[0]),id:'fixture.alias-dependency',capability:'composition.content',
  constraints:[{type:'dependencyDomain',values:['Secondary'],dependency:{subjects:[{targetRole:'button-0',relativePath:''}],
   contractDependencyId:'button',field:'variantProperty',property:'View',baselinePolicy:'require-domain'}}]};
 f.manual.rules.push(rule);const r=f.run();
 assert.equal(r.compiled.issues.filter(i=>i.level==='error').length,0,JSON.stringify(r.compiled.issues));
 assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith(rule.id+'.')).classification,'compliant');
 rule.targetId=f.manual.targets[1].id;const invalid=f.run();
 assert.ok(invalid.compiled.issues.some(i=>i.code==='CONSTRAINT_DEPENDENCY'));
 assert.ok(!invalid.contract.rules.some(r=>r.source.anchor===rule.id));
});

test('closed membership accepts hidden middle, rename/reorder and same-family variants independently from count',()=>{
 const f=fixture();const id=f.add('membership',{kind:'membership'},{visibleOnly:false});
 f.snapshot.nodes[2].visible=false;f.snapshot.nodes[1].name='Renamed';f.snapshot.nodes[0].childIds.reverse();
 f.snapshot.nodes[1].component.identity={componentKey:'primary',componentSetKey:'button-set',mainComponentId:'primary-main'};
 assert.equal(f.evaluate(id).e.classification,'compliant');
 f.snapshot.nodes[1].component.identity.componentSetKey='foreign-set';const e=f.evaluate(id).e;
 assert.equal(e.classification,'violation');assert.equal(e.focusNodeId,'member-0');assert.equal(e.collection.violations[0].reason,'member-family-replaced');
});

test('hidden additions, duplicate source occurrences and equal-count replacements are structural violations',()=>{
 for(const mode of ['extra','duplicate','replace','remove']){
  const f=fixture(),id=f.add('membership',{kind:'membership'},{visibleOnly:false});
  if(mode==='remove'){f.snapshot.nodes.splice(2,1);f.snapshot.nodes[0].childIds.splice(1,1);}
  else if(mode==='replace')f.snapshot.nodes[2].component.sourceIdentity.sourceNodeId='100:foreign';
  else {const extra=clone(f.snapshot.nodes[1]);extra.id='extra';extra.visible=false;
   if(mode==='extra')extra.component.sourceIdentity.sourceNodeId='100:extra';
   f.snapshot.nodes.push(extra);f.snapshot.nodes[0].childIds.push(extra.id);}
  const e=f.evaluate(id).e;assert.equal(e.classification,'violation',mode);
  assert.ok(e.collection.violations.length);if(mode==='duplicate')assert.ok(e.collection.violations.some(v=>v.reason==='duplicate-occurrence'));
 }
});

test('missing lineage, partial topology, wrong owner and stale reference remain unknown without invented deletion',()=>{
 for(const mutate of [f=>delete f.snapshot.nodes[1].component.sourceIdentity,
  f=>f.snapshot.source.truncated=true,f=>f.snapshot.source.captureTopology={version:1,complete:false,limitReached:false,issues:[{kind:'missing-child',path:'children'}]},
  f=>f.snapshot.nodes[0].component.identity.mainComponentId='foreign-main',
  f=>f.snapshot.variantReference.complete=false,f=>f.snapshot.variantReference.nodes.pop()]){
  const f=fixture(),id=f.add('membership',{kind:'membership'},{visibleOnly:false});mutate(f);
  const e=f.evaluate(id).e;assert.equal(e.classification,'human-review');assert.ok(e.collection.missing.length);
 }
});

test('visible count includes SingleIcon, permits one and fails zero even when every child is hidden',()=>{
 for(const count of [4,2]){const f=fixture(count),id=f.add('quantity',{kind:'count',min:1,max:count});
  f.snapshot.nodes.slice(2).forEach(n=>n.visible=false);f.snapshot.nodes[1].component.properties.SingleIcon='True';
  assert.equal(f.evaluate(id).e.classification,'compliant');f.snapshot.nodes[1].visible=false;
  const e=f.evaluate(id).e;assert.equal(e.classification,'violation');assert.equal(e.collection.selectedCount,0);
 }
});

test('Primary is optional, unique and first in the effective visible order with hidden middle',()=>{
 const f=fixture(),count=f.add('primary-count',{kind:'count',max:1},{filter:f.prop('View',['Primary'])}),position=f.add('primary-first',{kind:'position',position:'first'},{filter:f.prop('View',['Primary'])});
 assert.equal(f.evaluate(count).e.classification,'compliant');assert.equal(f.evaluate(position).e.classification,'compliant');
 f.snapshot.nodes[2].visible=false;f.snapshot.nodes[3].component.properties.View='Primary';
 const wrong=f.evaluate(position).e;assert.equal(wrong.classification,'violation');assert.equal(wrong.focusNodeId,'member-2');assert.equal(wrong.collection.violations[0].actualIndex,1);
 f.snapshot.nodes[0].childIds=['member-2','member-1','member-0','member-3'];assert.equal(f.evaluate(position).e.classification,'compliant');
 f.snapshot.nodes[0].unknownFacts.push('children.order');assert.equal(f.evaluate(position).e.classification,'human-review');f.snapshot.nodes[0].unknownFacts=[];
 f.snapshot.nodes[1].component.properties.View='Primary';assert.equal(f.evaluate(count).e.classification,'violation');
});

test('SingleIcon enforces last/max1, host Overflow and min2; missing SingleIcon remains permitted',()=>{
 const f=fixture(),filter=f.prop('SingleIcon',['True']);
 const ids={count:f.add('icon-count',{kind:'count',max:1},{filter}),last:f.add('icon-last',{kind:'position',position:'last'},{filter}),
  host:f.add('icon-overflow',{kind:'hostRequirement',...f.prop('Overflow',['true'])},{filter}),
  min:f.add('icon-min',{kind:'count',min:2},{whenMember:filter}),overflow:f.add('overflow-min',{kind:'count',min:2},{whenHost:f.prop('Overflow',['true'])})};
 assert.equal(f.evaluate(ids.host).e.classification,'not-applicable');assert.equal(f.evaluate(ids.min).e.classification,'not-applicable');
 f.snapshot.nodes[2].component.properties.SingleIcon='True';assert.equal(f.evaluate(ids.last).e.classification,'violation');assert.equal(f.evaluate(ids.host).e.classification,'violation');
 f.snapshot.nodes[0].component.properties.Overflow='true';assert.equal(f.evaluate(ids.host).e.classification,'compliant');
 f.snapshot.nodes[3].component.properties.SingleIcon='True';assert.equal(f.evaluate(ids.count).e.classification,'violation');
 f.snapshot.nodes[2].component.properties.SingleIcon='False';f.snapshot.nodes[3].component.properties.SingleIcon='False';f.snapshot.nodes[4].component.properties.SingleIcon='True';
 f.snapshot.nodes.slice(1,4).forEach(n=>n.visible=false);assert.equal(f.evaluate(ids.min).e.classification,'violation');assert.equal(f.evaluate(ids.overflow).e.classification,'violation');
 f.snapshot.nodes[4].component.properties.SingleIcon='False';f.snapshot.nodes[1].visible=true;assert.equal(f.evaluate(ids.overflow).e.classification,'compliant');
});

test('typed member domains and host mappings use explicit properties and ignore only proven hidden members',()=>{
 const f=fixture(),domain=f.add('view-domain',{kind:'propertyDomain',...f.prop('View',['Primary','Secondary'])}),mapping=f.add('size-mapping',{kind:'propertyMapping',property:'Size',propertyType:'VARIANT',hostProperty:'Size',hostPropertyType:'VARIANT'});
 f.snapshot.nodes[2].component.properties.View='Accent';assert.equal(f.evaluate(domain).e.classification,'violation');
 f.snapshot.nodes[2].visible=false;delete f.snapshot.nodes[2].component.properties.Size;assert.equal(f.evaluate(domain).e.classification,'compliant');assert.equal(f.evaluate(mapping).e.classification,'compliant');
 f.snapshot.nodes[3].component.properties.Size='40';const e=f.evaluate(mapping).e;assert.equal(e.classification,'violation');assert.equal(e.focusNodeId,'member-2');assert.equal(e.collection.hostValue,'48');
 assert.match(e.collection.summary,/Size="40".*Size.*="48"/);
 f.snapshot.nodes[3].component.propertyTypes.Size='BOOLEAN';assert.equal(f.evaluate(mapping).e.classification,'human-review');
});

test('unknown visibility/filter/host values never become zero, False or inactive and do not erase root checks',()=>{
 for(const mutate of [f=>f.snapshot.nodes[1].unknownFacts.push('visible'),f=>delete f.snapshot.nodes[1].component.properties.SingleIcon,
  f=>f.snapshot.nodes[1].component.propertyTypes.SingleIcon='BOOLEAN']){
  const f=fixture(),id=f.add('icon-count',{kind:'count',max:1},{filter:f.prop('SingleIcon',['True'])});mutate(f);
  const result=f.evaluate(id);assert.equal(result.e.classification,'human-review');assert.ok(result.e.collection.missing.length);
  assert.equal(result.engine.evaluations[0].classification,'compliant');
 }
 const f=fixture(),id=f.add('overflow-min',{kind:'count',min:2},{whenHost:f.prop('Overflow',['true'])});delete f.snapshot.nodes[0].component.properties.Overflow;
 assert.equal(f.evaluate(id).e.classification,'human-review');
});

test('known member property violation remains visible alongside another member gap with incomplete coverage',()=>{
 const f=fixture(),id=f.add('view-domain',{kind:'propertyDomain',...f.prop('View',['Primary','Secondary'])});
 delete f.snapshot.nodes[1].component.sourceIdentity;f.snapshot.nodes[3].component.properties.View='Accent';
 const r=f.evaluate(id);assert.equal(r.e.classification,'violation');assert.equal(r.e.focusNodeId,'member-2');assert.ok(r.e.collection.missing.length);assert.equal(r.report.scenarioCoverage.complete,false);
 assert.equal(r.e.collection.count,undefined);assert.equal(r.e.collection.knownCount,3);
 f.snapshot.nodes[3].component.properties.View='Secondary';assert.equal(f.evaluate(id).e.classification,'human-review');
});

test('collection schema rejects hidden membership gates, mixed types, missing bounds and legacy fields',()=>{
 const f=fixture(),id=f.add('membership',{kind:'membership'},{visibleOnly:false});const rule=f.manual.rules.find(r=>r.id===id);
 const original=clone(rule.constraints[0]);
 for(const mutate of [c=>c.collection.visibleOnly=true,c=>c.collection.memberTargetRoles.push('button-0'),c=>c.collection.representationIds=[],
  c=>c.collection.version=2,c=>c.collection.assertion={kind:'count'},c=>c.collection.assertion={kind:'count',min:-1},c=>c.collection.assertion={kind:'count',min:1,position:'last'},
  c=>{c.collection.assertion={kind:'count',max:1};c.collection.filter={property:'View',propertyType:'VARIANT',values:[true]};},c=>c.fact='children']){
  rule.constraints[0]=clone(original);mutate(rule.constraints[0]);const r=f.run();assert.ok(r.compiled.issues.some(i=>i.code.startsWith('MEMBER_COLLECTION')));
  assert.ok(!r.contract.rules.some(r=>r.source.anchor===id));
 }
});

test('new collection policy is versioned, source-linked and survives ZIP / exact replay without changing old contracts',async()=>{
 const f=fixture(),id=f.add('membership',{kind:'membership'},{visibleOnly:false});f.add('count',{kind:'count',min:1,max:4});
 const r=f.evaluate(id);assert.equal(r.contract.runtimePolicy.memberCollectionsVersion,1);assert.equal(r.contract.package.sourceExportVersion,'component-contract-editor@0.2.77');
 const bundle=core.buildExportBundle(f.manual,f.evidence),zip=core.buildAuthoringZip(bundle),files=(await core.readZip(zip)).map(e=>({name:e.name,text:core.zipEntryText(e)})),imported=core.importWorkspace(files);
 assert.deepEqual(imported.manual.rules,f.manual.rules);assert.deepEqual(core.compileManualSource(imported.manual,f.evidence).contract.facts.memberCollections,r.contract.facts.memberCollections);
 assert.deepEqual(core.evaluateCompiledContract(clone(f.snapshot),r.contract),r.engine);
 f.manual.rules=f.manual.rules.slice(0,1);const old=f.run().contract;assert.equal(old.runtimePolicy.memberCollectionsVersion,undefined);assert.equal(old.facts.memberCollections,undefined);
});

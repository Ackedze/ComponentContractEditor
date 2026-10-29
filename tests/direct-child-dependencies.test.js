const test=require('node:test'),assert=require('node:assert/strict');
const {core,clone,scenario}=require('./helpers/direct-group');

for(const count of [4,2])test('one pinned dependency separately executes each same-name direct child: '+count,()=>{
 const f=scenario(count),before=clone(f.snapshot),r=f.run();assert.deepEqual(r.compiled.issues.filter(i=>i.level==='error'),[]);
 assert.equal(r.contract.runtimePolicy.directChildDependenciesVersion,1);
 assert.deepEqual(r.engine.dependencyRuns.map(r=>r.status),Array(count).fill('executed'));
 assert.equal(r.engine.evaluations.filter(e=>e.dependency).length,count);assert.deepEqual(f.snapshot,before);
 f.children[1].nodes[0].appearance.opacity=.4;f.sync(1);f.snapshot.nodes[0].childIds.reverse();f.snapshot.nodes[2].name='Renamed button';
 const negative=f.run();assert.deepEqual(negative.engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.focusNodeId),['member-1']);
 f.children[1].nodes[0].appearance.opacity=1;f.sync(1);assert(f.run().engine.evaluations.every(e=>e.classification==='compliant'));
});

test('membership and family are proved before hidden child execution becomes inactive',()=>{
 const f=scenario();f.snapshot.nodes[2].visible=false;f.children[1].nodes[0].visible=false;
 assert.equal(f.run().engine.dependencyRuns[1].status,'not-applicable');
 delete f.snapshot.nodes[2].component.sourceIdentity;
 assert.equal(f.run().engine.dependencyRuns[1].status,'not-executed');
 const foreign=scenario();foreign.snapshot.nodes[2].visible=false;foreign.snapshot.nodes[2].component.identity.componentSetKey='foreign';
 assert.equal(foreign.run().engine.dependencyRuns[1].status,'not-executed');
});

test('direct child can select another proven same-family variant with an independent selected child reference',()=>{
 const f=scenario(),child=f.children[1];child.source.componentKey='primary';
 Object.assign(child.nodes[0].component.identity,{componentKey:'primary',mainComponentId:'primary-main'});child.nodes[0].component.properties.View='Primary';
 child.variantReference=clone(core.captureVariantReference(child,'primary','button-set'));f.sync(1);
 assert.equal(f.run().engine.dependencyRuns[1].status,'executed');
 delete child.variantReference;assert.equal(f.run().engine.dependencyRuns[1].status,'not-executed');
});

test('missing pins, stale capture, platform and unknown owner evidence stay explicit gaps',()=>{
 for(const mutate of [f=>f.manual.componentDependencies[0].compiledHash='f'.repeat(64),f=>f.snapshot.componentDependencyCaptures.splice(1,1),
  f=>f.children[1].nodes[0].appearance.opacity=.5,f=>f.snapshot.nodes[2].unknownFacts.push('component.identity'),
  f=>f.snapshot.nodes[0].component.identity.componentKey='foreign',f=>f.childContract.facts.representations[0].platform='mobile-web']){
  const f=scenario();mutate(f);const r=f.run();assert(r.engine.dependencyRuns.some(x=>x.status==='not-executed'));
  assert.equal(r.report.scenarioCoverage.complete,false);
 }
});

test('direct binding rejects legacy fields, absent owner, empty scope and unknown kinds',()=>{
 for(const mutate of [b=>b.childPath='',b=>b.ownerTargetRole='missing',b=>b.representationIds=[],b=>b.kind='guess',b=>b.relativePath='Nested']){
  const f=scenario();mutate(f.manual.componentDependencies[0].bindings[0]);assert(core.validateManualSource(f.manual).some(i=>i.code==='COMPONENT_DEPENDENCY'&&i.level==='error'));
 }
 const f=scenario();f.manual.componentDependencies[0].bindings[0]={...f.manual.componentDependencies[0].bindings[0],kind:'fixed-nested',childPath:''};
 assert(core.validateManualSource(f.manual).some(i=>i.code==='COMPONENT_DEPENDENCY'&&i.level==='error'));
});

test('one semantic member may have disjoint representation bindings but overlapping scopes are rejected',()=>{
 const f=scenario(),binding=f.manual.componentDependencies[0].bindings[0];
 f.manual.representations.push({id:'mobile',kind:'figma',platform:'mobile-web',status:'verified',locator:{componentKey:'mobile-set'}});
 f.manual.componentDependencies[0].bindings.push({...clone(binding),id:'mobile-first',ownerComponentKeys:['mobile-set'],representationIds:['mobile']});
 assert.equal(core.validateManualSource(f.manual).filter(i=>i.code==='COMPONENT_DEPENDENCY'&&i.level==='error').length,0);
 assert.equal(f.run().engine.dependencyRuns.at(-1).status,'not-applicable');
 f.manual.componentDependencies[0].bindings.at(-1).representationIds.push('desktop');
 assert(core.validateManualSource(f.manual).some(i=>i.code==='COMPONENT_DEPENDENCY'&&i.level==='error'));
});

test('duplicate actual child never executes twice; direct dependency data survives ZIP and exact replay',async()=>{
 const f=scenario(),r=f.run();const direct=r.contract.componentDependencies[0].bindings[0];
 r.contract.componentDependencies[0].bindings.push({...direct,id:'duplicate'});
 const duplicated=core.evaluateCompiledContract(f.snapshot,r.contract);assert.equal(duplicated.dependencyRuns.at(-1).reason,'dependency-child-claimed-twice');
 const files=(await core.readZip(core.buildAuthoringZip(core.buildExportBundle(f.manual,f.evidence,[f.childContract])))).map(e=>({name:e.name,text:core.zipEntryText(e)}));
 const reopened=core.importWorkspace(files);assert.deepEqual(reopened.manual,f.manual);assert.deepEqual(reopened.dependencyContracts,[clone(f.childContract)]);
 assert.deepEqual(core.evaluateCompiledContract(clone(f.snapshot),r.contract),duplicated);
});

test('typed subject condition narrows only the chosen direct member and keeps wrong/absent types unknown',()=>{
 const f=scenario(2),node=f.snapshot.nodes[1];Object.assign(node.component.properties,{SingleIcon:'False'});Object.assign(node.component.propertyTypes,{SingleIcon:'VARIANT'});
 const rule={...clone(f.manual.rules[0]),id:'fixture.single-icon-view',constraints:[{type:'dependencyDomain',values:['Primary'],dependency:{contractDependencyId:'button',subjects:[{targetRole:'button-0',relativePath:''}],field:'variantProperty',property:'View',baselinePolicy:'require-domain',subjectCondition:{property:'SingleIcon',propertyType:'VARIANT',values:['True']}}}]};f.manual.rules.push(rule);
 const check=()=>{const r=f.run();assert.ok(!r.compiled.issues.some(i=>i.level==='error'),JSON.stringify(r.compiled.issues));assert.equal(r.contract.runtimePolicy.dependencySubjectConditionsVersion,1);return r.engine.evaluations.find(e=>e.ruleId.startsWith(rule.id+'.'));};
 assert.equal(check().classification,'not-applicable');node.component.properties.SingleIcon='True';assert.equal(check().classification,'violation');
 node.component.propertyTypes.SingleIcon='BOOLEAN';assert.equal(check().classification,'human-review');delete node.component.properties.SingleIcon;assert.equal(check().classification,'human-review');
 rule.constraints[0].dependency.subjectCondition.values=[true];assert.ok(f.run().compiled.issues.some(i=>i.code==='CONSTRAINT_DEPENDENCY'));
});

test('one unresolved sibling does not hide an independently proved later child violation',()=>{
 const f=scenario(4);delete f.snapshot.nodes[1].component.sourceIdentity;
 f.children[3].nodes[0].appearance.opacity=.4;f.sync(3);
 const r=f.run();assert.equal(r.engine.dependencyRuns[0].status,'not-executed');assert.equal(r.engine.dependencyRuns[3].status,'executed');
 assert.ok(r.engine.evaluations.some(e=>e.dependency&&e.classification==='violation'&&e.focusNodeId==='member-3'));
 assert.equal(r.report.scenarioCoverage.complete,false);
});

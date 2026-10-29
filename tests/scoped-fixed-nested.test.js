const test=require('node:test'),assert=require('node:assert/strict');
const {scopedScenario,clone,core}=require('./helpers/scoped-fixed');

for(const platform of ['desktop','mobile-web']){
 test('scoped fixed dependency executes once through FRAME: '+platform,()=>{
  const f=scopedScenario(platform),r=f.run();assert.equal(r.compiled.issues.filter(i=>i.level==='error').length,0);
  assert.equal(r.contract.runtimePolicy.crossRepresentationBindingsVersion,2);
  assert.equal(r.engine.dependencyRuns.filter(x=>x.status==='executed').length,1);
  assert.equal(r.engine.dependencyRuns.filter(x=>x.reason==='binding-outside-representation').length,1);
  assert.ok(r.engine.evaluations.every(e=>['compliant','not-applicable'].includes(e.classification)));
 });
 test('captured child owns its violation without duplicate parent error: '+platform,()=>{
  const f=scopedScenario(platform);f.snapshot.componentDependencyCaptures[0].snapshot.nodes[0].appearance.opacity=.4;f.sync();
  const result=f.run().engine.evaluations,failures=result.filter(e=>e.classification==='violation');
  assert.equal(failures.length,1);assert.ok(failures[0].dependency);assert.equal(failures[0].focusNodeId,'member-0');
  assert.ok(result.some(e=>!e.dependency&&e.subjectNodeId==='root'&&e.classification==='compliant'));
 });
 test('inactive owner variant does not execute children: '+platform,()=>{
  const r=scopedScenario(platform,'False').run();assert.ok(r.engine.dependencyRuns.every(x=>x.status==='not-applicable'));
 });
}
for(const [name,change]of [
 ['empty',b=>b.representationIds=[]],['missing',b=>delete b.representationIds],['unknown',b=>b.representationIds=['unknown']],
 ['duplicate',b=>b.representationIds=['desktop','desktop']],['overlap',b=>b.representationIds=['desktop','mobile-web']],
 ['unversioned scope',b=>b.kind='fixed-nested'],
])test('rejects invalid scope '+name,()=>{const f=scopedScenario();change(f.manual.componentDependencies[0].bindings[0]);assert.ok(f.compile().issues.some(i=>i.level==='error'&&i.code==='COMPONENT_DEPENDENCY'));});
test('rejects overlap between unscoped and scoped bindings',()=>{
 const f=scopedScenario(),b=clone(f.manual.componentDependencies[0].bindings[0]);b.id='legacy';b.kind='fixed-nested';delete b.representationIds;
 f.manual.componentDependencies[0].bindings.push(b);assert.ok(f.compile().issues.some(i=>i.message==='Fixed nested bindings may not overlap in the same representation.'));
});
for(const [name,change]of [
 ['stale actual root',s=>s.nodes[0].component.identity.componentKey='stale'],['stale source',s=>s.source.componentKey='stale'],
 ['missing independent root',s=>delete s.variantReference],['wrong channel',s=>s.context.platform='mobile-web'],
])test('unproven root stays UNKNOWN, not inactive: '+name,()=>{
 const f=scopedScenario(),c=f.compile().contract;change(f.snapshot);const s=core.prepareValidationSnapshot(f.snapshot,c),d=c.componentDependencies[0];
 assert.equal(core.resolveFixedNestedBinding(s,d,d.bindings[1],false,c).status,'unknown');
});
for(const version of [undefined,1,3])test('root refuses unsupported scoped feature '+version,()=>{
 const f=scopedScenario(),c=f.compile().contract;c.runtimePolicy.crossRepresentationBindingsVersion=version;
 assert.throws(()=>core.evaluateCompiledContract(f.snapshot,c),/REPRESENTATION_RUNTIME_UNSUPPORTED/);
});
for(const [name,change]of [
 ['missing capture',f=>f.snapshot.componentDependencyCaptures=[]],
 ['foreign child',f=>f.snapshot.nodes.find(n=>n.id==='member-0').component.identity.componentSetKey='foreign'],
 ['stale capture',f=>f.snapshot.componentDependencyCaptures[0].snapshot.nodes[0].appearance.opacity=.3],
])test('child capture proof fails closed: '+name,()=>{
 const f=scopedScenario();change(f);assert.ok(f.run().engine.dependencyRuns.some(x=>x.bindingId==='desktop-child'&&x.status==='not-executed'));
});
test('unknown manual schema is refused by the importer',()=>{
 const f=scopedScenario();f.manual.schemaVersion='apollo.component-contract-manual.future';
 assert.throws(()=>core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)}]),/Unsupported manual source schema/);
});
test('unknown dependency feature retains the legacy unsupported-runtime diagnostic',()=>{
 const f=scopedScenario(),child=clone(f.childContract);child.runtimePolicy.crossRepresentationBindingsVersion=3;
 const dependency=clone(f.manual.componentDependencies[0]);dependency.compiledHash=core.stableHash(child);
 assert.equal(core.dependencyPinIssue(dependency,child),'dependency-runtime-unsupported');
});

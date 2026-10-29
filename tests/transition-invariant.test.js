const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {scenario,core,clone}=require('./helpers/button-spinner');
const source=require('../../../shared/design-system_ab/experiments/web-core/core/Button/contract.manual.json');
const id='component:web-core.button.loading-preserves-width';
// Synthetic paired evidence, not live acceptance. Actual child/reference from accepted Spinner fixture.
function pair(){
 const f=scenario();f.manual.semanticApi=clone(source.semanticApi);f.manual.representations=clone(source.representations);f.manual.generation=clone(source.generation);
 f.manual.rules=[clone(source.rules.find(r=>r.id===id))];
 f.snapshot.source.representationId='core.web.button.figma.desktop';
 const compiled=f.run().compiled;
 const capture=sequence=>({schemaVersion:'apollo.transition-capture.v1',sessionId:'test-session',sequence,
  manualSourceHash:compiled.contract.package.manualSourceHash,complete:true,
  externalContext:{profile:'same-instance-context@1',pageId:f.snapshot.source.pageId,ancestors:[],rootConstraints:{}}});
 f.snapshot.transitionCapture=capture(2);
 const before=clone(f.snapshot);before.transitionCapture=capture(1);
 const owner=before.nodes.find(n=>n.id===f.owner.id);owner.component.properties.Type='Icon-24';
 before.variantReference.nodeProperties['LeftAddon / LeftAddon'].properties.Type='Icon-24';
 f.snapshot.transitionBefore=before;
 return {...f,before};
}
const own=r=>r.engine.evaluations.find(e=>e.ruleId===id+'.1.1');
const evidence=(f,r)=>Object.values(core.prepareValidationSnapshot(f.snapshot,r.contract).nodes[0].transitionsV1)[0];
test('same instance width is a contract-driven predicate; shrink and growth both violate',()=>{
 const f=pair();let r=f.run();assert.deepEqual(r.compiled.issues.filter(i=>i.level==='error'),[]);
 assert.equal(evidence(f,r).reason,'paired');assert.equal(own(r).classification,'compliant');
 for(const delta of [-10,10]){f.root.bounds.width=f.before.nodes[0].bounds.width+delta;r=f.run();assert.equal(own(r).classification,'violation');
  const detail=core.buildEvaluationDetails(r.report,r.contract,[]).find(d=>d.ruleId===id+'.1.1');
  assert.equal(detail.expected,f.before.nodes[0].bounds.width);assert.equal(detail.actualLabel,'После перехода');
 }
 f.root.bounds.width=f.before.nodes[0].bounds.width+0.005;assert.equal(own(f.run()).classification,'compliant');
});
test('missing pair is Not executed, not unknown duplication or a full check',()=>{
 const f=pair();delete f.snapshot.transitionBefore;const r=f.run();
 assert.equal(own(r).classification,'human-review');assert.equal(r.report.scenarioCoverage.complete,false);
 const rows=r.report.evaluations.filter(e=>String(e.ruleId).startsWith(id));
 assert.equal(rows.length,1);assert.equal(rows[0].classification,'not-executed');
 assert.ok(JSON.stringify(rows).includes('Сначала запомните'));assert.ok(!JSON.stringify(rows).includes('не вернул результат'));
});
for(const [label,mutate,reason] of [
 ['other instance',f=>f.snapshot.source.rootNodeId='other','instance-or-variant-changed'],
 ['other page',f=>f.snapshot.source.pageId='other','instance-or-variant-changed'],
 ['other variant',f=>f.before.source.componentKey='other','instance-or-variant-changed'],
 ['other representation',f=>f.snapshot.source.representationId='other','instance-or-variant-changed'],
 ['other session',f=>f.snapshot.transitionCapture.sessionId='other','capture-order-or-session-mismatch'],
 ['old capture',f=>f.snapshot.transitionCapture.sequence=1,'capture-order-or-session-mismatch'],
 ['edited manual',f=>f.manual.rules[0].rationale+=' changed','manual-source-changed'],
 ['unknown topology',f=>f.before.source.truncated=true,'topology-incomplete'],
 ['product',f=>f.snapshot.context.product='other','scenario-context-changed'],
 ['mode',f=>f.snapshot.context.modes.collection='dark','scenario-context-changed'],
 ['parent layout',f=>f.snapshot.transitionCapture.externalContext.ancestors.push({width:500}),'external-context-changed'],
 ['missing context',f=>f.snapshot.transitionCapture.complete=false,'capture-context-incomplete'],
 ['changed during capture',f=>Object.assign(f.snapshot.transitionCapture,{complete:false,reason:'changed-during-capture'}),'changed-during-capture'],
 ['changed label',f=>f.root.component.properties['✎ Label#16:294']='new','invariant-changed-or-unknown'],
 ['unknown label',f=>f.root.unknownFacts.push('component.properties.✎ Label#16:294'),'invariant-changed-or-unknown'],
 ['bad before state',f=>f.before.nodes.find(n=>n.id===f.owner.id).component.properties.Type='Spinner','before-state-not-proven'],
 ['unknown width',f=>f.root.unknownFacts.push('bounds.width'),'dimension-unknown'],
 ['zero width',f=>f.root.bounds.width=0,'dimension-unknown'],
 ['recursive pair',f=>f.before.transitionBefore=clone(f.before),'before-not-captured'],
])test(`pair rejects ${label} without passing`,()=>{
 const f=pair();mutate(f);const r=f.run();assert.equal(evidence(f,r).reason,reason);
 assert.notEqual(own(r)?.classification,'compliant');assert.equal(r.report.scenarioCoverage.complete,false);
});
test('inactive transition is not applicable; unknown activation is not a pass',()=>{
 const f=pair();f.owner.component.properties.Type='Icon-24';
 f.snapshot.variantReference.nodeProperties['LeftAddon / LeftAddon'].properties.Type='Icon-24';
 assert.equal(own(f.run()).classification,'not-applicable');
 f.owner.unknownFacts.push('component.properties.Type');const r=f.run();
 assert.equal(evidence(f,r).reason,'after-state-unknown');assert.equal(r.report.scenarioCoverage.complete,false);
});
test('source declaration validates dependency, bounds, invariants, scope, tolerance',()=>{
 for(const edit of [r=>r.constraints[0].transition.dependencyId='missing',r=>r.constraints[0].transition.to=false,
  r=>r.constraints[0].transition.invariantFacts=['unknown'],r=>r.constraints[0].transition.tolerance=-1,
  r=>r.constraints[0].fact='appearance.fill',r=>r.targetScope='self-and-descendants',
  r=>r.applicability.context={loading:true}]){
  const f=pair();edit(f.manual.rules[0]);assert.ok(f.run().compiled.issues.some(i=>i.code==='CONSTRAINT_TRANSITION'));
 }
});
test('JSON replay is exact, derived temporal results cannot override captures',()=>{
 const f=pair(),r=f.run(),prepared=core.prepareValidationSnapshot(f.snapshot,r.contract);
 assert.deepEqual(core.prepareValidationSnapshot(prepared,r.contract),prepared);
 assert.deepEqual(core.evaluateCompiledContract(clone(prepared),r.contract),r.engine);
 const key=r.contract.facts.transitions[0].id;prepared.nodes[0].transitionsV1[key].after=9999;
 assert.deepEqual(core.evaluateCompiledContract(prepared,r.contract),r.engine);
 const ws=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)},
  {name:'compiled/component-contract.v2.json',text:JSON.stringify(r.compiled.contract)}]);
 assert.deepEqual(ws.manual.rules[0],f.manual.rules[0]);
});
test('legacy r21 reports retain exact engine, diagnostics and coverage',()=>{
 const zlib=require('node:zlib'),dir=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Button/qa/fixtures/effective-hint-visibility-r21');
 for(const name of fs.readdirSync(dir)){
  const report=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir,name))));
  const contract=report.runtime.evaluatedContract;
  const engine=core.evaluateCompiledContract(report.snapshot,contract);
  assert.deepEqual(clone(engine),report.results.engine);
  const editor=core.buildEditorValidationReport(engine,{contract:report.sources.compiledContract,issues:report.sources.compilerIssues},report.sources.manual,report.snapshot);
  assert.deepEqual(clone(editor),report.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(editor,contract,report.anatomy)),report.results.details);
 }
});

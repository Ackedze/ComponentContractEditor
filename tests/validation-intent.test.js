const test=require('node:test'), assert=require('node:assert/strict'), core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'), clone=x=>JSON.parse(JSON.stringify(x));
// Generic Widget, not Button: the contract declares the input and both assertions.
function scenario() {
 const manual=clone(fixture.manual);
 manual.component.componentKey='set';manual.generation.profiles=[];manual.componentDependencies=[];manual.controlPorts=[];
 manual.representations=[{id:'figma:test',kind:'figma',platform:'desktop',status:'verified',locator:{componentSetKey:'set'}}];
 manual.semanticApi=[{id:'stretch',kind:'layout',valueType:'boolean',defaultValue:false,bindings:[],validationInput:{version:1,label:'Stretch',description:'Independent specification'}}];
 manual.targets=[{id:'target.root',semanticRole:'root',label:'Widget',pathHint:'Widget',lineage:[],resolution:'resolved'}];
 manual.rules=[{...clone(fixture.manual.rules[0]),id:'widget-stretch',targetId:'target.root',targetScope:'self',capability:'layout.sizingHorizontal',permission:'constrained',status:'reviewed',execution:{route:'predicate'},owner:'test',rationale:'Stretch requires Fill in Auto Layout',
  constraints:[{type:'layoutConstraint',fact:'layout.sizingHorizontal',operator:'equals',value:'FILL'},{type:'propertyDomain',fact:'parent.layout.mode',values:['HORIZONTAL','VERTICAL','GRID']}],
  applicability:{variants:'all',modes:'all',platforms:['desktop'],context:{'expectedInput.stretch':true}}}];
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-28T16:00:00Z',source:{rootNodeId:'instance',pageId:'page',componentKey:'variant',componentSetKey:'set',truncated:false},selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},nodes:[{id:'root',parentId:null,childIds:[],order:0,name:'Widget',type:'INSTANCE',visible:true,semantic:{role:'root',path:'Widget'},component:{identity:{componentKey:'variant',componentSetKey:'set'}},layout:{sizingHorizontal:'FILL'},parent:{layout:{mode:'HORIZONTAL'}},unknownFacts:[]}]};
 const compile=()=>core.compileManualSource(manual), intent=value=>{snapshot.validationIntent=core.createValidationIntent(snapshot,compile().contract,value===undefined?{}:{stretch:value});};
 const run=()=>{const compiled=compile();assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);const prepared=core.prepareValidationSnapshot(snapshot,compiled.contract);const engine=core.evaluateCompiledContract(snapshot,compiled.contract);const report=core.buildEditorValidationReport(engine,compiled,manual,prepared);return{compiled,prepared,engine,report,classes:engine.evaluations.map(e=>e.classification)};};
 return {manual,snapshot,root:snapshot.nodes[0],compile,intent,run};
}
test('explicit true checks independent sizing and parent assertions; source is immutable',()=>{
 const f=scenario();f.intent(true);const before=clone(f.snapshot);assert.deepEqual(f.run().classes,['compliant','compliant']);assert.deepEqual(f.snapshot,before);
 f.root.layout.sizingHorizontal='HUG';assert.deepEqual(f.run().classes,['violation','compliant']);
 f.root.layout.sizingHorizontal='FIXED';assert.deepEqual(f.run().classes,['violation','compliant']);
 f.root.parent.layout.mode='NONE';assert.deepEqual(f.run().classes,['violation','violation']);
 f.root.layout.sizingHorizontal='FILL';for(const mode of ['HORIZONTAL','VERTICAL','GRID']){f.root.parent.layout.mode=mode;assert.deepEqual(f.run().classes,['compliant','compliant']);}
});
test('explicit false means not applicable, not a prohibition on Fill or requirement for Hug',()=>{
 const f=scenario();f.intent(false);for(const sizing of ['FILL','HUG','FIXED']){f.root.layout.sizingHorizontal=sizing;assert.deepEqual(f.run().classes,['not-applicable','not-applicable']);}
});
test('missing input never inferred from actual Fill, default false, semantic API or stale derived facts',()=>{
 const f=scenario();f.root.expectedInput={stretch:true};f.root.semanticApi={stretch:true};
 const r=f.run();assert.deepEqual(r.classes,['human-review','human-review']);assert.equal(r.report.scenarioCoverage.complete,false);
 assert.equal(r.prepared.nodes[0].expectedInput.stretch,undefined);
 assert.equal(r.prepared.nodes[0].expectedInputEvidence.stretch.reason,'expected-input-missing');
 f.intent(undefined);assert.deepEqual(f.run().classes,['human-review','human-review']);
});
test('invalid provenance, type, changed instance/page/key/manual and ambiguous identity fail closed',()=>{
 for(const edit of [f=>f.snapshot.validationIntent.origin='observed-fill',f=>f.snapshot.validationIntent.schemaVersion='old',f=>f.snapshot.validationIntent.values.stretch='true',f=>f.snapshot.validationIntent.values.stretch=null,
  f=>f.snapshot.source.rootNodeId='other',f=>f.snapshot.source.pageId='other',f=>f.snapshot.source.componentKey='other',f=>f.manual.metadata.revision++,f=>f.root.component.identity.componentSetKey='wrong',f=>f.snapshot.context.platform='mobile-web',
  f=>f.manual.representations.push({...clone(f.manual.representations[0]),id:'duplicate'}),f=>delete f.snapshot.validationIntent.subject]){
  const f=scenario();f.intent(true);edit(f);const r=f.run();assert.ok(r.classes.every(c=>c!=='compliant'));assert.equal(r.prepared.nodes[0].expectedInput.stretch,undefined);
 }
});
test('unknown parent/actual sizing never passes; no access failure is rewritten as NONE',()=>{
 const f=scenario();f.intent(true);f.root.unknownFacts=['parent'];assert.deepEqual(f.run().classes,['compliant','human-review']);
 f.root.unknownFacts=['layout.sizingHorizontal'];assert.deepEqual(f.run().classes,['human-review','compliant']);
 const missing=core.captureSupplementalFacts({type:'INSTANCE'},Symbol('mixed'));assert.ok(missing.unknownFacts.includes('parent'));
 assert.deepEqual(core.captureSupplementalFacts({type:'INSTANCE',parent:{type:'PAGE'}},Symbol('mixed')).parent.layout,{mode:'NONE'});
});
test('JSON replay is exact and old contracts remain opt-out',()=>{
 const f=scenario();f.intent(true);const r=f.run();const serialized=JSON.parse(JSON.stringify(r.prepared));
 assert.deepEqual(core.prepareValidationSnapshot(serialized,r.compiled.contract),r.prepared);
 assert.deepEqual(core.evaluateCompiledContract(serialized,r.compiled.contract),r.engine);
 const old=clone(r.compiled.contract);delete old.runtimePolicy.validationIntentVersion;
 const s=clone(f.snapshot);s.nodes[0].expectedInput={stretch:'legacy'};
 assert.equal(core.prepareValidationSnapshot(s,old).nodes[0].expectedInput.stretch,'legacy');
});
test('input declarations and context references are validated, cannot silently lose conditional scope',()=>{
 for(const edit of [f=>f.manual.semanticApi[0].validationInput.version=2,f=>f.manual.semanticApi[0].validationInput.label='',f=>f.manual.semanticApi[0].valueType='string',f=>delete f.manual.semanticApi[0].validationInput,
  f=>f.manual.rules[0].applicability.context={'expectedInput.unknown':true},f=>f.manual.rules[0].applicability.context={'expectedInput.stretch':'true'},f=>f.manual.rules[0].targetScope='descendants']){
  const f=scenario();edit(f);assert.ok(core.validateManualSource(f.manual).some(i=>i.level==='error'));
 }
});
test('diagnostics explain missing expected input, and false is an applicability condition, not a violation',()=>{
 const f=scenario();let r=f.run(),details=core.buildEvaluationDetails(r.engine,r.compiled.contract,[]);
 assert.ok(details.every(d=>/независимое ожидание/.test(d.reasonLabel)&&!d.showComparison));
 f.intent(false);r=f.run();details=core.buildEvaluationDetails(r.engine,r.compiled.contract,[]);
 assert.ok(details.every(d=>/не активирует/.test(d.reasonLabel)&&d.actual===false&&d.expected===true));
});

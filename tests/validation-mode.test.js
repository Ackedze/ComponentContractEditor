const test=require('node:test'),assert=require('node:assert/strict'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));
function scenario(){
 const m=clone(fixture.manual);m.component.componentKey='set';m.generation.profiles=[];m.componentDependencies=[];m.controlPorts=[];
 m.representations=[{id:'figma:test',kind:'figma',platform:'desktop',status:'verified',locator:{componentSetKey:'set'}}];
 m.semanticApi=[{id:'stretch',kind:'layout',valueType:'boolean',bindings:[],validationInput:{version:1,label:'Stretch',description:'External expectation'}}];
 m.targets=[{id:'target.root',semanticRole:'root',label:'Widget',pathHint:'Widget',lineage:[],resolution:'resolved'}];
 const rule={...clone(fixture.manual.rules[0]),id:'widget-stretch',targetId:'target.root',targetScope:'self',capability:'layout.sizingHorizontal',permission:'constrained',status:'reviewed',execution:{route:'predicate'},owner:'test',rationale:'Specification: stretch requires Fill',constraints:[{type:'layoutConstraint',fact:'layout.sizingHorizontal',operator:'equals',value:'FILL'}],applicability:{variants:'all',modes:'all',platforms:['desktop'],validationMode:'specification',context:{'expectedInput.stretch':true}}};
 m.rules=[rule,{...clone(rule),id:'intrinsic-opacity',capability:'appearance.opacity',applicability:{variants:'all',modes:'all',platforms:['desktop']},constraints:[{type:'propertyDomain',fact:'appearance.opacity',values:[1]}]}];
 const s={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-28T18:00:00Z',source:{rootNodeId:'instance',pageId:'page',componentKey:'variant',componentSetKey:'set',truncated:false},selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},nodes:[{id:'root',parentId:null,childIds:[],order:0,name:'Widget',type:'INSTANCE',visible:true,semantic:{role:'root',path:'Widget'},component:{identity:{componentKey:'variant',componentSetKey:'set'}},layout:{sizingHorizontal:'HUG'},appearance:{opacity:1},unknownFacts:[]}]};
 function run(){const c=core.compileManualSource(m);const e=core.evaluateCompiledContract(s,c.contract);const r=core.buildEditorValidationReport(e,c,m,s);return{c,e,r,spec:e.evaluations.find(e=>e.ruleId.startsWith('widget-stretch')),details:core.buildEvaluationDetails(r,c.contract,[])}};
 function intent(v){s.validationIntent=core.createValidationIntent(s,core.compileManualSource(m).contract,{stretch:v})}
 return{m,s,run,intent};
}
test('default audit excludes specification without calling it pass; intrinsic checks still execute',()=>{
 const f=scenario();const before=clone(f.s);const {e,r,details}=f.run();assert.deepEqual(f.s,before);
 assert.deepEqual(e.evaluations.map(e=>e.classification),['compliant','not-applicable']);
 assert.equal(r.scenarioCoverage.complete,true);assert.equal(r.scenarioCoverage.validationMode,'component-audit');assert.equal(r.scenarioCoverage.specificationStatus,'not-requested');
 assert.match(details[1].reasonLabel,/спецификации не запрошена/);assert.equal(details[1].showComparison,false);
 f.intent(true);assert.equal(f.run().spec.classification,'not-applicable');
 for(const mode of ['component-audit','specification']){f.s.validationRequest={version:1,mode};f.s.nodes[0].appearance.opacity=.5;assert.equal(f.run().e.evaluations.find(e=>e.ruleId.startsWith('intrinsic')).classification,'violation');}
});
test('explicit specification keeps missing expectations inconclusive and validates independent input',()=>{
 const f=scenario();f.s.validationRequest={version:1,mode:'specification'};
 assert.equal(f.run().spec.classification,'human-review');assert.equal(f.run().r.scenarioCoverage.complete,false);
 f.intent(true);assert.equal(f.run().spec.classification,'violation');
 f.s.nodes[0].layout.sizingHorizontal='FILL';assert.equal(f.run().spec.classification,'compliant');
 f.intent(false);assert.equal(f.run().spec.classification,'not-applicable');
});
test('context-only mappings stay package gaps; excluded from audit, pending in specification',()=>{
 const f=scenario();delete f.m.rules[0].applicability.context;f.m.rules[0].execution={route:'context-only',missingFacts:['derived.external']};
 let {r}=f.run();assert.equal(r.contractReadiness.unimplementedRules,1);assert.equal(r.contractReadiness.status,'draft');assert.equal(r.scenarioCoverage.complete,true);
 assert.equal(r.evaluations.find(e=>e.ruleId==='widget-stretch').classification,'not-applicable');
 f.s.validationRequest={version:1,mode:'specification'};r=f.run().r;assert.equal(r.scenarioCoverage.notExecuted,1);assert.equal(r.scenarioCoverage.complete,false);
});
test('absent/unresolved spec-only target cannot make ordinary audit incomplete; intrinsic target gaps remain',()=>{
 const f=scenario();f.m.targets.push({id:'target.missing',semanticRole:'missing',label:'Missing',pathHint:'Widget/Missing',lineage:[],resolution:'needs-remap'});
 f.m.rules[0].targetId='target.missing';delete f.m.rules[0].applicability.context;f.m.rules[0].execution={route:'context-only',missingFacts:['derived.external']};
 assert.equal(f.run().r.scenarioCoverage.notExecuted,0);
 delete f.m.rules[0].applicability.validationMode;assert.ok(f.run().r.scenarioCoverage.notExecuted>0);
});
test('malformed mode and forged derived scope never become a successful audit',()=>{
 for(const request of [null,{version:2,mode:'component-audit'},{version:1,mode:'bad'}]){
  const f=scenario();f.s.validationRequest=request;f.s.nodes[0].validationScopeV1={mode:'component-audit',isRoot:true};
  assert.equal(f.run().r.scenarioCoverage.complete,false);assert.equal(f.run().r.scenarioCoverage.validationMode,'unknown');
 }
});
test('scope survives edit/compile/export; invalid declaration blocks reviewed save',()=>{
 const f=scenario();const old=f.m.rules[0].applicability;
 assert.equal(core.mergeEditedApplicability(old,{variants:'all',modes:'all',platforms:[]}).validationMode,'specification');
 const c=f.run().c.contract;assert.equal(c.customizationPolicy[0].applicability.validationMode,undefined); // sorted intrinsic first
 assert.equal(c.customizationPolicy.find(p=>p.id==='widget-stretch').applicability.validationMode,'specification');
 assert.equal(c.runtimePolicy.validationModeVersion,1);
 f.m.rules[0].applicability.validationMode='typo';assert.ok(core.validateManualSource(f.m).some(i=>i.code==='RULE_VALIDATION_MODE'));
});
test('new reports replay exactly, historical contracts opt out even with request present',()=>{
 const f=scenario();f.s.validationRequest={version:1,mode:'specification'};f.intent(true);const {c,e,r}=f.run();
 const download=JSON.parse(core.buildValidationReportDownload({manual:f.m,compiled:c,evaluatedContract:c.contract,snapshot:f.s,anatomy:[],engineResult:e,result:r,capture:null,trigger:'selected-instance'}).json);
 assert.deepEqual(core.evaluateCompiledContract(download.snapshot,download.runtime.evaluatedContract),e);
 assert.equal(download.summary.validationMode,'specification');
 delete f.m.rules[0].applicability.validationMode;const old=core.compileManualSource(f.m).contract;const a=clone(f.s);delete a.validationRequest;
 assert.equal(old.runtimePolicy.validationModeVersion,undefined);assert.deepEqual(core.evaluateCompiledContract(a,old).evaluations.map(e=>e.classification),core.evaluateCompiledContract(f.s,old).evaluations.map(e=>e.classification));
});

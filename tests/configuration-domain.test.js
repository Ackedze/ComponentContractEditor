const test=require('node:test'),assert=require('node:assert/strict'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));
function scenario(){
 const m=clone(fixture.manual);m.component.componentKey='set';m.generation.profiles=[];m.componentDependencies=[];m.controlPorts=[];
 m.representations=[{id:'figma:widget',kind:'figma',platform:'desktop',status:'verified',locator:{componentSetKey:'set'}}];
 m.semanticApi=[{id:'density',kind:'layout',valueType:'enum',domain:['compact','spacious'],bindings:[],validationInput:{version:2,label:'Density',description:'Independent design brief'}}];
 m.targets=[{id:'root',semanticRole:'root',label:'Widget',pathHint:'Widget',lineage:[],resolution:'resolved'},
  {id:'content',semanticRole:'content',label:'Content',pathHint:'Widget / Content',lineage:[],resolution:'resolved'}];
 const rule={...clone(fixture.manual.rules[0]),id:'widget-configuration',targetId:'root',targetScope:'self',capability:'layout.sizingHorizontal',permission:'constrained',status:'reviewed',execution:{route:'predicate'},owner:'test',rationale:'Only complete profiles are allowed',applicability:{variants:'all',modes:'all',platforms:['desktop']}};
 m.rules=[{...rule,constraints:[{type:'configurationDomain',configuration:{activeRoles:['content'],profiles:[{id:'compact',requirements:[{targetRole:'content',fact:'layout.sizingHorizontal',value:'HUG'}]},{id:'spacious',requirements:[{targetRole:'content',fact:'layout.sizingHorizontal',value:'FILL'}]}],specificationInput:'density'}}]},
  {...rule,id:'widget-baseline',targetScope:'descendants',permission:'forbidden',constraints:[{type:'propertyForbidden',fact:'layout.sizingHorizontal',exceptConfiguration:{ruleId:rule.id,targetRoles:['content']}}]}];
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-28T19:00:00Z',source:{rootNodeId:'instance',pageId:'page',componentKey:'variant',componentSetKey:'set',truncated:false},selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},nodes:[
  {id:'root',parentId:null,childIds:['content'],order:0,name:'Widget',type:'INSTANCE',visible:true,semantic:{role:'root',path:'Widget'},component:{identity:{componentKey:'variant',componentSetKey:'set'}},layout:{},unknownFacts:[]},
  {id:'content',parentId:'root',childIds:[],order:1,name:'Content',type:'FRAME',visible:true,semantic:{role:'content',path:'Widget / Content'},layout:{sizingHorizontal:'FILL'},baseline:{effective:{layout:{sizingHorizontal:'HUG'}}},unknownFacts:[]}],validationRequest:{version:1,mode:'component-audit'}};
 for(const n of snapshot.nodes){const t=m.targets.find(t=>t.semanticRole===n.semantic.role);t.lineage=n.semantic.path.split('/').slice(0,-1).map(s=>core.slug(s.trim()));t.structuralFingerprint=core.stableHash({type:n.type,path:n.semantic.path,order:n.order}).slice(0,16);}
 const compile=()=>core.compileManualSource(m),run=()=>{const c=compile();assert.deepEqual(c.issues.filter(i=>i.level==='error'),[]);const e=core.evaluateCompiledContract(snapshot,c.contract);return{c,e,own:e.evaluations.filter(e=>e.ruleId.startsWith('widget-configuration.'))};};
 return{m,snapshot,compile,run};
}
test('generic configuration compiles to ordinary predicates; audit permits only declared profiles',()=>{
 const f=scenario();for(const value of ['HUG','FILL','FIXED']){f.snapshot.nodes[1].layout.sizingHorizontal=value;const r=f.run();assert.equal(r.own[0].classification,value==='FIXED'?'violation':'compliant');assert.equal(r.own[1].classification,'not-applicable');}
 const r=f.run();assert.equal(r.c.contract.runtimePolicy.validationModeVersion,1);assert.equal(r.c.contract.runtimePolicy.validationIntentVersion,2);
 assert.ok(!r.e.evaluations.some(e=>e.ruleId.startsWith('widget-baseline.')&&e.classification==='violation'));
});
test('explicit enum conformance is independent of intrinsic permission and fails closed without input',()=>{
 const f=scenario();f.snapshot.validationRequest.mode='specification';assert.equal(f.run().own[1].classification,'human-review');
 const details=core.buildEvaluationDetails(f.run().e,f.compile().contract,[]);assert.ok(details.some(d=>d.reasonLabel.includes('Density')&&d.reasonLabel.includes('независимое ожидание')));
 for(const [value,expected] of [['compact','violation'],['spacious','compliant'],[true,'human-review'],['other','human-review']]){f.snapshot.validationIntent=core.createValidationIntent(f.snapshot,f.compile().contract,{density:value});assert.equal(f.run().own[1].classification,expected);}
 f.snapshot.validationIntent=core.createValidationIntent(f.snapshot,f.compile().contract,{density:'spacious'});f.snapshot.nodes[1].unknownFacts=['layout.sizingHorizontal'];const r=f.run();assert.equal(r.own[1].classification,'human-review');
 assert.ok(!core.buildEvaluationDetails(r.e,r.c.contract,[]).some(d=>d.reasonLabel.includes('не активирует')));
});
test('malformed profiles and widened exceptions are validation errors, never crashes or silent baseline removal',()=>{
 for(const edit of [m=>m.rules[0].constraints[0].configuration.profiles=[null],m=>m.rules[0].constraints[0].configuration.profiles[0].requirements=[null],m=>m.rules[0].constraints[0].configuration.activeRoles=['missing'],m=>m.rules[0].constraints[0].configuration.specificationInput='',m=>m.rules[0].constraints[0].configuration.profiles[0].requirements[0].fact='layout.constructor',m=>m.rules[1].constraints[0].exceptConfiguration.targetRoles=['root'],m=>m.rules[0].constraints[0].configuration.unrecognized=true]){
  const f=scenario();edit(f.m);const c=f.compile();assert.ok(c.issues.some(i=>i.level==='error'));assert.ok(c.contract.nonExecutableRules.some(r=>r.id==='widget-baseline'));
 }
});

function addRolelessOwnedNode(f) {
 const n={id:'decor',parentId:'root',childIds:[],order:2,name:'Unmapped instance',type:'FRAME',visible:true,
  semantic:{path:'Widget / Unmapped instance'},layout:{sizingHorizontal:'HUG'},
  baseline:{effective:{layout:{sizingHorizontal:'HUG'}}},unknownFacts:[]};
 f.snapshot.nodes[0].childIds.push(n.id);f.snapshot.nodes.push(n);
 for(const node of f.snapshot.nodes)node.relations={root:'root',content:'content'};
 return n;
}
const baselineResult=(r,id)=>r.e.evaluations.find(e=>e.ruleId==='widget-baseline.1.1'&&e.subjectNodeId===id);
test('baseline exception selects resolved target IDs; other nodes still check HUG/FIXED',()=>{
 const f=scenario(),n=addRolelessOwnedNode(f);
 assert.equal(baselineResult(f.run(),n.id).classification,'compliant');
 n.layout.sizingHorizontal='FIXED';assert.equal(baselineResult(f.run(),n.id).classification,'violation');
 assert.equal(baselineResult(f.run(),'content').classification,'not-applicable');
 n.unknownFacts=['layout.sizingHorizontal'];assert.equal(baselineResult(f.run(),n.id).classification,'human-review');
});
test('optional absent role is not unknown identity; explicit unknown target identity remains fail-closed',()=>{
 const {evaluateRules}=require('../../../services/apollo-proxy/src/predicate-engine');
 const f=scenario();addRolelessOwnedNode(f);const c=f.compile().contract;
 const s=core.prepareValidationSnapshot(f.snapshot,c),n=s.nodes.find(n=>n.id==='decor');
 delete n.semantic.role;
 const run=()=>({e:evaluateRules({snapshot:s,rules:c.rules,ruleRelease:c.package.manualSourceHash})});
 assert.equal(baselineResult(run(),n.id).classification,'compliant');
 assert.equal(run().e.evaluations.find(e=>e.ruleId==='widget-configuration.1.1').classification,'compliant');
 n.layout.sizingHorizontal='FIXED';assert.equal(baselineResult(run(),n.id).classification,'violation');
 assert.equal(baselineResult(run(),'content').classification,'not-applicable');
 // Candidate role is explicitly unreadable: membership is not proven, so never pass.
 s.nodes.find(n=>n.id==='content').unknownFacts.push('semantic.role');
 assert.equal(baselineResult(run(),n.id).classification,'human-review');
});

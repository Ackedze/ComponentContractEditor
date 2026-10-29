const test=require('node:test'), assert=require('node:assert/strict'), core=require('../dist/core.cjs');
const clone=x=>JSON.parse(JSON.stringify(x)), source=require('./fixtures/button-variants.json');
function scenario(){
 const m=clone(source.manual);m.component.componentKey='set';m.generation.profiles=[];m.componentDependencies=[];m.controlPorts=[];
 m.representations=[{id:'widget',kind:'figma',platform:'desktop',status:'verified',locator:{componentSetKey:'set'}}];
 m.semanticApi=[{id:'singleLine',kind:'layout',valueType:'boolean',defaultValue:false,bindings:[],validationInput:{version:1,label:'Single line',description:'Independent expectation'}}];
 m.validationContext=[{id:'bounded',valueType:'boolean',label:'Bounded container',description:'Scenario, not component API'}];
 m.targets=[{id:'root',semanticRole:'root',label:'Widget',pathHint:'Widget',lineage:[],resolution:'resolved'}, {id:'body',semanticRole:'body',label:'Body',pathHint:'Widget / Body',lineage:[],resolution:'resolved'}];
 m.rules=[{...clone(source.manual.rules[0]),id:'widget-layout',targetId:'root',targetScope:'self',capability:'layout.wrapping',permission:'constrained',status:'reviewed',execution:{route:'predicate'},owner:'test',rationale:'Conditional mapping',applicability:{variants:'all',modes:'all',platforms:['desktop'],validationMode:'specification'},constraints:[{type:'configurationMapping',mapping:{activeRoles:['body'],cases:[
  {id:'single',when:{singleLine:true},requirements:[{targetRole:'body',fact:'layout.sizingHorizontal',value:'HUG'}]},
  {id:'bounded',when:{singleLine:false,bounded:true},requirements:[{targetRole:'body',fact:'layout.sizingHorizontal',value:'FILL'},{targetRole:'root',fact:'parent.layout.mode',values:['HORIZONTAL','VERTICAL','GRID']}]},
 ]}}]}];
 const s={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-29T09:00:00Z',source:{rootNodeId:'instance',pageId:'page',componentKey:'variant',componentSetKey:'set',truncated:false},selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},validationRequest:{version:1,mode:'specification'},nodes:[
 {id:'root',parentId:null,childIds:['body'],order:0,name:'Widget',type:'INSTANCE',visible:true,semantic:{role:'root',path:'Widget'},component:{identity:{componentKey:'variant',componentSetKey:'set'}},parent:{layout:{mode:'HORIZONTAL'}},unknownFacts:[]},
 {id:'body',parentId:'root',childIds:[],order:1,name:'Body',type:'FRAME',visible:true,semantic:{role:'body',path:'Widget / Body'},layout:{sizingHorizontal:'HUG'},unknownFacts:[]},
 ]};
 for(const n of s.nodes){const t=m.targets.find(t=>t.semanticRole===n.semantic.role);t.lineage=n.semantic.path.split('/').slice(0,-1).map(s=>core.slug(s.trim()));t.structuralFingerprint=core.stableHash({type:n.type,path:n.semantic.path,order:n.order}).slice(0,16);}
 const compile=()=>core.compileManualSource(m);
 const intent=v=>{s.validationIntent=core.createValidationIntent(s,compile().contract,v);};
 const run=()=>{const c=compile();assert.deepEqual(c.issues.filter(i=>i.level==='error'),[]);const e=core.evaluateCompiledContract(s,c.contract);return {c,e,verdicts:['single','bounded'].map(id=>e.evaluations.find(e=>e.ruleId.endsWith('.'+id)).classification)};};
 return {m,s,compile,intent,run};
}
test('generic conditional mapping, not Button-specific runtime; no unconditional Fill/default inference',()=>{
 const f=scenario();assert.deepEqual(f.run().verdicts,['human-review','human-review']);
 f.intent({singleLine:true});assert.deepEqual(f.run().verdicts,['compliant','not-applicable']);
 f.s.nodes[1].layout.sizingHorizontal='FILL';assert.deepEqual(f.run().verdicts,['violation','not-applicable']);
 f.intent({singleLine:false,bounded:true});assert.deepEqual(f.run().verdicts,['not-applicable','compliant']);
 f.s.nodes[1].layout.sizingHorizontal='HUG';assert.deepEqual(f.run().verdicts,['not-applicable','violation']);
 f.intent({singleLine:false,bounded:false});assert.deepEqual(f.run().verdicts,['not-applicable','not-applicable']);
 f.intent({singleLine:false});assert.deepEqual(f.run().verdicts,['not-applicable','human-review']);
 f.s.validationRequest.mode='component-audit';assert.deepEqual(f.run().verdicts,['not-applicable','not-applicable']);
});
test('hidden target excludes missing inputs; ambiguous/unknown evidence never becomes a pass',()=>{
 const f=scenario();f.s.nodes[1].visible=false;assert.deepEqual(f.run().verdicts,['not-applicable','not-applicable']);
 for(const kind of ['visibility','identity','truncated','fact']){
  const f=scenario();f.intent({singleLine:true});
  if(kind==='visibility')f.s.nodes[1].unknownFacts=['visible'];
  if(kind==='identity')f.s.nodes[1].name='unmapped';
  if(kind==='truncated')f.s.source.truncated=true;
  if(kind==='fact')delete f.s.nodes[1].layout.sizingHorizontal;
  assert.equal(f.run().verdicts[0],'human-review',kind);
 }
});
test('independent inputs are pinned to instance/page/contract and typed; context has no API bindings',()=>{
 const f=scenario();f.intent({singleLine:false,bounded:true});
 f.s.validationIntent.subject.rootNodeId='other';assert.deepEqual(f.run().verdicts,['human-review','human-review']);
 f.intent({singleLine:false,bounded:'true'});assert.equal(f.run().verdicts[1],'human-review');
 assert.ok(!f.run().c.contract.facts.semanticApi.some(p=>p.id==='bounded'));
 assert.deepEqual(f.run().c.contract.facts.validationContext,f.m.validationContext);
 const inputs=core.validationInputs(f.m);assert.equal(inputs.find(p=>p.id==='bounded').validationInput.label,'Контекст: Bounded container');
});
test('parent Auto Layout domain and missing evidence are actually checked',()=>{
 const f=scenario();f.intent({singleLine:false,bounded:true});f.s.nodes[1].layout.sizingHorizontal='FILL';
 for(const [mode,expected]of [['HORIZONTAL','compliant'],['VERTICAL','compliant'],['GRID','compliant'],['NONE','violation']]){f.s.nodes[0].parent.layout.mode=mode;assert.equal(f.run().verdicts[1],expected);}
 delete f.s.nodes[0].parent;assert.equal(f.run().verdicts[1],'human-review');
});
test('malformed context/mapping and visibility/presence masquerading as layout fail validation',()=>{
 const edits=[m=>m.validationContext=[null],m=>m.validationContext={},m=>m.validationContext[0].id='singleLine',m=>m.validationContext[0].defaultValue=false,
 m=>m.rules[0].constraints[0].mapping.cases=[null],m=>m.rules[0].constraints[0].mapping.cases[0].when={bogus:true},
 m=>m.rules[0].constraints[0].mapping.cases[0].requirements=[null],m=>m.rules[0].constraints[0].mapping.cases[0].requirements[0].fact='visibility.effective',
 m=>m.rules[0].constraints[0].mapping.activeRoles=['missing'],m=>delete m.rules[0].applicability.validationMode];
 for(const edit of edits){const f=scenario();edit(f.m);assert.ok(f.compile().issues.some(i=>i.level==='error'));}
});
test('manual export/import roundtrip preserves context and typed mapping',async()=>{
 const f=scenario();const bundle=core.buildExportBundle(f.m);assert.equal(bundle.validation.valid,true);
 const zip=core.createZip([core.textZipEntry('contract.manual.json',f.m)]),entries=await core.readZip(zip);
 const w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(w.manual.validationContext,f.m.validationContext);assert.deepEqual(w.manual.rules,f.m.rules);
 assert.deepEqual(core.compileManualSource(w.manual).contract,bundle.compiled);
});

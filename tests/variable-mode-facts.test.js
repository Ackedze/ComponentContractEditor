const test=require('node:test'),assert=require('node:assert/strict'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));
const key='22d83aeb0d0d643a5359f63464a2ab81838fbe9f';
const collection={id:'VariableCollectionId:remote/local',key,name:'BackgroundPlate Color',defaultModeId:'136853:0',
 modes:[{modeId:'136853:0',name:'base-bg-alt (grey)'},{modeId:'136853:1',name:'base-bg (white)'},
  {modeId:'136941:0',name:'modal-bg-alt (grey)'},{modeId:'136941:1',name:'modal-bg (white)'}]};

test('mode capture uses the proven collection key across local and remote collection IDs',()=>{
 for(const id of ['VariableCollectionId:local','VariableCollectionId:remote/file']){
  const result=core.captureResolvedVariableModes({[id]:'136853:1'},[{...collection,id}]);
  assert.equal(result.modes[key],'136853:1');assert.deepEqual(result.unknownFacts,[]);
  assert.equal(result.modeCatalog[key].collectionName,'BackgroundPlate Color');
  assert.equal(result.modeCatalog[key].modes.length,4);
 }
});
test('catalog default, invalid mode, unknown key and ambiguous collection never prove an active mode',()=>{
 for(const resolved of [{},{[collection.id]:'missing'}]){
  const result=core.captureResolvedVariableModes(resolved,[collection]);
  assert.deepEqual(result.modes,{});assert.deepEqual(result.unknownFacts,[`variable.modes.${key}`]);
 }
 assert.deepEqual(core.captureResolvedVariableModes({[collection.id]:'136853:0'},[{...collection,key:''}]).modes,{});
 assert.deepEqual(core.captureResolvedVariableModes({[collection.id]:'136853:0'},[collection,{...collection,id:'duplicate'}]).modes,{});
});
test('incomplete collection metadata stays unknown instead of breaking capture',()=>{
 for(const modes of [undefined,[null],[{modeId:'136853:0'}]]){
  const result=core.captureResolvedVariableModes({[collection.id]:'136853:0'},[{...collection,modes}]);
  assert.deepEqual(result.modes,{});assert.deepEqual(result.modeCatalog,{});
  assert.deepEqual(result.unknownFacts,[`variable.modes.${key}`]);
 }
 assert.deepEqual(core.captureResolvedVariableModes({[collection.id]:'136853:0'},[{id:collection.id}]).modes,{});
});

function scenario(){
 const manual=clone(fixture.manual);manual.component.componentKey='mode-set';
 manual.generation.profiles=[];manual.componentDependencies=[];manual.controlPorts=[];manual.semanticApi=[];
 manual.representations=[{id:'figma:mode',kind:'figma',platform:'desktop',status:'verified',locator:{componentSetKey:'mode-set'}}];
 manual.targets=[{id:'root',semanticRole:'root',label:'Root',pathHint:'Root',lineage:[],resolution:'resolved'}];
 manual.rules=[{...clone(fixture.manual.rules[0]),id:'page-background-modes',targetId:'root',targetScope:'self',
  capability:`variable.modes.${key}`,permission:'constrained',status:'reviewed',execution:{route:'predicate'},
  owner:'test',rationale:'Page surfaces only',controlPaths:[{kind:'variable-binding',property:key,required:true,exclusive:true}],
  applicability:{variants:'all',modes:'all',platforms:['desktop']},
  constraints:[{type:'propertyDomain',values:['136853:0','136853:1']}]}];
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-30T12:00:00Z',
  source:{rootNodeId:'instance',pageId:'page',componentKey:'variant',componentSetKey:'mode-set',truncated:false},
  selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},
  nodes:[{id:'root',parentId:null,childIds:[],order:0,name:'Root',type:'INSTANCE',visible:true,
   semantic:{role:'root',path:'Root'},component:{identity:{componentKey:'variant',componentSetKey:'mode-set'}},
   variable:{modes:{[key]:'136853:0'}},unknownFacts:[]}]};
 const compiled=core.compileManualSource(manual);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 const run=()=>core.evaluateCompiledContract(snapshot,compiled.contract).evaluations.find(e=>e.ruleId.startsWith('page-background-modes.'));
 return{snapshot,compiled,run};
}
test('mode domain compiles to the common one-of predicate: both page modes pass, both modal modes fail',()=>{
 const f=scenario();
 assert.equal(f.compiled.contract.rules[0].assert.predicate,'one-of');
 for(const [mode,expected] of [['136853:0','compliant'],['136853:1','compliant'],['136941:0','violation'],['136941:1','violation']]){
  f.snapshot.nodes[0].variable.modes[key]=mode;assert.equal(f.run().classification,expected);
 }
});
test('unavailable mode is incomplete; matching context or fill cannot supply its value',()=>{
 const f=scenario();delete f.snapshot.nodes[0].variable.modes[key];
 f.snapshot.context.modes[collection.id]='136853:0';
 f.snapshot.nodes[0].appearance={fill:[{type:'SOLID',color:{r:242,g:243,b:245}}]};
 assert.equal(f.run().classification,'human-review');
});

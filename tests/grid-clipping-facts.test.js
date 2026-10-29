const test=require('node:test'),assert=require('node:assert/strict'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));

function scenario(){
 const manual=clone(fixture.manual);
 manual.component.componentKey='grid-set';
 manual.generation.profiles=[];
 manual.componentDependencies=[];
 manual.controlPorts=[];
 manual.semanticApi=[];
 manual.representations=[{id:'figma:grid',kind:'figma',platform:'desktop',status:'verified',locator:{componentSetKey:'grid-set'}}];
 manual.targets=[{id:'root',semanticRole:'root',label:'Root',pathHint:'Root',lineage:[],resolution:'resolved'}];
 const template={...clone(fixture.manual.rules[0]),targetId:'root',targetScope:'self',permission:'forbidden',
  status:'reviewed',execution:{route:'predicate'},owner:'test',rationale:'Keep library facts',
  applicability:{variants:'all',modes:'all',platforms:['desktop']}};
 manual.rules=[
  {...template,id:'grid-style',capability:'layout.gridStyleId',
   constraints:[{type:'propertyForbidden',fact:'layout.gridStyleId'}]},
  {...template,id:'clipping',capability:'layout.clipsContent',
   constraints:[{type:'propertyForbidden',fact:'layout.clipsContent'}]},
 ];
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-30T12:00:00Z',
  source:{rootNodeId:'instance',pageId:'page',componentKey:'grid-variant',componentSetKey:'grid-set',truncated:false},
  selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},
  nodes:[{id:'root',parentId:null,childIds:[],order:0,name:'Root',type:'INSTANCE',visible:true,
   semantic:{role:'root',path:'Root'},component:{identity:{componentKey:'grid-variant',componentSetKey:'grid-set'}},
   layout:{gridStyleId:'S:system-grid',clipsContent:false},
   baseline:{effective:{layout:{gridStyleId:'S:system-grid',clipsContent:false}}},unknownFacts:[]}]};
 const compiled=core.compileManualSource(manual);
 assert.deepEqual(compiled.issues.filter(issue=>issue.level==='error'),[]);
 const run=()=>core.evaluateCompiledContract(snapshot,compiled.contract).evaluations
  .filter(e=>e.ruleId.startsWith('grid-style.')||e.ruleId.startsWith('clipping.'))
  .sort((a,b)=>a.ruleId.startsWith('grid-style.')?-1:b.ruleId.startsWith('grid-style.')?1:0);
 return {snapshot,run};
}

test('grid style and clipping have independent, executable baseline assertions',()=>{
 const f=scenario(),root=f.snapshot.nodes[0];
 assert.deepEqual(f.run().map(e=>e.classification),['compliant','compliant']);
 root.layout.gridStyleId='';
 assert.deepEqual(f.run().map(e=>e.classification),['violation','compliant']);
 root.layout.gridStyleId='S:system-grid';root.layout.clipsContent=true;
 assert.deepEqual(f.run().map(e=>e.classification),['compliant','violation']);
 root.layout.clipsContent=false;
 assert.deepEqual(f.run().map(e=>e.classification),['compliant','compliant']);
});

test('missing grid or clipping facts cannot be reported as compliant',()=>{
 const f=scenario(),root=f.snapshot.nodes[0];
 delete root.layout.gridStyleId;delete root.layout.clipsContent;
 assert.deepEqual(f.run().map(e=>e.classification),['human-review','human-review']);
});

test('missing independent grid or clipping baseline keeps the check incomplete',()=>{
 const f=scenario(),root=f.snapshot.nodes[0];
 delete root.baseline.effective.layout.gridStyleId;delete root.baseline.effective.layout.clipsContent;
 assert.deepEqual(f.run().map(e=>e.classification),['human-review','human-review']);
});

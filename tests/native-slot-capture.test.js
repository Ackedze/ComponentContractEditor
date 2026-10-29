const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x)),property='Body#1:0';
function model(){
 const m=clone(fixture.manual);m.component.componentKey='host';m.rules=[];m.semanticApi=[];m.controlPorts=[];m.componentDependencies=[];m.generation.profiles=[];
 m.representations=[{id:'host.desktop',kind:'figma',platform:'desktop',status:'verified',locator:{componentKey:'host'}}];
 m.targets=[{id:'root',semanticRole:'root',pathHint:'Host',label:'Host',lineage:[],resolution:'resolved'},{id:'body',semanticRole:'body',pathHint:'Host / Body',label:'Body',lineage:['root'],resolution:'resolved'}];
 const template={...clone(fixture.manual.rules[0]),status:'reviewed',owner:'test',rationale:'Caller owns payload',applicability:{variants:'all',modes:'all',platforms:['desktop']},execution:{route:'auto'}};
 m.rules=[{...template,id:'open-body',targetId:'body',targetScope:'self',capability:'composition.content',permission:'allowed',controlPaths:[{kind:'slot-api',target:'body',property,contentOwnership:'external',required:true,exclusive:true}],constraints:[]},
 {...template,id:'host-opacity',targetId:'root',targetScope:'self',capability:'appearance.opacity',permission:'forbidden',controlPaths:[],constraints:[{type:'propertyForbidden',fact:'appearance.opacity'}]}];
 const shape=[{path:'',type:'ROOT'},{path:'Body',type:'SLOT'},{path:'Body / Placeholder',type:'FRAME'}];
 const e={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:core.stableHash('native-capture-test'),structures:{shape},variants:[{componentKey:'host',componentSetKey:'',structureId:'shape',properties:{}}]};
 const compiled=core.compileManualSource(m,e);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);return{manual:m,evidence:e,compiled};
}
test('capture plan is derived, not a manual mutation; direct property checks supported',()=>{
 const f=model(),hash=core.stableHash(f.manual),p=core.nativeSlotCapturePlan(f.compiled.contract);
 assert.equal(p.manualSourceHash,hash);assert.deepEqual(p.boundaries,[{targetId:'body',property,path:'Body',representationId:'host.desktop'}]);assert.equal(core.stableHash(f.manual),hash);
});
for(const [label,mutate] of [
 ['recursive rule',c=>c.customizationPolicy[1].targetScope='self-and-descendants'],
 ['payload target rule',c=>{c.facts.targets.push({id:'text',semanticRole:'text',pathHint:'Host / Body / Text',resolution:'resolved'});c.customizationPolicy.push({...c.customizationPolicy[1],id:'text-rule',targetId:'text'});}],
 ['structural count',c=>c.capabilities.operators.push('count-between')],
 ['relationship fact',c=>c.capabilities.facts.push('relations.text')],
 ['dependency contract',c=>c.componentDependencies=[{}]],
 ['conditional slot policy',c=>c.customizationPolicy.find(p=>p.id==='open-body').applicability.variants={View:['One']}],
 ['draft slot policy',c=>c.customizationPolicy.find(p=>p.id==='open-body').status='draft'],
 ['nested owner',c=>c.customizationPolicy.find(p=>p.id==='open-body').controlPaths[0].ownerTargetId='owner'],
])test('full capture remains required: '+label,()=>{const f=model();mutate(f.compiled.contract);assert.equal(core.nativeSlotCapturePlan(f.compiled.contract),undefined);});

async function capture({scoped=true,conflictingPayload=true,opacity=1,invalidAnchor=false}={}){
 const f=model(),messages=[],pages=[],created=[],page={id:'page',type:'PAGE',selection:[]};let payloadReads=0;
 const node=(id,name,type,children=[])=>({id,name,type,children,visible:true,opacity:1,width:100,height:50,x:0,y:0,resolvedVariableModes:{},componentPropertyReferences:{},remove(){this.removed=true;},exportAsync:async()=>new Uint8Array([1,2,3])});
 const main={id:'main',key:'host',componentPropertyDefinitions:{[property]:{type:'SLOT'}},parent:null};
 function scene(prefix,actual){
   const root=node(prefix+'root','Host','INSTANCE'),body=node(prefix+'body','Body','SLOT'),payload=node(prefix+'payload','Placeholder','FRAME');
   root.children=[body];body.children=[payload];root.parent=page;body.parent=root;payload.parent=body;
   root.componentProperties={[property]:{type:'SLOT',value:''}};root.getMainComponentAsync=async()=>main;
   body.componentPropertyReferences={slotContentId:actual&&invalidAnchor?'Wrong#1':property};root.setProperties=()=>{};root.setExplicitVariableModeForCollection=()=>{};
   if(actual){root.opacity=opacity;Object.defineProperty(body,'children',{get(){payloadReads++;return [payload];}});
     if(conflictingPayload){const alias=node(root.id,'Host','TEXT'),cycle=node(root.id,'Host','FRAME',[body]);alias.parent=payload;cycle.parent=payload;payload.children=[alias,cycle];}}
   return root;
 }
 const actual=scene('actual-',true);page.selection=[actual];main.createInstance=()=>{const r=scene('reference-',false);created.push(r);return r;};
 const figma={currentPage:page,fileKey:'file',root:{name:'Test'},mixed:Symbol(),showUI(){},on(){},ui:{postMessage:m=>messages.push(m)},base64Encode:b=>Buffer.from(b).toString('base64'),
   getStyleByIdAsync:async()=>null,variables:{getVariableCollectionByIdAsync:async()=>null,getVariableByIdAsync:async()=>null},
   createPage(){const p={id:'temporary',type:'PAGE',appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
 vm.runInContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),vm.createContext({figma,__html__:''}));
 await figma.ui.onmessage({type:'test-selection',requestId:'native-capture',componentKey:'host',acceptedComponentKeys:[],allowedComponentProperties:[],platform:'desktop',manualSourceHash:f.compiled.contract.package.manualSourceHash,
   representations:f.compiled.contract.facts.representations,...(scoped?{nativeSlotCapturePlan:core.nativeSlotCapturePlan(f.compiled.contract)}:{})});
 assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);const result=messages.find(m=>m.type==='selection-test-result');assert(result);
 assert(pages.every(p=>p.removed)&&created.every(n=>n.removed));assert.equal(actual.removed,undefined);
 return {...f,result,payloadReads};
}
test('plugin scoped capture bypasses broken external payload, never its own host/SLOT',async()=>{
 const f=await capture();assert.equal(f.payloadReads,0);assert.equal(f.result.snapshot.nodes.length,2);assert.equal(f.result.matchedBaselineNodes,2);
 assert.equal(f.result.snapshot.source.truncated,false);assert.equal(f.result.snapshot.source.nativeSlotCaptureScope.omissions[0].nodeId,'preview:1');
 const engine=core.evaluateCompiledContract(f.result.snapshot,f.compiled.contract),report=core.buildEditorValidationReport(engine,f.compiled,f.manual,f.result.snapshot);
 assert.equal(report.editorCoverage.complete,true);assert(engine.evaluations.every(e=>e.classification==='compliant'));
 const negative=await capture({opacity:.5});const result=core.evaluateCompiledContract(negative.result.snapshot,negative.compiled.contract);assert(result.evaluations.some(e=>e.classification==='violation'));
});
test('without confirmed scope, repeated IDs are stopped and reported as corrupt topology, not node limit',async()=>{
 const f=await capture({scoped:false});assert.equal(f.result.snapshot.nodes.length,3);assert.equal(f.result.snapshot.source.truncated,true);
 assert.equal(f.result.snapshot.source.captureTopology.limitReached,false);assert(f.result.snapshot.source.captureTopology.issues.some(i=>i.kind==='identity-conflict'));
 const result=core.evaluateCompiledContract(f.result.snapshot,f.compiled.contract),report=core.buildEditorValidationReport(result,f.compiled,f.manual,f.result.snapshot);
 assert.equal(report.editorCoverage.complete,false);assert(report.evaluations.some(e=>e.ruleId==='snapshot-capture'&&e.trace.reason.includes('identity-conflict')));
 assert.equal(f.result.snapshot.nodes[0].parentId,null);assert.deepEqual(JSON.parse(JSON.stringify(f.result.snapshot.nodes[0].childIds)),['preview:1']);
});
test('wrong actual native anchor never suppresses external traversal or produces full pass',async()=>{
 const f=await capture({invalidAnchor:true});assert(f.payloadReads>0);assert.equal(f.result.snapshot.source.nativeSlotCaptureScope,undefined);
 assert.equal(f.result.snapshot.source.truncated,true);
});
for(const [label,mutate] of [
 ['stale manual hash',s=>s.source.nativeSlotCaptureScope.manualSourceHash='stale'],
 ['wrong target',s=>s.source.nativeSlotCaptureScope.omissions[0].targetId='wrong'],
 ['wrong property',s=>s.source.nativeSlotCaptureScope.omissions[0].property='Other#1'],
 ['wrong path',s=>s.source.nativeSlotCaptureScope.omissions[0].path='Other'],
 ['duplicate omission',s=>s.source.nativeSlotCaptureScope.omissions.push(clone(s.source.nativeSlotCaptureScope.omissions[0]))],
 ['incomplete reference',s=>s.variantReference.complete=false],
 ['foreign host',s=>s.nodes[0].component.identity.componentKey='foreign'],
 ['unknown host identity',s=>s.nodes[0].unknownFacts.push('component.identity')],
 ['unknown owner property type',s=>s.nodes[0].unknownFacts.push('component.propertyTypes.'+property)],
])test('runtime reproves bounded capture; rejects '+label,async()=>{
 const f=await capture();mutate(f.result.snapshot);const prepared=core.prepareValidationSnapshot(f.result.snapshot,f.compiled.contract);
 assert.equal(prepared.source.truncated,true);assert.equal(prepared.source.captureTopology.issues[0].kind,'unconfirmed-scope');
 assert.equal(core.buildEditorValidationReport(core.evaluateCompiledContract(f.result.snapshot,f.compiled.contract),f.compiled,f.manual,f.result.snapshot).editorCoverage.complete,false);
 assert.deepEqual(core.prepareValidationSnapshot(prepared,f.compiled.contract),prepared);
});
test('adding a payload rule invalidates a cached omission without silently dropping required checks',async()=>{
 const f=await capture();f.manual.rules[1].targetScope='self-and-descendants';const compiled=core.compileManualSource(f.manual,f.evidence);
 assert.equal(core.prepareValidationSnapshot(f.result.snapshot,compiled.contract).source.truncated,true);
});
test('downloaded report names its bounded scope and preserves exact replay',async()=>{
 const f=await capture(),snapshot=f.result.snapshot,contract=f.compiled.contract;
 const engine=core.evaluateCompiledContract(snapshot,contract),result=core.buildEditorValidationReport(engine,f.compiled,f.manual,snapshot);
 const file=core.buildValidationReportDownload({manual:f.manual,compiled:f.compiled,evaluatedContract:contract,snapshot,anatomy:f.result.anatomy,
   engineResult:engine,result,capture:{kind:'selected-instance',requestId:'test',warnings:f.result.warnings},trigger:'selected-instance'});
 const r=JSON.parse(file.json);assert.equal(r.summary.captureScope.externalContentsChecked,false);assert.equal(r.summary.capturedNodes,2);
 assert.deepEqual(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract),r.results.engine);
});

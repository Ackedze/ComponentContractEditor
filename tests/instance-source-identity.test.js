const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const core=require('../dist/core.cjs'),clone=x=>JSON.parse(JSON.stringify(x));
const fixture=require('./fixtures/button-variants.json'),property='Body#1:0',backgroundKey='a'.repeat(40);

function model(){
 const manual=clone(fixture.manual);
 manual.component.componentKey='host';manual.rules=[];manual.semanticApi=[];manual.controlPorts=[];manual.componentDependencies=[];manual.generation.profiles=[];manual.examples=[];
 manual.representations=[{id:'host.desktop',kind:'figma',platform:'desktop',status:'verified',locator:{componentKey:'host'}}];
 manual.targets=[{id:'root',semanticRole:'root',pathHint:'Host',label:'Host',lineage:[],resolution:'resolved'},
  {id:'body',semanticRole:'body',pathHint:'Host / Body',label:'Body',lineage:['root'],resolution:'resolved'}];
 const template={...clone(fixture.manual.rules[0]),status:'reviewed',owner:'test',rationale:'Fixture',applicability:{variants:'all',modes:'all',platforms:['desktop']},execution:{route:'auto'},targetScope:'self',controlPaths:[]};
 manual.rules=[{...template,id:'open-body',targetId:'body',capability:'composition.content',permission:'allowed',controlPaths:[{kind:'slot-api',target:'body',property,contentOwnership:'external',required:true,exclusive:true}],constraints:[]},
  {...template,id:'host-clipping',targetId:'root',capability:'layout.clipsContent',permission:'forbidden',constraints:[{type:'propertyForbidden',fact:'layout.clipsContent'}]},
  {...template,id:'page-mode',targetId:'root',capability:'variable.modes.'+backgroundKey,permission:'constrained',constraints:[{type:'propertyDomain',values:['page-grey','page-white']}]},
  {...template,id:'host-opacity',targetId:'root',capability:'appearance.opacity',permission:'forbidden',constraints:[{type:'propertyForbidden',fact:'appearance.opacity'}]}];
 const shape=[{path:'',type:'ROOT'},{path:'Top',type:'INSTANCE'},{path:'Top / Fixer',type:'FRAME'},
  {path:'Body',type:'SLOT'},{path:'Body / Placeholder',type:'FRAME'},{path:'Bottom',type:'INSTANCE'},{path:'Bottom / Fixer',type:'FRAME'}].sort((a,b)=>a.path.localeCompare(b.path));
 const evidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:core.stableHash('anonymous-repeat-instance'),structures:{shape},variants:[{componentKey:'host',componentSetKey:'',structureId:'shape',properties:{}}]};
 const compiled=core.compileManualSource(manual,evidence);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 return {manual,evidence,compiled};
}

async function capture({rename=false,reorder=false,clips=false,mode='page-grey',opacity=1,badSource=false,unknownSource=false,remote=false,sourceFailure,sourceMismatch=false,sourceCorrupt=false}={}){
 const f=model(),messages=[],pages=[],created=[];let payloadReads=0;
 const page={id:'page',type:'PAGE',selection:[]};
 const node=(id,name,type,children=[])=>({id,name,type,children,visible:true,opacity:1,width:100,height:50,x:0,y:0,resolvedVariableModes:{},componentPropertyReferences:{},
  remove(){this.removed=true;},exportAsync:async()=>new Uint8Array([1])});
 const spacer=node('200:1','Spacer','COMPONENT',[node('200:2','Fixer','FRAME')]);spacer.key='spacer';spacer.children[0].parent=spacer;
 const main=node('100:1','Host','COMPONENT',[node('100:2','Top','INSTANCE'),node('100:3','Body','SLOT'),node('100:4','Bottom','INSTANCE')]);
 main.key='host';main.componentPropertyDefinitions={[property]:{type:'SLOT'}};main.parent=null;
 for(const n of main.children)n.parent=main;
 Object.defineProperty(main.children[1],'children',{get(){throw Error('source SLOT payload must not be read');}});
 if(badSource)main.children[2].id=main.children[0].id;
 if(unknownSource)main.children=[];
 if(remote){main.remote=true;for(let i=0;i<main.children.length;i++)main.children[i].id='900:'+i;}
 function scene(id,actual){
  const root=node(id,'Host','INSTANCE'),top=node('I'+id+';100:2',actual&&rename?'Renamed top':'Top','INSTANCE'),bottom=node('I'+id+';100:4',actual&&rename?'Renamed bottom':'Bottom','INSTANCE');
  const body=node('I'+id+';100:3','Body','SLOT'),payload=node('I'+id+';100:3;payload','Placeholder','FRAME');
  root.parent=page;root.children=actual&&reorder?[bottom,body,top]:[top,body,bottom];
  for(const n of root.children)n.parent=root;
  for(const n of[top,bottom]){n.children=[node(n.id+';200:2','Fixer','FRAME')];n.children[0].parent=n;n.getMainComponentAsync=async()=>spacer;n.componentProperties={Size:{type:'VARIANT',value:'24'}};}
  body.componentPropertyReferences={slotContentId:property};body.children=[payload];payload.parent=body;
  if(actual)Object.defineProperty(body,'children',{get(){payloadReads++;return[payload];}});
  root.componentProperties={[property]:{type:'SLOT',value:''}};root.getMainComponentAsync=async()=>main;root.setProperties=()=>{};root.setExplicitVariableModeForCollection=()=>{};
  root.clipsContent=actual?clips:false;root.opacity=actual?opacity:1;root.resolvedVariableModes={'bg-local':actual?mode:'page-grey'};
  return root;
 }
 const actual=scene('10:1',true);page.selection=[actual];let nextRef=0;
 main.createInstance=()=>{const count=++nextRef;if(sourceFailure&&count>1)throw Error('source unavailable');const r=scene('20:'+count,false);
  if(sourceMismatch&&count>1)r.getMainComponentAsync=async()=>({id:'foreign',key:'foreign'});
  if(sourceCorrupt&&count>1)r.children[2].id=r.children[0].id;
  created.push(r);return r;};
 const collection={id:'bg-local',key:backgroundKey,name:'Background',modes:['page-grey','page-white','modal-white'].map(modeId=>({modeId,name:modeId})),defaultModeId:'page-grey'};
 const figma={currentPage:page,fileKey:'fixture',root:{name:'Fixture'},mixed:Symbol(),showUI(){},on(){},ui:{postMessage:m=>messages.push(m)},base64Encode:b=>Buffer.from(b).toString('base64'),getStyleByIdAsync:async()=>null,
  variables:{getVariableCollectionByIdAsync:async()=>collection,getVariableByIdAsync:async()=>null},createPage(){const p={id:'temporary',type:'PAGE',appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
 vm.runInContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),vm.createContext({figma,__html__:''}));
 await figma.ui.onmessage({type:'test-selection',requestId:'repeat-instance',componentKey:'host',acceptedComponentKeys:[],allowedComponentProperties:[],platform:'desktop',manualSourceHash:f.compiled.contract.package.manualSourceHash,
  representations:f.compiled.contract.facts.representations,nativeSlotCapturePlan:core.nativeSlotCapturePlan(f.compiled.contract)});
 assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);const result=messages.find(m=>m.type==='selection-test-result');assert(result);
 assert(pages.every(p=>p.removed)&&created.every(n=>n.removed));assert.equal(actual.removed,undefined);
 return {...f,result,payloadReads,createdCount:created.length};
}

test('remote imported main with remapped local IDs is proven through independent pristine instances',async()=>{
 const f=await capture({remote:true,rename:true,reorder:true,clips:true,mode:'modal-white'}),s=f.result.snapshot;
 assert.equal(f.result.matchedBaselineNodes,6);assert.equal(f.payloadReads,0);assert(f.createdCount>=3);
 assert(s.source.instanceSourceIdentityCapture.owners.every(o=>o.status==='captured'));
 assert.equal(s.nodes.find(n=>n.name==='Renamed top').component.sourceIdentity.sourceNodeId,'100:2');
 const engine=core.evaluateCompiledContract(s,f.compiled.contract);
 assert.deepEqual(engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId.replace(/\.1\.1$/,'')).sort(),['host-clipping','page-mode']);
 assert.equal(core.buildEditorValidationReport(engine,f.compiled,f.manual,s).editorCoverage.complete,true);
});
for(const option of['sourceFailure','sourceMismatch','sourceCorrupt'])test('remote pristine source failure stays incomplete and cleans up: '+option,async()=>{
 const f=await capture({remote:true,[option]:true});assert.equal(f.result.matchedBaselineNodes,0);
 assert(f.result.snapshot.source.instanceSourceIdentityCapture.owners.every(o=>o.status==='unavailable'&&o.reason));
 assert.equal(core.buildEditorValidationReport(core.evaluateCompiledContract(f.result.snapshot,f.compiled.contract),f.compiled,f.manual,f.result.snapshot).editorCoverage.complete,false);
});

test('new plugin capture proves equal-key occurrences and retains renamed/reordered actual layers',async()=>{
 const f=await capture({rename:true,reorder:true});const s=f.result.snapshot;
 assert.equal(s.source.instanceSourceIdentityVersion,1);assert.equal(f.result.matchedBaselineNodes,6);assert.equal(f.payloadReads,0);
 const top=s.nodes.find(n=>n.name==='Renamed top'),bottom=s.nodes.find(n=>n.name==='Renamed bottom');
 assert.equal(top.component.sourceIdentity.sourceNodeId,'100:2');assert.equal(bottom.component.sourceIdentity.sourceNodeId,'100:4');
 assert.equal(s.nodes[1].name,'Renamed bottom');assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,true);
 const before=clone(s),engine=core.evaluateCompiledContract(s,f.compiled.contract),report=core.buildEditorValidationReport(engine,f.compiled,f.manual,s);
 assert.equal(report.editorCoverage.complete,true);assert(engine.evaluations.every(e=>e.classification==='compliant'));assert.deepEqual(clone(s),before);
});
test('equal-key correspondence exposes clipping/modal/opacity violations and passes after reset',async()=>{
 const negative=await capture({clips:true,mode:'modal-white',opacity:.5});
 const engine=core.evaluateCompiledContract(negative.result.snapshot,negative.compiled.contract);
 assert.deepEqual(engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId.replace(/\.1\.1$/,'')).sort(),['host-clipping','host-opacity','page-mode']);
 assert.equal(negative.result.matchedBaselineNodes,6);assert.equal(negative.payloadReads,0);
 const reset=await capture({mode:'page-white'}),result=core.evaluateCompiledContract(reset.result.snapshot,reset.compiled.contract);
 assert(result.evaluations.every(e=>e.classification==='compliant'));
});
for(const [label,mutate]of[
 ['missing source',s=>delete s.nodes[1].component.sourceIdentity],
 ['foreign owner key',s=>s.nodes[1].component.sourceIdentity.ownerComponentKey='foreign'],
 ['foreign owner main',s=>s.nodes[1].component.sourceIdentity.ownerMainComponentId='foreign'],
 ['unknown source',s=>s.nodes[1].unknownFacts.push('component.sourceIdentity.sourceNodeId')],
 ['duplicate source occurrence',s=>s.nodes[1].component.sourceIdentity=clone(s.nodes[4].component.sourceIdentity)],
 ['wrong source',s=>s.nodes[1].component.sourceIdentity.sourceNodeId='unknown'],
 ['wrong version',s=>s.nodes[1].component.sourceIdentity.version=2],
 ['non-string owner main',s=>{s.nodes[1].component.sourceIdentity.ownerMainComponentId=123;s.nodes[0].component.identity.mainComponentId=123;}],
 ['unknown owner main',s=>s.nodes[0].unknownFacts.push('component.identity.mainComponentId')],
 ['missing reference',s=>delete s.variantReference.nodeProperties.Top.sourceIdentity],
 ['duplicate reference',s=>s.variantReference.nodeProperties.Top.sourceIdentity=clone(s.variantReference.nodeProperties.Bottom.sourceIdentity)],
 ['reference owner mismatch',s=>s.variantReference.nodeProperties.Top.sourceIdentity.ownerMainComponentId='foreign'],
 ['contradictory library set',s=>s.nodes[1].component.identity.componentSetKey='foreign-set'],
])test('source correspondence fails closed: '+label,async()=>{
 const f=await capture(),s=clone(f.result.snapshot);mutate(s);
 const c=core.compareInstanceBoundaries(s,s.variantReference);
 if(label==='contradictory library set'){assert(c.boundaries.length>0);assert(c.boundaries.some(b=>b.reason==='component-identity-changed'));}
 else assert.equal(c.complete,false);
});
for(const option of['badSource','unknownSource'])test('capture cannot turn unavailable/corrupt component source into a guessed occurrence: '+option,async()=>{
 const f=await capture({[option]:true});assert.equal(f.result.matchedBaselineNodes,0);
 assert(f.result.snapshot.nodes.filter(n=>n.type==='INSTANCE'&&n.parentId!==null).every(n=>!n.component.sourceIdentity));
});
test('without new capture marker historical equal-key ambiguity is preserved',async()=>{
 const f=await capture(),s=clone(f.result.snapshot);delete s.source.instanceSourceIdentityVersion;
 assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,false);
});
test('new report export retains source evidence and exact engine replay',async()=>{
 const f=await capture({clips:true,mode:'modal-white'}),s=f.result.snapshot,engine=core.evaluateCompiledContract(s,f.compiled.contract),result=core.buildEditorValidationReport(engine,f.compiled,f.manual,s);
 const download=core.buildValidationReportDownload({manual:f.manual,compiled:f.compiled,evaluatedContract:f.compiled.contract,snapshot:s,anatomy:f.result.anatomy,engineResult:engine,result,capture:null,trigger:'selected-instance'});
 const report=JSON.parse(download.json);assert.equal(report.snapshot.source.instanceSourceIdentityVersion,1);
 assert.deepEqual(clone(core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract)),report.results.engine);
});

function sourceChain(){
 const main={id:'100:1',key:'host',name:'Host',type:'COMPONENT',children:[{id:'100:2',name:'Wrapper',type:'FRAME',children:[{id:'100:3',name:'Child',type:'INSTANCE'}]}]};
 const actual={id:'10:1',name:'Host',type:'INSTANCE',children:[{id:'I10:1;100:2',name:'Wrapper',type:'FRAME',children:[{id:'I10:1;100:3',name:'Child',type:'INSTANCE'}]}]};
 return {main,actual,run(){return core.captureInstanceSourceIdentities(core.captureSceneTopology(actual).entries,new Map([[actual.id,main]]));}};
}
test('capture proves source ancestry through component-owned frames without reading nested payload',()=>{
 const f=sourceChain();Object.defineProperty(f.main.children[0].children[0],'children',{get(){throw Error('nested payload read');}});
 assert.equal(f.run().get('I10:1;100:3').sourceNodeId,'100:3');
});
for(const [label,mutate]of[
 ['actual used as its own source',f=>f.source.topology=core.captureSceneTopology(f.actual)],
 ['foreign imported component key',f=>f.source.componentKey='foreign'],
 ['foreign imported main ID',f=>f.source.mainComponentId='foreign'],
 ['incomplete pristine topology',f=>f.source.topology.complete=false],
 ['unrelated inherited source prefix',f=>f.source.topology.entries[2].figmaNodeId='Iforeign;100:3'],
])test('remote source proof rejects untrusted pristine evidence: '+label,()=>{
 const f=sourceChain();f.main.remote=true;
 const pristine=clone(f.actual);pristine.id='20:1';pristine.children[0].id='I20:1;100:2';pristine.children[0].children[0].id='I20:1;100:3';
 f.source={mainComponentId:f.main.id,componentKey:f.main.key,topology:core.captureSceneTopology(pristine)};
 mutate(f);
 assert.equal(core.captureInstanceSourceIdentities(core.captureSceneTopology(f.actual).entries,new Map([[f.actual.id,f.main]]),new Map([[f.main.id,f.source]])).size,0);
});
for(const [label,mutate]of[
 ['foreign inherited prefix',f=>f.actual.children[0].children[0].id='Iother;100:3'],
 ['same leaf under a different source parent',f=>f.main.children[0].id='100:9'],
 ['same name/index with different source layer',f=>f.main.children[0].children[0].id='100:9'],
 ['missing source parent',f=>f.main.children=[f.main.children[0].children[0]]],
 ['unreadable source',f=>Object.defineProperty(f.main,'children',{get(){throw Error('unavailable');}})],
])test('capture source chain is not guessed: '+label,()=>{const f=sourceChain();mutate(f);assert.equal(f.run().size,0);});
test('a valid explicit swap port cannot contradict the proven source occurrence',async()=>{
 const f=await capture(),s=clone(f.result.snapshot),root=s.nodes[0],refRoot=s.variantReference.nodeProperties[''];
 for(const owner of[root.component,refRoot]){owner.properties={Left:'200:1',Right:'200:1'};owner.propertyTypes.Left='INSTANCE_SWAP';owner.propertyTypes.Right='INSTANCE_SWAP';}
 s.nodes[1].component.propertyReferenceBindings.mainComponent='Right';s.nodes[4].component.propertyReferenceBindings.mainComponent='Left';
 s.variantReference.nodeProperties.Top.propertyReferenceBindings.mainComponent='Left';s.variantReference.nodeProperties.Bottom.propertyReferenceBindings.mainComponent='Right';
 assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,false);
});
test('source lookup keeps its bound and cannot prove an incomplete component tree',()=>{
 const f=sourceChain();f.main.children.push(...Array.from({length:500},(_,i)=>({id:'extra:'+i,name:'Extra '+i,type:'FRAME',children:[]})));
 assert.equal(f.run().size,0);
});
test('nested occurrences use their nearest instance main, not a global source ID match',()=>{
 const main={id:'100:1',key:'host',name:'Host',type:'COMPONENT',children:[{id:'100:2',name:'Outer',type:'INSTANCE'}]};
 const nestedMain={id:'200:1',key:'outer',name:'Outer',type:'COMPONENT',children:[{id:'200:2',name:'Inner',type:'INSTANCE'}]};
 const outer={id:'I10:1;100:2',name:'Outer',type:'INSTANCE',children:[{id:'I10:1;100:2;200:2',name:'Inner',type:'INSTANCE',children:[]}]};
 const root={id:'10:1',name:'Host',type:'INSTANCE',children:[outer]};
 const anchors=core.captureInstanceSourceIdentities(core.captureSceneTopology(root).entries,new Map([[root.id,main],[outer.id,nestedMain]]));
 assert.equal(anchors.get(outer.id).ownerComponentKey,'host');assert.equal(anchors.get(outer.children[0].id).ownerComponentKey,'outer');
 assert.equal(anchors.get(outer.children[0].id).sourceNodeId,'200:2');
});

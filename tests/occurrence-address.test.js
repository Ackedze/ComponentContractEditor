const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../dist/core.cjs'),fixture=require('./fixtures/button-variants.json');
const clone=x=>JSON.parse(JSON.stringify(x));

// Normalized Athena IDs intentionally differ from real Figma source IDs.
function candidates(){return ['desktop','mobile-web'].map((platform,rep)=>{
 const count=rep?2:4,variants=[];
 for(const size of ['56','48','40','32'])for(const overflow of ['false','true'])variants.push({key:`variant-${rep}-${size}-${overflow}`,properties:{Size:size,Overflow:overflow}});
 const base=[{nodeId:1,parentId:null,type:'COMPONENT',name:'Group',path:'Group'},
  ...Array.from({length:count},(_,i)=>({nodeId:i+2,parentId:1,type:'INSTANCE',name:'Button',path:'Group / Button'}))];
 return {id:`group-${rep}`,name:'Group',componentKey:`set-${rep}`,platform,figma:{defaultVariantKey:variants[0].key,
  structureSignature:base,variants:{variantKeys:variants},variantStructures:Object.fromEntries(variants.map(v=>[v.key,[]]))}};
});}

function model(platform='desktop',key){
 const cs=candidates(),rep=platform==='desktop'?0:1,candidate=cs[rep];
 const evidence=core.extractVariantEvidence(cs),manual=clone(fixture.manual);
 manual.component.componentKey=candidate.componentKey;manual.semanticApi=[];manual.generation.profiles=[];
 manual.controlPorts=[];manual.componentDependencies=[];manual.examples=[];
 manual.representations=cs.map((c,i)=>({id:`representation-${i}`,kind:'figma',platform:c.platform,status:'verified',locator:{componentKey:c.componentKey}}));
 manual.targets=[{id:'root',semanticRole:'root',label:'Group',pathHint:'Group',lineage:[],resolution:'resolved'},
  ...Array.from({length:rep?2:4},(_,i)=>({id:`button-${i}`,semanticRole:`button-${i}`,label:'Button',pathHint:`Group / @catalog:${i+2}`,lineage:[],resolution:'unknown'}))];
 const base={...clone(fixture.manual.rules[0]),status:'reviewed',owner:'fixture',rationale:'Synthetic occurrence regression.',
  applicability:{variants:'all',modes:'all',platforms:[platform]},execution:{route:'predicate'},targetScope:'self',controlPaths:[]};
 manual.rules=manual.targets.map(t=>({...clone(base),id:`opacity-${t.id}`,targetId:t.id,capability:'appearance.opacity',permission:'constrained',constraints:[{type:'propertyDomain',values:[1]}]}));
 return {cs,evidence,manual,key:key||candidate.figma.defaultVariantKey,rep};
}

function snapshot(f,{frames=false}={}){
 const variant=f.evidence.variants.find(v=>v.componentKey===f.key),count=f.rep?2:4;
 const node=(id,parentId,name,type)=>({id,parentId,name,type,childIds:[],order:0,visible:true,semantic:{path:'Group / '+name},
  component:{properties:{},propertyTypes:{},propertyReferences:[],propertyReferenceBindings:{}},appearance:{opacity:1},unknownFacts:[]});
 const root=node('root',null,'Group','INSTANCE');root.semantic.path='Group';
 root.component.identity={componentKey:variant.componentKey,componentSetKey:variant.componentSetKey,mainComponentId:`main-${f.key}`};
 root.component.properties=clone(variant.properties);root.component.propertyTypes={Size:'VARIANT',Overflow:'VARIANT'};
 const nodes=[root,...Array.from({length:count},(_,i)=>{
  const n=node(`child-${i}`,'root',frames?'Paint':'Button',frames?'FRAME':'INSTANCE');
  if(!frames)n.component.identity={componentKey:'secondary',componentSetKey:'button-set',mainComponentId:'button-main'};
  n.component.sourceIdentity={version:1,ownerComponentKey:f.key,ownerMainComponentId:`main-${f.key}`,sourceNodeId:`100:${i+2}`};
  n.component.properties={View:i===0?'Primary':'Secondary',Label:`label-${i}`};n.component.propertyTypes={View:'VARIANT',Label:'TEXT'};
  n.order=i+1;return n;
 })];root.childIds=nodes.slice(1).map(n=>n.id);
 const s={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'fixture',source:{occurrenceAddressVersion:1,instanceIdentityVersion:1,
  instanceSourceIdentityVersion:1,componentKey:f.key,componentSetKey:variant.componentSetKey,truncated:false,nodeLimit:500},
  selection:['root'],context:{platform:f.cs[f.rep].platform,modes:{},unknownFacts:[]},nodes};
 s.variantReference=clone(core.captureVariantReference(s,f.key,variant.componentSetKey));return s;
}

function bindAll(f,s){
 for(const n of s.nodes.slice(1)){
  const targetId=`button-${n.id.split('-')[1]}`,input={manual:f.manual,snapshot:s,variantEvidence:f.evidence,targetId,nodeId:n.id};
  const p=core.planTargetRemap(input);assert.equal(p.canApply,true,p.blockers.join('\n'));
  f.manual=core.applyTargetRemap(input,p.planHash,true,'2026-10-01T00:00:00Z');
 }
 return core.compileManualSource(f.manual,f.evidence);
}

test('all 16 variants retain distinct normalized occurrences without claiming source identity',()=>{
 const evidence=core.extractVariantEvidence(candidates());assert.equal(evidence.variants.length,16);assert.equal(evidence.occurrenceAddressVersion,1);
 for(const v of evidence.variants){const shape=evidence.structures[v.structureId];assert.equal(shape.length,v.componentSetKey==='set-0'?5:3);
  assert.equal(new Set(shape.map(n=>n.path)).size,shape.length);assert(shape.filter(n=>n.path).every(n=>n.path.startsWith('@catalog:')));}
 const workspace=core.importWorkspace([{name:'group/contract.generated.json',text:JSON.stringify({contracts:candidates()})}]);
 assert.equal(workspace.anatomy.length,5);assert.equal(new Set(workspace.anatomy.map(n=>n.path)).size,5);
 assert(workspace.anatomy.slice(1).every(n=>n.name==='Button'));
});

test('reference properties keep each equal-name child; unmarked historical paths stay ambiguous',()=>{
 const f=model(),s=snapshot(f),paths=core.snapshotPaths(s);
 assert.equal(paths.size,5);assert.equal(s.variantReference.complete,true);
 assert.equal(Object.keys(s.variantReference.nodeProperties).length,5);
 for(let i=0;i<4;i++)assert.equal(s.variantReference.nodeProperties[`@source:100%3A${i+2}`].properties.Label,`label-${i}`);
 const historical=clone(s);delete historical.source.occurrenceAddressVersion;
 assert.equal(core.snapshotShape(historical),undefined);
 const unique=clone(s);unique.nodes.slice(1).forEach((n,i)=>n.name=`Button ${i}`);
 const old=clone(unique);delete old.source.occurrenceAddressVersion;
 assert.deepEqual(core.snapshotShape(unique),core.snapshotShape(old));
});

for(const platform of ['desktop','mobile-web'])test('rename/reorder/hide preserves the specific occurrence and violation: '+platform,()=>{
 const f=model(platform),s=snapshot(f),compiled=bindAll(f,s);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 s.nodes[0].childIds.reverse();s.nodes.slice(1).forEach((n,i)=>{n.name=`Renamed ${i}`;n.order=20-i;});
 s.nodes[1].visible=false;s.nodes[2].appearance.opacity=.4;
 const comparison=core.compareInstanceBoundaries(s,s.variantReference);assert.equal(comparison.complete,true);
 assert.equal(comparison.referencePaths['Renamed 1'],'@source:100%3A3');
 const before=clone(s),prepared=core.prepareValidationSnapshot(s,compiled.contract);
 assert.equal(prepared.nodes.find(n=>n.id==='child-1').semantic.role,'button-1');
 assert.equal(prepared.nodes.find(n=>n.id==='child-0').semantic.role,'button-0');
 const engine=core.evaluateCompiledContract(s,core.prepareAuthoringPreviewContract(compiled.contract));
 assert.deepEqual(engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId),['opacity-button-1.1.1']);
 assert.deepEqual(s,before);s.nodes[2].appearance.opacity=1;
 const reset=core.evaluateCompiledContract(s,core.prepareAuthoringPreviewContract(compiled.contract));
 assert(reset.evaluations.every(e=>['compliant','not-applicable'].includes(e.classification)));
 assert.equal(reset.evaluations.find(e=>e.ruleId==='opacity-button-0.1.1').classification,'not-applicable');
});

test('normalized numbers, identical library keys and sibling positions cannot bind an occurrence',()=>{
 const f=model(),s=snapshot(f),compiled=core.compileManualSource(f.manual,f.evidence);
 assert.equal(core.variantAvailability(s,compiled.contract).targets['button-0'].state,'unknown');
 delete s.nodes[2].component.sourceIdentity;
 assert(core.snapshotShape(s));assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,false);
 const p=core.planTargetRemap({manual:f.manual,snapshot:s,variantEvidence:f.evidence,targetId:'button-1',nodeId:'child-1'});
 assert.equal(p.canApply,false);assert(p.blockers.length);
});

test('corrupt source/owner and duplicated addresses refuse correspondence; proven root facts still run',()=>{
 for(const mutate of [s=>s.nodes[1].component.sourceIdentity.ownerComponentKey='foreign',
  s=>s.nodes[1].component.sourceIdentity.sourceNodeId='100:3',s=>s.nodes[1].unknownFacts.push('component.sourceIdentity.sourceNodeId'),
  s=>s.variantReference.nodeProperties['@source:100%3A2'].sourceIdentity.ownerMainComponentId='foreign']){
  const f=model(),s=snapshot(f),compiled=bindAll(f,s);mutate(s);s.nodes[0].appearance.opacity=.4;
  assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,false);
  const engine=core.evaluateCompiledContract(s,compiled.contract);
  if(core.snapshotShape(s))assert(engine.evaluations.some(e=>e.ruleId==='opacity-root.1.1' && e.classification==='violation'));
  assert(!engine.evaluations.some(e=>e.ruleId==='opacity-button-0.1.1' && e.classification==='compliant'));
 }
});

test('one variant remap preserves other variant/representation bindings and round-trips through ZIP',async()=>{
 const f=model(),s=snapshot(f);bindAll(f,s);const first=clone(f.manual.targets[1].variantHints[0]);
 f.key='variant-0-48-true';const next=snapshot(f);bindAll(f,next);
 assert.deepEqual(f.manual.targets[1].variantHints[0],first);assert.equal(f.manual.targets[1].variantHints.length,2);
 f.key='variant-0-32-false';assert.equal(core.variantAvailability(snapshot(f),core.compileManualSource(f.manual,f.evidence).contract).targets['button-0'].state,'unknown');
 const files=(await core.readZip(core.buildAuthoringZip(core.buildExportBundle(f.manual,f.evidence)))).map(e=>({name:e.name,text:core.zipEntryText(e)}));
 const reimport=core.importWorkspace(files);assert.deepEqual(reimport.manual,f.manual);
 assert.equal(reimport.variantEvidence.variants.length,16);
 for(const invalid of [h=>h.pathHint='Group / @catalog:2',h=>h.pathHint='Group / @local:child-0',h=>h.componentKey='']){
  const manual=clone(f.manual);invalid(manual.targets[1].variantHints[0]);assert(core.validateManualSource(manual).some(i=>i.level==='error' && i.code==='TARGET_VARIANT_HINT'));
 }
});

test('equal-name frames use owned source evidence, including rename, without an instance key',()=>{
 const f=model(),s=snapshot(f,{frames:true});assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,true);
 s.nodes.slice(1).forEach((n,i)=>n.name=`Paint ${i}`);s.nodes[0].childIds.reverse();
 assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,true);
 delete s.nodes[2].component.sourceIdentity;assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,false);
});

test('coincident capture-local addresses never prove equal-name frame correspondence',()=>{
 const f=model(),s=snapshot(f,{frames:true});s.nodes.slice(1).forEach(n=>delete n.component.sourceIdentity);
 s.variantReference=clone(core.captureVariantReference(s,f.key,`set-${f.rep}`));
 assert.equal(s.variantReference.complete,true);assert(core.snapshotShape(s));
 assert.equal(core.compareInstanceBoundaries(s,s.variantReference).complete,false);
});

test('partial occurrence matching cannot grant root facts to a different or unknown root identity',()=>{
 for(const mutate of [s=>s.nodes[0].component.identity.componentKey='foreign',s=>s.nodes[0].unknownFacts=['component.identity.componentKey']]){
  const f=model(),s=snapshot(f),compiled=bindAll(f,s);mutate(s);
  const availability=core.variantAvailability(s,compiled.contract);assert.equal(availability.status,'unknown');
  assert.equal(availability.reason,'root-correspondence-unavailable');
 }
});

test('source correspondence identifies a changed button but grants no baseline or override permission',()=>{
 const f=model(),s=snapshot(f),compiled=bindAll(f,s);
 s.nodes[2].component.identity.componentKey='primary';s.nodes[2].component.identity.mainComponentId='primary-main';
 const comparison=core.compareInstanceBoundaries(s,s.variantReference,true);assert.equal(comparison.complete,true);
 assert.equal(comparison.boundaries.length,1);assert.equal(comparison.boundaries[0].nodeId,'child-1');
 assert.equal(comparison.boundaries[0].reason,'component-variant-changed');
 assert.equal(core.variantAvailability(s,compiled.contract).targets['button-1'].state,'unknown');
});

test('occurrence addresses retain cycle/edge/duplicate-ID/truncation guards',()=>{
 for(const mutate of [s=>s.nodes[0].childIds.push(s.nodes[0].childIds[0]),s=>s.nodes[1].parentId='missing',
  s=>s.nodes[1].id=s.nodes[2].id,s=>s.source.truncated=true,s=>s.nodes[1].parentId='child-1']){
  const s=snapshot(model());mutate(s);assert.equal(core.snapshotPaths(s),undefined);
 }
});

test('actual plugin capture keeps four/two same-name children and matches independent baseline',async()=>{
 for(const platform of ['desktop','mobile-web']){
  const f=model(platform),messages=[],created=[],pages=[],count=f.rep?2:4,page={id:'page',type:'PAGE',selection:[]};
  const node=(id,name,type,children=[])=>({id,name,type,children,visible:true,opacity:1,width:100,height:40,x:0,y:0,
   componentPropertyReferences:{},resolvedVariableModes:{},remove(){this.removed=true;},exportAsync:async()=>new Uint8Array([1])});
  const button=node('200:1','Button','COMPONENT');button.key='secondary';button.parent={type:'COMPONENT_SET',key:'button-set'};
  const main=node('100:1','Group','COMPONENT',Array.from({length:count},(_,i)=>node(`100:${i+2}`,'Button','INSTANCE')));
  main.key=f.key;main.parent={type:'COMPONENT_SET',key:`set-${f.rep}`,componentPropertyDefinitions:{Size:{type:'VARIANT'},Overflow:{type:'VARIANT'}}};main.children.forEach(n=>n.parent=main);
  function scene(id){const root=node(id,'Group','INSTANCE');root.parent=page;root.getMainComponentAsync=async()=>main;
   root.componentProperties={Size:{type:'VARIANT',value:'56'},Overflow:{type:'VARIANT',value:'false'}};root.setProperties=()=>{};
   root.children=main.children.map(n=>{const c=node(`I${id};${n.id}`,n.name,'INSTANCE');c.parent=root;c.getMainComponentAsync=async()=>button;
    c.componentProperties={View:{type:'VARIANT',value:'Secondary'}};return c;});return root;}
  const actual=scene('10:1');page.selection=[actual];let reference=0;
  main.createInstance=()=>{const r=scene(`20:${++reference}`);created.push(r);return r;};
  const figma={currentPage:page,root:{name:'Fixture'},fileKey:'fixture',mixed:Symbol(),showUI(){},on(){},ui:{postMessage:m=>messages.push(m)},
   getStyleByIdAsync:async()=>null,base64Encode:b=>Buffer.from(b).toString('base64'),variables:{getVariableByIdAsync:async()=>null,getVariableCollectionByIdAsync:async()=>null},
   createPage(){const p={id:'temporary',type:'PAGE',appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
  vm.runInContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),vm.createContext({figma,__html__:''}));
  const compiled=core.compileManualSource(f.manual,f.evidence);
  await figma.ui.onmessage({type:'test-selection',requestId:'group',componentKey:`set-${f.rep}`,acceptedComponentKeys:[],allowedComponentProperties:[],platform,
   manualSourceHash:compiled.contract.package.manualSourceHash,representations:f.manual.representations});
  assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);const result=messages.find(m=>m.type==='selection-test-result');assert(result);
  assert.equal(result.snapshot.variantReference.complete,true);assert.equal(result.matchedBaselineNodes,count+1);
  assert.equal(core.snapshotShape(result.snapshot).length,count+1);assert.equal(new Set(result.anatomy.map(n=>n.path)).size,count+1);
  assert(pages.every(p=>p.removed) && created.every(n=>n.removed));assert.equal(actual.removed,undefined);
 }
});

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('../dist/core.cjs');
const manual=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Button/contract.manual.json')));
const reps=manual.representations,figmaReps=reps.filter(r=>r.kind==='figma');
const bundle=fs.readFileSync(path.join(__dirname,'../dist/code.js'),'utf8');
const clone=x=>JSON.parse(JSON.stringify(x));

async function capture({representation=figmaReps[1],representations=reps,preview=false,legacy=false,paired=false,changeDuringCapture=false,standalone=false,layoutMutation=false,modeFixture}={}) {
 const messages=[],pages=[],references=[],imports=[];
 const page={id:'page',type:'PAGE',parent:null,selection:[]};
 const set={type:'COMPONENT_SET',key:representation.locator.componentSetKey,componentPropertyDefinitions:{}};
 const main={id:'main',key:standalone?representation.locator.componentKey:'actual-variant-key',parent:standalone?page:set,componentPropertyDefinitions:{}};
 const childSet={type:'COMPONENT_SET',key:'spinner-set',componentPropertyDefinitions:{}};
 const childMain={id:'child-main',key:'spinner-variant',parent:childSet};
 function node(id,owner,parent){return {id,name:'Renamed instance, not an identity hint',type:'INSTANCE',parent,visible:true,width:24,height:24,
  gridStyleId:'S:system-grid',clipsContent:false,
  opacity:id==='subject'?.5:1,componentProperties:{},resolvedVariableModes:modeFixture?{[modeFixture.id]:modeFixture.modes[0].modeId}:{},children:[],getMainComponentAsync:async()=>owner,
  setExplicitVariableModeForCollection(collection,mode){this.resolvedVariableModes[collection.id]=mode;},
  exportAsync:async()=>new Uint8Array([1]),remove(){this.removed=true;},setProperties(){}};}
 function host(id,parent){const n=node(id,main,parent);n.children=[node(id+':spinner',childMain,n)];return n;}
 const subject=host('subject',page);page.selection=[subject];
 if(layoutMutation){subject.gridStyleId='';subject.clipsContent=true;}
 if(changeDuringCapture)subject.exportAsync=async()=>{subject.width+=10;return new Uint8Array([1]);};
 main.createInstance=()=>{const n=host('reference',null);references.push(n);return n;};
 childMain.createInstance=()=>{const n=node('child-reference',childMain,null);references.push(n);return n;};
 const figma={mixed:Symbol('mixed'),currentPage:page,root:{name:'Fixture'},fileKey:'fixture',ui:{postMessage:m=>messages.push(m)},
  showUI(){},on(){},base64Encode:b=>Buffer.from(b).toString('base64'),
  importComponentByKeyAsync:async key=>{imports.push(key);return main;},
  getNodeByIdAsync:async id=>id.endsWith(':spinner')?(id.startsWith('subject')?subject.children[0]:references[0].children[0]):null,
  variables:{getVariableCollectionByIdAsync:async id=>id===modeFixture?.id?modeFixture:null},
  createPage(){const p={type:'PAGE',id:'temporary',parent:null,appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
 // Do not wait for preview's fallback timer in this VM: mode discovery resolves immediately.
 vm.runInNewContext(bundle,{figma,__html__:'',setTimeout(){}});
 const request={type:preview?'render-preview':'test-selection',requestId:'identity-test',componentKey:standalone?representation.locator.componentKey:figmaReps[0].locator.componentKey,
  acceptedComponentKeys:[],allowedComponentProperties:[],platform:'desktop',manualSourceHash:'session-edits-retained',
  variantProperties:{},modes:{},componentDependencyKeys:['spinner-set'],captureTransitionContext:paired,...(!legacy?{representations}: {})};
 await figma.ui.onmessage(request);
 return {messages,pages,references,imports,subject,request};
}

test('plugin paired capture records context, sequence and current manual without modifying the selected instance',async()=>{
 const f=await capture({paired:true}),r=f.messages.find(m=>m.type==='selection-test-result');
 const c=r.snapshot.transitionCapture;assert.equal(c.complete,true);assert.equal(c.sequence,1);
 assert.equal(c.manualSourceHash,'session-edits-retained');assert.equal(c.externalContext.pageId,'page');assert.ok(c.sessionId);
 assert.equal(f.subject.width,24);assert.ok(f.pages.every(p=>p.removed));assert.ok(f.references.every(p=>p.removed));
 const old=await capture();assert.equal(old.messages.find(m=>m.type==='selection-test-result').snapshot.transitionCapture,undefined);
});
test('plugin detects asynchronous mutation during capture and rejects temporal evidence',async()=>{
 const f=await capture({paired:true,changeDuringCapture:true}),c=f.messages.find(m=>m.type==='selection-test-result').snapshot.transitionCapture;
 assert.equal(c.complete,false);assert.equal(c.reason,'changed-during-capture');
});

test('grid style and clipping are captured independently from the instance and reference',async()=>{
 const f=await capture({layoutMutation:true}),r=f.messages.find(m=>m.type==='selection-test-result');
 assert.ok(r,JSON.stringify(f.messages));
 assert.equal(r.snapshot.nodes[0].layout.gridStyleId,'');
 assert.equal(r.snapshot.nodes[0].layout.clipsContent,true);
 assert.equal(r.snapshot.nodes[0].baseline.effective.layout.gridStyleId,'S:system-grid');
 assert.equal(r.snapshot.nodes[0].baseline.effective.layout.clipsContent,false);
});
test('plugin captures a resolved collection mode by stable key, with named domain metadata',async()=>{
 const collection={id:'collection-local',key:'22d83aeb0d0d643a5359f63464a2ab81838fbe9f',name:'BackgroundPlate Color',
  defaultModeId:'base',modes:[{modeId:'base',name:'Page grey'},{modeId:'modal',name:'Modal grey'}]};
 const f=await capture({modeFixture:collection}),r=f.messages.find(m=>m.type==='selection-test-result');
 assert.ok(r,JSON.stringify(f.messages));
 assert.equal(r.snapshot.nodes[0].variable.modes[collection.key],'base');
 assert.equal(r.snapshot.nodes[0].variable.modeCatalog[collection.key].collectionName,collection.name);
 assert.equal(r.anatomy[0].properties.variable.modes[collection.key],'base');
 assert.equal(r.snapshot.nodes[0].baseline.effective.variable.modes[collection.key],'base');
});

test('all four Button representations resolve by actual set key, independent of name, current variant and platform',()=>{
 for(const rep of figmaReps){const resolved=core.resolveCaptureRepresentation(reps,'any-actual-variant',rep.locator.componentSetKey);assert.equal(resolved.id,rep.id);assert.equal(resolved.platform,rep.platform);}
 const standalone={...figmaReps[0],locator:{componentKey:'standalone'}};
 assert.equal(core.resolveCaptureRepresentation([standalone],'standalone').id,standalone.id);
 assert.equal(core.resolveCaptureRepresentation([{...standalone,locator:{componentKey:'old-set'}}],'variant','old-set').id,standalone.id);
});

test('foreign, missing, deprecated, code-only, ambiguous, conflicting and missing-platform bindings fail closed',()=>{
 const rep=figmaReps[1],key=rep.locator.componentSetKey;
 const cases=[[],[{...rep,status:'deprecated'}],[{...rep,kind:'code'}],[rep,{...rep,id:'duplicate'}],
  [{...rep,platform:''}],[{...rep,locator:{componentKey:'variant',componentSetKey:'different-set'}}]];
 for(const list of cases)assert.throws(()=>core.resolveCaptureRepresentation(list,'variant',key));
 assert.throws(()=>core.resolveCaptureRepresentation(reps,'',key));
 assert.throws(()=>core.resolveCaptureRepresentation(reps,'spinner-variant','spinner-set'));
 const ambiguous=[rep,{...rep,id:'same-key-different-platform',platform:'desktop'}];
 assert.throws(()=>core.resolveCaptureRepresentation(ambiguous,'variant',key),/несколькими/);
});

for(const rep of figmaReps)test(`plugin capture: ${rep.id}, independent baseline and child captures use actual platform`,async()=>{
 const f=await capture({representation:rep}),r=f.messages.find(m=>m.type==='selection-test-result');
 assert.ok(r,JSON.stringify(f.messages));assert.equal(r.snapshot.context.platform,rep.platform);
 assert.equal(r.snapshot.source.representationId,rep.id);assert.equal(r.snapshot.source.componentSetKey,rep.locator.componentSetKey);
 assert.equal(r.snapshot.instanceContentReferences.base.context.platform,rep.platform);
 assert.equal(r.snapshot.componentDependencyCaptures[0].snapshot.context.platform,rep.platform);
 assert.equal(r.manualSourceHash,'session-edits-retained');assert.equal(r.matchedBaselineNodes,2);
 assert.equal(r.snapshot.nodes[0].appearance.opacity,.5);assert.equal(r.snapshot.nodes[0].baseline.effective.appearance.opacity,1);
 assert.equal(f.subject.removed,undefined);assert.ok(f.pages.every(p=>p.removed));assert.ok(f.references.every(n=>n.removed));
 assert.deepEqual(f.imports,[],'no library-wide import loop');
});

test('plugin preview also resolves actual representation before collecting facts',async()=>{
 const f=await capture({preview:true}),r=f.messages.find(m=>m.type==='preview-result');
 assert.ok(r,JSON.stringify(f.messages));assert.equal(r.snapshot.context.platform,'mobile-web');
 assert.equal(r.snapshot.source.representationId,figmaReps[1].id);
 assert.equal(r.snapshot.componentDependencyCaptures[0].snapshot.context.platform,'mobile-web');
 assert.equal(f.imports.length,1);
});

test('plugin rejects unknown/ambiguous root before creating reference pages, without enumerating keys',async()=>{
 for(const representations of [[],[...reps,{...figmaReps[1],id:'ambiguous'}],reps.filter(r=>r.id!==figmaReps[1].id)]){
  const f=await capture({representations}),error=f.messages.find(m=>m.type==='plugin-error');
  assert.ok(error);assert.ok(error.message.length<250);assert.equal(f.pages.length,0);assert.equal(f.imports.length,0);
  assert.equal(f.messages.some(m=>m.type==='selection-test-result'),false);
 }
});

test('legacy capture mismatch is bounded and never imports every allowed key',async()=>{
 const f=await capture({legacy:true});assert.equal(f.pages.length,0);assert.equal(f.imports.length,0);
 assert.ok(f.messages.find(m=>m.type==='plugin-error').message.length<250);
});

for (const preview of [true,false]) test(`actual Amount ZIP: standalone ${preview?'preview':'selected instance'} resolves without inventing a set`,async()=>{
 const input=fs.readFileSync(path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Amount/authoring/editor/Amount.editor-input.zip'));
 const entries=await core.readZip(input);
 const workspace=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 const representation=workspace.manual.representations.find(r=>r.kind==='figma');
 assert.equal(representation.locator.componentSetKey,undefined);
 const f=await capture({representation,representations:workspace.manual.representations,standalone:true,preview});
 assert.equal(f.messages.some(m=>m.type==='plugin-error'),false,JSON.stringify(f.messages));
 const result=f.messages.find(m=>m.type===(preview?'preview-result':'selection-test-result'));
 assert.ok(result);assert.equal(result.snapshot.source.componentKey,representation.locator.componentKey);
 assert.equal(result.snapshot.source.componentSetKey||'','');
 assert.equal(result.snapshot.variantReference.componentSetKey,'');
 assert.equal(result.snapshot.nodes[0].component.identity.componentSetKey,undefined);
 assert.equal(f.subject.removed,undefined);assert.ok(f.pages.every(p=>p.removed));
});

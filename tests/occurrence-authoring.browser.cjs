// Local functional UI gate, synthetic data only; no live Figma or network writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../dist/core.cjs'),fixture=require('./fixtures/button-variants.json');
const clone=x=>JSON.parse(JSON.stringify(x));

function input(){
 const candidate={componentKey:'group-set',figma:{defaultVariantKey:'large',variants:{variantKeys:[{key:'large',properties:{Size:'56'}}]},
  structureSignature:[{nodeId:1,parentId:null,name:'Group',type:'COMPONENT'},
   {nodeId:2,parentId:1,name:'Button',type:'INSTANCE'},{nodeId:3,parentId:1,name:'Button',type:'INSTANCE'}]}};
 const evidence=core.extractVariantEvidence([candidate]),manual=clone(fixture.manual);
 manual.component.componentKey='group-set';manual.semanticApi=[];manual.controlPorts=[];manual.componentDependencies=[];manual.generation.profiles=[];manual.examples=[];
 manual.representations=[{id:'desktop',kind:'figma',platform:'desktop',status:'verified',locator:{componentKey:'group-set'}}];
 manual.targets=[{id:'root',semanticRole:'root',label:'Group',lineage:[],pathHint:'Group',resolution:'resolved'},
  {id:'button',semanticRole:'chosen',label:'Button',lineage:[],pathHint:'Group / @catalog:3',resolution:'unknown'}];
 manual.rules=[{...clone(fixture.manual.rules[0]),id:'opacity',targetId:'button',targetScope:'self',capability:'appearance.opacity',
  constraints:[{type:'propertyDomain',values:[1]}],controlPaths:[],execution:{route:'predicate'},status:'reviewed',applicability:{variants:'all',modes:'all',platforms:['desktop']}}];
 const nodes=[{id:'root',name:'Group',parentId:null,childIds:['a','b'],order:0,type:'INSTANCE',visible:true,semantic:{path:'Group'},appearance:{opacity:1},
  component:{identity:{componentKey:'large',componentSetKey:'group-set',mainComponentId:'100:1'},properties:{Size:'56'},propertyTypes:{Size:'VARIANT'},propertyReferences:[],propertyReferenceBindings:{}}},
  ...['a','b'].map((id,i)=>({id,name:'Button',parentId:'root',childIds:[],order:i+1,type:'INSTANCE',visible:true,semantic:{path:'Group / Button'},appearance:{opacity:1},
   component:{identity:{componentKey:'secondary',mainComponentId:'button-main'},properties:{},propertyTypes:{},propertyReferences:[],propertyReferenceBindings:{},
    sourceIdentity:{version:1,ownerComponentKey:'large',ownerMainComponentId:'100:1',sourceNodeId:`100:${i+2}`}}}))];
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-10-01T00:00:00Z',selection:['root'],nodes,
  context:{platform:'desktop',modes:{},unknownFacts:[]},source:{rootNodeId:'root',componentKey:'large',componentSetKey:'group-set',truncated:false,nodeLimit:500,
   occurrenceAddressVersion:1,instanceIdentityVersion:1,instanceSourceIdentityVersion:1}};
 snapshot.variantReference=clone(core.captureVariantReference(snapshot,'large','group-set'));
 const paths=core.snapshotPaths(snapshot),anatomy=nodes.map(n=>({id:n.id,figmaNodeId:n.id,parentId:n.parentId,childIds:n.childIds,name:n.name,type:n.type,visible:n.visible,
  order:n.order,depth:n.parentId===null?0:1,path:['Group',paths.get(n.id)].filter(Boolean).join(' / '),semanticRole:'',properties:n,unknownFacts:[]}));
 const workspace={manual,variantEvidence:evidence,anatomy,variants:[{id:'large',componentKey:'large',label:'Size=56',properties:{Size:'56'}}],hasVariantEvidence:true,tokens:[],warnings:[]};
 const session=core.createEditorSession(workspace,{workspaceMode:'authoring',validationProduct:'ab',scenarioProperties:{Size:'56'},activeModes:{}});
 return {manual,evidence,snapshot,anatomy,session};
}

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const f=input(),page=await browser.newPage({acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.testRequests=[];window.addEventListener('message',e=>{if(e.data?.pluginMessage?.type==='test-selection')window.testRequests.push(e.data.pluginMessage);});});
  await page.goto('file://'+path.resolve(__dirname,'../dist/ui.html'));
  await page.evaluate(session=>{
   window.postMessage({pluginMessage:{type:'session-restored',session}},'*');
   window.postMessage({pluginMessage:{type:'plugin-ready',selectedRootNodeId:'root',selectionAvailable:true,instanceSelectionAvailable:true}},'*');
  },f.session);
  await page.locator('#validationModeButton').click();
  await page.locator('#testSelectionButton').click();
  await page.waitForFunction(()=>window.testRequests.length>0);const request=await page.evaluate(()=>window.testRequests.at(-1));
  await page.evaluate(({request,snapshot,anatomy})=>window.postMessage({pluginMessage:{type:'selection-test-result',requestId:request.requestId,
   manualSourceHash:request.manualSourceHash,componentKey:'large',snapshot,anatomy,imageDataUrl:'',width:100,height:40,matchedBaselineNodes:3,unmatchedBaselineNodeIds:[],warnings:[]}},'*'),{request,snapshot:f.snapshot,anatomy:f.anatomy});
  await page.locator('#authoringModeButton').click();await page.locator('#remapTargetsButton').click();
  await page.locator('#remapTargetSelect').selectOption('button');await page.locator('#remapNodeSelect').selectOption('b');
  assert.match(await page.locator('#remapContext').textContent(),/выбранного варианта large/);
  assert.match(await page.locator('#remapAfter').textContent(),/@source:100%3A3/);
  await page.locator('#remapConfirm').check();await page.locator('#applyRemapButton').click();
  await page.locator('#anatomyTree .tree-item').nth(1).click();
  await page.locator('#addSemanticTargetButton').click();
  assert.match(await page.locator('#remapAfter').textContent(),/@source:100%3A2/);
  await page.locator('#cancelRemapButton').click();
  assert.equal(await page.locator('#targetCount').textContent(),String(f.manual.targets.length+1));
  await page.locator('#addSemanticTargetButton').click();
  assert.equal(await page.locator('#targetCount').textContent(),String(f.manual.targets.length+1));
  await page.locator('#remapConfirm').check();await page.locator('#applyRemapButton').click();
  const pending=page.waitForEvent('download');await page.locator('#exportButton').click();const download=await pending;
  const files=(await core.readZip(fs.readFileSync(await download.path()))).map(e=>({name:e.name,text:core.zipEntryText(e)}));
  const reopened=core.importWorkspace(files),target=reopened.manual.targets.find(t=>t.id==='button');
  assert.deepEqual(target.variantHints,[{representationId:'desktop',componentKey:'large',pathHint:'Group / @source:100%3A3'}]);
  assert.equal(reopened.compiledInput.runtimePolicy.occurrenceAddressVersion,1);assert.equal(target.resolution,'resolved');
  const added=reopened.manual.targets.find(t=>t.id==='target.button');
  assert.equal(added.resolution,'resolved');assert.deepEqual(added.variantHints,[{representationId:'desktop',componentKey:'large',pathHint:'Group / @source:100%3A2'}]);
  assert.equal(reopened.manual.rules.length,f.manual.rules.length);
  assert.equal(reopened.manual.metadata.revision,f.manual.metadata.revision+3);assert.deepEqual(errors,[]);
  console.log('PASS: existing occurrence remapped and a new semantic target registered without a rule; source proof and explicit confirmation retained, exact ZIP reopen.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

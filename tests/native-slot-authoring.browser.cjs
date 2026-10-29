// Synthetic authoring UI test, not live Figma acceptance.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const core=require('../dist/core.cjs'),fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const manual=clone(fixture.manual);manual.component.componentKey='host';manual.component.contractId='native-host';
  manual.rules=[];manual.semanticApi=[];manual.controlPorts=[];manual.componentDependencies=[];manual.generation.profiles=[];
  manual.targets=[{id:'root',semanticRole:'root',label:'Root',pathHint:'Root',lineage:[],resolution:'resolved'}];
  manual.representations=[{id:'figma:host',kind:'figma',platform:'desktop',status:'verified',locator:{componentKey:'host'}}];
  const property='Body#1:0',structure=[{path:'',type:'ROOT'},{path:'Body',type:'SLOT'}];
  const evidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:core.stableHash('native-ui'),
   structures:{shape:structure},variants:[{componentKey:'host',componentSetKey:'',structureId:'shape',properties:{}}]};
  const anatomy=[{id:'root',figmaNodeId:'live',name:'Root',type:'INSTANCE',parentId:null,childIds:['body'],order:0,depth:0,path:'Root',semanticRole:'root',visible:true,
    properties:{component:{identity:{componentKey:'host'},propertyTypes:{[property]:'SLOT'},properties:{}}}},
   {id:'body',figmaNodeId:'live-body',name:'Body',type:'SLOT',parentId:'root',childIds:[],order:0,depth:1,path:'Root / Body',semanticRole:'body',visible:true,
    properties:{component:{propertyReferenceBindings:{slotContentId:property}},layout:{mode:'VERTICAL',itemSpacing:0}}}];
  const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-30T15:00:00Z',selection:['root'],
   source:{rootNodeId:'live',pageId:'page',componentKey:'host',truncated:false},context:{platform:'desktop',modes:{},unknownFacts:[]},
   nodes:anatomy.map(node=>({...node,semantic:{role:node.semanticRole,path:node.path},...node.properties,unknownFacts:[]}))};
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.setDefaultTimeout(10000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>window.addEventListener('message',event=>{
   const m=event.data?.pluginMessage;if(m?.type==='render-preview')window.__request=m.requestId;
   if(m?.type==='save-session')window.__manual=m.session.workspace.manual;
  }));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/ui.html')).href);
  await page.locator('#fileInput').setInputFiles([
   {name:'contract.manual.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(manual))},
   {name:'component-contract.v2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(core.compileManualSource(manual,evidence).contract))},
  ]);
  await page.waitForFunction(()=>window.__request);
  await page.evaluate(({snapshot,anatomy})=>window.postMessage({pluginMessage:{type:'preview-result',requestId:window.__request,
   snapshot,anatomy,width:100,height:100,componentProperties:{},variableModes:[],warnings:[],
   imageDataUrl:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'}},'*'),{snapshot,anatomy});
  await page.locator('.tree-item').filter({hasText:'Body'}).click();await page.locator('#newRuleButton').click();
  await page.locator('#capabilityInput').fill('Содержимое');
  await page.locator('.property-picker-option').filter({hasText:'Содержимое слота'}).click();
  await page.locator('#permissionControl label').filter({hasText:'Разрешено'}).click();
  await page.locator('#controlPathKind').evaluate(select=>{select.value='slot-api';select.dispatchEvent(new Event('change',{bubbles:true}));});
  assert.equal(await page.locator('#slotAnchorProperty').inputValue(),property);
  await page.locator('#slotContentOwnership').evaluate(select=>{select.value='external';select.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.locator('#rationale').fill('Caller owns slot payload; host owns SLOT boundary.');
  await page.locator('#saveRuleButton').click();await page.waitForFunction(()=>window.__manual?.rules.length===1);
  const saved=await page.evaluate(()=>window.__manual.rules[0]);
  assert.equal(saved.permission,'allowed');assert.equal(saved.capability,'composition.content');
  assert.equal(saved.controlPaths[0].property,property);assert.equal(saved.controlPaths[0].target,saved.targetId);
  assert.equal(saved.controlPaths[0].contentOwnership,'external');
  await page.locator('.rule-card').first().click();
  assert.equal(await page.locator('#slotAnchorProperty').inputValue(),property);
  assert.equal(await page.locator('#slotContentOwnership').inputValue(),'external');assert.deepEqual(errors,[]);
  console.log('PASS: native SLOT authoring, named capability, proven anchor prefill, explicit external boundary and target save/reopen.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

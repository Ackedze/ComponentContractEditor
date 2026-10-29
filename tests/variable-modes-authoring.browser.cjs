// Synthetic UI authoring regression; this is not live Figma acceptance.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url'),core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json'),clone=x=>JSON.parse(JSON.stringify(x));
const key='22d83aeb0d0d643a5359f63464a2ab81838fbe9f';
const collection={id:'local-collection',key,name:'BackgroundPlate Color',defaultModeId:'grey',
 modes:[{modeId:'grey',name:'base-bg-alt (grey)'},{modeId:'white',name:'base-bg (white)'},{modeId:'modal',name:'modal-bg-alt (grey)'}]};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const manual=clone(fixture.manual);
  manual.component.componentKey='variant';manual.component.contractId='mode-widget';manual.component.family='ModeWidget';
  manual.rules=[];manual.semanticApi=[];manual.controlPorts=[];manual.componentDependencies=[];manual.generation.profiles=[];
  manual.targets=[{id:'root',semanticRole:'root',label:'Root',pathHint:'Root',lineage:[],resolution:'resolved'}];
  manual.representations=[{id:'figma:mode',kind:'figma',platform:'desktop',status:'verified',locator:{componentKey:'variant',componentSetKey:'mode-set'}}];
  const facts=core.captureResolvedVariableModes({[collection.id]:'grey'},[collection]);
  const properties={layout:{mode:'VERTICAL'},appearance:{},variable:{bindings:{},modes:facts.modes,modeCatalog:facts.modeCatalog},
   component:{identity:{componentKey:'variant',componentSetKey:'mode-set'},properties:{}},text:{},bounds:{width:100,height:100}};
  const anatomy=[{id:'root',figmaNodeId:'instance',parentId:null,childIds:[],order:0,depth:0,name:'Root',type:'INSTANCE',path:'Root',semanticRole:'root',visible:true,properties}];
  const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-30T12:00:00Z',selection:['root'],
   source:{rootNodeId:'instance',pageId:'page',componentKey:'variant',componentSetKey:'mode-set',truncated:false},
   context:{platform:'desktop',modes:{[collection.id]:'grey'},unknownFacts:[]},
   nodes:[{id:'root',parentId:null,childIds:[],order:0,name:'Root',type:'INSTANCE',visible:true,semantic:{role:'root',path:'Root'},...properties,unknownFacts:[]}]};
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
  page.setDefaultTimeout(10000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>window.addEventListener('message',event=>{
   const message=event.data?.pluginMessage;
   if(message?.type==='save-session')window.__manual=message.session.workspace.manual;
   if(message?.type==='render-preview')window.__previewRequest=message.requestId;
  }));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/ui.html')).href);
  const evidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:core.stableHash('synthetic-mode-ui'),
   structures:{root:[{path:'Root',type:'INSTANCE'}]},
   variants:[{componentKey:'variant',componentSetKey:'mode-set',structureId:'root',properties:{}}]};
  const compiled=core.compileManualSource(manual,evidence).contract;
  await page.locator('#fileInput').setInputFiles([
   {name:'contract.manual.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(manual))},
   {name:'component-contract.v2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(compiled))},
  ]);
  await page.waitForFunction(()=>window.__previewRequest);
  await page.evaluate(({snapshot,anatomy})=>window.postMessage({pluginMessage:{type:'preview-result',requestId:window.__previewRequest,
   snapshot,anatomy,width:100,height:100,componentProperties:{},variableModes:[],warnings:[],
   imageDataUrl:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'}},'*'),{snapshot,anatomy});
  await page.locator('#newRuleButton').click();
  await page.locator('#capabilityInput').fill('BackgroundPlate');
  const modeOption=page.locator('.property-picker-option').filter({hasText:'Mode · BackgroundPlate Color'});
  const geometry=await modeOption.evaluate(option=>{
   const label=option.querySelector('strong'),code=option.querySelector('code');
   return{labelWidth:label.getBoundingClientRect().width,labelClipped:label.scrollWidth>label.clientWidth,
    separateRows:code.getBoundingClientRect().top>=label.getBoundingClientRect().bottom,
    codeFits:code.getBoundingClientRect().width<=option.getBoundingClientRect().width};
  });
  assert(geometry.labelWidth>150,'human-readable name must not collapse behind a long key');
  assert.equal(geometry.labelClipped,false,'the collection name must be readable');
  assert.equal(geometry.separateRows,true);assert.equal(geometry.codeFits,true);
  await modeOption.click();
  await page.locator('#constraintModeValues input[value="grey"]').check();
  await page.locator('#constraintModeValues input[value="white"]').check();
  await page.locator('#rationale').fill('Page surfaces only');
  await page.locator('#saveRuleButton').click();
  await page.waitForFunction(()=>window.__manual?.rules.length===1);
  const saved=await page.evaluate(()=>window.__manual.rules[0]);
  assert.equal(saved.capability,`variable.modes.${key}`);
  assert.deepEqual(saved.constraints[0].values,['grey','white']);
  assert.equal(saved.applicability.modes,'all');
  await page.locator('.rule-card').first().click();
  assert.equal(await page.locator('#constraintModeValues input:checked').count(),2);
  assert.deepEqual(errors,[]);
  console.log('PASS: named mode multi-select, stable key/IDs, all-mode applicability, UI save/reopen preserve domain; no page errors.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

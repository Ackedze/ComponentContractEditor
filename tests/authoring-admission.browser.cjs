const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const crypto=require('node:crypto'),os=require('node:os');
const {scopedScenario,clone}=require('./helpers/scoped-fixed');
const root=process.env.ARTIFACTS_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'editor-admission-'));
const E=path.resolve(__dirname,'..'),phase='candidate';
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
process.env.TMPDIR=root+'/workspace/tmp';fs.mkdirSync(process.env.TMPDIR,{recursive:true});
(async()=>{
 const self=pin(__filename),f=scopedScenario(),core=f.core,checks=[];
 f.manual.component.componentKey='desktop-set';
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),downloadsPath:root+'/workspace/downloads',
  args:['--disable-background-networking','--disk-cache-dir='+root+'/workspace/browser-cache']});
 try{
  function controller(){
   const sent=[],stats={captureEntered:0,showUI:0};
   const figma={skipInvisibleInstanceChildren:true,showUI(){stats.showUI++;},on(){},
    currentPage:{selection:[{id:'root',type:'INSTANCE',async getMainComponentAsync(){stats.captureEntered++;throw new Error('MOCK_CAPTURE_ENTRY');}}]},
    clientStorage:{async getAsync(){return null;},async setAsync(){}},ui:{postMessage(m){sent.push(m);}}};
   vm.runInNewContext(fs.readFileSync(E+'/dist/code.js','utf8'),{figma,__html__:'controlled-ui',console,setTimeout,clearTimeout,TextEncoder,TextDecoder},{filename:'actual-controller-'+phase+'.js'});
   return {figma,sent,stats};
  }
  async function pageFor(){
   const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.__out=[];window.parent.postMessage=m=>window.__out.push(m.pluginMessage);});
   await page.goto('file://'+E+'/dist/ui.html');
   const host=controller();
   await host.figma.ui.onmessage({type:'ready'});
   assert.equal(host.stats.showUI,1);
   for(const message of host.sent)await page.evaluate(m=>window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:m}})),message);
   return {page,errors,host};
  }
  function zipFor(manual){return core.buildAuthoringZip(core.buildExportBundle(manual,f.evidence,[f.childContract]));}
  async function upload(page,zip){
   await page.locator('#fileInput').setInputFiles({name:'generic.component-contract.zip',mimeType:'application/zip',buffer:Buffer.from(zip)});
   await page.waitForFunction(()=>document.querySelector('#componentName').textContent==='fixture.group');
   await page.waitForFunction(()=>document.querySelector('#fileInput').value==='');
  }
  async function readyToTest(page){
   await page.locator('#validationModeButton').click();
   await page.evaluate(()=>{const s=document.querySelector('#validationProductSelect');s.value='ab';s.dispatchEvent(new Event('change'));});
   await page.evaluate(()=>window.__out=[]);
  }
  async function messages(page,type){return page.evaluate(t=>window.__out.filter(m=>m.type===t),type);}
  async function exported(page,label){
   await page.locator('#authoringModeButton').click();
   const download=page.waitForEvent('download');await page.locator('#exportButton').click();const d=await download;
   const target=root+'/workspace/downloads/'+phase+'-'+label+'.zip';fs.mkdirSync(path.dirname(target),{recursive:true});await d.saveAs(target);
   return {zip:fs.readFileSync(target),pin:pin(target)};
  }
  const invalid=clone(f.manual);invalid.componentDependencies[0].bindings[0].representationIds=[];
  if(phase==='candidate'){
   const unknown=await pageFor(),future=clone(f.manual);future.schemaVersion='apollo.component-contract-manual.future';
   const files=[{name:'contract.manual.json',text:JSON.stringify(future)}];
   assert.throws(()=>core.importWorkspace(files),/Unsupported manual source schema/);
   await unknown.page.locator('#fileInput').setInputFiles({name:'future.manual.json',mimeType:'application/json',buffer:Buffer.from(files[0].text)});
   await unknown.page.waitForFunction(()=>document.body.textContent.includes('Unsupported manual source schema'));
   assert.equal((await messages(unknown.page,'render-preview')).length,0);assert.equal((await messages(unknown.page,'test-selection')).length,0);
   assert.equal(await unknown.page.locator('#exportButton').isDisabled(),true);assert.deepEqual(unknown.errors,[]);
   checks.push({name:'actual importer rejects unknown manual schema without reconstructing an empty source',status:'PASS'});await unknown.page.close();
   const readonly=await pageFor(),compiled=core.compileManualSource(f.manual,f.evidence,[f.childContract]).contract;
   assert.equal(core.importWorkspace([{name:'compiled.json',text:JSON.stringify(compiled)}]).manual.source.kind,'component-contract-v2');
   await readonly.page.locator('#fileInput').setInputFiles({name:'compiled.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(compiled))});
   await readonly.page.waitForFunction(()=>document.querySelector('#fileInput').value==='');
   await readyToTest(readonly.page);await readonly.page.locator('#testSelectionButton').click();
   assert.equal((await messages(readonly.page,'test-selection')).length,0);assert.equal(readonly.host.stats.captureEntered,0);
   await readonly.page.locator('#authoringModeButton').click();const downloads=[];readonly.page.on('download',d=>downloads.push(d));await readonly.page.locator('#exportButton').click();
   await readonly.page.waitForFunction(()=>document.body.textContent.includes('Нужен authoring ZIP'));
   assert.equal(downloads.length,0);assert.deepEqual(readonly.errors,[]);
   checks.push({name:'compiled-only evidence stays readable but cannot execute or export reconstructed empty rules',status:'PASS'});await readonly.page.close();
  }
  const bad=await pageFor();await upload(bad.page,zipFor(invalid));
  const previews=await messages(bad.page,'render-preview');await readyToTest(bad.page);await bad.page.locator('#testSelectionButton').click();
  const requests=await messages(bad.page,'test-selection');
  {
   assert.equal(previews.length,0);assert.equal(requests.length,0);assert.equal(bad.host.stats.captureEntered,0);
   assert.match(await bad.page.locator('body').textContent(),/Контракт содержит ошибки компиляции/);
   checks.push({name:'actual file import and test-selection reject invalid source before preview/capture',status:'PASS',captureEntered:0});
   await bad.page.locator('#authoringModeButton').click();
   const rejectedDownloads=[];bad.page.on('download',d=>rejectedDownloads.push(d));await bad.page.locator('#exportButton').click();
   await bad.page.waitForFunction(()=>document.body.textContent.includes('EXPORT_PROJECTION_SOURCE_INVALID'));
   assert.equal(rejectedDownloads.length,0);
   checks.push({name:'actual UI refuses preserving an invalid imported projection during export',status:'PASS'});
   const recovery=await pageFor(),badFiles=(await core.readZip(zipFor(invalid))).map(e=>({name:e.name,text:core.zipEntryText(e)})),session=core.createEditorSession(core.importWorkspace(badFiles),{workspaceMode:'authoring',validationProduct:'ab',scenarioProperties:{},activeModes:{}});
   await recovery.page.evaluate(s=>window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:{type:'session-restored',session:s}}})),session);
   const save=await exported(recovery.page,'invalid-draft'),files=(await core.readZip(save.zip)).map(e=>({name:e.name,text:core.zipEntryText(e)}));
   const validation=JSON.parse(files.find(x=>x.name==='validation-report.json').text);assert.equal(validation.valid,false);
   const reopened=core.importWorkspace(files),result=core.compileManualSource(reopened.manual,reopened.variantEvidence,reopened.dependencyContracts);
   assert.ok(result.issues.some(i=>i.level==='error'));assert.deepEqual(reopened.manual,invalid);
   const again=await pageFor();await upload(again.page,save.zip);await readyToTest(again.page);await again.page.locator('#testSelectionButton').click();
   assert.equal((await messages(again.page,'test-selection')).length,0);
   checks.push({name:'invalid Draft UI export preserves source and errors; reopen still blocks execution',status:'PASS',download:save.pin,validationValid:false});
   assert.deepEqual(recovery.errors,[]);await recovery.page.close();
   await again.page.close();
   const good=await pageFor(),validZip=zipFor(f.manual);await upload(good.page,validZip);await readyToTest(good.page);await good.page.locator('#testSelectionButton').click();
   const accepted=await messages(good.page,'test-selection');assert.equal(accepted.length,1);
   await good.host.figma.ui.onmessage(accepted[0]);assert.equal(good.host.stats.captureEntered,1);
   const message={type:'selection-test-result',requestId:accepted[0].requestId,componentKey:f.snapshot.source.componentKey,manualSourceHash:accepted[0].manualSourceHash,
    anatomy:[],snapshot:f.snapshot,imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6zwoAAAAASUVORK5CYII=',width:100,height:40,matchedBaselineNodes:3,unmatchedBaselineNodeIds:[],warnings:[]};
   await good.page.evaluate(m=>window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:m}})),message);
   await good.page.waitForFunction(()=>!document.querySelector('#downloadReportButton').disabled);
   const reportDownload=good.page.waitForEvent('download');await good.page.locator('#downloadReportButton').click();const d=await reportDownload;
   const reportPath=root+'/workspace/downloads/candidate-validation-report.json';await d.saveAs(reportPath);const report=JSON.parse(fs.readFileSync(reportPath));
   assert.equal(report.editorVersion,'component-contract-editor@0.2.106');
   assert.equal(report.runtime.evaluatedContract.runtimePolicy.crossRepresentationBindingsVersion,2);
   assert.equal(report.results.engine.dependencyRuns.filter(r=>r.status==='executed').length,1);
   assert.ok(report.results.engine.evaluations.every(e=>['compliant','not-applicable'].includes(e.classification)));
   checks.push({name:'supported scoped authoring source reaches actual controller and UI evaluates controlled snapshot with real Core',status:'PASS',captureKind:'controller entry is mocked; snapshot is synthetic',report:pin(reportPath)});
   const goodExport=await exported(good.page,'valid'),opened=core.importWorkspace((await core.readZip(goodExport.zip)).map(e=>({name:e.name,text:core.zipEntryText(e)})));
   const built=core.buildExportBundle(opened.manual,opened.variantEvidence,opened.dependencyContracts);assert.equal(built.validation.valid,true);assert.deepEqual(opened.manual,f.manual);
   assert.equal(built.compiled.runtimePolicy.crossRepresentationBindingsVersion,2);
   checks.push({name:'actual UI supported export/reopen preserves scoped source and exact compiler output',status:'PASS',download:goodExport.pin});
   await good.page.locator('#contractSettingsButton').click();
   await good.page.locator('#componentDependenciesInput').evaluate(e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});
   await good.page.locator('#componentDependenciesInput').fill(JSON.stringify(invalid.componentDependencies));
   await good.page.locator('#saveContractButton').click();
   await good.page.evaluate(()=>window.__out=[]);
   await good.page.locator('#contractSettingsButton').click();
   assert.equal(await good.page.locator('#contractDialog').evaluate(e=>e.open),true);
   assert.deepEqual(JSON.parse(await good.page.locator('#componentDependenciesInput').inputValue()),invalid.componentDependencies);
   await good.page.locator('#cancelContractButton').click();
   await good.page.locator('#constraintType').evaluate(e=>{e.value='dependencyDomain';e.dispatchEvent(new Event('change'));});
   assert.equal(await good.page.locator('#dependencySubjectChoices').count(),1);
   assert.equal((await messages(good.page,'render-preview')).length,0);
   assert.equal((await messages(good.page,'test-selection')).length,0);
   await readyToTest(good.page);await good.page.locator('#testSelectionButton').click();
   assert.equal((await messages(good.page,'test-selection')).length,0);assert.deepEqual(good.errors,[]);
   checks.push({name:'invalid Draft after valid capture stays editable in Passport and dependency constraints while execution stays blocked',status:'PASS'});
   await good.page.locator('#authoringModeButton').click();await good.page.locator('#contractSettingsButton').click();
   await good.page.locator('#componentDependenciesInput').evaluate(e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});
   await good.page.locator('#componentDependenciesInput').fill(JSON.stringify(f.manual.componentDependencies));
   await good.page.locator('#saveContractButton').click();
   await readyToTest(good.page);await good.page.locator('#testSelectionButton').click();
   const repairedRequest=(await messages(good.page,'test-selection'));assert.equal(repairedRequest.length,1);
   await good.page.evaluate(m=>window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:m}})),{...message,requestId:repairedRequest[0].requestId,manualSourceHash:repairedRequest[0].manualSourceHash});
   await good.page.waitForFunction(()=>!document.querySelector('#downloadReportButton').disabled);
   const repairedExport=await exported(good.page,'repaired-draft');
   const repaired=core.importWorkspace((await core.readZip(repairedExport.zip)).map(e=>({name:e.name,text:core.zipEntryText(e)})));
   assert.deepEqual(repaired.manual.componentDependencies,f.manual.componentDependencies);
   assert.equal(core.buildExportBundle(repaired.manual,repaired.variantEvidence,repaired.dependencyContracts).validation.valid,true);
   checks.push({name:'Passport repair restores supported capture/evaluation and valid source export without losing dependencies',status:'PASS',download:repairedExport.pin});
   await readyToTest(good.page);await good.page.locator('#testSelectionButton').click();const pending=(await messages(good.page,'test-selection'))[0];assert.ok(pending);
   await upload(good.page,zipFor(invalid));await good.page.evaluate(m=>window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:m}})),{...message,requestId:pending.requestId,manualSourceHash:pending.manualSourceHash});
   assert.equal(await good.page.locator('#downloadReportButton').isDisabled(),true);
   assert.match(await good.page.locator('body').textContent(),/Контракт содержит ошибки компиляции/);
   checks.push({name:'source invalidated during capture is rejected again before evaluation',status:'PASS'});
   assert.deepEqual(good.errors,[]);await good.page.close();
  }
  assert.deepEqual(bad.errors,[]);await bad.page.close();
 }finally{await browser.close();}
 assert.deepEqual(pin(__filename),self);
 const attempt=process.argv[3]||'01';assert.match(attempt,/^\d{2}$/);
 fs.writeFileSync(root+'/UI-ADMISSION-'+phase+'-'+attempt+'.json',JSON.stringify({test:self,checks,mode:'actual bundled UI in installed headless Chrome; actual bundled controller in Node VM with controlled Figma API; no native/model calls',updatedEditorBoundary:phase==='candidate'?'Core v2 support + execution/source preflight must ship as one verified Editor build':'UNSAFE historical path retained',Ready:false},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({passed:checks.length}));
})().catch(error=>{const report=JSON.stringify({phase,error:error.stack})+'\n',p=root+'/FIRST-UI-ADMISSION-FAILURE.json';if(!fs.existsSync(p))fs.writeFileSync(p,report);fs.writeFileSync(root+'/UI-FAILURE-'+phase+'-'+Date.now()+'.json',report,{flag:'wx'});console.error(error.stack);process.exitCode=1;});

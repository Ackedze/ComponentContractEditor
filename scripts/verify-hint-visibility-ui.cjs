// Built UI with archived Figma facts, not fresh Figma live acceptance.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),os=require('node:os');
const editor=path.resolve(__dirname,'..'),button=path.resolve(editor,'../../shared/design-system_ab/experiments/web-core/core/Button');
const core=require(path.join(editor,'dist/core.cjs'));
const manual=JSON.parse(fs.readFileSync(path.join(button,'contract.manual.json')));
const review=JSON.parse(fs.readFileSync(path.join(button,'qa/loading-composition-live-review.2026-09-28.json')));
const capture=id=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(button,review.reportResults.find(r=>r.caseId===id).fixtureFile))));
const ruleId='component:web-core.button.desktop-hint-restricted';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(editor,'dist/ui.html'));
  await page.evaluate(()=>{window.sent=[];window.addEventListener('message',e=>{if(e.data?.pluginMessage)window.sent.push(e.data.pluginMessage);});window.postMessage({pluginMessage:{type:'plugin-ready',selectionAvailable:true,instanceSelectionAvailable:true}},'*');});
  await page.locator('#fileInput').setInputFiles(path.join(button,'editor/Button.editor-input.zip'));
  await page.waitForFunction(()=>document.querySelector('#ruleCount').textContent==='26');
  await page.evaluate(r=>{
   const req=window.sent.findLast(m=>m.type==='render-preview');
   window.postMessage({pluginMessage:{type:'preview-result',requestId:req.requestId,componentKey:req.componentKey,
    snapshot:r.snapshot,anatomy:r.anatomy.map(n=>({...n,properties:r.snapshot.nodes.find(x=>x.id===n.id)})),width:128,height:56,warnings:[],
    imageDataUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="56"/>'}},'*');
  },capture('BL11'));
  async function validate(id){
   await page.locator('#validationModeButton').click();
   await page.locator('#validationProductSelect').selectOption('ab',{force:true});
   await page.locator('#testSelectionButton').click();
   await page.evaluate(r=>{const req=window.sent.findLast(m=>m.type==='test-selection');window.postMessage({pluginMessage:{
    type:'selection-test-result',requestId:req.requestId,manualSourceHash:req.manualSourceHash,componentKey:r.snapshot.source.componentKey,
    snapshot:r.snapshot,anatomy:r.anatomy.map(n=>({...n,properties:r.snapshot.nodes.find(x=>x.id===n.id)})),matchedBaselineNodes:r.snapshot.nodes.length,
    unmatchedBaselineNodeIds:[],warnings:[],width:128,height:56,imageDataUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="56"/>'}},'*');},capture(id));
   await page.waitForFunction(()=>!document.querySelector('#downloadReportButton').disabled);
   const pending=page.waitForEvent('download');await page.locator('#downloadReportButton').click();
   const stream=await(await pending).createReadStream(),chunks=[];for await(const c of stream)chunks.push(c);
   const r=JSON.parse(Buffer.concat(chunks));
   assert.equal(r.editorVersion,'component-contract-editor@'+require('../package.json').version);
   assert.deepEqual(r.results.engine,core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract));
   assert.deepEqual(r.results.details,JSON.parse(JSON.stringify(core.buildEvaluationDetails(r.results.editor,r.runtime.evaluatedContract,r.anatomy))));
   assert.equal(r.results.editor.scenarioCoverage.complete,false);
   return r;
  }
  const hidden=await validate('BL11');assert.deepEqual(hidden.sources.manual,manual);
  assert.equal(hidden.snapshot.nodes[0].semanticApi.hintEnabled,true);
  assert.equal(hidden.snapshot.nodes[0].semanticApi.hintVisible,false);
  assert.equal(hidden.results.engine.evaluations.filter(e=>e.classification==='violation').length,0);
  const absent=await validate('BL10');
  assert.equal(absent.snapshot.nodes[0].semanticApi.hintVisible,false);
  assert.equal(absent.snapshot.nodes[0].semanticBindingEvidence.hintVisible.confirmedAbsent,true);
  assert.equal(absent.results.engine.evaluations.filter(e=>e.classification==='violation').length,0);
  const visible=await validate('BL12');
  assert.equal(visible.snapshot.nodes[0].semanticApi.hintVisible,true);
  const violations=visible.results.engine.evaluations.filter(e=>e.classification==='violation');
  assert.equal(violations.length,2);assert.ok(violations.some(e=>e.ruleId.startsWith(ruleId+'.')));
  await page.locator('.result-chip.violation').click();
  await page.locator('#testDetailsDialog').screenshot({path:path.join(os.tmpdir(),'button-r21-hint-visibility-ui.png')});
  await page.locator('#closeTestDetailsButton').click();
  await page.locator('#authoringModeButton').click();
  // Saving the passport must preserve explicit target bindings and writable inputs.
  await page.locator('#contractSettingsButton').click();
  const semantics=JSON.parse(await page.locator('#semanticApiInput').inputValue());
  assert.deepEqual(semantics,manual.semanticApi);
  semantics.find(p=>p.id==='hintVisible').description+=' UI roundtrip verification.';
  await page.locator('#semanticApiInput').fill(JSON.stringify(semantics,null,2));
  await page.locator('#saveContractButton').click();
  const edited=await validate('BL11');
  assert.equal(edited.sources.manual.metadata.revision,manual.metadata.revision+1);
  assert.deepEqual(edited.sources.manual.semanticApi,semantics);
  assert.deepEqual(edited.sources.manual.generation,manual.generation);
  assert.deepEqual(edited.sources.compiledContract.componentDependencies,hidden.sources.compiledContract.componentDependencies);
  assert.equal(edited.results.engine.evaluations.filter(e=>e.classification==='violation').length,0);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'passed',source:'archived BL10/BL11/BL12 via simulated Plugin API',freshFigmaCapture:false,
   cases:{BL10:'confirmed absent; no violations',BL11:'enabled true / visible false; no violations',BL12:'two expected violations'},
   manualSessionRoundtrip:true,downloadedJsonReplay:'exact',errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

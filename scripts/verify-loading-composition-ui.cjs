// Built UI with archived Figma facts. This is not fresh Figma live acceptance.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),os=require('node:os');
const editor=path.resolve(__dirname,'..'),button=path.resolve(editor,'../../shared/design-system_ab/experiments/web-core/core/Button');
const core=require(path.join(editor,'dist/core.cjs'));
const manual=JSON.parse(fs.readFileSync(path.join(button,'contract.manual.json')));
const review=JSON.parse(fs.readFileSync(path.join(button,'qa/ownership-scope-live-review.2026-09-27.json')));
const original=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(button,review.reportResults.find(r=>r.caseId==='BS02').fixtureFile))));
const ruleId='component:web-core.button.loading-uses-addon-spinner';
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
  },original);
  async function validate(){
   await page.locator('#validationModeButton').click();
   await page.locator('#validationProductSelect').selectOption('ab',{force:true});
   await page.locator('#testSelectionButton').click();
   await page.evaluate(r=>{const req=window.sent.findLast(m=>m.type==='test-selection');window.postMessage({pluginMessage:{
    type:'selection-test-result',requestId:req.requestId,manualSourceHash:req.manualSourceHash,componentKey:r.snapshot.source.componentKey,
    snapshot:r.snapshot,anatomy:r.anatomy.map(n=>({...n,properties:r.snapshot.nodes.find(x=>x.id===n.id)})),matchedBaselineNodes:r.snapshot.nodes.length,
    unmatchedBaselineNodeIds:[],warnings:[],width:128,height:56,imageDataUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="56"/>'}},'*');},original);
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
  const initial=await validate();assert.deepEqual(initial.sources.manual,manual);
  assert.deepEqual(initial.results.engine.evaluations.filter(e=>e.ruleId.startsWith(ruleId+'.')).map(e=>e.classification),['compliant','compliant','compliant']);
  await page.locator('#authoringModeButton').click();
  await page.locator('#ruleSelect').selectOption(ruleId,{force:true});
  await page.locator('#constraintEntrySelect').selectOption('0',{force:true});
  assert.equal(await page.locator('#constraintCountDependency').inputValue(),'spinner');
  assert.equal(await page.locator('#activeDependency').inputValue(),'spinner');
  assert.equal(await page.locator('#constraintTargetRoles').isDisabled(),true);
  assert.equal(await page.locator('#constraintVisibleOnly').isDisabled(),true);
  await page.locator('#constraintMin').fill('2');await page.locator('#constraintMax').fill('2');
  await page.locator('#saveRuleButton').click();
  const edited=await validate(),saved=edited.sources.manual.rules.find(r=>r.id===ruleId);
  assert.deepEqual(saved.constraints[0],{type:'quantity',min:2,max:2,contractDependencyId:'spinner'});
  assert.deepEqual(saved.constraints.slice(1),manual.rules.find(r=>r.id===ruleId).constraints.slice(1));
  assert.equal(saved.applicability.activeDependency,'spinner');
  assert.deepEqual(edited.sources.compiledContract.componentDependencies,initial.sources.compiledContract.componentDependencies);
  const found=edited.results.details.filter(d=>d.ruleId.startsWith(ruleId+'.')&&d.classification==='violation');
  assert.equal(found.length,1);assert.equal(found[0].actual,1);
  await page.locator('.result-chip.violation').click();
  const card=page.locator('.test-detail-card.violation').filter({hasText:'В Loading у Button'});
  assert.equal(await card.count(),1);
  await card.screenshot({path:path.join(os.tmpdir(),'button-r20-loading-ui.png')});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'passed',source:'archived BS02 via simulated Plugin API',freshFigmaCapture:false,
   initialLoading:'three compliant',editedLoading:'one violation after session-only bounds edit',pin:'Spinner r8 unchanged',errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

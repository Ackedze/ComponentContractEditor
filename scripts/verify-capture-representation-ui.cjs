// Built UI + archived Figma facts through simulated Plugin API messages.
// VM capture tests separately exercise the real dist/code.js identity gate.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),os=require('node:os');
const editor=path.resolve(__dirname,'..'),button=path.resolve(editor,'../../shared/design-system_ab/experiments/web-core/core/Button');
const core=require(path.join(editor,'dist/core.cjs')),clone=x=>JSON.parse(JSON.stringify(x));
const review=JSON.parse(fs.readFileSync(path.join(button,'qa/spinner-palette-live-review.2026-09-28.json')));
const load=id=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(button,review.reportResults.find(r=>r.caseId===id).fixtureFile))));
const source={BP01:load('BP01'),BP08:load('BP08'),BP13:load('BP13')};
const ruleId='component:web-core.button.loading-spinner-style-follows-view';
const imageDataUrl='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="56"/>';

(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(editor,'dist/ui.html'));
  await page.evaluate(()=>{window.sent=[];window.addEventListener('message',e=>{if(e.data?.pluginMessage)window.sent.push(e.data.pluginMessage);});
   window.postMessage({pluginMessage:{type:'plugin-ready',selectionAvailable:true,instanceSelectionAvailable:true}},'*');});
  await page.locator('#fileInput').setInputFiles(path.join(button,'editor/Button.editor-input.zip'));
  await page.waitForFunction(()=>document.querySelector('#ruleCount').textContent==='26');
  async function request(type){return page.evaluate(type=>window.sent.findLast(m=>m.type===type),type);}
  async function respond(caseId,type,req){
   const r=clone(source[caseId]),rep=core.resolveCaptureRepresentation(req.representations,r.snapshot.source.componentKey,r.snapshot.source.componentSetKey);
   assert.equal(req.representations.filter(r=>r.kind==='figma').length,4);
   // Simulate what the patched capture produces, including independent references.
   const context=v=>{if(v&&typeof v==='object'){if(v.context?.platform)v.context.platform=rep.platform;Object.values(v).forEach(context);}};
   context(r.snapshot);r.snapshot.source.representationId=rep.id;
   const message={type,requestId:req.requestId,manualSourceHash:req.manualSourceHash,componentKey:r.snapshot.source.componentKey,
    snapshot:r.snapshot,anatomy:r.anatomy.map(n=>({...n,properties:r.snapshot.nodes.find(x=>x.id===n.id)})),
    matchedBaselineNodes:r.snapshot.nodes.length,unmatchedBaselineNodeIds:[],warnings:[],width:128,height:56,imageDataUrl,variableModes:[]};
   await page.evaluate(message=>window.postMessage({pluginMessage:message},'*'),message);
  }
  await respond('BP01','preview-result',await request('render-preview'));
  const authoringSelection=await page.locator('select[aria-label="Активный компонент"]').inputValue();
  async function start(){await page.locator('#validationModeButton').click();await page.locator('#validationProductSelect').selectOption('ab',{force:true});
   await page.locator('#testSelectionButton').click();const req=await request('test-selection');assert.deepEqual(req.acceptedComponentKeys,[]);return req;}
  async function download(){
   await page.waitForFunction(()=>!document.querySelector('#downloadReportButton').disabled);
   const pending=page.waitForEvent('download');await page.locator('#downloadReportButton').click();const chunks=[];
   for await(const c of await(await pending).createReadStream())chunks.push(c);
   const r=JSON.parse(Buffer.concat(chunks));
   assert.equal(r.editorVersion,'component-contract-editor@'+require('../package.json').version);
   assert.deepEqual(clone(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract)),r.results.engine);
   assert.equal(r.summary.complete,false);assert.equal(r.summary.inconclusive,0);return r;
  }
  const results=[];
  for(const id of ['BP08','BP01','BP13']){
   const req=await start();await respond(id,'selection-test-result',req);const r=await download();
   assert.deepEqual(r.sources.manual,source.BP01.sources.manual);assert.deepEqual(r.sources.compiledContract,source.BP01.sources.compiledContract);
   assert.equal(r.summary.classifications.violation||0,0);assert.equal(r.run.context.platform,id==='BP08'?'mobile-web':'desktop');
   assert.equal(await page.locator('select[aria-label="Активный компонент"]').inputValue(),authoringSelection);
   if(id==='BP08')assert.match(await page.locator('#componentMeta').textContent(),/\[M\] Button · mobile-web/);
   if(id==='BP13')assert.ok(r.results.engine.evaluations.filter(e=>e.ruleId.startsWith(ruleId+'.')).every(e=>e.classification==='not-applicable'));
   results.push({caseId:id,platform:r.run.context.platform,inconclusive:r.summary.inconclusive});
  }
  // Switch only authoring representation. The normative manual is still the same.
  await page.locator('#authoringModeButton').click();
  const select=page.locator('select[aria-label="Активный компонент"]');
  const mobileOption=await select.evaluate(el=>[...el.options].find(o=>o.textContent.startsWith('[M] Button ·')).value);
  await select.selectOption(mobileOption,{force:true});await respond('BP08','preview-result',await request('render-preview'));
  const reverse=await start();await respond('BP01','selection-test-result',reverse);const desktop=await download();
  assert.equal(desktop.run.context.platform,'desktop');assert.equal(await select.inputValue(),mobileOption);
  assert.deepEqual(desktop.sources.manual,source.BP01.sources.manual);
  // Change a rule while a capture is pending. A stale manual hash triggers a
  // new request; the eventual test uses the current session table, not the ZIP.
  const stale=await start();await page.locator('#authoringModeButton').click();
  await page.locator('#ruleSelect').selectOption(ruleId,{force:true});await page.locator('#constraintEntrySelect').selectOption('0',{force:true});
  const cases=JSON.parse(await page.locator('#dependencyCases').inputValue());cases[0].values=['False'];
  await page.locator('#dependencyCases').fill(JSON.stringify(cases,null,2));await page.locator('#saveRuleButton').click();
  await page.locator('#validationModeButton').click();await respond('BP08','selection-test-result',stale);
  await page.waitForFunction(id=>window.sent.findLast(m=>m.type==='test-selection').requestId!==id,stale.requestId);
  const fresh=await request('test-selection');assert.notEqual(fresh.manualSourceHash,stale.manualSourceHash);
  await respond('BP08','selection-test-result',fresh);const edited=await download();
  assert.deepEqual(edited.sources.manual.rules.find(r=>r.id===ruleId).constraints[0].dependency.cases,cases);
  const found=edited.results.details.filter(d=>d.classification==='violation');assert.equal(found.length,1);
  assert.equal(found[0].actual,'True');assert.deepEqual(found[0].expected,['False']);assert.equal(edited.run.context.platform,'mobile-web');
  assert.equal(await select.inputValue(),mobileOption);assert.equal(edited.component.platform,'desktop');
  await page.locator('#authoringModeButton').click();
  assert.deepEqual(JSON.parse(await page.locator('#dependencyCases').inputValue()),cases);
  const saved=await request('save-session');assert.deepEqual(saved.session.workspace.manual,edited.sources.manual);
  await page.locator('#validationModeButton').click();await page.locator('.result-chip.violation').click();
  await page.screenshot({path:path.join(os.tmpdir(),'button-key-capture-ui.png')});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'passed',freshFigmaCapture:false,source:'archived BP facts via simulated Plugin API',results,
   reverse:'mobile authoring -> desktop validation',sessionEdit:'stale result rejected; edited palette gives one violation',errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

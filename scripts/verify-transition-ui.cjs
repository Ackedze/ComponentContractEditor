// Synthetic paired snapshots through built UI / simulated Plugin API, not fresh Figma acceptance.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {scenario,clone,core}=require('../tests/helpers/button-spinner');
const editor=path.resolve(__dirname,'..'),button=path.resolve(editor,'../../shared/design-system_ab/experiments/web-core/core/Button');
const manual=JSON.parse(fs.readFileSync(path.join(button,'contract.manual.json'))),id='component:web-core.button.loading-preserves-width';
const review=JSON.parse(fs.readFileSync(path.join(button,'qa/effective-hint-visibility-live-review.2026-09-28.json')));
const archived=JSON.parse(require('node:zlib').gunzipSync(fs.readFileSync(path.join(button,review.reportResults.find(r=>r.caseId==='BL11').fixtureFile))));
const after=clone(archived.snapshot),before=clone(after);
before.nodes.find(n=>n.semantic.path==='[D] Button / LeftAddon').visible=false;
before.nodes.find(n=>n.name==='Text').visible=true;
before.nodes[0].component.properties['LeftAddon#4:10']=false;
before.nodes[0].component.properties['Label#4:11']=true;
const anatomy=s=>s.nodes.map(n=>({id:n.id,name:n.name,type:n.type,path:n.semantic.path,parentId:n.parentId,childIds:n.childIds,figmaNodeId:n.id,properties:n}));
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];let sequence=0;page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.join(editor,'dist/ui.html'));
  await page.evaluate(()=>{window.sent=[];window.addEventListener('message',e=>{if(e.data?.pluginMessage)window.sent.push(e.data.pluginMessage);});window.postMessage({pluginMessage:{type:'plugin-ready',selectionAvailable:true,instanceSelectionAvailable:true}},'*');});
  await page.locator('#fileInput').setInputFiles(path.join(button,'editor/Button.editor-input.zip'));
  await page.waitForFunction(()=>document.querySelector('#ruleCount').textContent==='26');
  await page.evaluate(({s,a})=>{const req=window.sent.findLast(m=>m.type==='render-preview');window.postMessage({pluginMessage:{type:'preview-result',requestId:req.requestId,componentKey:req.componentKey,snapshot:s,anatomy:a,width:120,height:40,warnings:[],imageDataUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}},'*');},{s:before,a:anatomy(before)});
  await page.locator('#validationModeButton').click();await page.locator('#validationProductSelect').selectOption('ab',{force:true});
  async function capture(snapshot,first=false){
   console.log('Capture',sequence+1,first?'before':'after');
   await page.locator(first?'#captureBeforeButton':'#testSelectionButton').click();
   await page.evaluate(({s,a,sequence})=>{
    const req=window.sent.findLast(m=>m.type==='test-selection');if(!req.captureTransitionContext)throw Error('Missing capture request');
    s.transitionCapture={schemaVersion:'apollo.transition-capture.v1',sessionId:'browser-test',sequence,manualSourceHash:req.manualSourceHash,complete:true,externalContext:{profile:'same-instance-context@1',pageId:s.source.pageId,ancestors:[],rootConstraints:{}}};
    window.postMessage({pluginMessage:{type:'selection-test-result',requestId:req.requestId,manualSourceHash:req.manualSourceHash,componentKey:s.source.componentKey,snapshot:s,anatomy:a,matchedBaselineNodes:s.nodes.length,unmatchedBaselineNodeIds:[],warnings:[],width:120,height:40,imageDataUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}},'*');
   },{s:clone(snapshot),a:anatomy(snapshot),sequence:++sequence});
   await page.waitForFunction(()=>!document.querySelector('#captureBeforeButton').disabled);
   if(first){console.log(await page.locator('#transitionStatus').textContent());await page.waitForFunction(()=>document.querySelector('#transitionStatus').textContent.includes('Состояние до:'));return;}
   await page.waitForFunction(()=>!document.querySelector('#downloadReportButton').disabled);
   const pending=page.waitForEvent('download');await page.locator('#downloadReportButton').click();const stream=await(await pending).createReadStream(),chunks=[];for await(const c of stream)chunks.push(c);
   const r=JSON.parse(Buffer.concat(chunks));assert.deepEqual(r.results.engine,clone(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract)));
   assert.deepEqual(r.results.details,clone(core.buildEvaluationDetails(r.results.editor,r.runtime.evaluatedContract,r.anatomy)));return r;
  }
  const verdict=r=>r.results.engine.evaluations.find(e=>e.ruleId===id+'.1.1').classification;
  const missing=await capture(after);assert.equal(verdict(missing),'human-review');
  assert.ok(missing.results.editor.evaluations.some(e=>e.ruleId===id&&e.classification==='not-executed'));
  await capture(before,true);const pass=await capture(after);assert.equal(verdict(pass),'compliant');
  assert.deepEqual(pass.sources.manual,manual);assert.ok(pass.snapshot.transitionBefore);assert.equal(pass.editorVersion,'component-contract-editor@0.2.41');
  const shrunk=clone(after);shrunk.nodes[0].bounds.width-=20;const fail=await capture(shrunk);assert.equal(verdict(fail),'violation');
  await page.locator('.result-chip.violation').click();await page.locator('#testDetailsDialog').screenshot({path:path.join(os.tmpdir(),'button-r22-transition-result.png')});await page.locator('#closeTestDetailsButton').click();
  await page.locator('#authoringModeButton').click();await page.locator('#ruleSelect').selectOption(id,{force:true});
  assert.equal(await page.locator('#transitionDependency').inputValue(),'spinner');
  await page.locator('#transitionTolerance').fill('0.1');await page.locator('#saveRuleButton').click();
  await page.locator('#validationModeButton').click();const edited=await capture(after);assert.equal(verdict(edited),'human-review');
  assert.equal(edited.sources.manual.rules.find(r=>r.id===id).constraints[0].transition.tolerance,0.1);
  assert.ok(JSON.stringify(edited.results.editor).includes('После первого снимка изменён контракт'));
  await capture(before,true);assert.equal(verdict(await capture(after)),'compliant');
  await page.locator('#clearBeforeButton').click();assert.equal(verdict(await capture(after)),'human-review');
  await capture(before,true);
  await page.locator('#fileInput').setInputFiles([]);
  await page.locator('#fileInput').setInputFiles(path.join(button,'editor/Button.editor-input.zip'));
  await page.waitForFunction(()=>document.querySelector('#clearBeforeButton').disabled);
  assert.equal(verdict(await capture(after)),'human-review');
  await page.screenshot({path:path.join(os.tmpdir(),'button-r22-transition-toolbar.png')});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'passed',freshFigmaCapture:false,scenarios:['no pair','before/after compliant','shrink violation','session rule edit invalidates pair','recapture','clear','import clears pair'],downloadedJsonReplay:'exact',errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

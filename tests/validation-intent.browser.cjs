// Local Chromium integration with archived Figma evidence; no Figma writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const editor=path.resolve(__dirname,'..'),root=path.resolve(editor,'../../shared/design-system_ab/experiments/web-core/core/Button');
const review=JSON.parse(fs.readFileSync(path.join(root,'qa/usage-transfer-live-review.2026-09-28.json')));
const report=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,review.reportResults[0].fixtureFile))));
const id='component:web-core.button.block-maps-to-fill';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.sent=[];const original=window.postMessage.bind(window);window.postMessage=(m,...args)=>{window.sent.push(m);return original(m,...args);};});
  await page.goto('file://'+path.join(editor,'dist/ui.html'));
  await page.locator('#fileInput').setInputFiles(path.join(root,'editor/Button.editor-input.zip'));
  await page.waitForFunction(()=>window.sent.map(m=>m.pluginMessage).some(m=>m?.type==='render-preview'));
  const send=message=>page.evaluate(m=>window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:m}})),message);
  await send({type:'selection-availability',selectionAvailable:true,instanceSelectionAvailable:true,selectedRootNodeId:report.snapshot.source.rootNodeId});
  const payload=(request,type)=>({type,requestId:request.requestId,manualSourceHash:request.manualSourceHash,componentKey:report.snapshot.source.componentKey,
   anatomy:report.anatomy,snapshot:report.snapshot,imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwAAAABJRU5ErkJggg==',width:192,height:56,warnings:[],variableModes:[],matchedBaselineNodes:16,unmatchedBaselineNodeIds:[]});
  let request=await page.evaluate(()=>window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='render-preview').at(-1));
  await send(payload(request,'preview-result'));
  await page.locator('#validationModeButton').click();await page.locator('#validationProductSelect').selectOption('ab',{force:true});
  assert.equal(await page.locator('#validationPurposeSelect').inputValue(),'component-audit');
  assert.equal(await page.locator('#validationInputs').isVisible(),false);
  await page.locator('#validationPurposeSelect').selectOption('specification',{force:true});
  await page.locator('#validationInputs summary').click();
  const input=page.locator('select[data-input-id="block"]');assert.equal(await input.inputValue(),'');
  const textInput=page.locator('select[data-input-id="textResizing"]');assert.equal(await textInput.inputValue(),'');
  const nowrapInput=page.locator('select[data-input-id="nowrap"]'),widthContext=page.locator('select[data-input-id="constrainedWidth"]');
  assert.equal(await nowrapInput.inputValue(),'');assert.equal(await widthContext.inputValue(),'');
  assert.match(await widthContext.locator('..').innerText(),/Контекст: Ограниченная ширина контейнера/);
  assert.deepEqual(await textInput.locator('option').evaluateAll(opts=>opts.map(o=>o.value)),['','hug','fill']);
  const check=async()=>{await page.locator('#testSelectionButton').click();assert.equal(await input.isDisabled(),true);request=await page.evaluate(()=>window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='test-selection').at(-1));await send(payload(request,'selection-test-result'));await page.locator('#downloadReportButton').waitFor({state:'visible'});};
  await check();await page.locator('.result-chip.human-review').click();
  assert.match(await page.locator('#testDetailList').innerText(),/независимое ожидание/);
  await page.locator('#testDetailsDialog button').filter({hasText:'Закрыть'}).count();
  await page.evaluate(()=>document.getElementById('testDetailsDialog').close());
  await input.selectOption('true',{force:true});await textInput.selectOption('hug',{force:true});
  await nowrapInput.selectOption('false',{force:true});await widthContext.selectOption('false',{force:true});await check();
  const downloadPromise=page.waitForEvent('download');await page.locator('#downloadReportButton').click();const download=await downloadPromise;
  const downloaded=JSON.parse(fs.readFileSync(await download.path()));
  assert.equal(downloaded.snapshot.validationIntent.values.block,true);
  assert.equal(downloaded.snapshot.validationIntent.values.textResizing,'hug');
  assert.equal(downloaded.snapshot.validationIntent.values.nowrap,false);
  assert.equal(downloaded.snapshot.validationIntent.values.constrainedWidth,false);
  assert.ok(downloaded.results.engine.evaluations.filter(e=>e.ruleId.includes('nowrap-maps')).every(e=>e.classification==='not-applicable'));
  assert.equal(downloaded.sources.manual.validationContext[0].id,'constrainedWidth');
  assert.ok(!downloaded.sources.manual.semanticApi.some(p=>p.id==='constrainedWidth'));
  assert.equal(downloaded.results.engine.evaluations.find(e=>e.ruleId.endsWith('text-resizing-maps-to-figma-layout.1.1.specification')).classification,'compliant');
  assert.equal(downloaded.snapshot.validationRequest.mode,'specification');
  assert.equal(downloaded.summary.specificationStatus,'requested');
  assert.equal(downloaded.snapshot.validationIntent.subject.rootNodeId,report.snapshot.source.rootNodeId);
  const rows=downloaded.results.engine.evaluations.filter(e=>e.ruleId.startsWith(id+'.'));assert.ok(rows.some(e=>e.classification==='violation'));
  await page.locator('#validationPurposeSelect').selectOption('component-audit',{force:true});
  assert.equal(await page.locator('#downloadReportButton').isDisabled(),true);
  assert.equal(await page.locator('#validationInputs').isVisible(),false);
  await check();
  const auditDownload=page.waitForEvent('download');await page.locator('#downloadReportButton').click();
  const audit=JSON.parse(fs.readFileSync(await (await auditDownload).path()));
  assert.equal(audit.snapshot.validationIntent,undefined);assert.equal(audit.summary.validationMode,'component-audit');
  assert.equal(audit.summary.complete,true);assert.equal(audit.summary.specificationStatus,'not-requested');
  assert.equal(audit.results.editor.evaluations.filter(e=>e.classification==='not-executed').length,0);
  assert.match(await page.locator('#testCompleteness').innerText(),/спецификации не проверялось/);
  await page.locator('#validationPurposeSelect').selectOption('specification',{force:true});assert.equal(await input.inputValue(),'');
  await send({type:'selection-availability',selectionAvailable:true,instanceSelectionAvailable:true,selectedRootNodeId:'other-instance'});
  assert.equal(await input.inputValue(),'');assert.equal(await page.locator('#downloadReportButton').isDisabled(),true);
  await input.selectOption('false',{force:true});
  // A capture from the previous instance is not displayed after a selection change.
  await page.locator('#testSelectionButton').click();request=await page.evaluate(()=>window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='test-selection').at(-1));
  assert.equal(request.expectedRootNodeId,'other-instance');await send(payload(request,'selection-test-result'));
  assert.equal(await page.locator('#downloadReportButton').isDisabled(),true);
  for(const [width,height] of [[1200,720],[900,640],[1440,900]]){
   await page.setViewportSize({width,height});
   const bounds=await page.locator('#testSelectionButton').boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<=height);
   const panel=await page.locator('.validation-panel').boundingBox();assert.ok(panel.y>=0&&panel.y+panel.height<=height);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  if(process.env.SCREENSHOT_DIR){await page.locator('.toast').last().waitFor({state:'detached',timeout:20000});await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'validation-intent.png')});}
  // Manual scope is editable and survives save; no parallel frontend-only source.
  await page.locator('#authoringModeButton').click();await page.locator('#ruleSelect').selectOption(id,{force:true});
  assert.equal(await page.locator('#ruleValidationMode').inputValue(),'specification');
  const layoutId='component:web-core.button.text-resizing-maps-to-figma-layout';
  await page.locator('#ruleSelect').selectOption(layoutId,{force:true});
  const profiles=JSON.parse(await page.locator('#configurationDomain').inputValue());assert.equal(profiles.profiles.length,2);
  await page.locator('#saveRuleButton').click();await page.locator('#ruleSelect').selectOption(layoutId,{force:true});
  assert.deepEqual(JSON.parse(await page.locator('#configurationDomain').inputValue()),profiles);
  const innerId='component:web-core.button.internal-sizing-locked';
  const nowrapId='component:web-core.button.nowrap-maps-to-figma-layout';
  await page.locator('#ruleSelect').selectOption(nowrapId,{force:true});
  const mapping=JSON.parse(await page.locator('#configurationMapping').inputValue());assert.equal(mapping.cases.length,2);
  await page.locator('#saveRuleButton').click();await page.locator('#ruleSelect').selectOption(nowrapId,{force:true});
  assert.deepEqual(JSON.parse(await page.locator('#configurationMapping').inputValue()),mapping);
  await page.locator('#ruleSelect').selectOption(innerId,{force:true});
  const exception=JSON.parse(await page.locator('#exceptConfiguration').inputValue());assert.equal(exception.ruleId,layoutId);
  await page.locator('#saveRuleButton').click();await page.locator('#ruleSelect').selectOption(innerId,{force:true});
  assert.deepEqual(JSON.parse(await page.locator('#exceptConfiguration').inputValue()),exception);
  if(process.env.SCREENSHOT_DIR){await page.locator('#exceptConfiguration').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'configuration-authoring.png')});}
  await page.locator('#ruleSelect').selectOption(id,{force:true});
  await page.locator('#saveRuleButton').click();await page.locator('#ruleSelect').selectOption(id,{force:true});
  assert.equal(await page.locator('#ruleValidationMode').inputValue(),'specification');
  await page.locator('#contractSettingsButton').click();
  const contextSource=JSON.parse(await page.locator('#validationContextInput').inputValue());
  assert.equal(contextSource[0].id,'constrainedWidth');
  assert.ok(!JSON.parse(await page.locator('#semanticApiInput').inputValue()).some(p=>p.id==='constrainedWidth'));
  await page.locator('#saveContractButton').click();await page.locator('#contractSettingsButton').click();
  assert.deepEqual(JSON.parse(await page.locator('#validationContextInput').inputValue()),contextSource);
  assert.deepEqual(errors,[]);console.log('PASS audit/specification/enum input/unknown diagnosis/JSON modes/input reset/stale capture/configuration+baseline-exception+context roundtrip/scope authoring/3 viewports. Simulated evidence, not live Figma acceptance.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

// Local browser test with archived evidence. Does not write manual/compiled/Figma sources.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const editor = path.resolve(__dirname, '..');
const button = path.resolve(editor, '../../shared/design-system_ab/experiments/web-core/core/Button');
const manual = JSON.parse(fs.readFileSync(path.join(button, 'history/r23-editor-0.2.44/contract.manual.json')));
const review = JSON.parse(fs.readFileSync(path.join(button, 'qa/instance-identity-live-review.2026-09-28.json')));
const report = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(button, review.reportResults[0].fixtureFile))));
const id = 'component:web-core.button.desktop-hint-restricted';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({viewport:{width:1200,height:720}}), errors=[];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.sent=[]; const original=window.postMessage.bind(window); window.postMessage=(message,...args)=>{window.sent.push(message);return original(message,...args);}; });
    await page.goto('file://'+path.join(editor,'dist/ui.html'));
    const send=message=>page.evaluate(m=>window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:m}})),message);
    const checkSelected=async()=>{
      await send({type:'selection-availability',selectionAvailable:true,instanceSelectionAvailable:true,selectedRootNodeId:report.snapshot.source.rootNodeId});
      await page.locator('#testSelectionButton').click();
      const request=await page.evaluate(()=>window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='test-selection').at(-1));
      await send({type:'selection-test-result',requestId:request.requestId,manualSourceHash:request.manualSourceHash,
        componentKey:report.snapshot.source.componentKey,anatomy:report.anatomy,snapshot:report.snapshot,
        imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwAAAABJRU5ErkJggg==',width:192,height:56,warnings:[],variableModes:[],matchedBaselineNodes:16,unmatchedBaselineNodeIds:[]});
    };
    const openCompiled=async()=>{
      await page.locator('#validationModeButton').click();
      await page.locator('#contractDiagnostics').evaluate(details=>{details.open=true;});
      await page.locator('#showCompiledButton').click();
    };
    await page.locator('#fileInput').setInputFiles(path.join(button,'history/r23-editor-0.2.44/Button.editor-input.zip'));
    await page.locator('#contractSettingsButton').waitFor({state:'visible'});
    await page.evaluate(({snapshot,anatomy}) => {
      const request=window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='render-preview').at(-1);
      window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:{type:'preview-result',requestId:request.requestId,componentKey:request.componentKey,
        anatomy,snapshot,imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwAAAABJRU5ErkJggg==',width:192,height:56,warnings:[]}}}));
    },{snapshot:report.snapshot,anatomy:report.anatomy});
    await page.locator('#ruleSelect').selectOption(id,{force:true});
    assert.equal(await page.locator('#ruleOwnershipKind').inputValue(),'');
    await page.locator('#ruleOwnershipKind').selectOption('product-policy',{force:true});
    await page.locator('#ruleOwnershipId').fill('product.ab');
    await page.locator('#saveRuleButton').click();
    const saved = await page.evaluate(()=>window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='save-session').at(-1).session.workspace.manual);
    const before=manual.rules.find(r=>r.id===id),after=saved.rules.find(r=>r.id===id);
    assert.deepEqual(after.ownership,{kind:'product-policy',ownerId:'product.ab'});
    for(const key of ['id','constraints','status']) assert.deepEqual(after[key],before[key],key);
    for(const key of ['applicability','execution']) for(const [field,value] of Object.entries(before[key] || {})) assert.deepEqual(after[key][field],value,`${key}.${field}`);
    assert.equal(saved.metadata.ruleOwnershipVersion,1);
    await openCompiled();
    const compiled=JSON.parse(await page.locator('#compiledOutput').innerText());
    assert.equal(compiled.rules.length,54); // missing ownership must not suppress legacy predicates
    assert.deepEqual(compiled.coverage.byOwnership,{component:0,usage:1,unclassified:26});
    await page.locator('#closeCompiledButton').click();
    await page.locator('#authoringModeButton').click();
    await page.locator('#ruleSelect').selectOption(id,{force:true});
    await page.locator('#ruleOwnershipKind').selectOption('',{force:true});
    await page.locator('#ruleStatus').selectOption('reviewed',{force:true});
    await page.locator('#saveRuleButton').click();
    assert.equal(await page.locator('#ruleOwnershipKind').getAttribute('aria-invalid'),'true');
    await page.locator('#ruleSelect').selectOption(id,{force:true}); // discard form-only error
    await page.locator('#validationModeButton').click();
    await page.locator('#validationProductSelect').selectOption('ab',{force:true});
    await page.evaluate(({snapshot,anatomy}) => {
      const request=window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='render-preview').at(-1);
      window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:{type:'preview-result',requestId:request.requestId,componentKey:request.componentKey,
        anatomy,snapshot,imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwAAAABJRU5ErkJggg==',width:192,height:56,warnings:[]}}}));
    },{snapshot:report.snapshot,anatomy:report.anatomy});
    await checkSelected();
    await page.locator('#ownershipCompleteness').waitFor({state:'visible'});
    assert.match(await page.locator('#ownershipCompleteness').innerText(),/Применение:/);
    assert.match(await page.locator('#testCompleteness').innerText(),/неполная/);
    await page.locator('#fileInput').setInputFiles(path.join(button,'editor/Button.editor-input.zip'));
    await page.waitForFunction(()=>window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='save-session').at(-1)?.session?.workspace?.manual?.metadata?.revision===26);
    await page.evaluate(({snapshot,anatomy})=>{
      const request=window.sent.map(m=>m.pluginMessage).filter(m=>m?.type==='render-preview').at(-1);
      window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:{type:'preview-result',requestId:request.requestId,componentKey:request.componentKey,
        anatomy,snapshot,imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwAAAABJRU5ErkJggg==',width:192,height:56,warnings:[]}}}));
    },{snapshot:report.snapshot,anatomy:report.anatomy});
    await page.locator('#authoringModeButton').click();
    assert.equal(await page.locator('#ruleSelect option').evaluateAll((options,id)=>options.filter(o=>o.value===id).length,id),0);
    await page.locator('#ruleSelect').selectOption('component:core.web.button.root.auto-layout-1',{force:true});
    assert.equal(await page.locator('#ruleOwnershipKind').inputValue(),'component');
    assert.equal(await page.locator('#ruleOwnershipId').inputValue(),'core.web.button');
    await openCompiled();
    const current=JSON.parse(await page.locator('#compiledOutput').innerText());
    assert.deepEqual(current.coverage.byOwnership,{component:22,usage:0,unclassified:0});
    assert.equal(current.rules.length,55);
    await page.locator('#closeCompiledButton').click();
    await page.locator('#validationModeButton').click();
    await page.locator('#validationProductSelect').selectOption('ab',{force:true});
    await checkSelected();
    await page.locator('#ownershipCompleteness').waitFor({state:'visible'});
    assert.doesNotMatch(await page.locator('#ownershipCompleteness').innerText(),/Без подтверждённого владельца/);
    if(process.env.SCREENSHOT_DIR) { await page.locator('.toast').last().waitFor({state:'detached',timeout:20000}); await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'editor-ownership-1200x720.png')}); }
    assert.deepEqual(errors,[]);
    console.log('PASS ownership UI: r23 import/classification/save gates, r26 import/22 component owners/55 predicates; transferred rule absent. Simulated selected-instance validation.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});

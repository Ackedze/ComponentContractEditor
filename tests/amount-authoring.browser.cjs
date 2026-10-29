// Optional headless UI roundtrip. Uses the real input ZIP, no Figma writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>window.addEventListener('message',e=>{if(e.data?.pluginMessage?.type==='save-session')window.__manual=e.data.pluginMessage.session.workspace.manual;}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/ui.html')).href);
    await page.locator('#fileInput').setInputFiles(path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Amount/authoring/editor/Amount.editor-input.zip'));
    await page.waitForFunction(()=>window.__manual?.component?.family==='Amount');
    for(const suffix of ['addon-content-is-configurable','currency-standard-text-matches-type','currency-custom-text-is-editable','major-colors-use-tokens','major-text-style-binding-required','minor-text-style-binding-required','currency-text-style-binding-required']){
      const original=await page.evaluate(s=>window.__manual.rules.find(r=>r.id.endsWith(s)),suffix);
      const index=await page.evaluate(id=>window.__manual.rules.findIndex(r=>r.id===id),original.id);
      await page.locator('.rule-card').nth(index).click();
      if(suffix.includes('text-style-binding')) assert.equal(await page.locator('#constraintStyleCatalog').inputValue(),'Web _ Typography.json');
      if(suffix.includes('addon')){assert.equal(await page.locator('#slotAnchorProperty').inputValue(),'Addon#100902:0');assert.equal(await page.locator('#slotContentOwnership').inputValue(),'external');}
      if(suffix.includes('standard')){
        assert.equal(await page.locator('#baselineSource').inputValue(),'library-text');assert.equal(await page.locator('#textNormalization').inputValue(),'trim');
        const previous=await page.locator('#contextDomains').inputValue();
        await page.locator('#contextDomains').fill('{ broken');await page.locator('#saveRuleButton').click();
        assert.equal(await page.locator('#contextDomains').inputValue(),'{ broken');
        await page.locator('#contextDomains').fill(previous);
      }
      const revision=await page.evaluate(()=>window.__manual.metadata.revision);
      await page.locator('#saveRuleButton').click();
      await page.waitForFunction(r=>window.__manual.metadata.revision===r+1,revision);
      const saved=await page.evaluate(id=>window.__manual.rules.find(r=>r.id===id),original.id);
      assert.deepEqual(saved.constraints,original.constraints);
      assert.deepEqual(saved.applicability.contextDomains||{},original.applicability.contextDomains||{});
      if(suffix.includes('addon')){assert.equal(saved.controlPaths[0].property,'Addon#100902:0');assert.equal(saved.controlPaths[0].target,'target.addon');assert.equal(saved.controlPaths[0].contentOwnership,'external');}
    }
    assert.deepEqual(errors,[]);console.log('PASS: 7 real-UI rule roundtrips; invalid context JSON blocks save without losing source; no page errors.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

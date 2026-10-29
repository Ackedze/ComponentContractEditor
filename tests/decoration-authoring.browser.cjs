// Real UI roundtrip for explicit baseline targets. No Figma writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),zlib=require('node:zlib');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.addEventListener('message',e=>{const m=e.data?.pluginMessage;if(m?.type==='save-session')window.__manual=m.session.workspace.manual;if(m?.type==='render-preview')window.__previewRequest=m.requestId;}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/ui.html')).href);
  // Pin this draft-authoring regression to immutable r9; Ready r10 acceptance is separate.
  await page.locator('#fileInput').setInputFiles(path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-corp/AmountStyles/history/r9-editor-0.2.64/editor/AmountStyles.editor-input.zip'));
  await page.waitForFunction(()=>window.__manual?.metadata?.revision===9);
  // Replay archived anatomy as a mock plugin response, not new live acceptance.
  const report=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-corp/AmountStyles/authoring/reports/fixtures/r8-editor-0.2.63/amount-styles.validation-report.2026-09-30T06-30-28-788Z.json.gz'))));
  await page.waitForFunction(()=>window.__previewRequest);
  await page.evaluate(r=>window.postMessage({pluginMessage:{type:'preview-result',requestId:window.__previewRequest,snapshot:r.snapshot,anatomy:r.anatomy,width:120,height:24,imageDataUrl:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',warnings:[]}},'*'),report);
  const original=await page.evaluate(()=>window.__manual.rules.find(r=>r.id.endsWith('manual-interactive-decoration-is-forbidden')));
  const index=await page.evaluate(id=>window.__manual.rules.findIndex(r=>r.id===id),original.id);
  await page.locator('.rule-card').nth(index).click();
  assert.equal(await page.locator('#baselineTargetRoles').inputValue(),original.constraints[0].targetRoles.join(', '));
  await page.locator('#saveRuleButton').click();
  await page.waitForFunction(()=>window.__manual.metadata.revision===10);
  const saved=await page.evaluate(id=>window.__manual.rules.find(r=>r.id===id),original.id);
  assert.deepEqual(saved.constraints,original.constraints);
  assert.equal(saved.targetScope,'self');assert.equal(saved.status,'draft');
  assert.deepEqual(errors,[]);
  console.log('PASS: real r9 ZIP import, explicit role field, all 3 constraints retained after UI save; no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

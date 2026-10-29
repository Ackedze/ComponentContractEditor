const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../dist/core.cjs'),{scenario}=require('../../Apollo/packages/component-contract-core/tests/helpers/direct-code-group.cjs'),{ownBindings}=require('../../Apollo/packages/component-contract-core/tests/helpers/code-passport.cjs');
(async()=>{
 const f=ownBindings(scenario()),bundle=core.buildExportBundle(f.manual,f.evidence,[f.childContract]),zip=core.buildAuthoringZip(bundle);
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../dist/ui.html'));await page.locator('#fileInput').setInputFiles({name:'synthetic-source.zip',mimeType:'application/zip',buffer:Buffer.from(zip)});await page.waitForFunction(()=>!document.querySelector('#exportButton').disabled);
 await page.locator('#contractSettingsButton').click();assert.deepEqual(JSON.parse(await page.locator('#representationsInput').inputValue()),f.manual.representations);assert.deepEqual(JSON.parse(await page.locator('#semanticApiInput').inputValue()),f.manual.semanticApi);
 assert.match(await page.locator('#contractDialog').textContent(),/Code evidence v1/);
 await page.locator('#saveContractButton').click();const pending=page.waitForEvent('download');await page.locator('#exportButton').click();const download=await pending;
 const output=(await core.readZip(fs.readFileSync(await download.path()))).map(e=>({name:e.name,text:core.zipEntryText(e)})),reopened=core.importWorkspace(output);
 assert.deepEqual(reopened.manual.representations,f.manual.representations);assert.deepEqual(reopened.manual.semanticApi,f.manual.semanticApi);assert.deepEqual(reopened.manual.componentDependencies,f.manual.componentDependencies);assert.equal(reopened.compiledInput.package.sourceExportVersion,'component-contract-editor@0.2.91');assert.equal(reopened.compiledInput.facts.representations.at(-1).status,'draft');
 const cache=JSON.parse(output.find(e=>e.name.endsWith('component-contract.v2.json')&&!e.name.includes('dependencies/')).text);cache.rules[0].presentation.title+=' tampered';
 const wrong=core.createZip(output.map(e=>core.textZipEntry(e.name,e.name==='compiled/component-contract.v2.json'?cache:JSON.parse(e.text))));await page.locator('#fileInput').setInputFiles({name:'stale-projection.zip',mimeType:'application/zip',buffer:Buffer.from(wrong)});await page.waitForFunction(()=>!document.querySelector('#exportButton').disabled);let downloads=0;page.on('download',()=>downloads++);await page.locator('#exportButton').click();await page.waitForFunction(()=>document.body.textContent.includes('EXPORT_PROJECTION_MISMATCH'));assert.equal(downloads,0);assert.deepEqual(errors,[]);
 console.log('PASS: Code evidence and owned bindings survive settings/save/ZIP, dependency pins remain exact, Code Draft stays Draft and stale cache export is visibly rejected.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

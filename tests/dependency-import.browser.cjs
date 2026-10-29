const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {core,clone,scenario}=require('./helpers/direct-group');

(async()=>{
 const f=scenario(2);f.manual.componentDependencies=[];
 f.manual.targets=f.manual.targets.filter(t=>t.semanticRole==='root');f.manual.targets[0].semanticRole='group-owner';
 f.manual.targets.push({...clone(f.manual.targets[0]),id:'variant-owner',semanticRole:'variant-owner',label:'Variant owner'});
 const workspace=process.env.AUTHORING_PACKAGE_PATH?core.importWorkspace((await core.readZip(fs.readFileSync(process.env.AUTHORING_PACKAGE_PATH))).map(e=>({name:e.name,text:core.zipEntryText(e)}))):
  {manual:f.manual,variantEvidence:f.evidence,anatomy:[],variants:[],hasVariantEvidence:true,tokens:[],warnings:[]};
 const dependency=process.env.DEPENDENCY_PACKAGE_PATH?fs.readFileSync(process.env.DEPENDENCY_PACKAGE_PATH):core.createZip([core.textZipEntry('contract.manual.json',f.childManual)]);
 const childWorkspace=core.importWorkspace((await core.readZip(dependency)).map(e=>({name:e.name,text:core.zipEntryText(e)})));
 const expected=core.compileManualSource(childWorkspace.manual,childWorkspace.variantEvidence,childWorkspace.dependencyContracts).contract;
 const initialRules=clone(workspace.manual.rules),initialTargets=clone(workspace.manual.targets);
 const session=core.createEditorSession(workspace,{workspaceMode:'authoring',validationProduct:'ab',scenarioProperties:{},activeModes:{}});
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../dist/ui.html'));
  await page.evaluate(session=>window.postMessage({pluginMessage:{type:'session-restored',session}},'*'),session);
  await page.locator('#contractSettingsButton').click();
  assert.notEqual(await page.locator('#directDependencyOwner').inputValue(),'');
  assert.equal(await page.locator('#directDependencyMembers input').count(),0);
  assert.match(await page.locator('#directDependencyMembers').textContent(),/semantic targets ещё не заданы/);
  await page.locator('#directDependencyFile').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
  await page.waitForFunction(()=>document.querySelector('#directDependencyStatus').classList.contains('error'));
  await page.locator('#directDependencyStatus').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('#directDependencyStatus').isVisible(),true);
  assert.equal(await page.locator('#directDependencyStatus').evaluate(el=>Boolean(el.closest('dialog')?.open)),true);
  assert.equal(await page.locator('#directDependencyPackage option').count(),1);
  await page.locator('#directDependencyFile').setInputFiles({name:'child-source.zip',mimeType:'application/zip',buffer:Buffer.from(dependency)});
  await page.waitForFunction(()=>document.querySelector('#directDependencyPinInfo').textContent.includes('Полный closure подтверждён'));
  assert.equal(await page.locator('#directDependencyPackage').inputValue(),expected.package.componentId);
  assert.match(await page.locator('#directDependencyStatus').textContent(),/child-source.zip загружен/);
  assert.match(await page.locator('#directDependencyPinInfo').textContent(),new RegExp(core.stableHash(expected)));
  const invalid=clone(expected);invalid.runtimePolicy.memberCollectionsVersion=2;
  await page.locator('#directDependencyFile').setInputFiles({name:'unsupported.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
  await page.waitForFunction(()=>document.querySelector('#directDependencyStatus').classList.contains('error'));
  assert.match(await page.locator('#directDependencyStatus').textContent(),/dependency-runtime-unsupported/);
  assert.equal(await page.locator('#directDependencyPackage').inputValue(),expected.package.componentId);
  await page.locator('#saveContractButton').click();
  const pending=page.waitForEvent('download');await page.locator('#exportButton').click();const download=await pending;
  const reopened=core.importWorkspace((await core.readZip(fs.readFileSync(await download.path()))).map(e=>({name:e.name,text:core.zipEntryText(e)})));
  assert.deepEqual(reopened.manual.rules,initialRules);assert.deepEqual(reopened.manual.targets,initialTargets);assert.deepEqual(errors,[]);
  console.log('PASS: source-only dependency ZIP loads with full closure, failures stay visible in the passport and preserve the previous package; non-root roles work and root aliases are excluded from children. Manual rules/targets unchanged.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

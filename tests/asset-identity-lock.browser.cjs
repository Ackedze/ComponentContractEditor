const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../dist/core.cjs');
const {fixture,clone}=require('../../Apollo/packages/component-contract-core/tests/helpers/asset-identity-lock.cjs');

(async()=>{
 const f=fixture(core),expected=clone(f.manual.rules[0].constraints[0]);expected.dependency.portNames=['Icon-16','Icon-20','Icon-24'];f.manual.rules=[];
 const child=clone(f.manual);Object.assign(child.component,{componentId:'synthetic.button',contractId:'synthetic.button',familyId:'synthetic.button',family:'Button',componentKey:'button-set'});
 child.targets=[{id:'root',semanticRole:'root',label:'Button',pathHint:'Button',lineage:[],resolution:'resolved'}];
 child.representations[0].locator.componentKey='button-set';
 child.rules=[{id:'synthetic.button.opacity',targetId:'root',targetScope:'self',capability:'appearance.opacity',permission:'constrained',
  controlPaths:[],constraints:[{type:'propertyDomain',values:[1]}],applicability:{variants:'all',modes:'all',platforms:['desktop'],scopeStatus:'confirmed'},
  rationale:'Synthetic child API.',severity:'error',status:'reviewed',owner:'test-author',execution:{route:'auto'}}];
 const childShape=[{path:'',type:'ROOT'}],childHash=core.stableHash(childShape);
 const childEvidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:'d'.repeat(64),structures:{[childHash]:childShape},variants:[
  {componentKey:'button-variant',componentSetKey:'button-set',structureId:childHash,properties:{SingleIcon:'False'}},
  {componentKey:'button-single-variant',componentSetKey:'button-set',structureId:childHash,properties:{SingleIcon:'True'}}]};
 child.rules.push({...clone(child.rules[0]),id:'synthetic.button.icon-ports',capability:'composition.members',constraints:[{type:'dependencyDomain',values:['Synthetic icons'],dependency:{
  field:'catalog',subjects:[{targetRole:'root',relativePath:'Addon'}],portNames:['Icon-16','Icon-20','Icon-24'],baselinePolicy:'require-domain'}}]});
 const childCompiled=core.compileManualSource(child,childEvidence);assert.deepEqual(childCompiled.issues,[]);
 f.manual.componentDependencies=[{id:'button',componentId:'synthetic.button',revision:1,manualSourceHash:childCompiled.contract.package.manualSourceHash,
  compiledHash:core.stableHash(childCompiled.contract),bindings:Array.from({length:4},(_,i)=>({kind:'direct-child',id:'button-'+(i+1),targetRole:'button-'+(i+1),relativePath:'',ownerTargetRole:'root',ownerComponentKeys:['group-set'],representationIds:['desktop']}))}];
 const pins=clone(f.manual.componentDependencies),paths=core.snapshotPaths(f.snapshot);
 const anatomy=f.snapshot.nodes.map(n=>({id:n.id,parentId:n.parentId,childIds:n.childIds,name:n.name,type:n.type,visible:n.visible,order:n.order,
  depth:paths.get(n.id).split(' / ').length,path:['Group',paths.get(n.id)].filter(Boolean).join(' / '),semanticRole:n.id==='root'?'root':n.id.startsWith('button-')?n.id:'',properties:n,unknownFacts:[]}));
 const workspace={manual:f.manual,variantEvidence:f.evidence,dependencyContracts:[childCompiled.contract],anatomy,
  variants:[{id:'group-variant',componentKey:'group-variant',label:'Group',properties:{Size:'56',Overflow:'true'}}],hasVariantEvidence:true,tokens:[],warnings:[]};
 const session=core.createEditorSession(workspace,{workspaceMode:'authoring',validationProduct:'ab',scenarioProperties:{Size:'56',Overflow:'true'},activeModes:{}});
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.addEventListener('message',e=>{const m=e.data?.pluginMessage;if(m?.type==='save-session')window.__session=m.session;if(m?.type==='render-preview')window.__previewRequest=m.requestId;}));
  await page.goto('file://'+path.resolve(__dirname,'../dist/ui.html'));
  await page.evaluate(session=>window.postMessage({pluginMessage:{type:'session-restored',session}},'*'),session);
  await page.locator('#scenarioControls select[aria-label="Size"]').selectOption('56',{force:true});
  await page.waitForFunction(()=>window.__previewRequest);
  await page.evaluate(({anatomy,snapshot})=>window.postMessage({pluginMessage:{type:'preview-result',requestId:window.__previewRequest,anatomy,snapshot,
   imageDataUrl:'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221%22%20height%3D%221%22%2F%3E',width:1,height:1,warnings:[],variableModes:[]}},'*'),{anatomy,snapshot:f.snapshot});
  await page.locator('#anatomyTree .tree-item').first().click();await page.locator('#newRuleButton').click();
  await page.locator('#ruleIdInput').fill('synthetic.single-icon-icon-is-fixed');await page.locator('#capabilityInput').fill('composition.members');
  await page.locator('#constraintType').selectOption('dependencyDomain',{force:true});
  for(const s of expected.dependency.subjects)await page.locator('#dependencySubjectChoices input').filter({visible:true}).evaluateAll((nodes,value)=>{
   const input=nodes.find(n=>n.value===value);if(!input)throw new Error('Missing confirmed subject '+value);input.click();
  },JSON.stringify(s));
  await page.locator('#dependencyField').selectOption('changed',{force:true});
  assert.equal(await page.locator('#dependencyIdentityPorts input').count(),3);
  assert.equal(await page.locator('#dependencyIdentityPorts input:checked').count(),0);
  assert.match(await page.locator('#dependencyIdentityPorts').textContent(),/Icon-16 · закреплённый контракт synthetic.button/);
  assert.equal(await page.locator('#dependencyValues').isVisible(),false);assert.equal(await page.locator('#dependencyPorts').isVisible(),false);
  assert.equal(await page.locator('#dependencyCases').isVisible(),false);assert.equal(await page.locator('#dependencySubjects').isVisible(),false);
  for(const port of expected.dependency.portNames)await page.locator('#dependencyIdentityPorts input[value="'+port+'"]').check();
  await page.locator('#dependencySubjectConditionEnabled').check();await page.locator('#dependencySubjectConditionProperty').selectOption('SingleIcon');
  assert.equal(await page.locator('#dependencySubjectConditionValues input').count(),2);
  await page.locator('#dependencySubjectConditionValues input[value=\'"True"\']').check();
  await page.locator('#rationale').fill('SingleIcon preserves its exact library icon.');await page.locator('#ruleStatus').selectOption('reviewed',{force:true});
  await page.locator('#saveRuleButton').click();
  assert.equal(await page.locator('#ruleSelect option[value="synthetic.single-icon-icon-is-fixed"]').count(),1,await page.locator('#ruleSaveErrors').textContent());
  const saved=await page.evaluate(()=>window.__session.workspace);
  assert.deepEqual(saved.manual.rules[0].constraints[0],expected);assert.deepEqual(saved.manual.componentDependencies,pins);
  assert.equal(saved.manual.rules[0].applicability.variants,'all');
  await page.locator('#ruleSelect').selectOption('synthetic.single-icon-icon-is-fixed',{force:true});
  assert.equal(await page.locator('#dependencyIdentityPorts input[value="Icon-24"]').isChecked(),true);
  assert.equal(await page.locator('#dependencySubjectConditionValues input[value=\'"True"\']').isChecked(),true);
  await page.locator('#saveRuleButton').click();
  const pending=page.waitForEvent('download');await page.locator('#exportButton').click();const download=await pending;
  const imported=core.importWorkspace((await core.readZip(fs.readFileSync(await download.path()))).map(e=>({name:e.name,text:core.zipEntryText(e)})));
  assert.deepEqual(imported.manual.rules[0].constraints[0],expected);assert.deepEqual(imported.manual.componentDependencies,pins);
  assert.equal(imported.compiledInput.runtimePolicy.assetIdentityLockVersion,1);assert.equal(imported.compiledInput.runtimePolicy.instanceMainComponentAliasesVersion,1);
  assert.equal(imported.compiledInput.package.sourceExportVersion,'component-contract-editor@0.2.90');
  assert(imported.compiledInput.facts.dependencyBindings.every(b=>b.identityLock));
  await page.reload();await page.evaluate(session=>window.postMessage({pluginMessage:{type:'session-restored',session}},'*'),core.createEditorSession(imported,session.ui));
  await page.locator('#ruleSelect').selectOption('synthetic.single-icon-icon-is-fixed',{force:true});
  assert.equal(await page.locator('#dependencyIdentityPorts input[value="Icon-24"]').isChecked(),true);
  assert.match(await page.locator('#dependencyIdentityPorts').textContent(),/Icon-24 · закреплённый контракт synthetic.button/);
  await page.locator('#saveRuleButton').click();
  const offline=await page.evaluate(()=>window.__session.workspace.manual);
  assert.deepEqual(offline.rules[0].constraints[0],expected);assert.deepEqual(offline.componentDependencies,pins);assert.deepEqual(errors,[]);
  const missing=clone(imported);missing.dependencyContracts=[];
  await page.reload();await page.evaluate(session=>window.postMessage({pluginMessage:{type:'session-restored',session}},'*'),core.createEditorSession(missing,session.ui));
  await page.locator('#ruleSelect').selectOption('synthetic.single-icon-icon-is-fixed',{force:true});
  assert.equal(await page.locator('#dependencyIdentityPorts input:checked').count(),3);
  assert.match(await page.locator('#dependencyIdentityPorts').textContent(),/сохранённый порт, нет API текущего превью/);
  assert.deepEqual(errors,[]);
  console.log('PASS: all-size applicability, three pinned port choices without auto-selection, fixed identity constraint, edit/offline save, missing-pin saved choices and ZIP/pin preservation.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

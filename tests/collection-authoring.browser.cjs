const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {core,clone,scenario}=require('./helpers/direct-group');
const {fixture}=require('./helpers/property-options-fixture');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const f=fixture().f,rootRole=process.env.ROOT_ROLE || 'buttons-group';f.manual.targets[0].semanticRole=rootRole;
  f.manual.componentDependencies=[];const paths=core.snapshotPaths(f.snapshot);
  const anatomy=f.snapshot.nodes.map(n=>({id:n.id,parentId:n.parentId,childIds:n.childIds,name:n.name,type:n.type,visible:n.visible,order:n.order,depth:n.parentId===null?0:1,
   path:['Group',paths.get(n.id)].filter(Boolean).join(' / '),semanticRole:n.id==='root'?rootRole:'button-'+n.id.split('-').at(-1),properties:n,unknownFacts:[]}));
  const workspace={manual:f.manual,variantEvidence:f.evidence,anatomy,variants:[{id:'group-variant',componentKey:'group-variant',label:'Group',properties:{}}],hasVariantEvidence:true,tokens:[],warnings:[]};
  const session=core.createEditorSession(workspace,{workspaceMode:'authoring',validationProduct:'ab',scenarioProperties:{},activeModes:{}});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../dist/ui.html'));
  await page.evaluate(session=>window.postMessage({pluginMessage:{type:'session-restored',session}},'*'),session);
  await page.locator('#contractSettingsButton').click();
  await page.locator('#directDependencyFile').setInputFiles({name:'child.contract.compiled.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(f.childContract))});
  await page.waitForFunction(()=>document.querySelector('#directDependencyPinInfo').textContent.includes('Полный closure подтверждён'));
  await page.locator('#directDependencyMembers input[value="button-0"]').check();await page.locator('#directDependencyMembers input[value="button-1"]').check();
  await page.locator('#directDependencyRepresentations input[value="desktop"]').check();await page.locator('#addDirectDependencyButton').click();
  assert.match(await page.locator('#directDependenciesList').textContent(),/2 bindings/);await page.locator('#saveContractButton').click();
  async function rule(id,kind){
   await page.locator('#anatomyTree .tree-item').first().click();await page.locator('#newRuleButton').click();
   await page.locator('#ruleIdInput').fill('fixture.'+id);await page.locator('#capabilityInput').fill('composition.members');
   await page.locator('#constraintType').selectOption('memberCollection',{force:true});
   await page.locator('#collectionAssertion').selectOption(kind);await page.locator('#collectionFromDependency').selectOption('fixture-button');
   await page.locator('#rationale').fill('Synthetic collection authoring regression.');await page.locator('#ruleStatus').selectOption('reviewed',{force:true});
  }
  await rule('membership','membership');assert.match(await page.locator('#collectionSummary').textContent(),/включая скрытые/);await page.locator('#saveRuleButton').click();
  await rule('primary-last','position');await page.locator('#collectionPosition').selectOption('last');await page.locator('#collectionFilterEnabled').check();
  await page.locator('#collectionFilterProperty').selectOption('View');await page.locator('#collectionFilterValues input[value=\'"Primary"\']').check();
  assert.match(await page.locator('#collectionSummary').textContent(),/последние/);await page.locator('#saveRuleButton').click();
  await rule('scope-check','membership');await page.locator('#targetScope').selectOption('self-and-descendants',{force:true});
  await page.locator('#saveRuleButton').click();assert.equal(await page.locator('#targetScope').getAttribute('aria-invalid'),'true');
  assert.equal(await page.locator('#executionRoute').getAttribute('aria-invalid'),null);
  await page.locator('#targetScope').selectOption('self',{force:true});await page.locator('#saveRuleButton').click();
  assert.equal(await page.locator('#ruleSelect option[value="fixture.scope-check"]').count(),1,await page.locator('#ruleSaveErrors').textContent());
  await page.locator('#anatomyTree .tree-item').first().click();await page.locator('#newRuleButton').click();
  await page.locator('#ruleIdInput').fill('fixture.conditional-child');await page.locator('#capabilityInput').fill('composition.content');
  await page.locator('#constraintType').selectOption('dependencyDomain',{force:true});
  await page.locator('#dependencySubjectChoices input[value=\'{"targetRole":"button-0","relativePath":""}\']').check();
  await page.locator('#dependencyContractId').selectOption('fixture-button',{force:true});await page.locator('#dependencyField').selectOption('variantProperty',{force:true});
  await page.locator('#dependencyVariantProperty').selectOption('View');await page.locator('#dependencyVariantValues input[value=\'"Primary"\']').check();
  await page.locator('#dependencySubjectConditionEnabled').check();await page.locator('#dependencySubjectConditionProperty').selectOption('SingleIcon');await page.locator('#dependencySubjectConditionValues input[value=\'"True"\']').check();
  await page.locator('#rationale').fill('Synthetic conditional subject regression.');await page.locator('#ruleStatus').selectOption('reviewed',{force:true});await page.locator('#saveRuleButton').click();
  assert.equal(await page.locator('#ruleSelect option[value="fixture.conditional-child"]').count(),1,await page.locator('#ruleSaveErrors').textContent());
  const pending=page.waitForEvent('download');await page.locator('#exportButton').click();const download=await pending;
  const files=(await core.readZip(fs.readFileSync(await download.path()))).map(e=>({name:e.name,text:core.zipEntryText(e)}));const reopened=core.importWorkspace(files);
  assert.equal(reopened.manual.componentDependencies.length,1);assert.equal(reopened.manual.componentDependencies[0].bindings.length,2);
  assert.deepEqual(reopened.dependencyContracts,[clone(f.childContract)]);
  const membership=reopened.manual.rules.find(r=>r.id==='fixture.membership').constraints[0].collection;
  assert.equal(membership.assertion.kind,'membership');assert.equal(membership.visibleOnly,false);assert.deepEqual(membership.memberTargetRoles,['button-0','button-1']);
  assert.equal(membership.ownerTargetRole,rootRole);assert.equal(reopened.manual.targets[0].semanticRole,rootRole);
  const position=reopened.manual.rules.find(r=>r.id==='fixture.primary-last').constraints[0].collection;
  assert.deepEqual(position.filter,{property:'View',propertyType:'VARIANT',values:['Primary']});assert.equal(position.assertion.position,'last');
  const conditional=reopened.manual.rules.find(r=>r.id==='fixture.conditional-child').constraints[0].dependency;
  assert.deepEqual(conditional.subjects,[{targetRole:'button-0',relativePath:''}]);assert.deepEqual(conditional.subjectCondition,{property:'SingleIcon',propertyType:'VARIANT',values:['True']});
  assert.equal(reopened.compiledInput.runtimePolicy.memberCollectionsVersion,1);assert.deepEqual(errors,[]);
  await page.reload();await page.evaluate(session=>window.postMessage({pluginMessage:{type:'session-restored',session}},'*'),core.createEditorSession(reopened,session.ui));
  await page.locator('#contractSettingsButton').click();assert.match(await page.locator('#directDependenciesList').textContent(),/2 bindings/);
  console.log(`PASS: root role ${rootRole}, typed direct pin + two bindings, membership/filtered position, correct scope error field, ZIP/session round-trip.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

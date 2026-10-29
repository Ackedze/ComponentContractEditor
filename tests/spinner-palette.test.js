const test=require('node:test'),assert=require('node:assert/strict');
const {paletteScenario,expected,ruleId,manual,core,clone}=require('./helpers/button-spinner-palette');
const own=r=>r.engine.evaluations.filter(e=>e.ruleId.startsWith(ruleId+'.'));

test('manual declares one existing RuleID, two dependency mappings, all sizes, both slots and both proven surfaces',()=>{
 const r=manual.rules.find(r=>r.id===ruleId);
 assert.equal(r.status,'reviewed');assert.equal(r.execution.route,'predicate');assert.equal(r.targetId,'target.root');
 assert.equal(r.applicability.context,undefined);assert.equal(r.applicability.variants,'all');
 assert.ok(r.constraints.every(c=>new Set(c.dependency.cases.map(x=>x.context['semanticApi.colors'])).size===2));
 assert.deepEqual(r.constraints.map(c=>c.dependency.property),['Inverted','Static']);
 assert.ok(r.constraints.every(c=>c.dependency.subjects.length===2&&c.dependency.contractDependencyId==='spinner'));
});

test('all six Views × six sizes × both sides × both platforms: correct palette passes, each wrong property fails independently',()=>{
 for(const view of ['Accent','Primary','Secondary','Outlined','Transparent','Text'])
 for(const size of [32,40,48,56,64,72])for(const side of ['left','right'])for(const platform of ['desktop','mobile-web'])for(const surface of ['default','inverted']){
  const f=paletteScenario({view,size,side,platform,surface}),label=`${view}/${size}/${side}/${platform}/${surface}`,r=f.run();
  assert.deepEqual(r.compiled.issues.filter(i=>i.level==='error'),[],label);
  assert.deepEqual(own(r).map(e=>e.classification),['compliant','compliant'],label);
  for(const [index,property] of ['Inverted','Static'].entries()){
   f.setValues({...expected(view,surface),[property]:expected(view,surface)[property]==='True'?'False':'True'});
   const bad=f.run(),evaluations=own(bad);
   assert.equal(evaluations[index].classification,'violation',`${label}/${property}`);
   assert.equal(evaluations[1-index].classification,'compliant',label);
   const detail=core.buildEvaluationDetails(bad.report,bad.contract,[]).find(d=>d.id===evaluations[index].evaluationId);
   assert.equal(detail.actual,expected(view,surface)[property]==='True'?'False':'True');
   assert.deepEqual(detail.expected,[expected(view,surface)[property]]);
  }
 }
});

test('Button_Inverted is included by proven representation, never by a name or guessed default',()=>{
 for(const platform of ['desktop','mobile-web']){
  const f=paletteScenario({platform,surface:'inverted'});
  assert.deepEqual(own(f.run()).map(e=>e.classification),['compliant','compliant']);
  f.root.name='[D] Button';assert.ok(own(f.run()).every(e=>e.classification==='compliant'));
 }
});

test('missing/unknown View, child VARIANT, surface, identity and lineage never pass palette checks',()=>{
 for(const mutate of [
  f=>{delete f.root.component.properties.View;},
  f=>{f.root.component.properties.View='FutureView';},
  f=>{f.root.unknownFacts.push('component.properties.View');},
  f=>{delete f.root.component.identity;},
  f=>{f.root.component.identity.componentSetKey='foreign';},
  f=>{f.root.unknownFacts.push('component.identity');},
  f=>{f.manual.representations.push({...clone(f.manual.representations[0]),id:'ambiguous'});},
  f=>{delete f.snapshot.variantReference;},
  f=>{f.owner.component.identity.componentSetKey='foreign';},
  f=>{f.child.nodes[0].component.identity.componentSetKey='foreign';f.syncActual();},
  f=>{delete f.child.nodes[0].component.properties.Inverted;delete f.child.nodes[0].component.properties.Static;f.syncActual();},
  f=>{f.child.nodes[0].component.propertyTypes.Inverted='BOOLEAN';f.child.nodes[0].component.propertyTypes.Static='BOOLEAN';f.syncActual();},
  f=>{f.child.nodes[0].component.properties.Inverted=true;f.child.nodes[0].component.properties.Static=true;f.syncActual();},
  f=>{f.child.nodes[0].unknownFacts.push('component.propertyTypes');f.syncActual();},
 ]){
  const f=paletteScenario();mutate(f);const r=f.run();
  assert.ok(own(r).every(e=>['human-review','not-evaluable','not-executed'].includes(e.classification)),JSON.stringify(own(r)));
  assert.equal(r.report.scenarioCoverage.complete,false);
 }
});

test('hidden Addon and actual non-Spinner Type do not execute a palette constraint',()=>{
 const hidden=paletteScenario();hidden.target.visible=false;
 assert.ok(own(hidden.run()).every(e=>e.classification==='not-applicable'));
 const icon=paletteScenario();icon.owner.component.properties.Type='Icon-24';
 icon.snapshot.variantReference.nodeProperties['LeftAddon / LeftAddon'].properties.Type='Icon-24';
 assert.ok(own(icon.run()).every(e=>e.classification==='not-applicable'));
});

test('surface binding is opt-in; invalid metadata is rejected and legacy transforms stay unknown',()=>{
 const f=paletteScenario(),colors=f.manual.semanticApi.find(p=>p.id==='colors');
 colors.bindings.forEach(b=>{if(b.path==='representation.surface')b.transform='default';});
 assert.ok(own(f.run()).every(e=>e.classification==='human-review'));
 const g=paletteScenario();g.manual.representations[0].surface='undeclared';
 assert.ok(g.run().compiled.issues.some(i=>i.code==='SEMANTIC_REPRESENTATION_SURFACE'));
});

test('identity-proven surface is available as a normal semantic property constraint, without a Figma control consumer',()=>{
 const f=paletteScenario();f.manual.rules[0].constraints=[{type:'propertyDomain',values:['default']}];
 f.manual.rules[0].capability='semanticApi.colors';f.manual.rules[0].applicability.context={};
 assert.equal(own(f.run())[0].classification,'compliant');
 f.manual.rules[0].constraints[0].values=['inverted'];assert.equal(own(f.run())[0].classification,'violation');
 delete f.root.component.identity;assert.equal(own(f.run())[0].classification,'human-review');
});

test('same child revision remains pinned; compiled policy, session, export and report replay preserve both tables',()=>{
 const f=paletteScenario(),r=f.run();
 const imported=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)},
  {name:'compiled/component-contract.v2.json',text:JSON.stringify(r.compiled.contract)}]);
 const session=core.parseEditorSession(core.createEditorSession(imported,{workspaceMode:'validation',validationProduct:'ab',scenarioProperties:{},activeModes:{}}));
 assert.deepEqual(session.workspace.manual.rules[0].constraints,f.manual.rules[0].constraints);
 assert.deepEqual(core.buildExportBundle(session.workspace.manual,f.evidence,session.workspace.dependencyContracts).compiled,r.compiled.contract);
 assert.equal(r.compiled.contract.componentDependencies[0].revision,8);
 assert.deepEqual(r.compiled.contract.componentDependencies[0].contract,f.childContract);
 assert.deepEqual(core.evaluateCompiledContract(core.prepareValidationSnapshot(f.snapshot,r.contract),r.contract),r.engine);
});

const test=require('node:test'),assert=require('node:assert/strict');
const {scenario,clone,core,childContract}=require('./helpers/button-spinner');
const dep=out=>out.engine.evaluations.filter(e=>e.dependency);

test('fixed nested Button → pinned Spinner executes child rules without copying rule ownership',()=>{
  const f=scenario(),r=f.run();assert.deepEqual(r.compiled.issues.filter(i=>i.level==='error'),[]);
  assert.equal(r.engine.dependencyRuns[0].status,'executed',JSON.stringify(r.engine.dependencyRuns));
  assert.ok(dep(r).length>0);assert.equal(dep(r).filter(e=>e.classification==='violation').length,0);
  assert.ok(dep(r).every(e=>e.ruleId.includes('spinner')));
  assert.equal(r.compiled.contract.rules.length,1);assert.equal(r.report.scenarioCoverage.complete,true);
  assert.deepEqual(r.compiled.contract.componentDependencies[0].contract,childContract);
});

test('parent size matrix and child intrinsic Scale checks remain independent, both sides and 32–72',()=>{
  for(const size of [32,40,48,56,64,72])for(const side of ['left','right']){
    const f=scenario({size,side}),r=f.run();
    assert.equal(r.engine.evaluations[0].classification,'compliant',`${size}/${side}`);
    assert.equal(r.engine.dependencyRuns[0].status,'executed');
    f.child.nodes[0].bounds.width+=2;f.syncActual();
    const scaled=f.run();assert.equal(scaled.engine.evaluations[0].classification,'compliant');
    assert.ok(dep(scaled).some(e=>e.classification==='violation'&&e.ruleId.includes('intrinsic-size')));
    const wrong=scenario({size,side,spinnerSize:size<=40?24:16}).run();
    assert.equal(wrong.engine.evaluations[0].classification,'violation');
    assert.equal(dep(wrong).filter(e=>e.classification==='violation').length,0);
  }
});

test('nested Spinner visual override is evaluated under its own original RuleID and focuses the real child node',()=>{
  const f=scenario();f.child.nodes[0].appearance.opacity=.5;f.syncActual();const r=f.run();
  const failures=dep(r).filter(e=>e.classification==='violation');assert.ok(failures.length);
  assert.ok(failures.every(e=>e.subjectNodeId===f.nodeMap[f.child.selection[0]]));
  const details=core.buildEvaluationDetails(r.report,r.contract,[]).filter(e=>e.classification==='violation');
  assert.ok(details.every(e=>e.ruleTitle!==e.ruleId));
});

test('normal icon and hidden Addon exclude Spinner execution; unknown topology never passes',()=>{
  const f=scenario();f.target.visible=false;
  assert.equal(f.run().engine.dependencyRuns[0].status,'not-applicable');
  f.target.visible=true;f.owner.component.properties.Type='Icon-20';
  f.snapshot.variantReference.nodeProperties['LeftAddon / LeftAddon'].properties.Type='Icon-20';
  assert.equal(f.run().engine.dependencyRuns[0].status,'not-applicable');
  delete f.snapshot.variantReference;
  assert.equal(f.run().report.scenarioCoverage.complete,false);
});

test('missing, wrong-hash and duplicate versions are explicit not-executed gaps; cycles rejected',()=>{
  const f=scenario();for(const inputs of [[],[clone(childContract),clone(childContract)], [{...clone(childContract),status:'draft'}]]){
    const r=f.run(inputs);assert.ok(r.compiled.issues.some(i=>i.code==='COMPONENT_DEPENDENCY_LINK'));
    assert.equal(r.engine.dependencyRuns[0].status,'not-executed');assert.equal(r.report.scenarioCoverage.complete,false);
  }
  f.manual.componentDependencies[0].componentId=f.manual.component.componentId;
  assert.ok(f.run().compiled.issues.some(i=>i.code==='COMPONENT_DEPENDENCY'));
});

test('same-name wrong wrapper, missing child, duplicate capture, stale actual and missing reference fail closed',()=>{
  for(const mutate of [
    f=>{f.owner.component.identity.componentSetKey='foreign';},
    f=>{f.snapshot.componentDependencyCaptures=[];},
    f=>{f.snapshot.componentDependencyCaptures.push(clone(f.snapshot.componentDependencyCaptures[0]));},
    f=>{f.child.nodes[0].appearance.opacity=.5;},
    f=>{delete f.child.variantReference;},
    f=>{delete f.snapshot.nodes.find(n=>n.id===f.nodeMap[f.child.selection[0]]).resolvedModes;},
  ]){
    const f=scenario();mutate(f);const r=f.run();assert.equal(r.engine.dependencyRuns[0].status,'not-executed');assert.equal(r.report.scenarioCoverage.complete,false);
  }
});

test('ZIP import, authoring session, export and report replay retain dependency pin and immutable child contract',()=>{
  const f=scenario(),r=f.run();
  const workspace=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)},{name:'compiled/component-contract.v2.json',text:JSON.stringify(r.compiled.contract)}]);
  assert.deepEqual(workspace.dependencyContracts,[childContract]);
  const session=core.parseEditorSession(core.createEditorSession(workspace,{workspaceMode:'validation',validationProduct:'alfa-business',scenarioProperties:{},activeModes:{}}));
  assert.deepEqual(session.workspace.dependencyContracts,[childContract]);
  assert.deepEqual(core.buildExportBundle(session.workspace.manual,f.evidence,session.workspace.dependencyContracts).compiled,r.compiled.contract);
  const prepared=core.prepareValidationSnapshot(f.snapshot,r.contract);
  assert.deepEqual(core.evaluateCompiledContract(prepared,r.contract),r.engine);
  assert.deepEqual(core.prepareValidationSnapshot(prepared,r.contract),prepared);
});

test('downloaded validation JSON includes pinned child contract, capture, verdicts and exact replay',()=>{
  const f=scenario();f.child.nodes[0].appearance.opacity=.5;f.syncActual();const r=f.run();
  const download=core.buildValidationReportDownload({manual:f.manual,compiled:r.compiled,evaluatedContract:r.contract,engineResult:r.engine,result:r.report,snapshot:f.snapshot,anatomy:[],
    capture:{kind:'selected-instance',requestId:'dependency-test',warnings:[],matchedBaselineNodes:f.snapshot.nodes.length,unmatchedBaselineNodeIds:[]},trigger:'selected-instance',generatedAt:'2026-09-27T13:00:00.000Z'});
  const report=JSON.parse(download.json);
  assert.deepEqual(report.sources.compiledContract.componentDependencies[0].contract,childContract);
  assert.equal(report.snapshot.componentDependencyCaptures.length,1);
  assert.deepEqual(core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract),report.results.engine);
  assert.deepEqual(core.buildEditorValidationReport(report.results.engine,r.compiled,f.manual,report.snapshot),report.results.editor);
  assert.ok(report.results.engine.evaluations.some(e=>e.dependency&&e.classification==='violation'));
});

test('tampered dependency at runtime and malformed imported contract fail closed',()=>{
  const f=scenario(),r=f.run();r.contract.componentDependencies[0].contract.rules[0].severity='tampered';
  const result=core.evaluateCompiledContract(f.snapshot,r.contract);
  assert.equal(result.dependencyRuns[0].reason,'dependency-pin-mismatch');
  const malformed=clone(childContract);delete malformed.rules;
  const bad=f.run([malformed]);assert.ok(bad.compiled.issues.some(i=>i.message==='dependency-contract-malformed'));
  assert.equal(bad.report.scenarioCoverage.complete,false);
});

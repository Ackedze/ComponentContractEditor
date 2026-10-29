const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../dist/core.cjs');
const {reports,clone,evaluate,capture}=require('./helpers/spinner-geometry');
const sizeChecks=result=>result.engine.evaluations.filter(e=>e.ruleId.includes('intrinsic-size-required'));

test('four original live reports replay exactly, including their known legacy coverage gap',()=>{
  for(const r of reports){const before=JSON.stringify(r),engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
    assert.deepEqual(engine,r.results.engine);
    const compiled={contract:r.sources.compiledContract,issues:r.sources.compilerIssues};
    assert.deepEqual(core.buildEditorValidationReport(engine,compiled,r.sources.manual,r.snapshot),r.results.editor);
    assert.deepEqual(clone(core.buildEvaluationDetails(r.results.editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
    assert.equal(JSON.stringify(r),before);
  }
});

for(const [index,r] of reports.entries())test(`independent materialization checks original Spinner case ${index+1} without losing prior violations`,()=>{
  const before=JSON.stringify(r),reference=r.snapshot.instanceContentReferences.base;
  assert.notEqual(reference.source.rootNodeId,r.snapshot.source.rootNodeId);
  const materialized=core.materializeEffectiveBaseline(r.snapshot,reference);
  const result=evaluate(materialized.snapshot,r.sources.manual);
  assert.equal(materialized.matchedNodes,6);
  assert.deepEqual(materialized.snapshot.nodes[0].baseline.effective.bounds,{width:48,height:48});
  assert.equal(sizeChecks(result).filter(e=>e.classification==='violation').length,[0,0,1,2][index]);
  assert.deepEqual(result.engine.evaluations.filter(e=>e.classification==='violation'&&!e.ruleId.includes('intrinsic-size')).map(e=>[e.ruleId,e.subjectNodeId]),
    r.results.engine.evaluations.filter(e=>e.classification==='violation').map(e=>[e.ruleId,e.subjectNodeId]));
  assert.equal(result.report.scenarioCoverage.complete,false); // Historical gradient geometry was not captured.
  assert.ok(result.report.evaluations.some(e=>e.evidenceIssues?.some(p=>p.includes('gradientTransform'))));
  assert.equal(result.report.contractReadiness.status,'draft');assert.equal(JSON.stringify(r),before);
});

test('missing baseline dimensions stay unknown with specific fact paths, not missing target or invented zero',()=>{
  const result=evaluate(reports[3].snapshot),checks=sizeChecks(result);
  assert.equal(checks.length,2);assert.ok(checks.every(e=>e.classification==='human-review'));
  assert.equal(result.report.scenarioCoverage.complete,false);
  const details=core.buildEvaluationDetails(result.report,result.contract,reports[3].anatomy).filter(e=>e.ruleId.includes('intrinsic-size'));
  assert.ok(details.every(d=>/Нет размера независимого эталона: baseline.effective.bounds\./.test(d.reasonLabel)));
  assert.ok(details.every(d=>!d.reasonLabel.includes('слой не найден')));
});

test('dimensions preserve zero but reject invalid or absent values and never include canvas x/y',()=>{
  assert.deepEqual(core.intrinsicBounds({width:0,height:48,x:100,y:200}),{width:0,height:48});
  for(const width of [undefined,null,NaN,Infinity,-1,'48'])assert.deepEqual(core.intrinsicBounds({width,height:48}),{height:48});
  const a=clone(reports[3].snapshot),ref=clone(a.instanceContentReferences.base);delete ref.nodes[0].bounds.width;
  const next=core.materializeEffectiveBaseline(a,ref).snapshot;
  assert.equal(next.nodes[0].bounds.width,80);assert.equal(next.nodes[0].baseline.effective.bounds.width,undefined);
  const checks=sizeChecks(evaluate(next));assert.deepEqual(checks.map(e=>e.classification),['human-review','violation']);
});

for(const [index,r] of reports.entries())test(`real plugin controller captures independent geometry and cleans up case ${index+1}`,async()=>{
  const {output,actual,created,pages}=await capture(r),s=output.snapshot;
  assert.equal(s.source.geometryCaptureVersion,1);assert.equal(output.matchedBaselineNodes,6);
  assert.deepEqual(s.nodes[0].baseline.effective.bounds,{width:48,height:48});
  assert.equal(actual.width,[48,48,300,80][index]);assert.equal(actual.height,[48,48,48,80][index]);
  assert.ok(created.every(n=>n.removed));assert.ok(pages.every(n=>n.removed));assert.equal(actual.removed,undefined);
  const result=evaluate(s,r.sources.manual);
  assert.equal(sizeChecks(result).filter(e=>e.classification==='violation').length,[0,0,1,2][index]);
  assert.equal(result.report.scenarioCoverage.complete,false); // Simulation retains missing gradient data from the old report.
  assert.ok(result.report.evaluations.some(e=>e.evidenceIssues?.some(p=>p.includes('gradientTransform'))));
  const text=core.buildValidationReportDownload({manual:r.sources.manual,compiled:result.compiled,evaluatedContract:result.contract,snapshot:s,anatomy:output.anatomy,
    engineResult:result.engine,result:result.report,capture:null,trigger:'selected-instance'}).json;
  const exported=JSON.parse(text);assert.equal(exported.editorVersion,'component-contract-editor@'+require('../package.json').version);
  assert.deepEqual(core.evaluateCompiledContract(exported.snapshot,exported.runtime.evaluatedContract),exported.results.engine);
  assert.deepEqual(exported.sources.manual,r.sources.manual);
});

test('real plugin preview includes intrinsic reference sizes; selected-instance missing width never becomes zero',async()=>{
  const preview=await capture(reports[0],{preview:true});
  assert.deepEqual(preview.output.snapshot.nodes[0].baseline.effective.bounds,{width:48,height:48});
  assert.equal(sizeChecks(evaluate(preview.output.snapshot)).filter(e=>e.classification==='violation').length,0);
  const missing=await capture(reports[3],{missingReferenceWidth:true});
  assert.deepEqual(missing.output.snapshot.nodes[0].baseline.effective.bounds,{height:48});
  const result=evaluate(missing.output.snapshot);assert.equal(result.report.scenarioCoverage.complete,false);
  assert.deepEqual(sizeChecks(result).map(e=>e.classification),['human-review','violation']);
});

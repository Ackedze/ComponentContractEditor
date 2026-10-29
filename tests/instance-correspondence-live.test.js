const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../dist/core.cjs');
const root=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Button');
const review=require(path.join(root,'qa/sizing-probes-live-review.2026-09-28.json'));
const clone=x=>JSON.parse(JSON.stringify(x));
const read=i=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,review.reportResults[i].fixtureFile))));
const records=review.reportResults.map((_,i)=>read(i));

function model(index=3,rename=['preview:2','preview:3']){
  const r=clone(records[index]),s=r.snapshot;
  // Synthetic new-capture model assembled from complete independent captures.
  // The failed historical reports themselves cannot supply missing references.
  const opt=s=>{s.source.instanceIdentityVersion=1;for(const c of s.componentDependencyCaptures||[])if(c.snapshot)opt(c.snapshot);
    if(s.instanceContentReferences){opt(s.instanceContentReferences.base);for(const a of s.instanceContentReferences.attempts)if(a.reference)opt(a.reference);}};
  opt(s);
  for(const id of rename)s.nodes.find(n=>n.id===id).name=id==='preview:2'?'🔩 Addon':'Custom spinner';
  const byId=new Map(s.nodes.map(n=>[n.id,n]));
  for(const n of s.nodes){let current=n,names=[];while(current){names.unshift(current.name);current=byId.get(current.parentId);}n.semantic.path=names.join(' / ');}
  r.snapshot=core.materializeEffectiveBaseline(s,s.instanceContentReferences.base,true).snapshot;
  return r;
}
function run(r){const e=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  const p=core.prepareValidationSnapshot(r.snapshot,r.runtime.evaluatedContract);
  const editor=core.buildEditorValidationReport(e,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot);
  return {e,p,editor,violations:e.evaluations.filter(e=>e.classification==='violation')};}

test('all six original 0.2.43 reports replay exactly, including the three failed captures',()=>{
  for(const r of records){const{e,editor}=run(r);assert.deepEqual(clone(e),r.results.engine);assert.deepEqual(clone(editor),r.results.editor);
    assert.deepEqual(clone(core.buildEvaluationDetails(editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);}
});
test('synthetic recovery of the three blocked captures preserves their actual names, ids and values',()=>{
  for(const index of[0,1,2]){
    const r=clone(records[index]),s=r.snapshot,actual=clone(s.nodes.map(n=>({name:n.name,layout:n.layout,component:n.component})));
    s.source.instanceIdentityVersion=1;
    // Supply independently captured reference stages from the later complete
    // same-variant probe. Missing evidence is never manufactured from actual.
    s.instanceContentReferences.attempts=clone(records[3].snapshot.instanceContentReferences.attempts);
    r.snapshot=core.materializeEffectiveBaseline(s,s.instanceContentReferences.base,true).snapshot;
    const result=run(r);assert.equal(result.editor.scenarioCoverage.inconclusive,0);
    assert.deepEqual(result.violations,[]);assert.equal(result.e.evaluations.filter(e=>e.dependency).length,168);
    assert.equal(result.p.nodes.filter(n=>n.baselineProvenance?.status==='matched').length,18);
    assert.deepEqual(result.p.nodes.map(n=>({name:n.name,layout:n.layout,component:n.component})),actual);
  }
});
for(const width of['HUG','FILL','FIXED'])test(`synthetic renamed Addon+Spinner: width ${width}, child contract executes without sizing false positives`,()=>{
  const r=model();r.snapshot.nodes[0].layout.sizingHorizontal=width;r.snapshot.nodes[0].layout.sizingVertical='HUG';
  const before=clone(r.snapshot),{e,p,editor,violations}=run(r);
  assert.deepEqual(violations,[]);assert.equal(editor.scenarioCoverage.inconclusive,0);
  assert.equal(editor.scenarioCoverage.notExecuted,7);
  assert.equal(p.nodes.filter(n=>n.baselineProvenance?.status==='matched').length,18);
  assert.equal(e.dependencyRuns.filter(d=>d.status==='executed').length,1);
  assert.equal(e.evaluations.filter(e=>e.dependency).length,168);
  assert.deepEqual(r.snapshot,before);assert.equal(p.nodes[2].name,'🔩 Addon');
  assert.deepEqual(core.prepareValidationSnapshot(p,r.runtime.evaluatedContract),p);
});
for(const i of[3,4,5])test(`synthetic renamed instances preserve the negative probe ${i}`,()=>{
  const r=model(i),result=run(r),expected=records[i].results.engine.evaluations.filter(e=>e.classification==='violation');
  assert.deepEqual(result.violations.map(e=>[e.ruleId,e.subjectNodeId,e.trace]),expected.map(e=>[e.ruleId,e.subjectNodeId,e.trace]));
  assert.equal(result.editor.scenarioCoverage.inconclusive,0);
});
test('renamed Spinner opacity override remains visible to the pinned child contract',()=>{
  const r=model(),s=r.snapshot;s.nodes[0].layout.sizingVertical='HUG';s.nodes[3].appearance.opacity=0.5;
  const child=s.componentDependencyCaptures.find(c=>c.nodeId==='preview:3');child.snapshot.nodes[0].appearance.opacity=0.5;
  const result=run(r);assert.equal(result.editor.scenarioCoverage.inconclusive,0);
  assert.ok(result.violations.some(e=>e.dependency&&e.trace.factPaths.includes('appearance.opacity')));
});
test('tampered independent evidence cannot be admitted just because instance keys are known',()=>{
  const r=model();r.snapshot.instanceContentReferences.attempts[0].reference.nodes[0].appearance.opacity=0.1;
  const result=run(r);assert.ok(result.p.instanceContentResults.some(x=>x.reason==='host-context-changed'));
  assert.equal(result.editor.scenarioCoverage.complete,false);
});
test('new-capture JSON download keeps correspondence opt-in, observed names and exact engine/editor replay',()=>{
  const r=model();r.snapshot.nodes[0].layout.sizingVertical='HUG';
  const result=run(r),compiled={contract:r.sources.compiledContract,issues:r.sources.compilerIssues};
  const exportResult=core.buildValidationReportDownload({manual:r.sources.manual,compiled,evaluatedContract:r.runtime.evaluatedContract,
    snapshot:r.snapshot,anatomy:r.anatomy,engineResult:result.e,result:result.editor,capture:null,trigger:'selected-instance'});
  const download=JSON.parse(exportResult.json);
  assert.equal(download.snapshot.source.instanceIdentityVersion,1);
  assert.equal(download.snapshot.nodes[2].name,'🔩 Addon');assert.equal(download.snapshot.nodes[3].name,'Custom spinner');
  assert.deepEqual(clone(core.evaluateCompiledContract(download.snapshot,download.runtime.evaluatedContract)),download.results.engine);
  assert.deepEqual(clone(core.buildEditorValidationReport(download.results.engine,compiled,download.sources.manual,download.snapshot)),download.results.editor);
  assert.equal(core.stableHash(download.sources.manual),r.run.manualSourceHash);
});
test('new identity capture preserves all six paired Loading-width outcomes',()=>{
  const manifest=require(path.join(root,'qa/root-sizing-live-review.2026-09-28.json'));
  for(const item of manifest.reportResults){
    const r=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))));
    const opt=s=>{s.source.instanceIdentityVersion=1;if(s.transitionBefore)opt(s.transitionBefore);
      for(const c of s.componentDependencyCaptures||[])if(c.snapshot)opt(c.snapshot);
      if(s.instanceContentReferences){opt(s.instanceContentReferences.base);for(const a of s.instanceContentReferences.attempts)if(a.reference)opt(a.reference);}};
    opt(r.snapshot);
    const result=run(r),id='component:web-core.button.loading-preserves-width';
    const width=result.editor.evaluations.find(e=>e.ruleId===id||e.ruleId===id+'.1.1');
    assert.equal(width.classification,item.widthExpected,item.caseId);
    assert.equal(result.violations.length,item.expectedViolationCount,item.caseId);
    assert.equal(result.editor.scenarioCoverage.inconclusive,0,item.caseId);
  }
});

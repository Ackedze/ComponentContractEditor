const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../dist/core.cjs');
const repo=path.resolve(__dirname,'../../../shared/design-system_ab'),root=path.join(repo,'experiments/web-corp/AmountStyles/authoring');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,'../history/r3-editor-0.2.60',p))),compiled=read('compiled/component-contract.v2.json'),manual=read('contract.manual.json');
const runtime=core.prepareAuthoringPreviewContract(compiled),clone=x=>JSON.parse(JSON.stringify(x));
function fixture(time='18-22-00-287') {return JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,`reports/fixtures/r2-editor-0.2.59/amount-styles.validation-report.2026-09-29T${time}Z.json.gz`))));}
const run=s=>core.evaluateCompiledContract(s,runtime),order=e=>e.evaluations.find(x=>x.ruleId.includes('fixed-part-order')&&!x.dependency);
test('all 31 live captures preserve other violations and all 87 binding expectations',()=>{
  const review=require(path.join(repo,'scripts/review_amount_styles_r3')).review();
  assert.deepEqual(review.counts,{reports:31,matchedCases:29,bindingAssertions:87});
});
test('Operation on and off keep structural order; raw evidence and replay are stable',()=>{
  for(const time of ['18-17-45-236','18-22-00-287']) {
    const r=fixture(time),before=JSON.stringify(r.snapshot),out=run(r.snapshot),p=core.prepareValidationSnapshot(r.snapshot,runtime);
    assert.equal(order(out).classification,'compliant');
    assert.deepEqual(p.nodes[0].structuralOrderV1.directChildRoles,['operation','amount']);
    assert.deepEqual(core.prepareValidationSnapshot(p,runtime),p);
    assert.deepEqual(run(p),out);assert.equal(JSON.stringify(r.snapshot),before);
  }
});
test('reordered children remain a violation, including hidden Operation',()=>{
  const s=fixture().snapshot;s.nodes[0].childIds.reverse();
  assert.equal(order(run(s)).classification,'violation');
});
test('uncaptured child, duplicate child, unknown list and truncated capture cannot pass',()=>{
  for(const mutate of [s=>s.nodes[0].childIds.push('uncaptured'),s=>s.nodes[0].childIds.push(s.nodes[0].childIds[0]),
    s=>s.nodes[0].unknownFacts.push('childIds'),s=>{s.source.truncated=true;}]) {
    const s=fixture().snapshot;mutate(s);assert.equal(order(run(s)).classification,'human-review');
  }
});
test('cached derived structural order cannot conceal reordering',()=>{
  const s=fixture().snapshot;s.nodes[0].childIds.reverse();s.nodes[0].structuralOrderV1={directChildRoles:['operation','amount']};
  assert.equal(order(run(s)).classification,'violation');
});
test('old compiled contracts retain visible-order interpretation',()=>{
  const r=fixture(),out=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  assert.equal(order(out).classification,'violation');
  assert.equal(out.dependencyRuns[0].status,'incomplete');
  assert.equal(core.prepareValidationSnapshot(r.snapshot,r.runtime.evaluatedContract).nodes[0].structuralOrderV1,undefined);
});
test('orderScope survives authoring compilation and invalid scopes are rejected',()=>{
  const m=clone(manual),r=m.rules.find(r=>r.id.endsWith('fixed-part-order'));
  r.constraints[0].orderScope='unknown';
  assert(core.validateRuleEdit(m,r,r.id).some(i=>i.code==='CONSTRAINT_ORDER_SCOPE'));
  r.constraints[0].orderScope='structural';
  assert.equal(core.validateRuleEdit(m,r,r.id).length,0);
  assert.equal(runtime.runtimePolicy.structuralOrderFactsVersion,1);
});
test('hidden optional Addon does not make otherwise resolved child incomplete',()=>{
  const out=run(fixture().snapshot);assert.equal(out.dependencyRuns[0].status,'executed');
  assert(out.evaluations.some(e=>e.dependency&&e.classification==='not-applicable'&&e.trace?.reason==='selector matched no visible nodes'));
});
test('missing nested capture remains not-executed',()=>{
  const s=fixture().snapshot;s.componentDependencyCaptures=[];
  assert.equal(run(s).dependencyRuns[0].status,'not-executed');
});
test('Opacity=True and 60% remain forbidden for both parts; actual detach is retained',()=>{
  const out=run(fixture('18-26-22-115').snapshot),failures=out.evaluations.filter(e=>e.classification==='violation');
  assert.equal(failures.filter(e=>e.ruleId.includes('.opacity-')).length,4);
  assert(failures.some(e=>e.ruleId.includes('major-text-style-binding-required')));
  assert.equal(order(out).classification,'compliant');
  const editor=core.buildEditorValidationReport(out,{contract:compiled,issues:[]},manual,fixture('18-26-22-115').snapshot);
  assert.equal(editor.scenarioCoverage.complete,false);
});

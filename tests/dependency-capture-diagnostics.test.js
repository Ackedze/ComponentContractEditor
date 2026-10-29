const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {runNativeOccurrenceCapture}=require('../../Apollo/packages/component-contract-core/tests/helpers/native-occurrence-capture.cjs');
const {scenario,clone,core}=require('./helpers/direct-group');
const semanticEngine=value=>{const result=clone(value);delete result.snapshotHash;result.evaluations.forEach(e=>delete e.evaluationId);return result;};
const invoke=async(figma,actual,request)=>{
 const messages=[];figma.showUI=()=>{};figma.on=()=>{};figma.ui={postMessage:m=>messages.push(m)};
 vm.runInNewContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),{figma,__html__:'',TextEncoder});
 await figma.ui.onmessage(Object.assign({type:'test-selection',requestId:'diagnostics'},request));
 assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);
 const result=messages.find(m=>m.type==='selection-test-result');assert(result);return result;
};
for(const failAll of [false,true])test('Editor bundle reports native failure stages and cleans up '+failAll,async()=>{
 const {result}=await runNativeOccurrenceCapture(invoke,{reset:true,dependencies:true,dependencyStage:'append-reference-instance',failAll});
 const captures=JSON.parse(JSON.stringify(result.snapshot.componentDependencyCaptures));
 assert.equal(captures[0].failureDetails.stage,'append-reference-instance');assert(!captures[0].snapshot);
 assert.equal(captures.filter(c=>c.failure).length,failAll?4:1);
 assert(captures.slice(failAll?4:1).every(c=>c.snapshot&&!c.failure));
});
test('failure diagnostics explain coverage but cannot change verdicts, pins or historical reasons',()=>{
 const f=scenario(4),original=f.run();f.snapshot.nodes[0].appearance.opacity=.4;
 const c=f.snapshot.componentDependencyCaptures[0];delete c.snapshot;delete c.nodeMap;c.failure='dependency-reference-capture-failed';
 const legacy=f.run(),engine=clone(legacy.engine),manual=clone(f.manual),pins=clone(legacy.contract.componentDependencies);
 c.failureDetails=core.dependencyCaptureFailureDetails('create-reference-instance',new TypeError('synthetic failure'));
 const diagnosed=f.run();assert.deepEqual(semanticEngine(diagnosed.engine),semanticEngine(engine));assert.notEqual(diagnosed.engine.snapshotHash,engine.snapshotHash);
 assert.deepEqual(f.manual,manual);assert.deepEqual(clone(diagnosed.contract.componentDependencies),pins);
 assert.equal(diagnosed.report.scenarioCoverage.complete,false);assert.equal(diagnosed.engine.dependencyRuns[0].status,'not-executed');
 assert(diagnosed.engine.evaluations.some(e=>e.classification==='violation'&&!e.dependency));
 const reasons=JSON.stringify(diagnosed.report);assert(reasons.includes('создание эталона'));assert(reasons.includes('synthetic failure'));
 for(const mutate of [()=>{c.failureDetails.version=2;},()=>{c.failureDetails.stage='unknown';},()=>{f.snapshot.componentDependencyCaptures.push(clone(c));}]){
  c.failureDetails=core.dependencyCaptureFailureDetails('create-reference-instance',Error('synthetic failure'));mutate();
  assert(!JSON.stringify(f.run().report).includes('Этап:'));
 }
 f.snapshot.componentDependencyCaptures.pop();delete c.failureDetails;assert.deepEqual(f.run().report,legacy.report);
 assert(original.report.scenarioCoverage.complete);
});

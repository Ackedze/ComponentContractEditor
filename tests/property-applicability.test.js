const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
const core=require('../dist/core.cjs');
const {capture,clone,evidence}=require('./helpers/spinner-geometry');
const reports=JSON.parse(zlib.gunzipSync(fs.readFileSync(require.resolve('./fixtures/spinner-live-acceptance-20260926.json.gz')))).files.map(f=>f.document);
const gates={'appearance.strokeWeight':'stroke-present-either@1','layout.itemSpacing':'flow-gap-either@1'};
function gated(){const m=clone(reports[0].sources.manual);for(const r of m.rules){const facts=core.baselineFactsForRule(r);const entries=Object.entries(gates).filter(([f])=>facts.includes(f));if(entries.length)r.propertyApplicability=Object.fromEntries(entries);}return m;}
function run(snapshot,manual=gated(),variants=evidence){
 const compiled=core.compileManualSource(manual,variants);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 const contract=core.prepareAuthoringPreviewContract(compiled.contract),engine=core.evaluateCompiledContract(snapshot,contract);
 return {compiled,contract,engine,report:core.buildEditorValidationReport(engine,compiled,manual,snapshot)};
}
test('all four accepted 0.2.30 reports retain exact replay and original manual',()=>{
 for(const r of reports){const before=JSON.stringify(r),engine=core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract);
  assert.deepEqual(engine,r.results.engine);
  assert.deepEqual(core.buildEditorValidationReport(engine,{contract:r.sources.compiledContract,issues:r.sources.compilerIssues},r.sources.manual,r.snapshot),r.results.editor);
  assert.deepEqual(clone(core.buildEvaluationDetails(r.results.editor,r.runtime.evaluatedContract,r.anatomy)),r.results.details);
  assert.equal(JSON.stringify(r),before);
 }
});
for(const [index,r]of reports.entries())test(`opt-in activity policy through actual controller preserves meaningful findings, case ${index+1}`,async()=>{
 const {output}=await capture(r),m=gated(),result=run(output.snapshot,m);
 assert.deepEqual(output.snapshot.nodes[0].propertyActivityV1,{strokePresent:false,gapApplicable:false,paddingApplicable:true,axisAlignmentApplicable:true});
 assert.deepEqual(output.snapshot.nodes[0].baseline.effective.propertyActivityV1,{strokePresent:false,gapApplicable:false,paddingApplicable:true,axisAlignmentApplicable:true});
 const violations=result.engine.evaluations.filter(e=>e.classification==='violation');
 const expected=r.results.engine.evaluations.filter(e=>e.classification==='violation'&&!e.trace.factPaths.some(f=>f==='appearance.strokeWeight'||f==='layout.itemSpacing'));
 assert.deepEqual(violations.map(e=>[e.ruleId,e.subjectNodeId,e.trace]),expected.map(e=>[e.ruleId,e.subjectNodeId,e.trace]));
 assert.equal(violations.length,[0,4,7,2][index]);assert.equal(result.report.scenarioCoverage.complete,false);
 assert.ok(result.report.evaluations.some(e=>e.evidenceIssues?.some(p=>p.includes('gradientTransform'))));
 const excluded=result.engine.evaluations.filter(e=>e.classification==='not-applicable');
 assert.equal(excluded.length,18);assert.ok(excluded.every(e=>e.trace.truth==='false'));
 const details=core.buildEvaluationDetails(result.report,result.contract,output.anatomy).filter(d=>d.classification==='not-applicable');
 assert.ok(details.every(d=>/по условию контракта/.test(d.reasonLabel)));
 const text=core.buildValidationReportDownload({manual:m,compiled:result.compiled,evaluatedContract:result.contract,snapshot:output.snapshot,anatomy:output.anatomy,engineResult:result.engine,result:result.report,capture:null,trigger:'selected-instance'}).json;
 const exported=JSON.parse(text);assert.deepEqual(core.evaluateCompiledContract(exported.snapshot,exported.runtime.evaluatedContract),exported.results.engine);assert.deepEqual(exported.sources.manual,m);
 // Facts never change old semantics without a manual opt-in.
 const old=run(output.snapshot,r.sources.manual);assert.equal(old.engine.evaluations.filter(e=>e.classification==='violation').length,[0,4,7,10][index]);
});
for(const [fact,field]of [['appearance.strokeWeight','strokePresent'],['layout.itemSpacing','gapApplicable']]){
 test(`${fact}: either state active is checked, inactive is explicit, unknown/missing is incomplete`,async()=>{
  const s=(await capture(reports[3])).output.snapshot,m=gated();
  m.rules=[{...m.rules.find(r=>r.id.endsWith('layer-properties-use-effective-baseline')),capability:fact,targetScope:'self',constraints:[{type:'propertyForbidden'}],propertyApplicability:{[fact]:gates[fact]}}];
  for(const [actual,expected,verdict]of [[false,false,'not-applicable'],[true,false,'violation'],[false,true,'violation'],[true,true,'violation'],[undefined,false,'human-review'],[false,undefined,'human-review'],[undefined,true,'violation']]){
   const snapshot=clone(s),n=snapshot.nodes[0];n.propertyActivityV1={[field]:actual};n.baseline.effective.propertyActivityV1={[field]:expected};
   const r=run(snapshot,m,undefined);assert.equal(r.engine.evaluations[0].classification,verdict);assert.equal(r.report.scenarioCoverage.complete,verdict!=='human-review');
  }
  const missing=clone(s),root=missing.nodes[0];root.propertyActivityV1={[field]:true};
  const [part,key]=fact.split('.');delete root.baseline.effective[part][key];
  const r=run(missing,m,undefined);assert.equal(r.engine.evaluations[0].classification,'human-review');assert.equal(r.report.scenarioCoverage.complete,false);
 });
}
test('capture counts only visible AUTO children; mixed or missing evidence never becomes empty',()=>{
 const node=children=>({type:'FRAME',layoutMode:'HORIZONTAL',children});const child=(visible=true,layoutPositioning='AUTO')=>({visible,layoutPositioning});
 const gap=n=>core.capturePropertyActivity(n).gapApplicable;
 assert.equal(gap(node([])),false);assert.equal(gap(node([{}])),false);
 assert.equal(gap(node([child(),child()])),true);
 assert.equal(gap(node([child(),child(false)])),false);
 assert.equal(gap(node([child(),child(true,'ABSOLUTE')])),false);
 assert.equal(gap(node([child(),{}])),undefined);
 assert.equal(gap(node([child(),child(),{}])),true);
 assert.equal(gap({type:'FRAME',layoutMode:'HORIZONTAL'}),undefined);
 assert.equal(gap({type:'FRAME',layoutMode:'NONE'}),false);
 assert.equal(gap({type:'FRAME',layoutMode:'GRID'}),false);
 assert.equal(gap({type:'FRAME'}),undefined);
 assert.equal(gap({type:'ELLIPSE'}),false);
 assert.equal(core.capturePropertyActivity({strokes:Symbol('mixed')}).strokePresent,undefined);
 assert.equal(core.capturePropertyActivity({strokes:[]}).strokePresent,false);
 assert.equal(core.capturePropertyActivity({strokes:[{visible:false}]}).strokePresent,true);
});
test('adding/removing stroke still triggers paint/weight checks; missing baseline activity remains unknown',async()=>{
 const {output}=await capture(reports[0]);for(const removed of [false,true]){
  const s=clone(output.snapshot),root=s.nodes[0];root.appearance.strokeWeight=2;
  (removed?root.baseline.effective:root).appearance.stroke=[{type:'SOLID',visible:true}];
  (removed?root.baseline.effective:root).propertyActivityV1.strokePresent=true;
  const r=run(s);assert.ok(r.engine.evaluations.some(e=>e.classification==='violation'&&e.trace.factPaths.includes('appearance.stroke')));
  assert.ok(r.engine.evaluations.some(e=>e.classification==='violation'&&e.trace.factPaths.includes('appearance.strokeWeight')));
 }
 const old=run(reports[3].snapshot);assert.equal(old.report.scenarioCoverage.complete,false);
 assert.ok(core.buildEvaluationDetails(old.report,old.contract,reports[3].anatomy).some(d=>/Недостаточно данных о применимости/.test(d.reasonLabel)));
});
test('invalid or unrelated gates fail closed and rule editing/ZIP preserve exact maps',async()=>{
 const manual=gated(),source=manual.rules.find(r=>r.id.endsWith('layer-properties-use-effective-baseline'));
 for(const map of [{'appearance.fill':'stroke-present-either@1'},{'appearance.strokeWeight':'future@9'},['stroke-present-either@1'],null]){
  const m=clone(manual);m.rules.find(r=>r.id===source.id).propertyApplicability=map;
  assert.ok(core.validateManualSource(m).some(i=>i.code==='RULE_PROPERTY_APPLICABILITY'));
  assert.ok(core.compileManualSource(m,evidence).contract.nonExecutableRules.some(r=>r.sourceRuleId===source.id));
 }
 const unrelated={...source,capability:'appearance.opacity',constraints:[{type:'propertyForbidden'}],status:'reviewed'};
 assert.ok(core.validateRuleEdit(manual,unrelated,source.id).some(i=>i.code==='RULE_PROPERTY_APPLICABILITY'));
 const bundle=core.buildExportBundle(manual,evidence),zip=core.createZip([core.textZipEntry('contract.manual.json',manual),core.textZipEntry('compiled/component-contract.v2.json',bundle.compiled)]);
 const entries=await core.readZip(zip),restored=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(restored.manual,manual);
 assert.deepEqual(bundle.compiled.customizationPolicy.find(r=>r.id===source.id).propertyApplicability,source.propertyApplicability);
 assert.ok(bundle.compiled.capabilities.facts.includes('baseline.effective.propertyActivityV1.strokePresent'));
 assert.equal(core.effectiveFacts({layout:{mode:'HORIZONTAL'},propertyActivityV1:{gapApplicable:true}}).propertyActivityV1,undefined);
});
test('saving an unchanged forbidden capability preserves imported explicit constraints independently of activity opt-in',()=>{
 const source=gated().rules.find(r=>r.id.endsWith('layer-properties-use-effective-baseline'));
 const before=JSON.stringify(source),actual=core.forbiddenConstraintsForEdit(source,source,[]);
 assert.equal(actual.length,13);assert.deepEqual(actual,source.constraints);assert.notEqual(actual,source.constraints);
 actual[0].fact='changed';assert.equal(JSON.stringify(source),before);
 const fallback=[{type:'propertyDomain',values:[false]}];
 assert.deepEqual(core.forbiddenConstraintsForEdit(undefined,{capability:'component.properties.Hint'},fallback),fallback);
 assert.deepEqual(core.forbiddenConstraintsForEdit(source,{capability:'appearance.opacity'},[]),[]);
 assert.deepEqual(core.forbiddenConstraintsForEdit({...source,permission:'constrained'},source,[]),[]);
 const group={...source,capability:'',capabilitySet:'auto-layout@1',capabilitySelection:['layout.itemSpacing','layout.mode']};
 assert.deepEqual(core.forbiddenConstraintsForEdit(group,{...group,capabilitySelection:group.capabilitySelection.slice().reverse()},[]),source.constraints);
 assert.deepEqual(core.forbiddenConstraintsForEdit(group,{...group,capabilitySelection:['layout.mode']},[]),[]);
});

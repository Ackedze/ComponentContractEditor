const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../dist/core.cjs'),clone=x=>JSON.parse(JSON.stringify(x));
const root=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Button');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'qa/spinner-integration-live-review.2026-09-27.json')));
const reports=manifest.reportResults.map(item=>({item,r:JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,item.fixtureFile))))}));
const source=id=>reports.find(({item})=>item.caseId===id).r;
const hiddenIds=['component:web-core.button.label-and-hint-color-locked','component:web-core.button.label-text-style-locked'];
const ownershipIds=['component:core.web.button.root.auto-layout-1','component:core.web.button.root.visual-style-1','component:web-core.button.manual-layout-and-appearance-overrides-prohibited'];
function optedIn(r){const m=clone(r.sources.manual);m.metadata.revision=17;for(const rule of m.rules){
 if(ownershipIds.includes(rule.id))rule.boundaryPolicy='component-owned@1';
 if([ownershipIds[0],ownershipIds[2]].includes(rule.id))rule.propertyApplicability={'layout.itemSpacing':'flow-gap-either@1'};
 if(hiddenIds.includes(rule.id))rule.targetApplicability='visible-target@1';
}return m;}
function run(r,m=optedIn(r),editContract=()=>{}){
 const compiled=core.compileManualSource(m,r.sources.compiledContract.facts.variantEvidence,[r.sources.compiledContract.componentDependencies[0].contract]);
 assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
 const contract=core.prepareAuthoringPreviewContract(compiled.contract);editContract(contract);
 const engine=core.evaluateCompiledContract(r.snapshot,contract),editor=core.buildEditorValidationReport(engine,compiled,m,r.snapshot);
 const details=core.buildEvaluationDetails(editor,contract,r.anatomy),violations=details.filter(d=>d.classification==='violation');
 return {compiled,contract,engine,editor,details,violations};
}
for(const {r,item}of reports)test(`${item.caseId}: explicit owner/visibility/gap policies preserve meaningful findings and child checks`,()=>{
 const before=JSON.stringify(r),out=run(r);
 assert.equal(out.compiled.contract.runtimePolicy.ruleScopeFactsVersion,1);
 assert.equal(out.violations.length,{BS01:0,BS02:0,BS03:1,BS04:14,BS05:2,BS06:0,BS07:0}[item.caseId]);
 assert.equal(core.groupEvaluationDetails(out.violations).length,{BS01:0,BS02:0,BS03:1,BS04:8,BS05:1,BS06:0,BS07:0}[item.caseId]);
 assert.equal(out.editor.scenarioCoverage.notExecuted,10);assert.equal(out.editor.scenarioCoverage.inconclusive,0);assert.equal(out.editor.scenarioCoverage.complete,false);
 // Entire child output, including IDs, traces and baseline, is unchanged.
 assert.deepEqual(out.engine.evaluations.filter(e=>e.dependency),r.results.engine.evaluations.filter(e=>e.dependency));
 if(item.caseId!=='BS07')for(const id of hiddenIds){const entries=out.engine.evaluations.filter(e=>e.ruleId.startsWith(id+'.'));
  assert.equal(entries.length,1);assert.equal(entries[0].classification,'not-applicable');assert.equal(entries[0].trace.truth,'false');
 }
 assert.equal(JSON.stringify(r),before);
 const json=core.buildValidationReportDownload({manual:optedIn(r),compiled:out.compiled,evaluatedContract:out.contract,snapshot:r.snapshot,anatomy:r.anatomy,engineResult:out.engine,result:out.editor,capture:null,trigger:'selected-instance'}).json;
 const saved=JSON.parse(json);assert.deepEqual(core.evaluateCompiledContract(saved.snapshot,saved.runtime.evaluatedContract),saved.results.engine);
});
test('unknown pin/capture/identity/topology cannot establish an ownership exemption',()=>{
 for(const kind of ['pin','capture','actual-mismatch','topology']){
  const r=clone(source('BS05'));
  if(kind==='capture')r.snapshot.componentDependencyCaptures=[];
  if(kind==='actual-mismatch')r.snapshot.componentDependencyCaptures[0].snapshot.nodes[0].appearance.opacity=.9;
  if(kind==='topology')r.snapshot.source.truncated=true;
  const out=run(r,optedIn(r),c=>{if(kind==='pin')c.componentDependencies[0].contract.rules[0].severity='tampered';});
  assert.equal(out.editor.scenarioCoverage.complete,false);
  assert.ok(out.engine.dependencyRuns.some(d=>d.status==='not-executed'));
  assert.ok(out.engine.evaluations.some(e=>!e.dependency&&['human-review','not-evaluable'].includes(e.classification)),kind);
  const prepared=core.prepareValidationSnapshot(r.snapshot,out.contract);
  assert.notEqual(prepared.nodes.find(n=>n.name==='Spinner').ruleScopeV1.local,false,kind);
 }
});
test('uncontracted icons stay inside parent scope; explicit host Size survives the child boundary',()=>{
 const r=clone(source('BS07')),n=r.snapshot.nodes.find(n=>n.name==='PaintMe');assert.ok(n);n.appearance.opacity=.5;
 const out=run(r);assert.ok(out.violations.some(e=>ownershipIds.some(id=>e.ruleId.startsWith(id+'.'))&&e.nodeId===n.id));
 const wrong=run(source('BS03'));assert.equal(wrong.violations[0].ruleId,'component:web-core.button.addon-size-follows-button-size.1.8.1');
 assert.equal(wrong.violations[0].actual,'24');assert.deepEqual(wrong.violations[0].expected,['16']);
});
test('inactive gaps are explicit exclusions; active baseline gap and parent padding/radius stay checked',()=>{
 const out=run(source('BS04'));
 assert.ok(out.violations.some(d=>d.nodeId==='preview:0'&&d.factPath==='layout.itemSpacing'));
 assert.ok(!out.violations.some(d=>['preview:2','preview:3'].includes(d.nodeId)&&d.factPath==='layout.itemSpacing'));
 assert.ok(out.violations.some(d=>d.factPath==='layout.padding.left'));
 assert.ok(out.violations.some(d=>d.factPath==='appearance.radius'));
 assert.equal(out.violations.filter(d=>d.ruleId.includes('spinner.intrinsic-size-required')).length,2);
});
test('unresolved/ambiguous/missing visibility never becomes a hidden-target exemption',()=>{
 for(const kind of ['manual','missing','visibility','collision']){
  const r=clone(source('BS01')),m=optedIn(r);m.rules=m.rules.filter(rule=>hiddenIds.includes(rule.id));
  if(kind==='manual')m.targets.find(t=>t.id==='target.text').resolution='unknown';
  const text=r.snapshot.nodes.find(n=>n.semantic.role==='text');
  if(kind==='missing')text.name='Renamed unknowable target';
  if(kind==='visibility'){delete text.visible;text.unknownFacts.push('visible');}
  if(kind==='collision')m.targets.push({...clone(m.targets.find(t=>t.id==='target.text')),id:'target.text-duplicate'});
  const out=run(r,m);assert.equal(out.editor.scenarioCoverage.complete,false,kind);
  assert.ok(out.editor.scenarioCoverage.notExecuted+out.editor.scenarioCoverage.inconclusive>0,kind);
 }
});
test('visibility policy never suppresses a required-presence constraint or permits visibility edits',()=>{
 const r=source('BS01'),m=optedIn(r),style=m.rules.find(rule=>hiddenIds.includes(rule.id));
 m.rules=[{...style,id:'test-required-text',targetScope:'self',capability:'visibility',constraints:[{type:'presence',targetRole:'text'}],permission:'constrained'}];
 assert.ok(core.validateManualSource(m).some(i=>i.code==='RULE_TARGET_APPLICABILITY'));
 delete m.rules[0].targetApplicability;
 const out=run(r,m);assert.ok(out.violations.some(d=>d.ruleId==='test-required-text.1.1'));
});
test('invalid policies fail validation; manual/compiled/ZIP preserve opt-in without changing child bytes',async()=>{
 const r=source('BS01'),m=optedIn(r);
 for(const [field,value,index]of [['boundaryPolicy','future@9',0],['targetApplicability','future@9',m.rules.findIndex(x=>hiddenIds.includes(x.id))]]){
  const bad=clone(m);bad.rules[index][field]=value;assert.ok(core.validateManualSource(bad).some(i=>i.level==='error'&&i.path.endsWith('/'+field)));
 }
 const bad=clone(m);bad.componentDependencies=[];assert.ok(core.validateManualSource(bad).some(i=>i.code==='RULE_BOUNDARY_POLICY'));
 const out=run(r,m),zip=core.createZip([core.textZipEntry('contract.manual.json',m),core.textZipEntry('compiled/component-contract.v2.json',out.compiled.contract)]);
 const entries=await core.readZip(zip),w=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(w.manual,m);assert.deepEqual(w.dependencyContracts,[r.sources.compiledContract.componentDependencies[0].contract]);
 for(const rule of m.rules){const p=out.compiled.contract.customizationPolicy.find(p=>p.id===rule.id);assert.equal(p.boundaryPolicy,rule.boundaryPolicy);assert.equal(p.targetApplicability,rule.targetApplicability);}
});
test('legacy compiled contracts do not gain new scope facts or altered replay',()=>{
 for(const {r}of reports){assert.equal(r.runtime.evaluatedContract.runtimePolicy.ruleScopeFactsVersion,undefined);
  assert.deepEqual(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract),r.results.engine);
  assert.ok(core.prepareValidationSnapshot(r.snapshot,r.runtime.evaluatedContract).nodes.every(n=>n.ruleScopeV1===undefined));
 }
});

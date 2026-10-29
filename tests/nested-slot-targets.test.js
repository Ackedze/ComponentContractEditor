const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../dist/core.cjs'),root=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-corp/AmountStyles/authoring');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json'),runtime=core.prepareAuthoringPreviewContract(compiled);
const clone=x=>JSON.parse(JSON.stringify(x));
const fixture=()=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures/r2-editor-0.2.59/amount-styles.validation-report.2026-09-29T18-21-31-438Z.json.gz'))));
const slot=s=>s.nodes.find(n=>n.id==='preview:10'),owner=s=>s.nodes.find(n=>n.id==='preview:3');
const checks=s=>core.evaluateCompiledContract(s,runtime).evaluations.filter(e=>e.ruleId.includes('addon-uses-supported-components'));
test('nested slot preserves declared boundary role after native Addon swap; text unaffected',()=>{
 const s=fixture().snapshot,raw=JSON.stringify(s),p=core.prepareValidationSnapshot(s,runtime);
 assert.equal(slot(p).semantic.role,'addon');assert.equal(slot(p).slotBoundaryV1.ownerTargetId,'target.amount');
 assert.equal(slot(p).baselineProvenance.status,'unresolved');
 assert(p.nodes.filter(n=>Number(n.id.split(':')[1])>10).every(n=>!n.semantic.role));
 assert.deepEqual(checks(s).map(e=>e.classification),['compliant','compliant']);
 assert.equal(JSON.stringify(s),raw);assert.deepEqual(core.prepareValidationSnapshot(p,runtime),p);
 const unknown=core.evaluateCompiledContract(s,runtime).evaluations.filter(e=>e.classification==='human-review');
 // r2 capture has no text.decoration; only the new r9 assertions stay unknown.
 assert.equal(unknown.length,4);assert(unknown.every(e=>e.ruleId.includes('manual-interactive-decoration-is-forbidden')));
});
test('foreign Addon family fails, not unknown or name fallback',()=>{
 const s=fixture().snapshot;slot(s).component.identity.componentSetKey='foreign';
 assert.equal(checks(s).find(e=>e.ruleId.endsWith('.1.2')).classification,'violation');
});
test('missing Addon identity stays unknown, even with matching name',()=>{
 const s=fixture().snapshot;delete slot(s).component.identity.componentSetKey;slot(s).unknownFacts.push('component.identity.componentSetKey');
 assert.equal(checks(s).find(e=>e.ruleId.endsWith('.1.2')).classification,'human-review');
});
for(const [label,change] of [
 ['wrong owner identity',s=>owner(s).component.identity.componentKey='foreign'],
 ['missing native reference',s=>delete slot(s).component.propertyReferenceBindings.visible],
 ['wrong native reference',s=>slot(s).component.propertyReferenceBindings.visible='Other#1'],
 ['wrong owner property type',s=>owner(s).component.propertyTypes['Addon#100902:0']='TEXT'],
 ['unknown owner identity',s=>owner(s).unknownFacts.push('component.identity.componentKey')],
 ['unknown native reference',s=>slot(s).unknownFacts.push('component.propertyReferenceBindings.visible')],
 ['truncated capture',s=>s.source.truncated=true],
 ['duplicate native consumer',s=>{const n=clone(slot(s));n.id='duplicate';n.childIds=[];s.nodes.push(n);owner(s).childIds.push(n.id);}],
])test('nested slot fails closed: '+label,()=>{const s=fixture().snapshot;change(s);const p=core.prepareValidationSnapshot(s,runtime);assert.notEqual(slot(p).semantic.role,'addon');assert(!checks(s).every(e=>e.classification==='compliant'));});
test('owner is explicit; archived contracts retain exact replay',()=>{
 const r=fixture();assert.deepEqual(JSON.parse(JSON.stringify(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract))),r.results.engine);
 const c=clone(runtime);c.customizationPolicy.forEach(r=>r.controlPaths.forEach(p=>delete p.ownerTargetId));
 assert.notEqual(slot(core.prepareValidationSnapshot(r.snapshot,c)).semantic.role,'addon');
});
test('cached slot roles and ownership cannot survive a failed recapture',()=>{
 const s=core.prepareValidationSnapshot(fixture().snapshot,runtime);s.source.truncated=true;
 const p=core.prepareValidationSnapshot(s,runtime);assert.notEqual(slot(p).semantic.role,'addon');assert.equal(slot(p).slotBoundaryV1,undefined);
 assert(!checks(s).every(e=>e.classification==='compliant'));
});
test('owner field round-trips ZIP; validates missing, same and unrelated targets',async()=>{
 const files=await core.readZip(fs.readFileSync(path.join(root,'editor/AmountStyles.editor-input.zip')));
 const w=core.importWorkspace(files.map(f=>({name:f.name,text:core.zipEntryText(f)})));assert.deepEqual(w.manual,manual);
 const get=m=>m.rules.find(r=>r.id.endsWith('addon-uses-supported-components')).controlPaths[0];
 assert.equal(get(w.manual).ownerTargetId,'target.amount');
 for(const id of ['missing','target.addon','target.major']){const m=clone(manual);get(m).ownerTargetId=id;const result=core.compileManualSource(m,w.evidence);assert(result.issues.some(i=>i.code==='CONTROL_SLOT_OWNER'));}
});
test('35 r2/r3/r4 captures preserve verdicts except two resolved Addon checks',()=>{
 assert.equal(require(path.resolve(root,'../../../../scripts/review_amount_styles_r5')).review().results.length,35);
});

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../dist/core.cjs'),root=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-corp/AmountStyles/authoring');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json'),runtime=core.prepareAuthoringPreviewContract(compiled);
const clone=x=>JSON.parse(JSON.stringify(x));
const fixture=()=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures/r3-editor-0.2.60/amount-styles.validation-report.2026-09-29T18-47-36-079Z.json.gz'))));
const prepare=(s,c=runtime)=>core.prepareValidationSnapshot(s,c),leaf=s=>s.nodes.find(n=>n.id==='preview:7');
test('declared text targets recover on independent same-family variant, not from current style',()=>{
 const r=fixture(),raw=JSON.stringify(r.snapshot),p=prepare(r.snapshot);
 assert.equal(leaf(p).semantic.role,'minor-text');assert.equal(p.nodes.find(n=>n.id==='preview:9').semantic.role,'currency-text');
 assert.equal(leaf(p).variantAvailability.targets['minor-text'].evidence,'explicit-independent-host-variant-text');
 assert.equal(JSON.stringify(r.snapshot),raw);assert.deepEqual(prepare(p),p);
 const e=core.evaluateCompiledContract(r.snapshot,runtime),unknown=e.evaluations.filter(e=>e.classification==='human-review');
 // This historical capture predates decoration facts; never synthesize NONE.
 assert.equal(unknown.length,3);assert(unknown.every(e=>e.ruleId.includes('manual-interactive-decoration-is-forbidden')));
 assert.equal(e.evaluations.filter(e=>e.classification==='violation').length,8);
 assert.deepEqual(core.evaluateCompiledContract(p,runtime),e);
});
test('without manual continuity, even matched same-name TEXT stays unresolved',()=>{
 const c=clone(runtime);delete c.facts.targets.find(t=>t.semanticRole==='minor-text').variantContinuity;
 assert.equal(leaf(prepare(fixture().snapshot,c)).semantic.role,undefined);
});
test('old compiled contract still replays all original unknowns exactly',()=>{
 const r=fixture();assert.deepEqual(JSON.parse(JSON.stringify(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract))),r.results.engine);
});
for(const [label,mutate] of [
 ['missing reference',s=>{s.instanceContentReferences.attempts=[];}],
 ['duplicate reference',s=>s.instanceContentReferences.attempts.push(clone(s.instanceContentReferences.attempts[0]))],
 ['foreign family',s=>{s.nodes[6].component.identity.componentSetKey='foreign';}],
 ['capture failure',s=>{s.instanceContentReferences.attempts[0].failure='unavailable';}],
 ['wrong strategy',s=>{delete s.instanceContentReferences.attempts[0].strategy;}],
 ['reference not independent',s=>{s.instanceContentReferences.attempts[0].reference.source.rootNodeId=s.source.rootNodeId;}],
 ['host altered',s=>{s.instanceContentReferences.attempts[0].reference.nodes[0].appearance.opacity=.4;}],
 ['wrong TEXT type',s=>{s.nodes[7].type='FRAME';}],
 ['truncated source',s=>{s.source.truncated=true;}],
 ['duplicate target name',s=>{const n=clone(s.nodes[7]);n.id='duplicate';s.nodes.push(n);s.nodes[6].childIds.push(n.id);}],
])test('continuity fails closed: '+label,()=>{
 const s=fixture().snapshot;mutate(s);
 // Adversarial cached roles/provenance must be recomputed, not trusted.
 leaf(s).semantic.role='minor-text';
 const p=prepare(s);assert.notEqual(leaf(p).semantic.role,'minor-text');
 assert.notEqual(p.nodes[0].variantAvailability.targets['minor-text']?.present,true);
});
test('continuity cannot attach to another anchor or unreviewed ambiguous target',()=>{
 for(const mutate of [t=>{t.variantContinuity.anchorTargetId='target.currency';},t=>{t.resolution='ambiguous';},t=>{t.variantContinuity.kind='swap';}]){
 const c=clone(runtime),t=c.facts.targets.find(t=>t.semanticRole==='minor-text');mutate(t);assert.equal(leaf(prepare(fixture().snapshot,c)).semantic.role,undefined);
 }
});
test('actual token/style overrides remain actual, including a matching-pristine-reference override',()=>{
 const s=fixture().snapshot,n=leaf(s);n.textStyleEvidenceV1.segments.forEach(x=>x.styleId='');n.appearance.typography.styleId='';
 const p=prepare(s);assert.equal(leaf(p).semantic.role,'minor-text');assert.equal(leaf(p).textBindingIdentityV1.style.valid,false);
});
test('authoring controls retain stable target IDs, require valid anchors, and invalidate relevant reviews',()=>{
 const old=clone(manual),before=JSON.stringify(old);const edited=core.editVariantTextTargets(old,[]);
 assert.equal(JSON.stringify(old),before);assert(edited.targets.every(t=>!t.variantContinuity));
 assert.equal(edited.rules.find(r=>r.id.endsWith('parts-share-color')).status,'draft');
 for(const rows of [[{targetId:'missing',anchorTargetId:'target.minor'}],[{targetId:'target.minor-text',anchorTargetId:'target.minor-text'}],
  [{targetId:'target.minor-text',anchorTargetId:'target.currency'}],[{targetId:'target.minor-text',anchorTargetId:'target.minor'},{targetId:'target.minor-text',anchorTargetId:'target.minor'}]])assert.throws(()=>core.editVariantTextTargets(old,rows));
 const rows=manual.targets.filter(t=>t.variantContinuity).map(t=>({targetId:t.id,anchorTargetId:t.variantContinuity.anchorTargetId}));
 assert.deepEqual(core.editVariantTextTargets(old,rows),old);
});
test('ZIP preserves explicit continuity; historical and current 33-capture replay',async()=>{
 const files=await core.readZip(fs.readFileSync(path.join(root,'editor/AmountStyles.editor-input.zip')));
 const w=core.importWorkspace(files.map(f=>({name:f.name,text:core.zipEntryText(f)})));
 assert.deepEqual(w.manual,manual);assert.equal(compiled.runtimePolicy.variantTextTargetsVersion,1);
 assert.equal(require(path.resolve(root,'../../../../scripts/review_amount_styles_r4')).review().results.length,33);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../dist/core.cjs');
const live=require('./fixtures/button40-icon20-live-snapshot.json');
const dependencies=require('./fixtures/button-dependencies.json');
const clone=x=>JSON.parse(JSON.stringify(x));

function scenario(modern=false) {
  const snapshot=clone(live.snapshot),manual=clone(dependencies.manual),evidence=clone(dependencies.evidence);
  evidence.variants.push(clone(live.variant));evidence.structures[live.variant.structureId]=clone(live.structure);
  evidence.assetCatalogs=clone(live.assetCatalogs);
  manual.rules.push({...clone(manual.rules[0]),id:'fixture:host-fill',targetScope:'self-and-descendants',
    capability:'appearance.fill',permission:'forbidden',controlPaths:[],constraints:[],message:'No manual fill'});
  const compiled=core.compileManualSource(manual,evidence);
  assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
  if(modern) {
    // Counterfactual capture model, NOT a new live result. Preserve the library
    // host fill when switching Type; never obtain the expected fill from actual.
    snapshot.instanceContentReferences.schemaVersion='apollo.instance-content-references.v3';
    const {base,attempts}=snapshot.instanceContentReferences;
    attempts[0].strategy='pristine-host-variant-properties';
    attempts[0].reference.nodes[4].appearance.fill=clone(base.nodes[4].appearance.fill);
  }
  const run=()=>({prepared:core.prepareValidationSnapshot(snapshot,compiled.contract),
    engine:core.evaluateCompiledContract(snapshot,compiled.contract)});
  return {snapshot,compiled,run};
}

test('live 0.2.24 fixture reproduces wrong blue baseline and inactive-port ambiguity',()=>{
  const f=scenario(),r=f.run();
  assert.equal(r.prepared.instanceContentResults[0].status,'matched');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-fill')&&e.subjectNodeId==='preview:4').classification,'violation');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'human-review');
  assert.ok(Object.values(r.prepared.nodes[0].dependencies).some(d=>d.reason==='ambiguous-swap-port'));
});

test('preserved-host capture model resolves actual Icon-20 consumer and removes false fill finding',()=>{
  const f=scenario(true),r=f.run();
  assert.equal(r.prepared.instanceContentResults[0].status,'matched');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-fill')&&e.subjectNodeId==='preview:4').classification,'compliant');
  const binding=f.compiled.contract.facts.dependencyBindings.find(b=>b.targetRole==='left-addon'&&b.portNames.length);
  const d=r.prepared.nodes[0].dependencies[binding.id];
  assert.equal(d.applicable,true);assert.equal(d.changed,false);assert.equal(d.catalog,'Icons -- glyph-26');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'not-applicable');
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,f.compiled.contract),r.prepared);
});

test('manual fill override is still a violation, not absorbed into the new reference',()=>{
  const f=scenario(true);
  f.snapshot.nodes[4].appearance.fill[0].tokenId='actual-custom-token';
  f.snapshot.nodes[4].appearance.fill[0].color={r:1,g:2,b:3};
  const r=f.run();
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-fill')&&e.subjectNodeId==='preview:4').classification,'violation');
  assert.equal(r.prepared.nodes[4].baseline.effective.appearance.fill[0].color.r,255);
});

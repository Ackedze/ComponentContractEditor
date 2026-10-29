const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const fixture = require('./fixtures/button-dependencies.json');
const clone = x => JSON.parse(JSON.stringify(x));
const addon16 = '24e2f4ddddc89ef024f8f1ef3f4bc51a0e5eac68';
const addon24 = 'f33ce04b0651b062f10be88deab065ba67bf7171';
function scenario(regular = false, side = 'left') {
  const f=clone(fixture);
  if(regular) f.snapshot=f.regularSnapshot;
  f.root=f.snapshot.nodes[0];f.owner=f.snapshot.nodes[side==='left'?2:11];f.icon=f.snapshot.nodes[side==='left'?5:14];
  f.run=()=>{
    const compiled=core.compileManualSource(f.manual,f.evidence);
    assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
    const engine=core.evaluateCompiledContract(f.snapshot,compiled.contract);
    return {compiled,engine,prepared:core.prepareValidationSnapshot(f.snapshot,compiled.contract),
      size:engine.evaluations.filter(e=>e.ruleId.includes('addon-size')),
      icon:engine.evaluations.filter(e=>e.ruleId.includes('addon-uses')),
      report:core.buildEditorValidationReport(engine,compiled,f.manual,f.snapshot)};
  };
  return f;
}

test('golden live swap: Addon24 passes, positively identified legacy replacement fails; absent right side is not applicable',()=>{
  const f=scenario(),r=f.run();
  assert.deepEqual(r.size.map(e=>e.classification),['compliant','not-applicable']);
  assert.deepEqual(r.icon.map(e=>e.classification),['violation','not-applicable']);
  assert.equal(r.icon[0].trace.actual,'Icons -- general (glyph)');
  assert.deepEqual(r.icon[0].trace.expected,['Icons -- glyph-26']);
  assert.deepEqual(r.prepared.nodes[5].baseline.effective,{});
  assert.deepEqual(r.prepared.nodes[6].baseline.effective,{});
});

test('unchanged legacy is allowed even with no catalog membership; body overrides are not grandfathered by this rule',()=>{
  const f=scenario();
  f.snapshot.variantReference.nodeProperties[Object.keys(f.snapshot.variantReference.nodeProperties).find(p=>p.endsWith('/ diamonds'))].identity.componentKey=f.icon.component.identity.componentKey;
  const r=f.run();assert.equal(r.icon[0].classification,'not-applicable');
  f.evidence.assetCatalogs=[];assert.equal(f.run().icon[0].classification,'not-applicable');
});

test('glyph-26 replacement is compliant by exact key and set; no old icon baseline is reused',()=>{
  const f=scenario(),member=f.evidence.assetCatalogs.find(c=>c.catalog==='Icons -- glyph-26').members[0];
  Object.assign(f.icon.component.identity,member);
  const r=f.run();assert.equal(r.icon[0].classification,'compliant');
  assert.deepEqual(r.prepared.nodes[5].baseline.effective,{});
});

test('unknown, conflicting or stale set membership never produces a violation or a complete check',()=>{
  for(const mutate of [
    f=>{f.evidence.assetCatalogs=[];},
    f=>{f.evidence.assetCatalogs.push({...clone(f.evidence.assetCatalogs[0]),catalog:'other'});},
    f=>{f.evidence.assetCatalogs.push({...clone(f.evidence.assetCatalogs[0]),library:'other'});},
    f=>{f.icon.component.identity.componentSetKey='unknown-set';},
    f=>{f.icon.component.identity.componentKey='unknown-key';},
  ]) {const f=scenario();mutate(f);const r=f.run();assert.equal(r.icon[0].classification,'human-review');assert.equal(r.report.scenarioCoverage.complete,false);}
});

test('synthetic mapping matrix covers sizes 32–72 and wrong wrappers on both sides',()=>{
  for(const side of ['left','right']) for(const size of [32,40,48,56,64,72]) for(const correct of [true,false]) {
    const f=scenario(true,side);
    f.snapshot.nodes[side==='left'?1:10].visible=true;
    for(const r of f.manual.rules) r.constraints[0].dependency.subjects=r.constraints[0].dependency.subjects.filter(s=>s.targetRole===`${side}-addon`);
    f.root.component.properties.Size=String(size);f.snapshot.variantReference.properties.Size=String(size);
    f.snapshot.variantReference.nodeProperties[''].properties.Size=String(size);
    f.evidence.variants.find(v=>v.componentKey===f.snapshot.source.componentKey).properties.Size=String(size);
    const expected=size<=40?addon16:addon24;
    f.owner.component.identity.componentSetKey=correct?expected:expected===addon16?addon24:addon16;
    assert.equal(f.run().size[0].classification,correct?'compliant':'violation',`${side} ${size} ${correct}`);
  }
});

test('hidden slots are not applicable, missing topology/identity/ports is unknown',()=>{
  const f=scenario();f.snapshot.nodes[1].visible=false;
  assert.equal(f.run().icon[0].classification,'not-applicable');
  assert.equal(f.run().size[0].classification,'not-applicable');
  for(const mutate of [
    f=>{delete f.snapshot.variantReference;},
    f=>{f.snapshot.source.truncated=true;},
    f=>{delete f.owner.component.identity.componentKey;},
    f=>{f.owner.component.propertyTypes['Icon-20#x']='INSTANCE_SWAP';},
    f=>{delete f.owner.component.propertyTypes['Icon-24#13:0'];},
    f=>{delete f.icon.component.propertyReferenceBindings.mainComponent;},
    f=>{f.manual.rules[1].constraints[0].dependency.subjects[0].relativePath='missing';},
  ]) {const x=scenario();mutate(x);assert.equal(x.run().icon[0].classification,'human-review');}
});

test('manual changes affect engine immediately, no runtime rule/key special cases; roundtrip preserves constraints and evidence',()=>{
  const f=scenario(),before=JSON.stringify(f.manual);
  f.run();assert.equal(JSON.stringify(f.manual),before);
  f.manual.rules[1].constraints[0].values=['Icons -- general (glyph)'];
  f.manual.rules.forEach((r,i)=>{r.id=`fixture:independent-${i}`;});
  const b=core.buildExportBundle(f.manual,f.evidence);
  assert.ok(core.evaluateCompiledContract(f.snapshot,b.compiled).evaluations.every(e=>e.classification!=='violation'));
  const imported=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)},{name:'component-contract.v2.json',text:JSON.stringify(b.compiled)}]);
  assert.deepEqual(imported.manual,f.manual);assert.deepEqual(imported.variantEvidence,b.compiled.facts.variantEvidence);
});

test('dependency authoring rejects ambiguous subjects, overlapping mappings and invalid baseline policies',()=>{
  for(const mutate of [
    f=>{f.manual.rules[0].constraints[0].dependency.subjects[0].targetRole='not-declared';},
    f=>{f.manual.rules[0].constraints[0].dependency.cases[1].when.push(56);},
    f=>{f.manual.rules[0].constraints[0].dependency.sourceFact='invented.size';},
    f=>{f.manual.rules[0].constraints[0].dependency.baselinePolicy='allow-unchanged';},
    f=>{f.manual.rules[1].constraints[0].dependency.portNames=[];},
  ]){const f=scenario();mutate(f);const c=core.compileManualSource(f.manual,f.evidence);assert.ok(c.issues.some(i=>i.code==='CONSTRAINT_DEPENDENCY'));assert.ok(c.contract.nonExecutableRules.length);}
});

test('only Athena exact variant keys become catalog facts; component names are never evidence',()=>{
  const catalogs=core.extractAssetCatalogs([{kind:'component-index',catalogName:'Custom',library:'Icons',generatedAt:'date',components:[{key:'set',name:'glyph-26',variants:[{key:'one'},{id:'no-key'}]}]}]);
  assert.deepEqual(catalogs[0].members,[{componentKey:'one',componentSetKey:'set'}]);
  assert.equal(core.extractAssetCatalogs([{catalogName:'Icons -- glyph-26',components:[]}]).length,0);
});

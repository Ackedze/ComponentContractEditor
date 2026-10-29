const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-icon-size-live-cases.json');
const sizeRule=require('./fixtures/button-addon-size-rule-r15.json');
const clone=x=>JSON.parse(JSON.stringify(x));
const ruleId=sizeRule.id;
function scenario(index=0){
  const manual=clone(fixture.manual),evidence=clone(fixture.evidence),snapshot=clone(fixture.cases[index].snapshot);
  manual.rules[manual.rules.findIndex(r=>r.id===ruleId)]=clone(sizeRule);manual.metadata.revision=15;
  // Explicit synthetic upgrade for the new runtime. Original fixtures stay v3.
  snapshot.instanceContentReferences.schemaVersion='apollo.instance-content-references.v4';
  const run=()=>{
    const compiled=core.compileManualSource(manual,evidence);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
    const contract=core.prepareAuthoringPreviewContract(compiled.contract),engine=core.evaluateCompiledContract(snapshot,contract);
    return {compiled,contract,engine,checks:engine.evaluations.filter(e=>e.ruleId.startsWith(ruleId)),prepared:core.prepareValidationSnapshot(snapshot,contract),
      details:core.buildEvaluationDetails(engine,contract,[]),report:core.buildEditorValidationReport(engine,compiled,manual,snapshot)};
  };return {manual,evidence,snapshot,run};
}
const nominal=r=>r.checks.filter(e=>/\.1\.[567]\.1$/.test(e.ruleId));

test('r15 golden: Size24 fitted into 20×20 fails nominal Size even with missing child visual evidence',()=>{
  const f=scenario(1),r=f.run();
  assert.equal(r.prepared.instanceContentResults[0].status,'partial');
  assert.equal(r.prepared.instanceContentResults[1].reason,'reference-not-captured');
  assert.deepEqual(nominal(r).map(e=>e.classification),['not-applicable','violation','not-applicable']);
  assert.ok(r.checks.filter(e=>/\.1\.[1234]\.1$/.test(e.ruleId)).every(e=>e.classification==='compliant'));
  const d=r.details.find(d=>d.ruleId.endsWith('.1.6.1'));assert.equal(d.actual,'24');assert.deepEqual(d.expected,['20']);assert.match(d.capability,/Size/);
  assert.equal(r.report.scenarioCoverage.complete,false);
});

test('r15 golden: legacy M in Icon-16 gets explicit M→S and retains independent catalog violation',()=>{
  const f=scenario(2),r=f.run();
  assert.equal(r.prepared.instanceContentResults[0].status,'matched');
  assert.deepEqual(nominal(r).map(e=>e.classification),['violation','not-applicable','not-applicable']);
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'violation');
  const d=r.details.find(d=>d.ruleId.endsWith('.1.5.1'));assert.equal(d.actual,'m');assert.deepEqual(d.expected,['s']);
  assert.equal(f.snapshot.nodes[5].bounds.width,16);assert.equal(f.snapshot.nodes[5].bounds.height,16);
  assert.ok(r.checks.filter(e=>/\.1\.[234]\.1$/.test(e.ruleId)).every(e=>e.classification==='not-applicable'));
});

test('r15 golden positive Size20 plus untouched legacy S remain allowed; inactive ports ignored',()=>{
  const f=scenario(),r=f.run();
  assert.deepEqual(nominal(r).map(e=>e.classification),['not-applicable','compliant','not-applicable']);
  assert.equal(r.engine.evaluations.filter(e=>e.classification==='violation').length,0);
  const legacy=scenario(2); // Mutate the local object, never the fixture.
  Object.assign(legacy.snapshot,clone(legacy.snapshot.instanceContentReferences.base));
  legacy.snapshot.source.rootNodeId='synthetic-untouched-legacy';
  legacy.snapshot.variantReference=clone(fixture.cases[2].snapshot.variantReference);
  legacy.snapshot.instanceContentReferences={schemaVersion:'apollo.instance-content-references.v4',base:clone(fixture.cases[2].snapshot.instanceContentReferences.base),attempts:[]};
  assert.equal(legacy.snapshot.nodes[5].component.properties.Size,'s');
  const lr=legacy.run();assert.equal(nominal(lr)[0].classification,'compliant');
  assert.equal(lr.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'not-applicable');
});

test('nominal Size is not parsed from names, geometry or untyped properties; unknown remains incomplete',()=>{
  for(const mutate of [f=>{delete f.snapshot.nodes[5].component.properties.Size},f=>{f.snapshot.nodes[5].component.propertyTypes.Size='TEXT'},
    f=>{f.snapshot.nodes[5].component.properties.Size=20},f=>{f.snapshot.nodes[5].unknownFacts.push('component.properties.Size')},f=>{f.evidence.assetCatalogs=[]}]){
    const f=scenario();mutate(f);const r=f.run();assert.equal(nominal(r)[1].classification,'human-review');assert.equal(r.report.scenarioCoverage.complete,false);
  }
  const f=scenario();f.snapshot.nodes[5].name='Size=24';f.snapshot.nodes[5].bounds.width=24;f.snapshot.nodes[5].bounds.height=24;
  // Rename without changing the bound consumer does not redefine the property.
  const r=f.run();assert.equal(nominal(r)[1].classification,'compliant');
});

test('manual edits control nominal-domain verdicts and survive import/export, not runtime constants',()=>{
  const f=scenario(1);f.manual.rules.find(r=>r.id===ruleId).constraints[5].values=['24'];
  assert.equal(nominal(f.run())[1].classification,'compliant');
  const b=core.buildExportBundle(f.manual,f.evidence),w=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)},{name:'component-contract.v2.json',text:JSON.stringify(b.compiled)}]);
  assert.deepEqual(w.manual,f.manual);assert.deepEqual(w.manual.rules.find(r=>r.id===ruleId).constraints[5].dependency.activePorts,['Icon-20']);
  const r=f.run();assert.deepEqual(core.evaluateCompiledContract(JSON.parse(JSON.stringify(f.snapshot)),r.contract),r.engine);
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.contract),r.prepared);
});

test('reviewed authoring rejects missing property, invalid port filter and geometry tolerance on nominal Size',()=>{
  for(const mutate of [d=>{delete d.property},d=>{d.property=' '},d=>{d.property=' Size'},d=>{d.activePorts=[]},d=>{d.activePorts=['Unknown']},d=>{d.activePorts=['Icon-20','Icon-20']},d=>{d.tolerance=1},d=>{d.baselinePolicy='allow-unchanged'}]){
    const f=scenario();mutate(f.manual.rules.find(r=>r.id===ruleId).constraints[5].dependency);
    assert.ok(core.compileManualSource(f.manual,f.evidence).issues.some(i=>i.code==='CONSTRAINT_DEPENDENCY'));
  }
});

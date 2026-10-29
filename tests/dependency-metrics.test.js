const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-dependencies.json');
const sizeRule=require('./fixtures/button-addon-size-rule-r14.json');
const clone=x=>JSON.parse(JSON.stringify(x));

// Synthetic matrix: keys/port bindings come from captured evidence; host sizes
// and asset geometry are explicit test inputs, not proof of live reachability.
function scenario(size=40,side='left') {
  const f=clone(fixture);f.snapshot=f.regularSnapshot;
  f.manual.rules[0]=clone(sizeRule);
  for(const r of f.manual.rules)for(const c of r.constraints)c.dependency.subjects=c.dependency.subjects.filter(s=>s.targetRole===`${side}-addon`);
  f.root=f.snapshot.nodes[0];f.slot=f.snapshot.nodes[side==='left'?1:10];
  f.owner=f.snapshot.nodes[side==='left'?2:11];f.icon=f.snapshot.nodes[side==='left'?5:14];
  f.slot.visible=true;const reference=f.snapshot.variantReference;
  f.root.component.properties.Size=String(size);reference.properties.Size=String(size);reference.nodeProperties[''].properties.Size=String(size);
  f.evidence.variants.find(v=>v.componentKey===f.snapshot.source.componentKey).properties.Size=String(size);
  const ownerPath=side==='left'?'LeftAddon / LeftAddon':'RightAddon / RightAddon';
  const iconPath=Object.keys(reference.nodeProperties).find(p=>p.startsWith(ownerPath)&&p.endsWith('/ diamonds'));
  f.owner.component.identity.componentSetKey=size<=40?'24e2f4ddddc89ef024f8f1ef3f4bc51a0e5eac68':'f33ce04b0651b062f10be88deab065ba67bf7171';
  f.setPort=(port)=>{
    const old=f.icon.component.propertyReferenceBindings.mainComponent,next=port+'#fixture:0';
    for(const node of [f.owner.component,reference.nodeProperties[ownerPath]])for(const field of ['properties','propertyTypes']){
      node[field][next]=node[field][old];delete node[field][old];
    }
    f.icon.component.propertyReferenceBindings.mainComponent=next;
    reference.nodeProperties[iconPath].propertyReferenceBindings.mainComponent=next;
  };
  f.setPort(size<=40?'Icon-20':'Icon-24');
  Object.assign(f.icon.component.identity,f.evidence.assetCatalogs.find(c=>c.catalog==='Icons -- glyph-26').members[0]);
  f.icon.bounds.width=f.icon.bounds.height=size<=40?20:24;
  f.run=()=>{
    const compiled=core.compileManualSource(f.manual,f.evidence);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
    const engine=core.evaluateCompiledContract(f.snapshot,compiled.contract);
    return {compiled,engine,checks:engine.evaluations.filter(e=>e.ruleId.includes('addon-size')),prepared:core.prepareValidationSnapshot(f.snapshot,compiled.contract),
      report:core.buildEditorValidationReport(engine,compiled,f.manual,f.snapshot)};
  };return f;
}

test('r14 manual matrix: Button 32–72, both sides, wrapper + port + asset bounds',()=>{
  for(const size of [32,40,48,56,64,72])for(const side of ['left','right']){
    const f=scenario(size,side),r=f.run();assert.deepEqual(r.checks.map(e=>e.classification),Array(4).fill('compliant'),`${size}/${side}`);
    const b=r.compiled.contract.facts.dependencyBindings.find(b=>b.metrics);
    assert.equal(r.prepared.nodes[0].dependencies[b.id].width,size<=40?20:24);
    assert.equal(r.prepared.nodes[0].dependencies[b.id].portName,size<=40?'Icon-20':'Icon-24');
  }
});

test('wrong active adapter and independently resized width/height are separate violations',()=>{
  for(const size of [32,40,48,56,64,72])for(const side of ['left','right']){
    const f=scenario(size,side);f.setPort(size<=40?'Icon-24':'Icon-20');
    assert.deepEqual(f.run().checks.map(e=>e.classification),['compliant','violation','compliant','compliant']);
    f.setPort(size<=40?'Icon-20':'Icon-24');f.icon.bounds.width=19;
    assert.deepEqual(f.run().checks.map(e=>e.classification),['compliant','compliant','violation','compliant']);
    f.icon.bounds.width=size<=40?20:24;f.icon.bounds.height=19;
    assert.deepEqual(f.run().checks.map(e=>e.classification),['compliant','compliant','compliant','violation']);
  }
});

test('metric diagnostics show the proven mapping result, not logical false/false or an unrelated size case',()=>{
  const f=scenario();f.icon.bounds.width=19;const r=f.run();
  const detail=core.buildEvaluationDetails(r.engine,r.compiled.contract,[]).find(d=>d.ruleId.endsWith('.1.3.1'));
  assert.equal(detail.actual,19);assert.equal(detail.reasonLabel,'Размер иконки не входит в диапазон из контракта');
  assert.match(detail.capability,/Ширина иконки/);assert.ok(JSON.stringify(detail.expected).includes('19.99'));
  f.setPort('Icon-24');const p=f.run();
  const port=core.buildEvaluationDetails(p.engine,p.compiled.contract,[]).find(d=>d.ruleId.endsWith('.1.2.1'));
  assert.equal(port.actual,'Icon-24');assert.deepEqual(port.expected,['Icon-20']);
});

test('metric binding survives catalog-rule merge in either order; wrapper/vector geometry is not asset size',()=>{
  const f=scenario();f.owner.bounds.width=5;f.owner.bounds.height=5;f.snapshot.nodes[4].bounds.width=1;f.snapshot.nodes[6].bounds.width=1;
  for(const _ of [0,1]){assert.ok(f.run().checks.every(e=>e.classification==='compliant'));f.manual.rules.reverse();}
  const r=f.run();assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.compiled.contract),r.prepared);
});

test('catalog-scoped metrics preserve legacy exemption; changed legacy still fails family rule',()=>{
  const f=scenario();Object.assign(f.icon.component.identity,f.evidence.assetCatalogs.find(c=>c.catalog==='Icons -- general (glyph)').members[0]);
  assert.deepEqual(f.run().checks.map(e=>e.classification),['compliant','not-applicable','not-applicable','not-applicable']);
  const references=Object.values(f.snapshot.variantReference.nodeProperties).filter(n=>n.propertyReferenceBindings?.mainComponent===f.icon.component.propertyReferenceBindings.mainComponent);
  references[0].identity.componentKey='different-library-default';
  assert.equal(f.run().engine.evaluations.find(e=>e.ruleId.includes('addon-uses')).classification,'violation');
});

test('missing/conflicting catalog or missing geometry stays unknown; hidden targets are excluded',()=>{
  for(const change of [f=>{f.evidence.assetCatalogs=[]},f=>{f.evidence.assetCatalogs.push({...clone(f.evidence.assetCatalogs.find(c=>c.catalog==='Icons -- glyph-26')),catalog:'ambiguous'})}]){
    const f=scenario();change(f);const r=f.run();assert.ok(r.checks.slice(1).every(e=>e.classification==='human-review'));assert.equal(r.report.scenarioCoverage.complete,false);
  }
  for(const value of [undefined,null,'20',0,NaN,Infinity]){
    const f=scenario();f.icon.bounds.width=value;assert.equal(f.run().checks[2].classification,'human-review');
  }
  const f=scenario();f.slot.visible=false;assert.ok(f.run().checks.every(e=>e.classification==='not-applicable'));
});

test('changing manual mapping/tolerance changes verdict; serialization preserves all constraints and opt-in facts',()=>{
  const f=scenario();f.icon.bounds.width=20.005;assert.equal(f.run().checks[2].classification,'compliant');
  const d=f.manual.rules[0].constraints[2].dependency;delete d.tolerance;
  assert.equal(f.run().checks[2].classification,'violation');
  d.cases[0].values=[20.005];assert.equal(f.run().checks[2].classification,'compliant');
  const b=core.buildExportBundle(f.manual,f.evidence);
  const workspace=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(f.manual)},{name:'component-contract.v2.json',text:JSON.stringify(b.compiled)}]);
  assert.deepEqual(workspace.manual,f.manual);
  assert.deepEqual(core.evaluateCompiledContract(f.snapshot,b.compiled),core.evaluateCompiledContract(f.snapshot,core.compileManualSource(workspace.manual,workspace.variantEvidence).contract));
  const legacy=core.compileManualSource(fixture.manual,fixture.evidence).contract;
  assert.ok(legacy.facts.dependencyBindings.every(b=>!('metrics' in b)));
  assert.ok(Object.values(core.prepareValidationSnapshot(fixture.snapshot,legacy).nodes[0].dependencies).every(d=>!('width' in d)&&!('portName' in d)));
});

test('authoring rejects untyped dimensions, invalid filters/tolerance, and allow-unchanged metric exemptions',()=>{
  for(const mutate of [d=>{d.cases[0].values=['20']},d=>{d.tolerance=-1},d=>{d.catalogs=[]},d=>{d.catalogs=['a','a']},d=>{d.portNames=[]},d=>{d.baselinePolicy='allow-unchanged'}]){
    const f=scenario();mutate(f.manual.rules[0].constraints[2].dependency);
    assert.ok(core.compileManualSource(f.manual,f.evidence).issues.some(i=>i.code==='CONSTRAINT_DEPENDENCY'));
  }
});

test('r15 nominal variant property: both sides and all host sizes; geometry remains independent',()=>{
  const r15=require('./fixtures/button-addon-size-rule-r15.json');
  for(const size of [32,40,48,56,64,72])for(const side of ['left','right']){
    const f=scenario(size,side);
    for(const constraint of r15.constraints.slice(4)){
      const c=clone(constraint);c.dependency.subjects=c.dependency.subjects.filter(s=>s.targetRole===`${side}-addon`);
      f.manual.rules[0].constraints.push(c);
    }
    f.icon.component.propertyTypes.Size='VARIANT';f.icon.component.properties.Size=size<=40?'20':'24';
    const expectedIndex=size<=40?5:6;
    assert.equal(f.run().checks[expectedIndex].classification,'compliant',`${size}/${side}`);
    f.icon.component.properties.Size=size<=40?'24':'20';
    const wrong=f.run();assert.equal(wrong.checks[expectedIndex].classification,'violation');
    assert.ok(wrong.checks.slice(2,4).every(c=>c.classification==='compliant'));
    f.slot.visible=false;assert.ok(f.run().checks.every(c=>c.classification==='not-applicable'));
  }
});

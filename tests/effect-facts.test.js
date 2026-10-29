const test=require('node:test'),assert=require('node:assert/strict');
const {paletteScenario,manual,core,clone}=require('./helpers/button-spinner-palette');
const id='component:web-core.button.backdrop-blur-maps-to-control-blur';
const style='01c83f6e3a7dcc11f03eb6e99064b356ba9ac1a9',blur={type:'BACKGROUND_BLUR',visible:true,radius:80};
function fixture(enabled=true){
 const f=paletteScenario();f.manual.rules=[clone(manual.rules.find(r=>r.id===id))];
 const details=core.captureEffectDetails(enabled?[blur]:[],enabled?`S:${style},library`:'');
 f.root.appearance.effectDetailsV1=clone(details);
 f.root.baseline.effective.appearance.effectDetailsV1=clone(details);
 return {...f,check:()=>f.run().engine.evaluations.find(e=>e.ruleId.startsWith(id+'.'))};
}
test('ControlBlur has an intrinsic library-baseline rule, not an expected-input or universal disabled matrix',()=>{
 const r=manual.rules.find(r=>r.id===id);
 assert.equal(r.execution.route,'predicate');assert.equal(r.applicability.validationMode,undefined);
 assert.deepEqual(r.applicability.platforms,['desktop','mobile-web']);
 assert.deepEqual(r.constraints,[{type:'propertyForbidden',fact:'appearance.effectDetailsV1'}]);
});
test('published style identity ignores imported suffix, but never equates custom/local styles',()=>{
 assert.deepEqual(core.captureEffectDetails([blur],`S:${style},a`),core.captureEffectDetails([blur],`S:${style},b`));
 assert.notDeepEqual(core.captureEffectDetails([blur],`S:${style},a`),core.captureEffectDetails([blur],'30:55'));
 assert.equal(core.captureEffectDetails([{type:'BACKGROUND_BLUR'}],''),undefined);
 assert.equal(core.captureEffectDetails(null,''),undefined);assert.equal(core.captureEffectDetails([],undefined),undefined);
});
test('each independent reference can require ON or OFF; missing/extra/hidden/changed radius/style are violations',()=>{
 for(const enabled of [false,true]){const f=fixture(enabled);assert.equal(f.check().classification,'compliant');
  f.root.appearance.effectDetailsV1=core.captureEffectDetails(enabled?[]:[blur],enabled?'':`S:${style},a`);
  assert.equal(f.check().classification,'violation');}
 for(const change of [d=>d.effects[0].radius=40,d=>d.effects[0].visible=false,d=>d.effects.push(clone(blur)),d=>d.styleRef='local:custom',d=>d.styleRef=null]){
  const f=fixture();change(f.root.appearance.effectDetailsV1);assert.equal(f.check().classification,'violation');}
});
test('missing effect evidence is unknown, never an empty selector or a synthesized radius/style',()=>{
 for(const change of [f=>delete f.root.appearance.effectDetailsV1,f=>delete f.root.baseline.effective.appearance.effectDetailsV1,f=>f.root.unknownFacts.push('appearance.effectDetailsV1')]){
  const f=fixture();change(f);const result=f.run();assert.equal(f.check().classification,'human-review');assert.equal(result.report.scenarioCoverage.complete,false);}
});
test('raw capture and independent reference survive exact exported snapshot replay',()=>{
 const f=fixture(),r=f.run();assert.deepEqual(core.evaluateCompiledContract(core.prepareValidationSnapshot(f.snapshot,r.contract),r.contract),r.engine);
 assert.deepEqual(core.prepareValidationSnapshot(core.prepareValidationSnapshot(f.snapshot,r.contract),r.contract),core.prepareValidationSnapshot(f.snapshot,r.contract));
});
test('dependency context rejects overlap, unknown facts, wrong values, empty maps; valid disjoint surfaces compile',()=>{
 for(const edit of [d=>d.cases[2].context={'semanticApi.colors':'default'},d=>d.cases[2].context={'semanticApi.colors':'unknown'},d=>d.cases[2].context={'semanticApi.unknown':true},d=>d.cases[2].context={},d=>delete d.cases[2].context]){
  const f=paletteScenario();edit(f.manual.rules[0].constraints[0].dependency);assert.ok(f.run().compiled.issues.some(i=>i.code==='CONSTRAINT_DEPENDENCY'));}
 assert.deepEqual(paletteScenario({surface:'inverted'}).run().compiled.issues.filter(i=>i.level==='error'),[]);
});

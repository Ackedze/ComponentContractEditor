// The browser bundle must execute the same independently authored core policies.
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../dist/core.cjs');
const {fixture}=require('../../Apollo/packages/component-contract-core/tests/helpers/asset-identity-lock.cjs');
const {aliasFixture}=require('../../Apollo/packages/component-contract-core/tests/helpers/main-component-aliases.cjs');
test('Editor bundled core enforces conditional exact asset identity without asset catalog membership',()=>{
  const f=fixture(core),c=f.compile();assert.deepEqual(c.issues,[]);
  const classify=()=>core.evaluateCompiledContract(f.snapshot,c.contract).evaluations.map(e=>e.classification);
  assert.deepEqual(classify(),['not-applicable','not-applicable','not-applicable','compliant']);
  const icon=f.snapshot.nodes.find(n=>n.id==='icon-4');icon.component.identity.componentKey='other-icon';
  assert.equal(classify().at(-1),'violation');
  delete f.snapshot.variantReference;assert.equal(classify().at(-1),'human-review');
});
test('Editor bundle preserves a restored icon across different local main IDs without accepting a replacement',()=>{
 const f=aliasFixture(core),c=f.compile().contract;
 assert.equal(core.evaluateCompiledContract(f.snapshot,c).evaluations.at(-1).classification,'compliant');
 f.snapshot.nodes.find(n=>n.id==='icon-4').component.identity.componentKey='replacement';
 f.snapshot.nodes.find(n=>n.id==='glyph-4').component.sourceIdentity.ownerComponentKey='replacement';
 assert.equal(core.evaluateCompiledContract(f.snapshot,c).evaluations.at(-1).classification,'violation');
});

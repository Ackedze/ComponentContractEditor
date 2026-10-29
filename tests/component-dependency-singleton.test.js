const test=require('node:test'),assert=require('node:assert/strict');
const {scenario,clone,core,childContract}=require('./helpers/button-spinner');

test('fixed child paths also resolve from the component root, without a leading separator',()=>{
  const f=scenario(),r=f.run(),snapshot=core.prepareValidationSnapshot(f.snapshot,r.contract);
  // The reusable fixture embeds child-local roles; a real host capture remaps them.
  for(const n of snapshot.nodes)if(n.id!==snapshot.selection[0]&&n.semantic?.role==='root')n.semantic.role='child-root';
  snapshot.nodes[0].variantAvailability.targets.root={present:true};
  const binding={id:'root-child',targetRole:'root',relativePath:'',ownerComponentSetKeys:[f.root.component.identity.componentSetKey],activeVariant:{property:'Size',values:['40']},childPath:'LeftAddon / LeftAddon / Spinner'};
  const result=core.resolveFixedNestedBinding(snapshot,r.contract.componentDependencies[0],binding);
  assert.equal(result.status,'active',JSON.stringify(result));
  assert.equal(result.identityValid,true);
});

test('standalone dependency capture resolves by componentKey, never by a missing set key',()=>{
  const f=scenario(),contract=clone(childContract),root=f.child.nodes.find(n=>f.child.selection.includes(n.id));
  delete root.component.identity.componentSetKey;
  f.child.source.componentSetKey='';
  f.syncActual();
  contract.facts.representations=[{id:'singleton',kind:'figma',platform:'universal',status:'verified',locator:{componentKey:root.component.identity.componentKey}}];
  const nodeId=f.nodeMap[f.child.selection[0]];
  const valid=core.validatedDependencyCapture(f.snapshot,nodeId,contract);
  assert.ok(valid.snapshot,JSON.stringify(valid));
  contract.facts.representations[0].locator.componentKey='foreign';
  assert.equal(core.validatedDependencyCapture(f.snapshot,nodeId,contract).reason,'dependency-representation-unresolved');
  delete contract.facts.representations[0].locator.componentKey;
  assert.equal(core.validatedDependencyCapture(f.snapshot,nodeId,contract).reason,'dependency-representation-unresolved');
});

test('two representations with the same singleton identity remain ambiguous',()=>{
  const f=scenario(),contract=clone(childContract);
  contract.facts.representations.push(clone(contract.facts.representations[0]));
  assert.equal(core.validatedDependencyCapture(f.snapshot,f.nodeMap[f.child.selection[0]],contract).reason,'dependency-representation-unresolved');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const fixture = require('./fixtures/button-variants.json');
const clone = x => JSON.parse(JSON.stringify(x));

test('Athena standalone raw grouping is not mistaken for a live Figma variant property',()=>{
  const root={id:'root',parentId:null,childIds:[],order:0,name:'[D] CorporateContent',type:'INSTANCE',visible:true,
    semantic:{path:'[D] CorporateContent'},component:{properties:{},propertyTypes:{},propertyReferences:[],propertyReferenceBindings:{},
      identity:{componentKey:'corporate-content',mainComponentId:'main'}}};
  const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'fixture',selection:['root'],
    source:{instanceIdentityVersion:1,componentKey:'corporate-content',componentSetKey:'',truncated:false,nodeLimit:500},
    context:{platform:'desktop',modes:{},unknownFacts:[]},nodes:[root]};
  snapshot.variantReference=core.captureVariantReference(snapshot,'corporate-content','');
  const shape=snapshot.variantReference.nodes,structureId=core.stableHash(shape);
  const contract={package:{snapshotProfile:'variant-facts-v4'},facts:{
    variantEvidence:{structures:{[structureId]:shape},variants:[{componentKey:'corporate-content',
      componentSetKey:'corporate-content',structureId,properties:{raw:'[D] CorporateContent'}}]},
    targets:[{id:'target.root',semanticRole:'root',pathHint:'[D] CorporateContent',resolution:'resolved'}],
    representations:[{id:'figma.desktop',kind:'figma',platform:'desktop',status:'active',locator:{componentKey:'corporate-content'}}]}};
  const availability=core.variantAvailability(snapshot,contract);
  assert.equal(availability.status,'verified');
  assert.equal(availability.targets.root.state,'present');
  root.component.properties.raw='Different';
  root.component.propertyTypes.raw='VARIANT';
  snapshot.variantReference=core.captureVariantReference(snapshot,'corporate-content','');
  assert.equal(core.variantAvailability(snapshot,contract).reason,'variant-properties-mismatch');
});

function scenario(singleIcon = true, representation = 0) {
  const manual = clone(fixture.manual);
  const evidence = core.extractVariantEvidence(fixture.candidates);
  const candidate = fixture.candidates[representation];
  const variant = evidence.variants.find(v=>v.componentSetKey===candidate.componentKey && v.properties.SingleIcon === String(singleIcon ? 'True':'False'));
  const shape = evidence.structures[variant.structureId];
  const nodes = shape.map((n,i)=>({ id:`n${i}`,name:n.path.split(' / ').pop()||candidate.name,
    parentId:n.path ? `n${shape.findIndex(p=>p.path===n.path.split(' / ').slice(0,-1).join(' / '))}` : null,
    childIds:[],type:n.path?n.type:'INSTANCE',order:i,visible:true,
    semantic:{role:n.path.toLowerCase().replace(/[^a-z0-9]+/g,'-')||'root',path:[candidate.name,n.path].filter(Boolean).join(' / ')},
    component:{ propertyReferences:[] }, unknownFacts:[] }));
  nodes.forEach(n=>{if(n.parentId) nodes.find(p=>p.id===n.parentId).childIds.push(n.id)});
  const root=nodes.find(n=>n.parentId===null);
  nodes.filter(n=>n.type==='INSTANCE').forEach(n=>{n.component.identity={componentKey:`fixture:${representation}:${n.semantic.path}`,mainComponentId:`fixture-main:${n.id}`};});
  root.component={properties:{...variant.properties},propertyTypes:Object.fromEntries(Object.keys(variant.properties).map(k=>[k,'VARIANT'])),propertyReferences:[]};
  const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-25T00:00:00Z',source:{fileName:'fixture',pageId:'p',rootNodeId:root.id,componentKey:variant.componentKey,componentSetKey:variant.componentSetKey,truncated:false,nodeLimit:500},selection:[root.id],context:{platform:candidate.platform,modes:{},unknownFacts:[]},nodes};
  snapshot.variantReference=core.captureVariantReference(snapshot,variant.componentKey,variant.componentSetKey);
  const run=()=>{
    const compiled=core.compileManualSource(manual,evidence);
    assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
    const contract=core.prepareAuthoringPreviewContract(compiled.contract);
    const engine=core.evaluateCompiledContract(snapshot,contract);
    return {compiled,contract,engine,prepared:core.prepareValidationSnapshot(snapshot,contract),report:core.buildEditorValidationReport(engine,compiled,manual,snapshot)};
  };
  return {manual,evidence,snapshot,root,run};
}

test('real Athena SingleIcon structures: no Label/Hint/RightAddon, two checks pass in all four representations',()=>{
  for(let i=0;i<4;i++){
    const f=scenario(true,i),before=JSON.stringify(f.manual),r=f.run();
    assert.deepEqual(r.engine.evaluations.map(e=>e.classification),['compliant','compliant']);
    assert.equal(r.report.scenarioCoverage.complete,true);
    assert.equal(r.prepared.nodes[0].variantAvailability.targets.label.present,false);
    assert.equal(r.prepared.nodes[0].semanticTargets['right-addon'].present,false);
    assert.equal(JSON.stringify(f.manual),before);
  }
});

test('switching to the real regular variant excludes SingleIcon; toggling a value on old anatomy cannot prove the new variant',()=>{
  const f=scenario(false);
  assert.ok(f.run().engine.evaluations.every(e=>e.classification==='not-applicable'));
  f.root.component.properties.SingleIcon='True';
  assert.equal(f.run().prepared.nodes[0].variantAvailability.status,'unknown');
  assert.ok(f.run().engine.evaluations.every(e=>e.classification==='human-review'));
});

test('no absence proof on stale keys, reference drift, truncation, missing evidence, cycles or unknown targets',()=>{
  const mutations=[
    f=>{delete f.snapshot.variantReference},
    f=>{f.snapshot.source.componentKey='other'},
    f=>{f.snapshot.variantReference.nodes[1].path='renamed'},
    f=>{f.snapshot.source.truncated=true},
    f=>{f.snapshot.variantReference.complete=false},
    f=>{f.snapshot.nodes[1].parentId='missing'},
    f=>{f.manual.targets.find(t=>t.semanticRole==='label').pathHint='Button / Text / typo'},
    f=>{f.manual.targets.find(t=>t.semanticRole==='label').resolution='ambiguous'},
  ];
  for(const mutate of mutations){const f=scenario();mutate(f);const r=f.run();assert.equal(r.report.scenarioCoverage.complete,false);assert.ok(r.engine.evaluations.some(e=>e.classification==='human-review'));}
});

test('visible slot can be hidden: known zero is a violation, not an unresolved target',()=>{
  const f=scenario();f.snapshot.nodes.find(n=>n.semantic.path.endsWith(' / LeftAddon')).visible=false;
  assert.equal(f.run().engine.evaluations[0].classification,'violation');
});

test('missing actually expected slot is unknown, never a confirmed absence',()=>{
  const f=scenario();f.snapshot.nodes=[f.root];f.root.childIds=[];
  assert.equal(f.run().engine.evaluations[0].classification,'human-review');
});

test('absent semantic target property produces an explicit not-applicable, not a missing-selector gap',()=>{
  const f=scenario();f.manual.rules=[{...f.manual.rules[0],targetId:'target.label',constraints:[{type:'propertyDomain',fact:'visible',values:[true]}]}];
  const r=f.run();assert.equal(r.engine.evaluations[0].classification,'not-applicable');assert.equal(r.report.scenarioCoverage.complete,true);
});

test('unused family boolean is not false: it is not applicable in the variant with no consumer',()=>{
  const f=scenario();f.manual.rules=[{...f.manual.rules[0],constraints:[{type:'propertyDomain',fact:'semanticApi.hintVisible',values:[false]}]}];
  f.root.component.properties['Hint#4:8']=true;f.root.component.propertyTypes['Hint#4:8']='BOOLEAN';
  f.snapshot.variantReference=core.captureVariantReference(f.snapshot,f.snapshot.source.componentKey,f.snapshot.source.componentSetKey);
  const r=f.run();assert.equal(r.prepared.nodes[0].semanticApi.hintVisible,true);assert.equal(r.engine.evaluations[0].classification,'not-applicable');
  f.snapshot.variantReference.propertyReferences.push('Hint#4:8');
  assert.equal(f.run().engine.evaluations[0].classification,'violation');
});

test('direct Component Property rules also respect consumers, and display availability instead of a fake diff',()=>{
  const f=scenario();f.manual.rules=[{...f.manual.rules[0],capability:'component.properties.Hint#4:8',constraints:[{type:'propertyDomain',values:[false]}]}];
  f.root.component.properties['Hint#4:8']=true;f.root.component.propertyTypes['Hint#4:8']='BOOLEAN';
  f.snapshot.variantReference=core.captureVariantReference(f.snapshot,f.snapshot.source.componentKey,f.snapshot.source.componentSetKey);
  const r=f.run();assert.equal(r.engine.evaluations[0].classification,'not-applicable');
  const detail=core.buildEvaluationDetails(r.engine,r.contract,[])[0];
  assert.match(detail.reasonLabel,/недоступны/);assert.equal(detail.showComparison,false);
  f.snapshot.variantReference.nodeProperties[''].propertyReferences.push('Hint#4:8');
  assert.equal(f.run().engine.evaluations[0].classification,'violation');
});

test('property consumers in a nested instance cannot activate a host property with the same name',()=>{
  const f=scenario();
  const inner=f.snapshot.nodes.find(n=>n.type==='INSTANCE'&&n.parentId!==null);
  const child=f.snapshot.nodes.find(n=>n.parentId===inner.id);
  child.component.propertyReferences=['Hint#4:8'];
  const ref=core.captureVariantReference(f.snapshot,f.snapshot.source.componentKey,f.snapshot.source.componentSetKey);
  assert.equal(ref.propertyReferences.includes('Hint#4:8'),false);
  const path=inner.semantic.path.split(' / ').slice(1).join(' / ');
  assert.ok(ref.nodeProperties[path].propertyReferences.includes('Hint#4:8'));
});

test('a conditional mismatch is not mislabeled as an unavailable property',()=>{
  const f=scenario(false);f.manual.rules=[{...f.manual.rules[0],constraints:[{type:'propertyDomain',fact:'semanticApi.singleIcon',values:[false]}]}];
  const r=f.run();assert.equal(r.engine.evaluations[0].classification,'not-applicable');
  assert.doesNotMatch(core.buildEvaluationDetails(r.engine,r.contract,[])[0].reasonLabel,/недоступны/);
});

test('variant facts survive bundle/session/replay without becoming manual source',()=>{
  const f=scenario(),r=f.run();
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.contract),r.prepared);
  assert.deepEqual(core.evaluateCompiledContract(r.prepared,r.contract),r.engine);
  const bundle=core.buildExportBundle(f.manual,f.evidence);
  assert.deepEqual(bundle.compiled.facts.variantEvidence,f.evidence);
  assert.equal(bundle.manual.variantEvidence,undefined);
  const ws={manual:f.manual,variantEvidence:f.evidence,variants:[],anatomy:[],tokens:[],warnings:[],hasVariantEvidence:true};
  assert.deepEqual(core.parseEditorSession(core.createEditorSession(ws,{workspaceMode:'validation',validationProduct:'ab',scenarioProperties:{},activeModes:{}})).workspace.variantEvidence,f.evidence);
});

test('malformed/generated patch evidence fails closed instead of silently using default anatomy',()=>{
  const bad=clone(fixture.candidates);bad[0].figma.variantStructures[bad[0].figma.variants.variantKeys[1].key]=[{op:'unsupported',id:1}];
  assert.equal(core.extractVariantEvidence(bad).variants.length,7);
});

test('missing availability evidence is unknown for property rules, never a false not-applicable',()=>{
  for(const fact of ['semanticApi.singleIcon','component.properties.SingleIcon','visible']){
    const f=scenario();f.manual.rules=[{...f.manual.rules[0],constraints:[{type:'propertyDomain',fact,values:[true]}]}];
    delete f.snapshot.variantReference;
    const r=f.run();assert.ok(r.engine.evaluations.every(e=>e.classification==='human-review'));
    assert.equal(r.report.scenarioCoverage.complete,false);
  }
});

test('availability unknown markers are cleared when fresh verified evidence arrives',()=>{
  const f=scenario();const reference=clone(f.snapshot.variantReference);delete f.snapshot.variantReference;
  const unknown=f.run().prepared;
  unknown.variantReference=reference;
  const recovered=core.prepareValidationSnapshot(unknown,f.run().contract);
  assert.equal(recovered.nodes[0].unknownFacts.some(p=>p==='variantAvailability.targets.label.present'),false);
  assert.equal(recovered.nodes[0].variantAvailability.targets.label.present,false);
});

test('compiler includes generated anatomy only for representations owned by this contract',()=>{
  const f=scenario();f.evidence.variants.push({...f.evidence.variants[0],componentSetKey:'unrelated',componentKey:'foreign'});
  assert.equal(f.run().contract.facts.variantEvidence.variants.some(v=>v.componentKey==='foreign'),false);
});

test('unrecognized property binding is unknown; known family property absent from variant is not applicable',()=>{
  const f=scenario();f.manual.rules=[{...f.manual.rules[0],constraints:[{type:'propertyDomain',fact:'semanticApi.hintVisible',values:[false]}]}];
  assert.equal(f.run().engine.evaluations[0].classification,'human-review');
  f.snapshot.variantReference=core.captureVariantReference(f.snapshot,f.snapshot.source.componentKey,f.snapshot.source.componentSetKey,['Hint#4:8']);
  assert.equal(f.run().engine.evaluations[0].classification,'not-applicable');
});

function deferredRule(f, route, patch = {}) {
  return {
    ...clone(f.manual.rules[0]), id:'test:variant-coverage', targetId:'target.text',
    targetScope:'self-and-descendants', capability:'appearance.opacity',
    constraints:[{type:'propertyDomain',fact:'appearance.opacity',values:[1]}],
    applicability:{variants:'all',modes:'all',platforms:['desktop','mobile-web']},
    execution:route==='delegated' ? {route,externalRuleIds:['test:external']}
      : {route,missingFacts:['appearance.opacity']}, ...patch,
  };
}

test('all routes exclude property checks on confirmed absent targets, including delegated/subtree rules',()=>{
  for(const route of ['predicate','context-only','delegated']) for(const targetId of ['target.text','target.label']) {
    const f=scenario();f.manual.rules=[deferredRule(f,route,{targetId})];
    const before=JSON.stringify({manual:f.manual,snapshot:f.snapshot});
    const r=f.run(),entry=r.report.evaluations[0];
    assert.equal(entry.classification,'not-applicable');
    assert.equal(r.report.scenarioCoverage.complete,true);
    const detail=core.buildEvaluationDetails(r.report,r.contract,[])[0];
    assert.match(detail.reasonLabel,/недоступны/);assert.equal(detail.showComparison,false);
    if(route!=='predicate') {
      assert.equal(r.engine.evaluations.length,0,'coverage must not execute deferred constraints');
      assert.equal(r.report.contractReadiness.status,'draft');
      assert.equal(r.report.contractReadiness.unimplementedRules,1);
      assert.ok(entry.packageGapReasons.length);
    }
    assert.equal(JSON.stringify({manual:f.manual,snapshot:f.snapshot}),before);
  }
});

test('real regular variant still needs its deferred text checks; True/False/True does not rewrite manual',()=>{
  for(const route of ['context-only','delegated']) {
    const manual=deferredRule(scenario(),route),before=JSON.stringify(manual);
    for(const flag of [true,false,true]) {
      const f=scenario(flag);f.manual.rules=[manual];const r=f.run();
      assert.equal(r.report.evaluations[0].classification,flag?'not-applicable':'not-executed');
      assert.equal(r.report.scenarioCoverage.notExecuted,flag?0:1);
      assert.equal(JSON.stringify(manual),before);
    }
  }
});

test('coverage cannot exclude absent-looking targets on missing, stale, truncated or ambiguous evidence',()=>{
  const mutations=[
    f=>{delete f.snapshot.variantReference},
    f=>{f.snapshot.source.truncated=true},
    f=>{f.snapshot.variantReference.complete=false},
    f=>{f.snapshot.variantReference.nodes[1].path='stale'},
    f=>{f.snapshot.source.componentKey='other'},
    f=>{f.manual.targets.find(t=>t.id==='target.text').resolution='ambiguous'},
    f=>{f.manual.targets.find(t=>t.id==='target.text').pathHint='[D] Button / typo'},
  ];
  for(const route of ['context-only','delegated']) for(const mutate of mutations) {
    const f=scenario();f.manual.rules=[deferredRule(f,route)];mutate(f);const r=f.run();
    assert.equal(r.report.evaluations[0].classification,'not-executed');
    assert.equal(r.report.scenarioCoverage.unknownApplicabilityRules,1);
    assert.equal(r.report.scenarioCoverage.complete,false);
  }
});

test('structural probes remain applicable on an absent target: presence, absence, quantity and order',()=>{
  // Deliberately artificial authoring rules test compiler safety, not Button policy.
  const constraints=[
    {type:'presence',expected:true}, {type:'presence',expected:false},
    {type:'quantity',min:1,max:1}, {type:'positionOrder',order:['label']},
  ];
  for(const route of ['context-only','delegated']) for(const constraint of constraints) {
    const f=scenario();f.manual.rules=[deferredRule(f,route,{targetId:'target.label',targetScope:'self',constraints:[constraint]})];
    const entry=f.run().report.evaluations[0];
    assert.equal(entry.classification,'not-executed');assert.equal(entry.applicability,'applicable');
  }
  for(const [constraint,expected] of [[constraints[0],'violation'],[constraints[1],'compliant'],[constraints[2],'violation']]) {
    const f=scenario();f.manual.rules=[deferredRule(f,'predicate',{targetId:'target.label',targetScope:'self',constraints:[constraint]})];
    assert.equal(f.run().engine.evaluations[0].classification,expected);
  }
});

test('a compound rule cannot be excluded when it also requires the missing element',()=>{
  for(const route of ['predicate','context-only','delegated']) {
    const f=scenario();f.manual.rules=[deferredRule(f,route,{targetId:'target.label',constraints:[
      {type:'propertyDomain',fact:'appearance.opacity',values:[1]}, {type:'presence',expected:true},
    ]})];
    const r=f.run();
    if(route==='predicate') assert.ok(r.engine.evaluations.some(e=>e.classification==='violation'));
    else assert.equal(r.report.evaluations[0].classification,'not-executed');
  }
});

test('deferred API/property checks respect variant consumers; partially applicable compound rules stay pending',()=>{
  for(const route of ['context-only','delegated']) for(const fact of ['semanticApi.hintVisible','component.properties.Hint#4:8']) {
    const f=scenario();f.root.component.properties['Hint#4:8']=true;f.root.component.propertyTypes['Hint#4:8']='BOOLEAN';
    f.snapshot.variantReference=core.captureVariantReference(f.snapshot,f.snapshot.source.componentKey,f.snapshot.source.componentSetKey);
    f.manual.rules=[deferredRule(f,route,{targetId:'target.root',targetScope:'self',constraints:[{type:'propertyDomain',fact,values:[false]}]})];
    assert.equal(f.run().report.evaluations[0].classification,'not-applicable');
    f.manual.rules[0].constraints.push({type:'propertyDomain',fact:'semanticApi.size',values:[56]});
    assert.equal(f.run().report.evaluations[0].classification,'not-executed');
    f.manual.rules[0].constraints[1]={type:'propertyDomain',fact:'appearance.opacity',values:[1]};
    assert.equal(f.run().report.evaluations[0].classification,'not-executed');
    f.manual.rules[0].constraints.pop();delete f.snapshot.variantReference;
    assert.equal(f.run().report.evaluations[0].applicability,'unknown');
  }
});

test('forbidden default and capability sets use the same deferred absence gate',()=>{
  const f=scenario();f.manual.rules=[deferredRule(f,'context-only',{permission:'forbidden',constraints:[]})];
  assert.equal(f.run().report.evaluations[0].classification,'not-applicable');
  f.manual.rules[0].capabilitySet='visual-style@1';
  f.manual.rules[0].capabilitySelection=['appearance.opacity','appearance.radius'];
  assert.equal(f.run().report.evaluations[0].classification,'not-applicable');
  f.manual.rules[0].constraints=[{type:'propertyForbidden'},{type:'tokenBinding',bindingRequired:true}];
  assert.equal(f.run().report.evaluations[0].classification,'not-applicable');
});

test('legacy contracts do not infer availability from a newer snapshot',()=>{
  const f=scenario();f.manual.rules=[deferredRule(f,'context-only')];
  const prepared=f.run().prepared,legacy=core.compileManualSource(f.manual);
  const engine=core.evaluateCompiledContract(prepared,legacy.contract);
  const report=core.buildEditorValidationReport(engine,legacy,f.manual,prepared);
  assert.equal(report.evaluations[0].classification,'not-executed');
  assert.equal(report.scenarioCoverage.unknownApplicabilityRules,1);
});

test('relationship applicability does not invent a component-property dependency on an addon wrapper',()=>{
  const f=scenario();f.manual.rules=[deferredRule(f,'context-only',{
    targetId:'target.left-addon',targetScope:'self',capability:'component-property.Size',
    constraints:[{type:'relationship',relation:'ancestor',targetRole:'root'}],
  })];
  const entry=f.run().report.evaluations[0];
  assert.equal(entry.classification,'not-executed');assert.equal(entry.applicability,'applicable');
});

// Real Athena anatomy + explicitly modelled Plugin API identity/port facts.
// These adapter fixtures are not a claim of a fresh live Figma capture.
function swapScenario(rename = true) {
  const f=scenario(),nodes=f.snapshot.nodes;
  const owner=nodes.find(n=>n.type==='INSTANCE'&&n.parentId!==null);
  const icon=nodes.find(n=>n.type==='INSTANCE'&&n!==owner&&n.parentId!==null);
  const property='Icon-24#13:0';
  owner.component.properties={[property]:icon.component.identity.mainComponentId};
  owner.component.propertyTypes={[property]:'INSTANCE_SWAP'};
  icon.component.propertyReferenceBindings={mainComponent:property};
  icon.component.propertyReferences=[property];
  nodes.forEach(n=>{n.appearance={opacity:1};});
  const reference=clone(f.snapshot);
  f.snapshot.variantReference=core.captureVariantReference(reference,reference.source.componentKey,reference.source.componentSetKey);
  owner.component.properties[property]='new-main-component-id';
  icon.component.identity={componentKey:'new-icon-key',mainComponentId:'new-main-component-id'};
  if(rename) {
    const oldPath=icon.semantic.path;icon.name='replacement-icon';
    nodes.filter(n=>n.semantic.path===oldPath||n.semantic.path.startsWith(oldPath+' / ')).forEach(n=>{
      n.semantic.path=n.semantic.path.replace(oldPath,oldPath.split(' / ').slice(0,-1).concat(icon.name).join(' / '));
    });
  }
  return {...f,reference,owner,icon,property};
}

test('swap via explicit owner/port isolates payload, preserving host anatomy and both SingleIcon checks',()=>{
  const f=swapScenario(),before=JSON.stringify({manual:f.manual,snapshot:f.snapshot});
  const r=f.run(),root=r.prepared.nodes[0];
  assert.equal(root.variantAvailability.status,'partial');
  assert.equal(root.variantAvailability.targets.root.present,true);
  assert.equal(root.variantAvailability.targets.label.present,false);
  assert.deepEqual(r.engine.evaluations.map(e=>e.classification),['compliant','compliant']);
  assert.equal(r.report.scenarioCoverage.complete,false);
  assert.equal(r.report.scenarioCoverage.notExecuted,1);
  assert.equal(r.prepared.instanceBoundaries.length,1);
  assert.equal(r.prepared.instanceBoundaries[0].reason,'instance-swap');
  assert.equal(r.prepared.instanceBoundaries[0].property,f.property);
  const gap=r.report.evaluations.find(e=>e.ruleId.startsWith('instance-boundary:'));
  assert.equal(gap.subjectNodeId,f.icon.id);assert.match(gap.trace.reason,/Допустимость замены/);
  assert.equal(JSON.stringify({manual:f.manual,snapshot:f.snapshot}),before);
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.contract),r.prepared);
  assert.deepEqual(core.evaluateCompiledContract(r.prepared,r.contract),r.engine);
});

test('strict baseline never maps an old icon or its same-named child into a replacement subtree',()=>{
  for(const rename of [true,false]) {
    const f=swapScenario(rename);
    const m=core.materializeEffectiveBaseline(f.snapshot,f.reference,true);
    const child=f.snapshot.nodes.find(n=>n.parentId===f.icon.id);
    assert.equal(m.matchedNodes,5);
    assert.deepEqual(m.unmatchedNodeIds,[f.icon.id,child.id]);
    for(const id of m.unmatchedNodeIds) assert.deepEqual(m.snapshot.nodes.find(n=>n.id===id).baseline.effective,{});
    assert.equal(m.snapshot.nodes[0].baseline.effective.appearance.opacity,1);
    const prepared=core.prepareValidationSnapshot(m.snapshot,f.run().contract);
    assert.equal(prepared.nodes.find(n=>n.id===child.id).semantic.role,undefined);
  }
});

test('same-name changed identity without a swap port is isolated, never accepted as the old component',()=>{
  const f=swapScenario(false);delete f.icon.component.propertyReferenceBindings;
  const r=f.run();assert.equal(r.prepared.instanceBoundaries[0].reason,'component-identity-changed');
  assert.equal(r.report.scenarioCoverage.notExecuted,1);
});

test('missing identity is local uncertainty, not permission and not a baseline name match',()=>{
  const f=swapScenario(false);delete f.icon.component.identity;
  const r=f.run();assert.equal(r.prepared.instanceBoundaries[0].reason,'instance-identity-unavailable');
  assert.deepEqual(r.engine.evaluations.map(e=>e.classification),['compliant','compliant']);
  assert.equal(r.report.scenarioCoverage.complete,false);
  assert.ok(core.materializeEffectiveBaseline(f.snapshot,f.reference,true).unmatchedNodeIds.includes(f.icon.id));
});

test('an unproven rename/port, duplicate consumer, moved port or drift outside the subtree fails closed',()=>{
  const mutations=[
    f=>{delete f.icon.component.propertyReferenceBindings},
    f=>{f.owner.component.propertyTypes[f.property]='BOOLEAN'},
    f=>{f.owner.component.properties[f.property]='wrong-id'},
    f=>{const refPath=f.reference.nodes.find(n=>n.id===f.icon.id).semantic.path.split(' / ').slice(1).join(' / ');delete f.snapshot.variantReference.nodeProperties[refPath].propertyReferenceBindings;},
    f=>{const duplicate=clone(f.icon);duplicate.id='duplicate-slot';duplicate.name='another-icon';duplicate.childIds=[];f.snapshot.nodes.push(duplicate);f.snapshot.nodes.find(n=>n.id===duplicate.parentId).childIds.push(duplicate.id);},
    f=>{const parent=f.snapshot.nodes.find(n=>n.id===f.icon.parentId),grandparent=f.snapshot.nodes.find(n=>n.id===parent.parentId);parent.childIds=parent.childIds.filter(id=>id!==f.icon.id);grandparent.childIds.push(f.icon.id);f.icon.parentId=grandparent.id;},
    f=>{f.snapshot.nodes[1].name='outside-renamed'},
  ];
  for(const mutate of mutations) {
    const f=swapScenario();mutate(f);const r=f.run();
    assert.equal(r.prepared.nodes[0].variantAvailability.status,'unknown');
    assert.ok(r.engine.evaluations.every(e=>e.classification==='human-review'));
  }
});

test('host self-and-descendants checks still catch a root override while swap content has a separate gap',()=>{
  const f=swapScenario();
  f.manual.rules.push(deferredRule(f,'predicate',{id:'test:host-opacity',targetId:'target.root',targetScope:'self-and-descendants',permission:'forbidden',constraints:[]}));
  f.root.appearance.opacity=0.2;
  const materialized=core.materializeEffectiveBaseline(f.snapshot,f.reference,true);
  const compiled=core.compileManualSource(f.manual,f.evidence),contract=core.prepareAuthoringPreviewContract(compiled.contract);
  const engine=core.evaluateCompiledContract(materialized.snapshot,contract),report=core.buildEditorValidationReport(engine,compiled,f.manual,materialized.snapshot);
  const checks=engine.evaluations.filter(e=>e.ruleId.startsWith('test:host-opacity.'));
  assert.equal(checks.length,5);assert.equal(checks.filter(e=>e.classification==='violation').length,1);
  assert.equal(checks.find(e=>e.classification==='violation').subjectNodeId,f.root.id);
  assert.equal(report.scenarioCoverage.notExecuted,1);
});

test('a role named Label inside a replacement payload is not the host Button label',()=>{
  const f=swapScenario();const child=f.snapshot.nodes.find(n=>n.parentId===f.icon.id);
  child.name='Label';child.semantic.role='label';child.semantic.path=child.semantic.path.split(' / ').slice(0,-1).concat('Label').join(' / ');
  assert.deepEqual(f.run().engine.evaluations.map(e=>e.classification),['compliant','compliant']);
});

test('unchanged identity/path uses independent baseline and preserves legacy v3 replay behavior',()=>{
  const f=swapScenario();const m=core.materializeEffectiveBaseline(f.reference,f.reference,true);
  assert.equal(m.matchedNodes,7);assert.deepEqual(m.unmatchedNodeIds,[]);
  const contract=f.run().contract;contract.package.snapshotProfile='variant-facts-v3';
  const old=core.prepareValidationSnapshot(f.snapshot,contract);
  assert.equal(old.nodes[0].variantAvailability.status,'unknown');
  assert.equal(old.instanceBoundaries,undefined);
});

test('strict baseline also rejects a foreign root even when its names and topology match',()=>{
  const f=swapScenario();const foreign=clone(f.reference);foreign.source.componentKey='another-root-key';
  const m=core.materializeEffectiveBaseline(f.reference,foreign);
  assert.equal(m.matchedNodes,0);assert.equal(m.unmatchedNodeIds.length,7);
  assert.ok(m.snapshot.nodes.every(n=>Object.keys(n.baseline.effective).length===0));
});

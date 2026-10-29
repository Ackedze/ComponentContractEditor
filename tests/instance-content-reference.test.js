const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const fixture = require('./fixtures/button-dependencies.json');
const clone = value => JSON.parse(JSON.stringify(value));

// Synthetic independent captures derived from the live topology; never labelled live evidence.
function scenario() {
  const f = clone(fixture), snapshot = f.snapshot, original = snapshot.variantReference;
  const base = clone(snapshot);
  delete base.variantReference; delete base.instanceBoundaries;
  base.source.rootNodeId = 'synthetic-pristine-host';
  base.nodes[5].name = 'diamonds';
  base.nodes.forEach((node, i) => {
    const path = original.nodes[i].path, props = original.nodeProperties[path];
    Object.assign(node, clone(node.baseline.effective));
    node.semantic = {path:[base.nodes[0].name, path].filter(Boolean).join(' / ')};
    node.component = {properties:clone(props.properties), propertyTypes:clone(props.propertyTypes),
      propertyReferences:Object.values(props.propertyReferenceBindings || {}),
      propertyReferenceBindings:clone(props.propertyReferenceBindings || {}), ...(props.identity ? {identity:clone(props.identity)} : {})};
    node.appearance = {...node.appearance, opacity:1};
  });
  assert.deepEqual(core.captureVariantReference(base, base.source.componentKey, base.source.componentSetKey, original.definedProperties), original);
  const reference = clone(base);
  reference.source.rootNodeId = 'synthetic-swapped-host';
  reference.nodes[5].name = snapshot.nodes[5].name;
  for (const i of [5,6]) {
    reference.nodes[i].component = clone(snapshot.nodes[i].component);
    reference.nodes[i].semantic.path = snapshot.nodes[i].semantic.path;
    reference.nodes[i].appearance = {...snapshot.nodes[i].appearance, opacity:1};
  }
  reference.nodes[2].component.properties['Icon-24#13:0'] = snapshot.nodes[5].component.identity.mainComponentId;
  snapshot.instanceContentReferences = {schemaVersion:'apollo.instance-content-references.v1',base,attempts:[{boundaryNodeId:'preview:5',reference}]};
  f.manual.rules.push({...clone(f.manual.rules[0]), id:'fixture:host-opacity', targetScope:'self-and-descendants',
    capability:'appearance.opacity', permission:'forbidden', controlPaths:[], constraints:[], message:'No opacity override'});
  const compiled = core.compileManualSource(f.manual, f.evidence);
  assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
  const run = () => {
    const contract = compiled.contract;
    const prepared = core.prepareValidationSnapshot(snapshot, contract);
    const engine = core.evaluateCompiledContract(snapshot, contract);
    const report = core.buildEditorValidationReport(engine,compiled,f.manual,snapshot);
    return {prepared,engine,report,compiled};
  };
  return {...f,snapshot,base,reference,run};
}

test('independent host reference verifies new icon internals without approving its catalog', () => {
  const f=scenario(); f.snapshot.nodes[6].appearance.opacity=0.3;
  const before=JSON.stringify(f.snapshot),r=f.run();
  assert.equal(r.prepared.instanceContentResults[0].status,'matched');
  assert.deepEqual(r.prepared.instanceContentResults[0].matchedNodeIds,['preview:5','preview:6']);
  assert.equal(r.prepared.nodes[6].baseline.effective.appearance.opacity,1);
  assert.equal(r.prepared.nodes[6].baselineProvenance.kind,'independent-host-swap');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-opacity')&&e.subjectNodeId==='preview:6').classification,'violation');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'violation');
  assert.ok(!r.report.evaluations.some(e=>e.ruleId==='instance-boundary:preview:5'));
  assert.equal(JSON.stringify(f.snapshot),before);
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.compiled.contract),r.prepared);
  assert.deepEqual(core.evaluateCompiledContract(r.prepared,r.compiled.contract),r.engine);
});

test('pristine replacement passes content checks, but host PaintMe deviations remain visible', () => {
  const f=scenario();f.snapshot.nodes[4].appearance.opacity=0.4;
  const r=f.run();
  assert.equal(r.prepared.nodes[4].baseline.effective.appearance.opacity,1);
  for(const id of ['preview:5','preview:6']) assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-opacity')&&e.subjectNodeId===id).classification,'compliant');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-opacity')&&e.subjectNodeId==='preview:4').classification,'violation');
});

test('no host semantic role leaks into a replacement even after its independent baseline is resolved', () => {
  const f=scenario();f.snapshot.nodes[6].semantic.role='label';
  const r=f.run();
  assert.equal(r.prepared.nodes[6].semantic.role,undefined);
  assert.equal(r.prepared.nodes[0].semanticTargets.label.present,false);
  assert.equal(r.prepared.nodes[0].relations.label,undefined);
});

test('same-name replacement is resolved by exact key and port, not its label', () => {
  const f=scenario();f.snapshot.nodes[5].name='diamonds';
  const r=f.run();assert.equal(r.prepared.instanceContentResults[0].status,'matched');
});

test('invalid provenance, changed PaintMe, modes, nested identity and structure fail closed', () => {
  const cases=[
    ['original-host-evidence-invalid',f=>{f.base.source.rootNodeId=f.snapshot.source.rootNodeId;}],
    ['original-host-evidence-invalid',f=>{f.base.source.componentKey='wrong';}],
    ['original-host-evidence-invalid',f=>{f.base.context.modes={bad:'mode'};}],
    ['replacement-reference-incomplete',f=>{f.reference.source.rootNodeId=f.snapshot.source.rootNodeId;}],
    ['replacement-reference-incomplete',f=>{f.reference.source.truncated=true;}],
    ['replacement-reference-incomplete',f=>{f.reference.context.modes={bad:'mode'};}],
    ['replacement-identity-or-port-mismatch',f=>{f.reference.nodes[5].component.identity.componentKey='wrong';}],
    ['host-context-changed',f=>{f.reference.nodes[4].appearance.opacity=0.1;}],
    ['host-context-changed',f=>{f.reference.nodes[2].component.properties.Type='other';}],
    ['replacement-structure-needs-remap',f=>{f.reference.nodes[6].name='other-vector';}],
    ['replacement-nested-identity-unresolved',f=>{f.reference.nodes[5].component.identity.componentSetKey='wrong-set';}],
    ['ambiguous-reference',f=>{f.snapshot.instanceContentReferences.attempts.push(clone(f.snapshot.instanceContentReferences.attempts[0]));}],
    ['reference-capture-failed',f=>{f.snapshot.instanceContentReferences.attempts[0].failure='reference-capture-failed';}],
    ['reference-capture-limit',f=>{f.snapshot.instanceContentReferences.attempts[0].failure='reference-capture-limit';}],
    ['variable-modes-unavailable',f=>{f.snapshot.instanceContentReferences.attempts[0].failure='variable-modes-unavailable';}],
  ];
  for(const [reason,mutate] of cases) {
    const f=scenario();mutate(f);const r=f.run();
    assert.equal(r.prepared.instanceContentResults[0].reason,reason);
    assert.deepEqual(r.prepared.nodes[6].baseline.effective,{},reason);
    assert.equal(r.report.scenarioCoverage.complete,false);
    const gap=r.report.evaluations.find(e=>e.ruleId==='instance-boundary:preview:5');
    assert.equal(gap.classification,'not-executed');
    assert.match(gap.trace.reason,/относится только к проверке содержимого/);
    assert.doesNotMatch(gap.trace.reason,/Допустимость замены и содержимое требуют/);
  }
});

test('successful content check cannot mask an unknown catalog', () => {
  const f=scenario();f.run().compiled.contract.facts.variantEvidence.assetCatalogs=[];
  const r=f.run();assert.equal(r.prepared.instanceContentResults[0].status,'matched');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'human-review');
  assert.equal(r.report.scenarioCoverage.complete,false);
});

test('JSON report roundtrip preserves independent references and canonical engine parity', () => {
  const f=scenario(),r=f.run();
  const download=core.buildValidationReportDownload({manual:f.manual,compiled:r.compiled,evaluatedContract:r.compiled.contract,
    snapshot:f.snapshot,anatomy:[],engineResult:r.engine,result:r.report,capture:null,trigger:'selected-instance'});
  const report=JSON.parse(download.json);
  assert.deepEqual(report.snapshot.instanceContentReferences,f.snapshot.instanceContentReferences);
  assert.deepEqual(core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract),report.results.engine);
  assert.deepEqual(core.buildEditorValidationReport(report.results.engine,r.compiled,report.sources.manual,report.snapshot),report.results.editor);
});

function variantScenario() {
  const f=scenario(), original=clone(f.snapshot.variantReference);
  Object.assign(f.snapshot,clone(f.base));
  f.snapshot.source.rootNodeId='synthetic-actual-variant';
  f.snapshot.variantReference=original;
  f.reference=clone(f.base);f.reference.source.rootNodeId='synthetic-variant-reference';
  for(const model of [f.snapshot,f.reference]) {
    const owner=model.nodes[2].component;
    owner.identity.componentKey='synthetic-addon-variant';owner.identity.mainComponentId='synthetic-main';
    owner.properties.Type='Icon-20';
    delete owner.properties['Icon-24#13:0'];delete owner.propertyTypes['Icon-24#13:0'];
    owner.properties['Icon-20#1:0']=model.nodes[5].component.identity.mainComponentId;
    owner.propertyTypes['Icon-20#1:0']='INSTANCE_SWAP';
    model.nodes[5].component.propertyReferenceBindings.mainComponent='Icon-20#1:0';
    model.nodes[5].component.propertyReferences=['Icon-20#1:0'];
  }
  f.snapshot.instanceContentReferences={schemaVersion:'apollo.instance-content-references.v2',base:f.base,
    attempts:[{boundaryNodeId:'preview:2',reference:f.reference}]};
  return f;
}

test('same-set variant gets independent visuals and current port lineage without erasing Type delta',()=>{
  const f=variantScenario();f.snapshot.nodes[6].appearance.opacity=0.4;
  const before=JSON.stringify(f.snapshot),r=f.run();
  assert.equal(r.prepared.instanceBoundaries[0].reason,'component-variant-changed');
  assert.equal(r.prepared.instanceContentResults[0].status,'matched');
  assert.equal(r.prepared.nodes[2].baselineProvenance.kind,'independent-host-variant');
  assert.equal(r.prepared.nodes[2].component.properties.Type,'Icon-20');
  assert.equal(r.prepared.nodes[2].baseline.effective.component.properties.Type,f.base.nodes[2].component.properties.Type);
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-opacity')&&e.subjectNodeId==='preview:6').classification,'violation');
  const binding=r.compiled.contract.facts.dependencyBindings.find(b=>b.targetRole==='left-addon'&&b.portNames.length);
  const dependency=r.prepared.nodes[0].dependencies[binding.id];
  assert.equal(dependency.applicable,true);
  assert.equal(dependency.changed,false);
  assert.equal(dependency.referenceComponentKey,f.reference.nodes[5].component.identity.componentKey);
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'not-applicable');
  assert.equal(JSON.stringify(f.snapshot),before);
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.compiled.contract),r.prepared);
  assert.deepEqual(core.evaluateCompiledContract(JSON.parse(JSON.stringify(f.snapshot)),r.compiled.contract),r.engine);
  const download=core.buildValidationReportDownload({manual:f.manual,compiled:r.compiled,evaluatedContract:r.compiled.contract,
    snapshot:f.snapshot,anatomy:[],engineResult:r.engine,result:r.report,capture:null,trigger:'selected-instance'});
  const report=JSON.parse(download.json);
  assert.equal(report.snapshot.instanceContentReferences.schemaVersion,'apollo.instance-content-references.v2');
  assert.deepEqual(core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract),report.results.engine);
  assert.deepEqual(core.buildEditorValidationReport(report.results.engine,r.compiled,report.sources.manual,report.snapshot),report.results.editor);
});

test('same-set visual rebasing does not approve a forbidden variant property',()=>{
  const f=variantScenario();
  f.manual.rules.push({...clone(f.manual.rules[0]),id:'fixture:locked-type',targetScope:'self-and-descendants',
    capability:'component.properties.Type',permission:'forbidden',controlPaths:[],constraints:[],message:'Do not change Type'});
  const compiled=core.compileManualSource(f.manual,f.evidence);
  assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
  const result=core.evaluateCompiledContract(f.snapshot,compiled.contract);
  assert.equal(result.evaluations.find(e=>e.ruleId.startsWith('fixture:locked-type')&&e.subjectNodeId==='preview:2').classification,'violation');
});

test('nested variant requires matching set, properties, structure and pristine surrounding host',()=>{
  for(const [reason,mutate] of [
    ['explicit-swap-port-required',f=>{f.snapshot.nodes[2].component.identity.componentSetKey='other-set';}],
    ['explicit-swap-port-required',f=>{delete f.snapshot.nodes[2].component.identity.componentSetKey;}],
    ['variant-properties-mismatch',f=>{f.snapshot.nodes[2].component.properties.Type='forged';}],
    ['replacement-identity-or-port-mismatch',f=>{f.reference.nodes[2].component.identity.componentSetKey='other-set';}],
    ['host-context-changed',f=>{f.reference.nodes[1].appearance.opacity=0.5;}],
    ['replacement-nested-identity-unresolved',f=>{f.snapshot.nodes[5].component.identity.componentKey='extra-nested-swap';}],
    ['replacement-structure-needs-remap',f=>{f.snapshot.nodes[6].name='renamed';}],
    ['reference-capture-failed',f=>{f.snapshot.instanceContentReferences.attempts[0].failure='reference-capture-failed';}],
  ]) {
    const f=variantScenario();mutate(f);const r=f.run();
    assert.equal(r.prepared.instanceContentResults[0].reason,reason);
    assert.deepEqual(r.prepared.nodes[6].baseline.effective,{});
    assert.equal(r.report.scenarioCoverage.complete,false);
  }
});

test('historical captures do not silently acquire nested variant semantics',()=>{
  const f=variantScenario();f.snapshot.instanceContentReferences.schemaVersion='apollo.instance-content-references.v1';
  const r=f.run();
  assert.equal(r.prepared.instanceBoundaries[0].reason,'component-identity-changed');
  assert.equal(r.prepared.instanceContentResults[0].reason,'explicit-swap-port-required');
});

for (const variant of [false,true]) for (const failure of (variant?[false,true,'no-op','missing-properties']:[false,true])) test(`Figma sandbox capture uses pristine host, clears old overrides, cleans up (variant: ${variant}, API failure: ${failure})`, async () => {
  const vm=require('node:vm'),fs=require('node:fs');
  const f=variant?variantScenario():scenario(),messages=[],created=[],assignments=[];
  const hostPaint={type:'SOLID',visible:true,opacity:0.94,tokenId:'host-white',color:{r:255,g:255,b:255}};
  if(variant) {
    f.base.nodes[4].appearance.fill=[clone(hostPaint)];f.reference.nodes[4].appearance.fill=[clone(hostPaint)];
    // A manual override must NOT leak into expected state.
    f.snapshot.nodes[4].appearance.fill=[{...clone(hostPaint),tokenId:'actual-custom',color:{r:12,g:34,b:56}}];
  }
  const boundaryId=variant?'preview:2':'preview:5';
  const page={type:'PAGE',id:'user-page',selection:[]},mains=new Map();
  for(const model of [f.base,f.snapshot]) for(const n of model.nodes) {
    const id=n.component.identity;
    if(id) mains.set(id.componentKey,{id:id.mainComponentId,key:id.componentKey,
      variantProperties:Object.fromEntries(Object.entries(n.component.properties||{}).filter(([p])=>n.component.propertyTypes[p]==='VARIANT')),
      parent:id.componentSetKey ? {type:'COMPONENT_SET',key:id.componentSetKey,componentPropertyDefinitions:{}} : null});
  }
  if(failure==='missing-properties') delete mains.get(f.snapshot.nodes[2].component.identity.componentKey).variantProperties;
  let sequence=0;
  function scene(model,prefix) {
    const nodes=new Map();
    for(const data of model.nodes) {
      let main=mains.get(data.component.identity?.componentKey);
      const node={id:`${prefix}:${data.id}`,type:data.type,name:data.name,visible:data.visible,
        opacity:data.appearance.opacity,children:[],width:24,height:24,
        fills:(data.appearance.fill||[]).map(p=>({...clone(p),color:p.color&&Object.fromEntries(Object.entries(p.color).map(([k,v])=>[k,v/255])),
          ...(p.tokenId?{boundVariables:{color:{type:'VARIABLE_ALIAS',id:p.tokenId}}}:{})})),
        resolvedVariableModes:Object.assign({},clone(model.context.modes),{'synthetic-mode-collection':'light'}),componentPropertyReferences:clone(data.component.propertyReferenceBindings),
        componentProperties:Object.fromEntries(Object.entries(data.component.properties||{}).map(([p,value])=>[p,{type:data.component.propertyTypes[p],value}])),
        getMainComponentAsync:async()=>main,
        exportAsync:async()=>new Uint8Array([1,2,3]),
        setExplicitVariableModeForCollection(){},
        setProperties(props){
          if(variant && data.id===boundaryId) {
            assert.notEqual(prefix,'actual');assert.deepEqual(JSON.parse(JSON.stringify(props)),{Type:'Icon-20'});
            applyMain(mains.get(f.snapshot.nodes[2].component.identity.componentKey),'variant-properties');
          } else for(const [p,value] of Object.entries(props)) this.componentProperties[p].value=value;
        },
        remove(){this.removed=true;},
      };
      function applyMain(next,method) {
        assert.notEqual(prefix,'actual','the tested instance must never be changed');
        assignments.push({prefix,key:next.key,method});
        if(variant) assert.equal(method,'variant-properties','direct assignment would erase host overrides');
        if(failure===true) throw new Error('simulated Figma refusal');
        if(failure==='no-op') return;
        main=next;
        const clean=scene(f.reference,`payload-${++sequence}`).byId.get(boundaryId);
        node.name=clean.name;node.opacity=clean.opacity;node.children=clean.children;
        node.componentProperties=clean.componentProperties;
        node.children.forEach(child=>{child.parent=node;});
        let owner=node.parent;while(owner && owner.type!=='INSTANCE') owner=owner.parent;
        if(!variant) owner.componentProperties[node.componentPropertyReferences.mainComponent].value=next.id;
      }
      Object.defineProperty(node,'mainComponent',{set(next){applyMain(next,'main-component');}});
      nodes.set(data.id,node);
    }
    for(const data of model.nodes) {
      const node=nodes.get(data.id);
      node.parent=nodes.get(data.parentId)||page;
      node.children=data.childIds.map(id=>nodes.get(id));
    }
    const root=nodes.get(model.selection[0]);
    root.clone=()=>{const copy=scene(model,`host-${++sequence}`).root;created.push(copy);return copy;};
    return {root,byId:nodes};
  }
  const actual=scene(f.snapshot,'actual');page.selection=[actual.root];
  mains.get(f.snapshot.source.componentKey).createInstance=()=>{
    const root=scene(f.base,`pristine-${++sequence}`).root;created.push(root);return root;
  };
  const pages=[];
  const figma={currentPage:page,fileKey:'test',root:{name:'Test'},mixed:Symbol('mixed'),
    showUI(){},on(){},ui:{postMessage:m=>messages.push(m)},base64Encode:bytes=>Buffer.from(bytes).toString('base64'),
    variables:{getVariableCollectionByIdAsync:async id=>id==='synthetic-mode-collection'?({id,key:'8'.repeat(40),name:'Synthetic modes',defaultModeId:'light',modes:[{modeId:'light',name:'Light'}]}):({id}),
      getVariableByIdAsync:async id=>({id,variableCollectionId:'synthetic-mode-collection',valuesByMode:{light:1}})},
    createPage(){const p={type:'PAGE',id:'temporary',appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
  const sandbox=vm.createContext({figma,__html__:'',TextEncoder:undefined});
  vm.runInContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),sandbox);
  await figma.ui.onmessage({type:'test-selection',requestId:'reference-test',componentKey:f.snapshot.source.componentKey,
    acceptedComponentKeys:[],allowedComponentProperties:[],platform:'desktop',manualSourceHash:'unchanged'});
  assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);
  const response=messages.find(m=>m.type==='selection-test-result');assert.ok(response);
  assert.equal(assignments.length,failure==='missing-properties'?0:1);
  assert.equal(response.snapshot.instanceContentResults[0].status,failure?'unresolved':'matched');
  if(failure==='missing-properties') assert.equal(response.snapshot.instanceContentResults[0].reason,'variant-properties-unavailable');
  if(failure==='no-op') assert.equal(response.snapshot.instanceContentResults[0].reason,'variant-switch-identity-mismatch');
  assert.equal(response.matchedBaselineNodes,failure?(variant?2:5):7);
  assert.equal(response.unmatchedBaselineNodeIds.length,failure?(variant?5:2):0);
  assert.ok(created.every(node=>node.removed));assert.ok(pages.every(p=>p.removed));
  assert.equal(actual.root.removed,undefined);assert.equal(actual.byId.get('preview:5').name,f.snapshot.nodes[5].name);
  assert.equal(actual.byId.get('preview:4').opacity,f.snapshot.nodes[4].appearance.opacity);
  assert.equal(response.snapshot.variantReference.nodeProperties['LeftAddon / LeftAddon / Fixer / PaintMe / diamonds'].identity.componentKey,f.base.nodes[5].component.identity.componentKey);
  if(variant && !failure) {
    assert.equal(response.snapshot.instanceContentReferences.attempts[0].strategy,'pristine-host-variant-properties');
    assert.deepEqual(JSON.parse(JSON.stringify(response.snapshot.nodes[4].baseline.effective.appearance.fill)),[hostPaint]);
    assert.notDeepEqual(JSON.parse(JSON.stringify(response.snapshot.nodes[4].appearance.fill)),[hostPaint]);
  }
});

function activeVariantScenario() {
  const f=variantScenario();
  f.snapshot.instanceContentReferences.schemaVersion='apollo.instance-content-references.v3';
  f.snapshot.instanceContentReferences.attempts[0].strategy='pristine-host-variant-properties';
  for(const s of [f.snapshot,f.reference]) {
    s.nodes[2].component.properties['Icon-16#inactive']='unused';
    s.nodes[2].component.propertyTypes['Icon-16#inactive']='INSTANCE_SWAP';
  }
  return f;
}

function nestedScenario() {
  const f=activeVariantScenario();
  f.snapshot.instanceContentReferences.schemaVersion='apollo.instance-content-references.v4';
  const icon=f.snapshot.nodes[5];
  icon.component.identity.componentKey='synthetic-child-variant';
  icon.component.identity.mainComponentId='synthetic-child-main';
  icon.component.properties.Size='24';icon.component.propertyTypes.Size='VARIANT';
  f.snapshot.nodes[2].component.properties['Icon-20#1:0']=icon.component.identity.mainComponentId;
  const child=clone(f.reference);child.source.rootNodeId='synthetic-child-reference';
  child.nodes[5].component=clone(icon.component);
  child.nodes[2].component.properties['Icon-20#1:0']=icon.component.identity.mainComponentId;
  f.snapshot.instanceContentReferences.attempts.push({boundaryNodeId:'preview:5',parentBoundaryNodeId:'preview:2',reference:child});
  return {...f,child};
}

test('v4 independently rebases nested swap after a host variant without approving controls or styles',()=>{
  const f=nestedScenario();f.snapshot.nodes[4].appearance.opacity=0.4;f.snapshot.nodes[5].appearance.opacity=0.5;f.snapshot.nodes[6].appearance.opacity=0.6;
  const before=JSON.stringify(f.snapshot),r=f.run();
  assert.deepEqual(r.prepared.instanceContentResults.map(x=>x.status),['matched','matched']);
  assert.deepEqual(r.prepared.instanceBoundaries.map(x=>x.nodeId),['preview:2','preview:5']);
  assert.equal(r.prepared.nodes[2].baseline.effective.component.properties.Type,f.base.nodes[2].component.properties.Type);
  for(const id of ['preview:4','preview:5','preview:6'])assert.equal(r.engine.evaluations.find(x=>x.ruleId.startsWith('fixture:host-opacity')&&x.subjectNodeId===id).classification,'violation');
  assert.equal(JSON.stringify(f.snapshot),before);
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.compiled.contract),r.prepared);
  assert.deepEqual(core.evaluateCompiledContract(JSON.parse(JSON.stringify(f.snapshot)),r.compiled.contract),r.engine);
});

test('v4 preserves proven parent facts but never treats missing or tampered child content as checked',()=>{
  for(const [reason,mutate] of [
    ['reference-not-captured',f=>{f.snapshot.instanceContentReferences.attempts.pop();}],
    ['reference-parent-mismatch',f=>{f.snapshot.instanceContentReferences.attempts[1].parentBoundaryNodeId='wrong';}],
    ['ambiguous-reference',f=>{f.snapshot.instanceContentReferences.attempts.push(clone(f.snapshot.instanceContentReferences.attempts[1]));}],
    ['host-context-changed',f=>{f.child.nodes[4].appearance.opacity=0.4;}],
    ['replacement-reference-incomplete',f=>{f.child.source.rootNodeId=f.reference.source.rootNodeId;}],
    ['reference-capture-limit',f=>{f.snapshot.instanceContentReferences.attempts[1].failure='reference-capture-limit';}],
  ]){
    const f=nestedScenario();mutate(f);const r=f.run();
    assert.equal(r.prepared.instanceContentResults[0].status,'partial');
    assert.equal(r.prepared.instanceContentResults[0].lineageProven,true);
    assert.equal(r.prepared.instanceContentResults[1].reason,reason);
    assert.deepEqual(r.prepared.nodes[5].baseline.effective,{});
    assert.equal(r.prepared.nodes[4].baseline.effective.appearance.opacity,1);
    const b=r.compiled.contract.facts.dependencyBindings.find(b=>b.targetRole==='left-addon'&&b.portNames.length);
    assert.equal(r.prepared.nodes[0].dependencies[b.id].componentKey,'synthetic-child-variant');
    assert.equal(r.prepared.nodes[0].dependencies[b.id].changed,true);
    assert.equal(r.report.scenarioCoverage.complete,false);
    assert.ok(r.report.evaluations.some(e=>e.ruleId==='instance-boundary:preview:5'&&e.classification==='not-executed'));
    assert.ok(!r.report.evaluations.some(e=>e.ruleId==='instance-boundary:preview:2'));
  }
});

test('v3 keeps explicit legacy swap violation and its independent content baseline',()=>{
  const f=scenario();f.snapshot.instanceContentReferences.schemaVersion='apollo.instance-content-references.v3';
  f.snapshot.nodes[6].appearance.opacity=0.5;
  const r=f.run();
  assert.equal(r.prepared.instanceBoundaries[0].reason,'instance-swap');
  assert.equal(r.prepared.instanceContentResults[0].status,'matched');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'violation');
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('fixture:host-opacity')&&e.subjectNodeId==='preview:6').classification,'violation');
});

test('inactive declared ports do not make a proven variant consumer ambiguous',()=>{
  const f=activeVariantScenario(),r=f.run();
  const b=r.compiled.contract.facts.dependencyBindings.find(b=>b.targetRole==='left-addon'&&b.portNames.length);
  assert.equal(r.prepared.nodes[0].dependencies[b.id].applicable,true);
  assert.equal(r.prepared.nodes[0].dependencies[b.id].changed,false);
  assert.equal(r.prepared.nodes[0].dependencies[b.id].reason,undefined);
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'not-applicable');
});

test('active consumer selection rejects duplicate, missing and broken actual/reference bindings',()=>{
  for(const mutate of [
    f=>{f.snapshot.nodes[5].component.propertyReferenceBindings.mainComponent='Icon-16#inactive';},
    f=>{f.snapshot.nodes[2].component.properties['Icon-20#1:0']='broken';},
    f=>{f.reference.nodes[2].component.properties['Icon-20#1:0']='broken';},
    f=>{delete f.snapshot.nodes[5].component.propertyReferenceBindings.mainComponent;},
    f=>{delete f.reference.nodes[5].component.propertyReferenceBindings.mainComponent;},
    f=>{delete f.snapshot.nodes[2].component.propertyTypes['Icon-20#1:0'];},
    f=>{delete f.snapshot.instanceContentReferences.attempts[0].strategy;},
    f=>{for(const s of [f.snapshot,f.reference]) {s.nodes[6].type='INSTANCE';s.nodes[6].parentId='preview:4';
      s.nodes[4].childIds.push('preview:6');s.nodes[5].childIds=[];s.nodes[6].component=clone(s.nodes[5].component);}},
  ]) {
    const f=activeVariantScenario();mutate(f);const r=f.run();
    assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('addon-uses-glyph-26.1.1.1')).classification,'human-review');
    assert.equal(r.report.scenarioCoverage.complete,false);
  }
});

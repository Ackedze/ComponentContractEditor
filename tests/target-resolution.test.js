const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const fixture = require('./fixtures/button-variants.json');
const clone = value => JSON.parse(JSON.stringify(value));

// Synthetic flat-component topology; not a claimed reachable Button state.
function scenario() {
  const manual = clone(fixture.manual);
  manual.semanticApi = []; manual.generation.profiles = []; manual.controlPorts = [];
  manual.component.componentKey = 'component-set';
  manual.representations = [{ id: 'figma:test', kind: 'figma', platform: 'desktop', status: 'verified', locator: { componentKey: 'component-set' } }];
  const specs = [['root',null,'Old root','INSTANCE',0], ['text','root','Text','FRAME',1], ['label','text','Label','TEXT',2], ['other','root','Other','FRAME',3]];
  const nodes = specs.map(([id,parentId,name,type,order]) => ({id,parentId,name,type,order,childIds:[],visible:true,
    semantic:{role:id,path: id === 'root' ? 'Old root' : id === 'label' ? 'Old root / Text / Label' : `Old root / ${name}`},
    appearance:{opacity:1},unknownFacts:[]}));
  nodes.forEach(node => {if (node.parentId) nodes.find(parent => parent.id === node.parentId).childIds.push(node.id)});
  manual.targets = nodes.filter(node => ['root','label'].includes(node.id)).map(node => ({
    id:`target.${node.id}`,semanticRole:node.id,label:node.name,lineage:node.semantic.path.split('/').slice(0,-1).map(part=>core.slug(part.trim())),
    pathHint:node.semantic.path,nameHint:node.name,nodeIdHint:node.id,resolution:'resolved',
    structuralFingerprint:core.stableHash({type:node.type,path:node.semantic.path,order:node.order}).slice(0,16),
  }));
  manual.rules = ['root','label'].map(role=>({...clone(fixture.manual.rules[0]),id:`rule.${role}`,targetId:`target.${role}`,
    targetScope:'self',capability:'appearance.opacity',permission:'constrained',constraints:[{type:'propertyDomain',values:[1]}],
    status:'reviewed',execution:{route:'predicate'},rationale:'Synthetic exact target test.',owner:'test',
    applicability:{variants:'all',modes:'all',platforms:['desktop']}}));
  const snapshot = {schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-26T00:00:00Z',
    source:{fileName:'fixture',pageId:'page',rootNodeId:'root',componentKey:'variant-key',componentSetKey:'component-set',truncated:false,nodeLimit:500},
    selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},nodes};
  const run=()=>{
    const compiled=core.compileManualSource(manual);
    assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);
    snapshot.targetResolution=core.resolveSnapshotTargets(snapshot,compiled.contract);
    const prepared=core.prepareValidationSnapshot(snapshot,compiled.contract);
    const engine=core.evaluateCompiledContract(prepared,compiled.contract);
    return {compiled,prepared,engine,report:core.buildEditorValidationReport(engine,compiled,manual,prepared)};
  };
  return {manual,snapshot,nodes,run};
}

test('legacy exact anchors resolve; node IDs and root name are not identity; manual is immutable',()=>{
  const f=scenario(),before=clone(f.manual);
  f.nodes[0].name='Renamed instance';
  f.nodes[2].id='new-label'; f.nodes[1].childIds=['new-label'];
  const r=f.run();
  assert.deepEqual(r.prepared.targetResolution.targets.map(t=>t.resolution),['resolved','resolved']);
  assert.equal(r.prepared.targetResolution.targets[1].nodeId,'new-label');
  assert.ok(r.engine.evaluations.every(e=>e.classification==='compliant'));
  assert.equal(r.report.scenarioCoverage.complete,true);
  assert.deepEqual(f.manual,before);
});

test('moved same-name/same-ID layer is not rebound, even with a forged captured role',()=>{
  const f=scenario(); f.nodes[2].parentId='other';f.nodes[1].childIds=[];f.nodes[3].childIds=['label'];
  const r=f.run();
  assert.equal(r.prepared.targetResolution.targets[1].reason,'path-needs-remap');
  assert.equal(r.prepared.nodes[2].semantic.role,'');
  assert.equal(r.prepared.nodes[0].relations.label,undefined);
  assert.equal(r.report.scenarioCoverage.complete,false);
  assert.equal(r.report.scenarioCoverage.notExecuted,1);
  assert.deepEqual(r.report.evaluations.map(e=>e.classification).sort(),['compliant','not-executed']);
  assert.match(r.report.evaluations.find(e=>e.classification==='not-executed').trace.reason,/исходный путь не найден/);
  assert.equal(r.engine.evaluations.find(e=>e.ruleId.startsWith('rule.root.')).classification,'compliant');
});

test('a duplicate path, a truncated/cyclic/disconnected topology cannot silently map a target',()=>{
  for (const mutate of [
    f=>{f.nodes.push({...clone(f.nodes[2]),id:'second'});f.nodes[1].childIds.push('second')},
    f=>{f.snapshot.source.truncated=true},
    f=>{f.nodes[1].parentId='label';f.nodes[2].childIds=['text']},
    f=>{f.nodes[2].parentId='missing'},
  ]) {
    const f=scenario();mutate(f);
    const result=core.resolveSnapshotTargets(f.snapshot,core.compileManualSource(f.manual).contract);
    assert.ok(result.targets.every(t=>t.reason==='topology-incomplete-or-ambiguous'));
  }
});

test('two targets cannot claim one node or the same semantic role',()=>{
  for(const kind of ['node','role']){
    const f=scenario(); const duplicate={...clone(f.manual.targets[1]),id:'target.duplicate'};
    if(kind==='node')duplicate.semanticRole='another-label'; else duplicate.pathHint='Old root / Missing';
    f.manual.targets.push(duplicate);
    const result=core.resolveSnapshotTargets(f.snapshot,core.compileManualSource(f.manual).contract);
    assert.ok(result.targets.slice(1).every(t=>t.resolution==='ambiguous'&&t.reason==='target-collision'));
  }
});

test('type/order/lineage drift and absent structural anchor require explicit remap',()=>{
  for(const [mutate,reason] of [
    [f=>{f.nodes[2].type='FRAME'},'structural-anchor-changed'],
    [f=>{f.nodes[2].order=8},'structural-anchor-changed'],
    [f=>{f.manual.targets[1].lineage=['wrong']},'lineage-hint-conflict'],
    [f=>{delete f.manual.targets[1].structuralFingerprint},'structural-anchor-missing'],
    [f=>{delete f.manual.targets[1].pathHint},'path-hint-missing'],
    [f=>{f.manual.targets[1].resolution='unknown'},'authoring-target-unresolved'],
  ]) {const f=scenario();mutate(f);assert.equal(f.run().prepared.targetResolution.targets[1].reason,reason);}
});

test('component/platform/representation guards refuse cross-family name matches',()=>{
  for(const mutate of [f=>{f.snapshot.source.componentSetKey='other'},f=>{f.snapshot.context.platform='mobile-web'},
    f=>{f.manual.representations.push({...f.manual.representations[0],id:'another'})}]){
    const f=scenario();mutate(f);assert.ok(f.run().prepared.targetResolution.targets.every(t=>t.reason==='representation-unresolved'));
  }
});

test('representation-specific path is explicit; never borrow another representation anchor',()=>{
  const f=scenario();f.manual.representations[0].locator.componentKey='another-set';f.snapshot.source.componentSetKey='another-set';
  assert.equal(f.run().prepared.targetResolution.targets[1].reason,'representation-hint-missing');
  f.manual.targets[1].representationHints=[{representationId:'figma:test',pathHint:'Another root / Text / Label',
    structuralFingerprint:core.stableHash({type:'TEXT',path:'Another root / Text / Label',order:2}).slice(0,16)}];
  assert.equal(f.run().prepared.targetResolution.targets[1].resolution,'resolved');
  f.manual.targets[1].representationHints.push(clone(f.manual.targets[1].representationHints[0]));
  assert.equal(f.run().prepared.targetResolution.targets[1].reason,'representation-hints-ambiguous');
});

test('legacy path-only anchors cannot prove nested instance lineage',()=>{
  const f=scenario();f.nodes[1].type='INSTANCE';
  const r=f.run();assert.equal(r.prepared.targetResolution.targets[1].reason,'nested-lineage-unproven');
  assert.equal(r.report.scenarioCoverage.complete,false);
});

test('replay recomputes forged mappings, remains idempotent and retains historical no-marker behavior',()=>{
  const f=scenario(),r=f.run();
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,r.compiled.contract),r.prepared);
  assert.deepEqual(core.evaluateCompiledContract(r.prepared,r.compiled.contract),r.engine);
  f.nodes[2].name='Renamed';
  f.snapshot.targetResolution=clone(r.prepared.targetResolution);
  const prepared=core.prepareValidationSnapshot(f.snapshot,r.compiled.contract);
  assert.equal(prepared.targetResolution.targets[1].reason,'path-needs-remap');
  assert.equal(prepared.nodes[2].semantic.role,'');
  delete f.snapshot.targetResolution;
  const historic=core.prepareValidationSnapshot(f.snapshot,r.compiled.contract);
  assert.equal(historic.targetResolution,undefined);assert.equal(historic.nodes[2].semantic.role,'label');
});

test('missing target is unknown; an explicit mismatching product may still exclude the rule',()=>{
  const f=scenario();f.nodes[2].name='Renamed';f.manual.rules[1].applicability.products=['ab'];f.snapshot.context.product='corp';
  const r=f.run();assert.equal(r.report.scenarioCoverage.notExecuted,0);
  assert.ok(r.report.evaluations.some(e=>e.classification==='not-applicable'));
});

test('a slash-containing layer name cannot impersonate the declared ancestor chain',()=>{
  const f=scenario();f.nodes[2].name='Text / Label';f.nodes[2].parentId='root';f.nodes[1].childIds=[];
  f.nodes[0].childIds.push('label');f.nodes.splice(1,1);f.nodes[0].childIds=f.nodes[0].childIds.filter(id=>id!=='text');
  assert.equal(f.run().prepared.targetResolution.targets[1].reason,'lineage-hint-conflict');
});

test('download retains remap evidence and exact replay, never writes it to manual/compiled source',()=>{
  const f=scenario(),r=f.run();
  const download=core.buildValidationReportDownload({manual:f.manual,compiled:r.compiled,evaluatedContract:r.compiled.contract,
    snapshot:r.prepared,anatomy:[],engineResult:r.engine,result:r.report,capture:null,trigger:'selected-instance'});
  const report=JSON.parse(download.json);
  assert.deepEqual(report.snapshot.targetResolution,r.prepared.targetResolution);
  assert.equal(report.sources.manual.targetResolution,undefined);
  assert.equal(report.sources.compiledContract.facts.targetResolution,undefined);
  assert.deepEqual(core.evaluateCompiledContract(report.snapshot,report.runtime.evaluatedContract),report.results.engine);
});

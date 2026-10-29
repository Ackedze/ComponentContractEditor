const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../dist/core.cjs');
const fixture=require('./fixtures/button-variants.json');
const clone=x=>JSON.parse(JSON.stringify(x));

// Synthetic component: two frames and one text layer, not a claimed Button variant.
function scenario(){
 const manual=clone(fixture.manual);manual.semanticApi=[];manual.generation.profiles=[];manual.controlPorts=[];manual.examples=[];
 manual.component.componentKey='set';
 manual.representations=[{id:'figma:test',kind:'figma',platform:'desktop',status:'verified',locator:{componentKey:'set'}}];
 const nodes=[
  {id:'root',parentId:null,childIds:['left','right'],order:0,name:'Component',type:'INSTANCE',semantic:{role:'root',path:'Component'}},
  {id:'left',parentId:'root',childIds:[],order:1,name:'Left',type:'FRAME',semantic:{role:'left',path:'Component / Left'}},
  {id:'right',parentId:'root',childIds:['label'],order:2,name:'Right',type:'FRAME',semantic:{role:'right',path:'Component / Right'}},
  {id:'label',parentId:'right',childIds:[],order:3,name:'Renamed label',type:'TEXT',semantic:{role:'label',path:'Component / Right / Renamed label'}},
 ].map(n=>({...n,visible:true,appearance:{opacity:1},baseline:{effective:{appearance:{opacity:1}}},unknownFacts:[],component:{properties:{},propertyTypes:{},propertyReferences:[]}}));
 const target=(id,path,type,order)=>({id:`target.${id}`,semanticRole:id,label:id,lineage:path.split('/').slice(0,-1).map(p=>core.slug(p.trim())),
  nameHint:path.split(' / ').pop(),pathHint:path,nodeIdHint:'diagnostic-old-id',structuralFingerprint:core.stableHash({type,path,order}).slice(0,16),resolution:'resolved'});
 manual.targets=[target('root','Component','INSTANCE',0),target('label','Component / Left / Label','TEXT',3)];
 const base=clone(fixture.manual.rules[0]);
 manual.rules=['root','label'].map(role=>({...base,id:`rule.${role}`,targetId:`target.${role}`,targetScope:'self',capability:'appearance.opacity',
  permission:'constrained',controlPaths:[],constraints:[{type:'propertyDomain',values:[1]}],status:'reviewed',
  applicability:{variants:'all',modes:'all',platforms:['desktop']},execution:{route:'predicate'},owner:'fixture',rationale:'Synthetic remap test.'}));
 const snapshot={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'2026-09-26T00:00:00Z',source:{fileName:'fixture',pageId:'page',rootNodeId:'root',componentKey:'variant',componentSetKey:'set',truncated:false,nodeLimit:500},selection:['root'],context:{platform:'desktop',modes:{},unknownFacts:[]},nodes};
 const input={manual,snapshot,targetId:'target.label',nodeId:'label'};
 return {manual,snapshot,nodes,input,plan:()=>core.planTargetRemap(input),apply:()=>{const p=core.planTargetRemap(input);return core.applyTargetRemap(input,p.planHash,true,'2026-09-26T14:00:00Z')}};
}

test('proposal/cancel are read-only; confirmed remap preserves IDs and only updates binding/status/revision',()=>{
 const f=scenario(),before=clone(f.input),p=f.plan();assert.equal(p.canApply,true);assert.deepEqual(f.input,before);
 assert.throws(()=>core.applyTargetRemap(f.input,p.planHash,false),/Подтвердите/);assert.deepEqual(f.input,before);
 const next=f.apply();assert.deepEqual(f.input,before);assert.equal(next.metadata.revision,f.manual.metadata.revision+1);
 assert.equal(next.metadata.updatedAt,'2026-09-26T14:00:00Z');assert.equal(next.rules[0].status,'reviewed');assert.equal(next.rules[1].status,'draft');
 const expected=clone(f.manual);expected.targets[1]=p.after;expected.rules[1].status='draft';expected.metadata=next.metadata;
 assert.deepEqual(next,expected);assert.equal(next.targets[1].id,f.manual.targets[1].id);assert.equal(next.targets[1].nodeIdHint,'diagnostic-old-id');
 assert.equal(next.targets[1].representationHints[0].pathHint,'Component / Right / Renamed label');
});

test('stale manual, snapshot, generated evidence, target choice or tampered proposal cannot apply',()=>{
 for(const mutate of [f=>{f.manual.rules[0].message='new'},f=>{f.snapshot.generatedAt='later'},f=>{f.input.variantEvidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:'new',structures:{},variants:[]}},f=>{f.input.nodeId='left'}]){
  const f=scenario(),p=f.plan();mutate(f);const before=clone(f.manual);assert.throws(()=>core.applyTargetRemap(f.input,p.planHash,true),/изменились/);assert.deepEqual(f.manual,before);
 }
 const f=scenario();assert.throws(()=>core.applyTargetRemap(f.input,'fake',true),/изменились/);
});

test('related relationships, quantities, dependencies, ports and ancestor rules are re-reviewed; deprecated untouched',()=>{
 const f=scenario(),base=f.manual.rules[0];f.manual.rules[0].targetScope='self-and-descendants';
 f.manual.controlPorts=[{id:'label-port',label:'Label',targetId:'target.label',capability:'appearance.opacity',required:true}];
 f.manual.rules.push(
  {...clone(base),id:'relation',constraints:[{type:'relationship',relation:'descendant',targetRole:'label'}]},
  {...clone(base),id:'quantity',constraints:[{type:'quantity',targetRoles:['label'],min:1,max:1}]},
  {...clone(base),id:'port',controlPaths:[{kind:'inherited-port',port:'label-port'}]},
  {...clone(base),id:'old',targetId:'target.label',status:'deprecated'},
 );
 f.manual.examples=[{id:'related',kind:'validation',intent:'related',input:{},expected:{},ruleIds:['quantity'],status:'reviewed'},
  {id:'direct-ref',kind:'mapping',intent:'mapping',input:{target:'target.label'},expected:{},status:'reviewed'},
  {id:'unrelated',kind:'generation',intent:'other',input:{},expected:{},status:'reviewed'}];
 const p=f.plan();assert.equal(p.canApply,true);assert.deepEqual(p.affectedRules.map(r=>r.id),['rule.root','rule.label','relation','quantity','port']);
 const next=f.apply();assert.ok(next.rules.slice(0,-1).every(r=>r.status==='draft'));assert.equal(next.rules.at(-1).status,'deprecated');
 assert.deepEqual(next.examples.map(e=>e.status),['draft','draft','reviewed']);assert.deepEqual(next.controlPorts,f.manual.controlPorts);
 assert.deepEqual(next.rules.map(r=>r.id),f.manual.rules.map(r=>r.id));
});

test('no root/child cross-over, occupied path, duplicate role or ambiguous topology',()=>{
 for(const mutate of [f=>{f.input.nodeId='root'},f=>{f.input.targetId='target.root'},
  f=>{f.manual.targets.push({...clone(f.manual.targets[1]),id:'occupied',semanticRole:'occupied',pathHint:f.nodes[3].semantic.path})},
  f=>{f.manual.targets.push({...clone(f.manual.targets[1]),id:'duplicate'})},
  f=>{f.snapshot.source.truncated=true},f=>{f.nodes[3].parentId='missing'},
  f=>{f.nodes.push({...clone(f.nodes[3]),id:'duplicate-node'});f.nodes[2].childIds.push('duplicate-node')},
 ]){const f=scenario();mutate(f);const p=f.plan();assert.equal(p.canApply,false);assert.ok(p.blockers.length);}
});

test('missing/unknown properties, text-to-frame or missing effective baseline are blockers; false/zero are facts',()=>{
 for(const mutate of [f=>{delete f.nodes[3].appearance},f=>{f.nodes[3].unknownFacts=['appearance.opacity']},
  f=>{f.manual.rules[1].capability='text.fontSize';f.nodes[3].type='FRAME'},
  f=>{f.manual.rules[1].constraints=[];f.manual.rules[1].permission='forbidden';delete f.nodes[3].baseline},
 ]){const f=scenario();mutate(f);assert.equal(f.plan().canApply,false);}
 const f=scenario();f.nodes[3].appearance.opacity=0;assert.equal(f.plan().canApply,true);
 f.manual.rules[1].capability='visibility';f.nodes[3].visible=false;assert.equal(f.plan().canApply,true);
});

test('control source and dependent relative paths are never silently rewritten',()=>{
 const f=scenario();f.manual.rules[1].controlPaths=[{kind:'host-property',property:'Appearance',exclusive:true}];
 assert.equal(f.plan().canApply,false);f.nodes[0].component.properties.Appearance='Primary';assert.equal(f.plan().canApply,true);
 f.manual.rules.push({...clone(f.manual.rules[0]),id:'dependency',constraints:[{type:'dependencyDomain',dependency:{subjects:[{targetRole:'label',relativePath:'Nested'}],field:'componentSetKey',baselinePolicy:'require-domain'},values:['key']}]});
 assert.ok(f.plan().blockers.some(b=>b.includes('dependency path')));
});

test('another component or platform cannot receive the binding',()=>{
 for(const mutate of [f=>{f.snapshot.source.componentSetKey='foreign'},f=>{f.snapshot.context.platform='mobile-web'},f=>{f.manual.representations.push({...f.manual.representations[0],id:'duplicate'})}]){
  const f=scenario();mutate(f);assert.equal(f.plan().canApply,false);
 }
});

test('current representation only: all other bindings and applicability remain identical',()=>{
 const f=scenario();f.manual.representations.push({id:'figma:mobile',kind:'figma',platform:'mobile-web',status:'verified',locator:{componentKey:'mobile-set'}});
 const mobileHint={representationId:'figma:mobile',pathHint:'Mobile / Label',nameHint:'Label'};f.manual.targets[1].representationHints=[mobileHint];
 const next=f.apply();assert.deepEqual(next.targets[1].representationHints[0],mobileHint);assert.deepEqual(next.rules.map(r=>r.applicability),f.manual.rules.map(r=>r.applicability));
 f.manual.targets[1].resolution='unknown';assert.equal(f.plan().canApply,false);
});

test('unresolved single-representation authoring target can be confirmed; no-op cannot add a revision',()=>{
 const f=scenario();f.manual.targets[1].resolution='missing';const next=f.apply();assert.equal(next.targets[1].resolution,'resolved');
 f.input.manual=next;const p=f.plan();assert.equal(p.changed,false);assert.equal(p.canApply,false);
});

test('Athena/reference drift and nested replacement remain blocked, not approved through manual remap',()=>{
 const f=scenario();f.input.variantEvidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:'fixture',structures:{},variants:[]};
 assert.equal(f.plan().canApply,false);assert.ok(f.plan().blockers.some(b=>b.includes('эталоном')));
 delete f.input.variantEvidence;f.nodes[2].type='INSTANCE';assert.ok(f.plan().blockers.some(b=>b.includes('вложенного компонента')));
});

test('actual values do not become desired values; remapped rule still detects a violation',()=>{
 const f=scenario();f.nodes[3].appearance.opacity=.5;const next=f.apply();
 const compiled=core.compileManualSource(next),contract=core.prepareAuthoringPreviewContract(compiled.contract);
 f.snapshot.targetResolution=core.resolveSnapshotTargets(f.snapshot,contract);
 const result=core.evaluateCompiledContract(f.snapshot,contract);
 assert.equal(result.evaluations.find(e=>e.ruleId.startsWith('rule.label.')).classification,'violation');
 assert.deepEqual(next.rules[1].constraints,f.manual.rules[1].constraints);
});

test('regeneration needs matching independent reference and Athena structure before rename/reparent can be accepted',()=>{
 const f=scenario();
 const previous=clone(f.snapshot);previous.nodes[3].name='Label';previous.nodes[3].parentId='left';previous.nodes[1].childIds=['label'];previous.nodes[2].childIds=[];
 const oldShape=core.snapshotShape(previous),shape=core.snapshotShape(f.snapshot);
 f.input.variantEvidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:'previous-generation',structures:{old:oldShape},variants:[{componentKey:'variant',componentSetKey:'set',structureId:'old',properties:{}}]};
 f.snapshot.variantReference=core.captureVariantReference(f.snapshot,'variant','set');
 assert.equal(f.plan().canApply,false);
 f.input.variantEvidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:'regenerated',structures:{fresh:shape},variants:[{componentKey:'variant',componentSetKey:'set',structureId:'fresh',properties:{}}]};
 const before=clone(f.input);assert.equal(f.plan().canApply,true,f.plan().blockers.join('\n'));
 const next=f.apply();assert.deepEqual(f.input,before);assert.equal(next.rules[1].status,'draft');
 const compiled=core.compileManualSource(next,f.input.variantEvidence).contract;
 assert.equal(core.variantAvailability(f.snapshot,compiled).targets.label.state,'present');
});

test('capability groups stay versioned and explicit selection does not broaden during remap',()=>{
 const f=scenario();f.manual.rules[1].capabilitySet='visual-style@1';f.manual.rules[1].capabilitySelection=['appearance.opacity'];
 f.manual.rules[1].constraints=[];f.manual.rules[1].permission='forbidden';
 const p=f.plan();assert.equal(p.canApply,true);assert.deepEqual(p.capabilities.map(c=>c.path),['appearance.opacity','baseline.effective.appearance.opacity']);
 const next=f.apply();assert.deepEqual(next.rules[1].capabilitySelection,['appearance.opacity']);assert.deepEqual(next.rules[1].constraints,[]);
 f.manual.rules[1].capabilitySelection.push('appearance.fill');assert.equal(f.plan().canApply,false);
});

test('export/import, session and replay preserve remap, stable IDs and immutable generated input',()=>{
 const f=scenario(),next=f.apply(),bundle=core.buildExportBundle(next);
 const imported=core.importWorkspace([{name:'contract.manual.json',text:JSON.stringify(bundle.manual)},{name:'component-contract.v2.json',text:JSON.stringify(bundle.compiled)}]);
 assert.deepEqual(imported.manual,next);
 const session=core.parseEditorSession(core.createEditorSession(imported,{workspaceMode:'authoring',validationProduct:'ab',scenarioProperties:{},activeModes:{}}));
 assert.deepEqual(session.workspace.manual,next);assert.deepEqual(bundle.compiled.facts.targets,next.targets);
 assert.equal(next.rules[1].status,'draft');
});

test('deferred semantic policies remain deferred and explicitly require owner review, not fabricated runtime facts',()=>{
 const f=scenario();f.manual.rules[1].execution={route:'delegated',externalRuleIds:['pattern:editorial']};f.manual.rules[1].capability='content.editorial';
 const p=f.plan();assert.equal(p.canApply,true);assert.ok(p.warnings.some(w=>w.includes('delegated')));
 const next=f.apply();assert.deepEqual(next.rules[1].execution,f.manual.rules[1].execution);assert.equal(next.rules[1].status,'draft');
});

test('real Button evidence: correcting only a stale manual Label binding preserves all policies and generated facts',()=>{
 const live=require('./fixtures/button-icon-size-live-cases.json');const manual=clone(live.manual),snapshot=clone(live.cases[0].snapshot),variantEvidence=clone(live.evidence);
 const target=manual.targets.find(t=>t.id==='target.label');target.pathHint='[D] Button / Outdated / Label';
 const node=snapshot.nodes.find(n=>n.semantic?.path==='[D] Button / Text / Label');assert.ok(node);
 const input={manual,snapshot,variantEvidence,targetId:target.id,nodeId:node.id},before=clone(input),p=core.planTargetRemap(input);
 assert.equal(p.canApply,true,p.blockers.join('\n'));assert.ok(p.affectedRules.length>1);
 const next=core.applyTargetRemap(input,p.planHash,true);assert.deepEqual(input,before);
 assert.equal(next.rules.length,manual.rules.length);assert.deepEqual(next.rules.map(({status,...r})=>r),manual.rules.map(({status,...r})=>r));
 assert.deepEqual(next.targets.filter(t=>t.id!==target.id),manual.targets.filter(t=>t.id!==target.id));
 const compiled=core.compileManualSource(next,variantEvidence);
 const correct=clone(live.manual);const original=core.compileManualSource(correct,variantEvidence);
 assert.deepEqual(compiled.contract.facts.variantEvidence,original.contract.facts.variantEvidence);
 const verdicts=c=>core.evaluateCompiledContract(snapshot,core.prepareAuthoringPreviewContract(c)).evaluations.map(e=>[e.ruleId,e.subjectNodeId,e.classification]);
 assert.deepEqual(verdicts(compiled.contract),verdicts(original.contract));
});

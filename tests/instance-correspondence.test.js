const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../dist/core.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));

function tree() {
  const node=(id,parentId,name,type,children,identity)=>({id,parentId,name,type,childIds:children,visible:true,
    semantic:{path:name},appearance:{opacity:1},component:{properties:{},propertyTypes:{},propertyReferences:[],propertyReferenceBindings:{},...(identity?{identity}:{})}});
  const s={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'fixture',selection:['root'],
    source:{instanceIdentityVersion:1,fileName:'fixture',pageId:'page',rootNodeId:'actual',componentKey:'root-key',componentSetKey:'root-set',truncated:false,nodeLimit:500},
    context:{platform:'desktop',modes:{},unknownFacts:[]},nodes:[
      node('root',null,'Root','INSTANCE',['left','right'],{componentKey:'root-key',componentSetKey:'root-set',mainComponentId:'main-root'}),
      node('left','root','Left','FRAME',['a']),node('a','left','Addon','INSTANCE',['v'],{componentKey:'addon-key',componentSetKey:'addon-set',mainComponentId:'main-addon'}),
      node('v','a','Vector','VECTOR',[]),node('right','root','Right','FRAME',['b']),
      node('b','right','Addon','INSTANCE',['w'],{componentKey:'addon-key',componentSetKey:'addon-set',mainComponentId:'main-addon'}),
      node('w','b','Vector','VECTOR',[]),
    ]};
  const byId=new Map(s.nodes.map(n=>[n.id,n]));
  for(const n of s.nodes){let current=n,names=[];while(current){names.unshift(current.name);current=byId.get(current.parentId);}n.semantic.path=names.join(' / ');}
  const reference=clone(s);reference.source.rootNodeId='independent';
  const ref=core.captureVariantReference(reference,'root-key','root-set');
  return {s,reference,ref,compare:()=>core.compareInstanceBoundaries(s,ref,true)};
}

test('renamed same-key nested instance resolves only inside its matched parent; observed name/paint retained',()=>{
  const f=tree();f.s.nodes[2].name='Custom addon';f.s.nodes[2].appearance.opacity=0.4;
  const before=clone(f.s),c=f.compare();assert.equal(c.complete,true);assert.deepEqual(c.boundaries,[]);
  assert.equal(c.referencePaths['Left / Custom addon'],'Left / Addon');
  assert.equal(c.referencePaths['Right / Addon'],'Right / Addon');
  const m=core.materializeEffectiveBaseline(f.s,f.reference,true);assert.equal(m.matchedNodes,7);
  assert.equal(m.snapshot.nodes[2].name,'Custom addon');assert.equal(m.snapshot.nodes[2].appearance.opacity,0.4);
  assert.equal(m.snapshot.nodes[2].baseline.effective.appearance.opacity,1);assert.deepEqual(f.s,before);
});
test('renamed same-set variant remains a boundary requiring independent reference, not permission',()=>{
  const f=tree();f.s.nodes[2].name='Loading addon';f.s.nodes[2].component.identity.componentKey='another-variant';
  const c=f.compare();assert.equal(c.complete,true);assert.equal(c.boundaries[0].reason,'component-variant-changed');
  assert.equal(c.boundaries[0].actualPath,'Left / Loading addon');assert.equal(c.boundaries[0].referencePath,'Left / Addon');
  const m=core.materializeEffectiveBaseline(f.s,f.reference,true);assert.deepEqual(m.snapshot.nodes[2].baseline.effective,{});
  assert.equal(m.snapshot.nodes[0].baselineProvenance.status,'matched');
});
test('unknown key, contradictory set and unexposed replacement never acquire a baseline',()=>{
  for(const mutate of [n=>delete n.component.identity,n=>n.component.identity.componentSetKey='wrong-set',n=>n.component.identity.componentKey='outside',n=>n.unknownFacts=['component.identity']]){
    const f=tree();mutate(f.s.nodes[2]);if(f.s.nodes[2].component.identity?.componentKey==='outside')f.s.nodes[2].component.identity.componentSetKey='outside-set';
    const m=core.materializeEffectiveBaseline(f.s,f.reference,true);assert.deepEqual(m.snapshot.nodes[2].baseline.effective,{});
  }
});
test('duplicate same-set siblings are ambiguous even when their labels happen to match',()=>{
  const f=tree();for(const s of[f.s,f.reference]){s.nodes[1].childIds.push('b');s.nodes[4].childIds=[];s.nodes[5].parentId='left';s.nodes[5].name='Other addon';s.nodes[5].semantic.path='Root / Left / Other addon';s.nodes[6].semantic.path='Root / Left / Other addon / Vector';}
  const ref=core.captureVariantReference(f.reference,'root-key','root-set');assert.equal(core.compareInstanceBoundaries(f.s,ref,true).complete,false);
});
test('explicit unique swap ports distinguish equal-key siblings; wrong binding fails closed',()=>{
  const f=tree();for(const s of[f.s,f.reference]){
    s.nodes[0].childIds=['a','b'];s.nodes=s.nodes.filter(n=>!['left','right'].includes(n.id));
    const root=s.nodes[0];root.component.properties={Left:'main-addon',Right:'main-addon'};root.component.propertyTypes={Left:'INSTANCE_SWAP',Right:'INSTANCE_SWAP'};
    for(const[id,name,property]of[['a','First','Left'],['b','Second','Right']]){
      const n=s.nodes.find(n=>n.id===id);n.parentId='root';n.name=name;n.semantic.path='Root / '+name;n.component.propertyReferenceBindings={mainComponent:property};
      n.component.propertyReferences=[property];s.nodes.find(c=>c.parentId===id).semantic.path='Root / '+name+' / Vector';
    }
  }
  f.s.nodes.find(n=>n.id==='a').name='Renamed';
  const ref=core.captureVariantReference(f.reference,'root-key','root-set');
  assert.equal(core.compareInstanceBoundaries(f.s,ref,true).complete,true);
  f.s.nodes.find(n=>n.id==='a').component.propertyReferenceBindings.mainComponent='Right';
  assert.equal(core.compareInstanceBoundaries(f.s,ref,true).complete,false);
});
test('missing/duplicate paths, moved owner and renamed non-instance are not guessed by position',()=>{
  for(const mutate of [s=>s.nodes[1].name='Different frame',s=>s.nodes[2].parentId='right',s=>s.nodes.push(clone(s.nodes[2])),s=>s.source.truncated=true]){
    const f=tree();mutate(f.s);assert.equal(f.compare().complete,false);
  }
});
test('legacy opt-out preserves historical unresolved renamed-instance behavior',()=>{
  const f=tree();delete f.s.source.instanceIdentityVersion;f.s.nodes[2].name='Custom';assert.equal(f.compare().complete,false);
});
test('shared BOOLEAN is not a unique identity port: strong library keys still work',()=>{
  const f=tree();
  for(const s of [f.s,f.reference]){
    s.source.propertyReferenceIdentityVersion=1;
    s.nodes[0].component.properties.Visible=true;s.nodes[0].component.propertyTypes.Visible='BOOLEAN';
    for(const n of s.nodes.filter(n=>['a','b'].includes(n.id)))n.component.propertyReferenceBindings.visible='Visible';
  }
  const ref=core.captureVariantReference(f.reference,'root-key','root-set');
  assert.equal(core.compareInstanceBoundaries(f.s,ref,true).complete,true);
  f.s.nodes[2].component.identity={componentKey:'arbitrary'};f.s.nodes[2].name='Different';
  assert.equal(core.compareInstanceBoundaries(f.s,ref,true).complete,false);
});

test('native SLOT content may replace its placeholder without hiding root style violations',()=>{
  const node=(id,parentId,name,type,childIds)=>({id,parentId,name,type,childIds,visible:true,
    semantic:{path:parentId?`CorporateContent / ${name}`:'CorporateContent'},
    appearance:{fill:[{type:'SOLID',color:{r:242,g:243,b:245}}]},
    component:{properties:{},propertyTypes:{},propertyReferences:[],propertyReferenceBindings:{}}});
  const root=node('root',null,'CorporateContent','INSTANCE',['slot']);
  root.component.identity={componentKey:'corporate-content',mainComponentId:'main'};
  root.component.propertyTypes.Body='SLOT';
  const slot=node('slot','root','Body','SLOT',[]);
  slot.component.propertyReferenceBindings.slotContentId='Body';
  const actual={schemaVersion:'apollo.predicate-snapshot.v2',generatedAt:'fixture',selection:['root'],
    source:{instanceIdentityVersion:1,componentKey:'corporate-content',componentSetKey:'',truncated:false,nodeLimit:500},
    context:{platform:'desktop',modes:{},unknownFacts:[]},nodes:[root,slot]};
  const reference=clone(actual);
  reference.nodes[1].childIds=['placeholder'];
  const placeholder=node('placeholder','slot','SwapMe','FRAME',[]);
  placeholder.semantic.path='CorporateContent / Body / SwapMe';
  reference.nodes.push(placeholder);
  actual.nodes[0].appearance.fill[0].color={r:255,g:199,b:184};
  const ref=core.captureVariantReference(reference,'corporate-content','');
  const comparison=core.compareInstanceBoundaries(actual,ref);
  assert.equal(comparison.complete,true);
  assert.equal(comparison.referencePaths[''],'');
  assert.equal(comparison.referencePaths.Body,'Body');
  const result=core.materializeEffectiveBaseline(actual,reference,true);
  assert.equal(result.matchedNodes,2);
  assert.deepEqual(result.unmatchedNodeIds,[]);
  assert.deepEqual(result.snapshot.nodes[0].baseline.effective.appearance.fill[0].color,{r:242,g:243,b:245});
  assert.deepEqual(result.snapshot.nodes[0].appearance.fill[0].color,{r:255,g:199,b:184});

  const unanchored=clone(actual);
  delete unanchored.nodes[1].component.propertyReferenceBindings.slotContentId;
  assert.equal(core.compareInstanceBoundaries(unanchored,ref).complete,false);
  assert.equal(core.materializeEffectiveBaseline(unanchored,reference,true).matchedNodes,0);
});

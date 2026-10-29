const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {scenario,clone,core}=require('./helpers/button-spinner');

// Actual bundled controller, simulated Plugin API. This is not live acceptance.
for(const failure of [false,'lookup','main','mode'])test(`nested contract capture uses independent child master and cleans up (${failure})`,async()=>{
  const f=scenario(),hostReference=clone(f.snapshot),childReference=clone(f.base);
  f.child.nodes[0].appearance.opacity=.5;f.syncActual();
  const page={id:'user-page',type:'PAGE',selection:[]},messages=[],created=[],pages=[],all=new Map(),mains=new Map();let sequence=0,actualChildMainReads=0;
  for(const s of [hostReference,childReference])for(const n of s.nodes){const identity=n.component?.identity;if(identity?.componentKey)mains.set(identity.componentKey,{
    id:identity.mainComponentId,key:identity.componentKey,
    variantProperties:Object.fromEntries(Object.entries(n.component.properties||{}).filter(([p])=>n.component.propertyTypes[p]==='VARIANT')),
    parent:{type:'COMPONENT_SET',key:identity.componentSetKey,componentPropertyDefinitions:{}},componentPropertyDefinitions:{},
  });}
  const paints=arr=>(arr||[]).map(p=>({...clone(p),...(p.color?{color:Object.fromEntries(Object.entries(p.color).map(([k,v])=>[k,k==='a'?v:v/255]))}:{}),
    ...(p.tokenId?{boundVariables:{color:{type:'VARIABLE_ALIAS',id:p.tokenId}}}:{})}));
  function scene(model,prefix){
    const nodes=new Map();
    for(const d of model.nodes){const a=d.appearance||{},l=d.layout||{},identity=d.component?.identity;
      const n={id:prefix+':'+d.id,type:d.type,name:d.name,visible:d.visible,...d.bounds,
        opacity:a.opacity,fills:paints(a.fill),strokes:paints(a.stroke),strokeWeight:a.strokeWeight,
        fillStyleId:a.fillStyleId,strokeStyleId:a.strokeStyleId,strokeAlign:a.strokeAlign,dashPattern:a.dashPattern,
        effects:a.effects,effectStyleId:a.effectStyleId,cornerRadius:a.radius,
        layoutSizingHorizontal:l.sizingHorizontal,layoutSizingVertical:l.sizingVertical,
        componentPropertyReferences:clone(d.component?.propertyReferenceBindings||{}),
        componentProperties:Object.fromEntries(Object.entries(d.component?.properties||{}).map(([p,value])=>[p,{type:d.component.propertyTypes[p],value}])),
        resolvedVariableModes:clone(model.context.modes),
        getMainComponentAsync:async()=>failure==='main'&&prefix==='actual'&&d.id===f.nodeMap[f.child.selection[0]]&&++actualChildMainReads>1?null:mains.get(identity?.componentKey),
        exportAsync:async()=>new Uint8Array([1,2,3]),remove(){this.removed=true;},
        setExplicitVariableModeForCollection(){if(failure==='mode'&&prefix.startsWith('child-reference'))throw Error('mode unavailable');},
        setProperties(props){assert.notEqual(prefix,'actual');for(const [k,v]of Object.entries(props))this.componentProperties[k].value=v;},
      };
      if(l.mode!==undefined)Object.assign(n,{layoutMode:l.mode,itemSpacing:l.itemSpacing,primaryAxisAlignItems:l.primaryAxisAlignItems,counterAxisAlignItems:l.counterAxisAlignItems,
        paddingTop:l.padding?.top,paddingRight:l.padding?.right,paddingBottom:l.padding?.bottom,paddingLeft:l.padding?.left});
      if(d.type==='TEXT')Object.assign(n,{characters:d.text?.characters||'',fontName:{family:'Fixture',style:'Regular'},fontSize:14,lineHeight:{unit:'AUTO'},letterSpacing:{unit:'PIXELS',value:0},textCase:'ORIGINAL'});
      nodes.set(d.id,n);all.set(n.id,n);
    }
    for(const d of model.nodes){const n=nodes.get(d.id);n.parent=nodes.get(d.parentId)||page;if(d.childIds.length||['INSTANCE','FRAME','BOOLEAN_OPERATION'].includes(d.type))n.children=d.childIds.map(id=>nodes.get(id));}
    return {root:nodes.get(model.selection[0]),nodes};
  }
  const actual=scene(f.snapshot,'actual');page.selection=[actual.root];
  const create=(model,prefix)=>()=>{const root=scene(model,prefix+ ++sequence).root;created.push(root);return root;};
  mains.get(f.snapshot.source.componentKey).createInstance=create(hostReference,'host-reference');
  mains.get(f.child.source.componentKey).createInstance=create(childReference,'child-reference');
  const figma={currentPage:page,root:{name:'Plugin API simulation'},fileKey:'fixture',mixed:Symbol('mixed'),showUI(){},on(){},
    ui:{postMessage:m=>messages.push(m)},base64Encode:b=>Buffer.from(b).toString('base64'),
    getNodeByIdAsync:async id=>failure==='lookup'?null:all.get(id),
    variables:{getVariableCollectionByIdAsync:async id=>({id}),getVariableByIdAsync:async()=>null},
    createPage(){const p={id:'temporary',type:'PAGE',appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
  vm.runInContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),vm.createContext({figma,__html__:'',TextEncoder:undefined}));
  const compiled=f.run().contract;
  await figma.ui.onmessage({type:'test-selection',requestId:'child-capture',componentKey:f.snapshot.source.componentKey,acceptedComponentKeys:[],allowedComponentProperties:[],
    platform:'desktop',manualSourceHash:core.stableHash(f.manual),componentDependencyKeys:core.componentDependencyKeys(compiled)});
  assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);
  const output=messages.find(m=>m.type==='selection-test-result');assert.ok(output);
  const captures=output.snapshot.componentDependencyCaptures;assert.equal(captures.length,1);
  if(failure)assert.ok(captures[0].failure);
  else {
    const capture=captures[0];assert.equal(capture.failure,undefined);
    const childRoot=capture.snapshot.nodes.find(n=>capture.snapshot.selection.includes(n.id));
    assert.equal(childRoot.appearance.opacity,.5);assert.equal(childRoot.baseline.effective.appearance.opacity,1);
    assert.equal(capture.nodeMap[childRoot.id],capture.nodeId);assert.equal(capture.snapshot.source.componentKey,f.child.source.componentKey);
    const result=core.evaluateCompiledContract(JSON.parse(JSON.stringify(output.snapshot)),compiled);
    assert.equal(result.dependencyRuns[0].status,'executed',JSON.stringify(result.dependencyRuns));
    assert.ok(result.evaluations.some(e=>e.dependency&&e.classification==='violation'&&e.subjectNodeId===capture.nodeId));
  }
  assert.ok(created.every(n=>n.removed));assert.ok(pages.every(p=>p.removed));assert.equal(actual.root.removed,undefined);
  assert.equal(actual.nodes.get(f.nodeMap[f.child.selection[0]]).opacity,.5);
});

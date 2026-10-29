const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const fixture=require('./fixtures/button-icon-size-live-cases.json');
const clone=x=>JSON.parse(JSON.stringify(x));

// Plugin API simulation uses captured topology but independently constructed
// library stages. It does NOT claim to be a new live Figma acceptance run.
for(const failChild of [false,true])for(const rename of [false,true])test(`v4 Figma sandbox captures variant then nested swap and cleans up (child refusal=${failChild}, renamed=${rename})`,async()=>{
  const snapshot=clone(fixture.cases[1].snapshot),base=snapshot.instanceContentReferences.base;
  const parent=snapshot.instanceContentReferences.attempts[0].reference;
  const child=clone(parent);child.nodes[5].component=clone(snapshot.nodes[5].component);
  child.nodes[2].component.properties[child.nodes[5].component.propertyReferenceBindings.mainComponent]=child.nodes[5].component.identity.mainComponentId;
  snapshot.nodes[4].appearance.opacity=0.4;snapshot.nodes[5].appearance.opacity=0.5;snapshot.nodes[6].appearance.opacity=0.6;
  if(rename){snapshot.nodes[2].name='Custom wrapper';snapshot.nodes[5].name='Custom icon';}
  const messages=[],created=[],assignments=[],mains=new Map(),page={type:'PAGE',id:'user-page',selection:[]};let sequence=0;
  for(const model of [base,parent,child])for(const n of model.nodes){const id=n.component?.identity;if(id?.componentKey)mains.set(id.componentKey,{id:id.mainComponentId,key:id.componentKey,
    variantProperties:Object.fromEntries(Object.entries(n.component.properties||{}).filter(([p])=>n.component.propertyTypes[p]==='VARIANT')),
    parent:id.componentSetKey?{type:'COMPONENT_SET',key:id.componentSetKey,componentPropertyDefinitions:{}}:null});}
  function scene(input,prefix){
    const model=clone(input),nodes=new Map();
    function applyData(node,data){
      node.name=data.name;node.visible=data.visible;node.opacity=data.appearance.opacity;
      node.width=data.bounds.width;node.height=data.bounds.height;
      if(data.type==='TEXT')Object.assign(node,{characters:data.text?.characters||'',fontName:{family:'Fixture',style:'Regular'},fontSize:14,lineHeight:{unit:'AUTO'},letterSpacing:{unit:'PIXELS',value:0},textCase:'ORIGINAL'});
      node.componentPropertyReferences=clone(data.component?.propertyReferenceBindings||{});
      node.componentProperties=Object.fromEntries(Object.entries(data.component?.properties||{}).map(([p,value])=>[p,{type:data.component.propertyTypes[p],value}]));
    }
    function switchStage(id,next,kind){
      assert.notEqual(prefix,'actual');assignments.push({id,key:next.key,kind});
      if(id==='preview:5'&&failChild)throw Error('simulated child library failure');
      const stage=id==='preview:2'?parent:child;
      const ids=id==='preview:2'?[2,3,4,5,6]:[5,6];
      for(const i of ids){model.nodes[i]=clone(stage.nodes[i]);applyData(nodes.get(model.nodes[i].id),model.nodes[i]);}
      if(id==='preview:5'){
        const owner=model.nodes[2],prop=model.nodes[5].component.propertyReferenceBindings.mainComponent;
        owner.component.properties[prop]=next.id;nodes.get(owner.id).componentProperties[prop].value=next.id;
      }
    }
    for(const data of model.nodes){
      const node={id:`${prefix}:${data.id}`,type:data.type,children:[],resolvedVariableModes:clone(model.context.modes),
        getMainComponentAsync:async()=>mains.get(model.nodes.find(n=>n.id===data.id).component?.identity?.componentKey),
        exportAsync:async()=>new Uint8Array([1,2,3]),setExplicitVariableModeForCollection(){},remove(){this.removed=true;},
        getStyledTextSegments(){return [{fills:this.fills||[],boundVariables:this.boundVariables||{}}];},
        setProperties(props){
          if(data.id==='preview:2'){
            assert.deepEqual(JSON.parse(JSON.stringify(props)),{Type:'Icon-20'});
            switchStage(data.id,mains.get(parent.nodes[2].component.identity.componentKey),'variant-properties');
          }else for(const [p,v]of Object.entries(props)){this.componentProperties[p].value=v;model.nodes.find(n=>n.id===data.id).component.properties[p]=v;}
        },
      };
      applyData(node,data);
      Object.defineProperty(node,'mainComponent',{set(next){assert.equal(data.id,'preview:5');switchStage(data.id,next,'main-component');}});
      nodes.set(data.id,node);
    }
    for(const data of model.nodes){const n=nodes.get(data.id);n.parent=nodes.get(data.parentId)||page;n.children=data.childIds.map(id=>nodes.get(id));}
    const root=nodes.get(model.selection[0]);root.clone=()=>{const n=scene(model,`clone-${++sequence}`).root;created.push(n);return n;};
    return {root,nodes};
  }
  const actual=scene(snapshot,'actual');page.selection=[actual.root];
  mains.get(snapshot.source.componentKey).createInstance=()=>{const n=scene(base,`pristine-${++sequence}`).root;created.push(n);return n;};
  const pages=[],figma={currentPage:page,fileKey:'test',root:{name:'Test'},mixed:Symbol('mixed'),showUI(){},on(){},ui:{postMessage:m=>messages.push(m)},base64Encode:b=>Buffer.from(b).toString('base64'),
    variables:{getVariableCollectionByIdAsync:async id=>({id})},
    createPage(){const p={type:'PAGE',id:'temporary',appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
  vm.runInContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),vm.createContext({figma,__html__:'',TextEncoder:undefined}));
  await figma.ui.onmessage({type:'test-selection',requestId:'nested-reference',componentKey:snapshot.source.componentKey,acceptedComponentKeys:[],allowedComponentProperties:[],platform:'desktop',manualSourceHash:'unchanged'});
  assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);
  const result=messages.find(m=>m.type==='selection-test-result');assert.ok(result);
  assert.equal(result.snapshot.instanceContentReferences.schemaVersion,'apollo.instance-content-references.v4');
  assert.deepEqual(assignments.map(a=>a.kind),['variant-properties','main-component']);
  assert.equal(result.snapshot.instanceContentReferences.attempts[1].parentBoundaryNodeId,'preview:2');
  assert.deepEqual(JSON.parse(JSON.stringify(result.snapshot.instanceContentResults.map(r=>r.status))),failChild?['partial','unresolved']:['matched','matched']);
  assert.equal(result.matchedBaselineNodes,failChild?13:15);
  for(const id of [4,...(failChild?[]:[5,6])])assert.equal(result.snapshot.nodes[id].baseline.effective.appearance.opacity,1);
  assert.equal(result.snapshot.source.geometryCaptureVersion,1);
  assert.equal(result.snapshot.source.instanceIdentityVersion,1);
  if(rename){assert.equal(result.snapshot.nodes[2].name,'Custom wrapper');assert.equal(result.snapshot.nodes[5].name,'Custom icon');}
  for(const id of [4,...(failChild?[]:[5,6])]){
    const expected=(id===4?parent:child).nodes[id].bounds;
    assert.equal(result.snapshot.nodes[id].baseline.effective.bounds.width,expected.width);
    assert.equal(result.snapshot.nodes[id].baseline.effective.bounds.height,expected.height);
    assert.equal(result.snapshot.nodes[id].baseline.effective.bounds.x,undefined);
  }
  assert.equal(actual.nodes.get('preview:4').opacity,0.4);assert.equal(actual.nodes.get('preview:5').opacity,0.5);
  assert.ok(created.every(n=>n.removed));assert.ok(pages.every(p=>p.removed));assert.equal(actual.root.removed,undefined);
});

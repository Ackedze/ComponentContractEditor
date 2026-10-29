const fs=require('node:fs'),zlib=require('node:zlib'),vm=require('node:vm');
const core=require('../../dist/core.cjs');
const fixture=JSON.parse(zlib.gunzipSync(fs.readFileSync(require.resolve('../fixtures/spinner-live-20260926.json.gz'))));
const reports=fixture.files.filter(f=>f.name.startsWith('editor/')).map(f=>f.document);
const evidence=core.extractVariantEvidence(fixture.files.find(f=>f.name==='evidence/contract.generated.json').document.contracts);
const clone=x=>JSON.parse(JSON.stringify(x));

function evaluate(snapshot,manual=reports[0].sources.manual){
  const compiled=core.compileManualSource(manual,evidence),contract=core.prepareAuthoringPreviewContract(compiled.contract);
  const engine=core.evaluateCompiledContract(snapshot,contract);
  return {compiled,contract,engine,report:core.buildEditorValidationReport(engine,compiled,manual,snapshot)};
}

// Executes the actual bundled plugin controller against a Plugin API simulation.
// Reference and actual are separate original captures, never cloned from actual.
async function capture(report,{preview=false,missingReferenceWidth=false,mutateActual,mutateReference}={}){
  const source=clone(report.snapshot),reference=clone(source.instanceContentReferences.base);
  if(missingReferenceWidth)delete reference.nodes[0].bounds.width;
  const messages=[],created=[],pages=[],page={type:'PAGE',id:'fixture-page',selection:[]};
  const main={id:'library-main',key:source.source.componentKey,
    parent:{type:'COMPONENT_SET',key:source.source.componentSetKey,componentPropertyDefinitions:{}},
    componentPropertyDefinitions:{}};
  const paints=arr=>(arr||[]).map(p=>({...p,...(p.color?{color:{r:p.color.r/255,g:p.color.g/255,b:p.color.b/255}}:{}),
    ...(p.tokenId?{boundVariables:{color:{type:'VARIABLE_ALIAS',id:p.tokenId}}}:{})}));
  function scene(model,prefix){
    const nodes=new Map(model.nodes.map(d=>{
      const a=d.appearance,l=d.layout;
      const n={id:prefix+':'+d.id,type:d.type,name:d.name,visible:d.visible,...d.bounds,
        opacity:a.opacity,fills:paints(a.fill),strokes:paints(a.stroke),strokeWeight:a.strokeWeight,
        fillStyleId:a.fillStyleId,strokeStyleId:a.strokeStyleId,strokeAlign:a.strokeAlign,
        dashPattern:a.dashPattern,effects:a.effects,effectStyleId:a.effectStyleId,cornerRadius:a.radius,
        layoutSizingHorizontal:l.sizingHorizontal,layoutSizingVertical:l.sizingVertical,
        componentPropertyReferences:clone(d.component.propertyReferenceBindings||{}),
        componentProperties:Object.fromEntries(Object.entries(d.component.properties||{}).map(([p,value])=>[p,{type:d.component.propertyTypes[p],value}])),
        resolvedVariableModes:clone(model.context.modes),
        getMainComponentAsync:async()=>main,exportAsync:async()=>new Uint8Array([1,2,3]),
        remove(){this.removed=true;},setExplicitVariableModeForCollection(){},
        setProperties(props){for(const [k,v]of Object.entries(props))this.componentProperties[k].value=v;},
      };
      if(l.mode!==undefined)Object.assign(n,{layoutMode:l.mode,itemSpacing:l.itemSpacing,
        primaryAxisAlignItems:l.primaryAxisAlignItems,counterAxisAlignItems:l.counterAxisAlignItems,
        paddingTop:l.padding?.top,paddingRight:l.padding?.right,paddingBottom:l.padding?.bottom,paddingLeft:l.padding?.left});
      return [d.id,n];
    }));
    for(const d of model.nodes){const n=nodes.get(d.id);n.parent=nodes.get(d.parentId)||page;
      if(d.childIds.length||['INSTANCE','FRAME','BOOLEAN_OPERATION'].includes(d.type))n.children=d.childIds.map(id=>nodes.get(id));}
    return nodes.get(model.selection[0]);
  }
  const actual=scene(source,'actual');
  if(mutateActual)mutateActual(actual);
  page.selection=[actual];
  main.createInstance=()=>{const root=scene(reference,'independent');if(mutateReference)mutateReference(root);created.push(root);return root;};
  const figma={currentPage:page,root:{name:'Plugin API simulation'},fileKey:'fixture',mixed:Symbol('mixed'),showUI(){},on(){},
    ui:{postMessage:m=>messages.push(m)},base64Encode:b=>Buffer.from(b).toString('base64'),
    importComponentByKeyAsync:async()=>main,
    variables:{getVariableCollectionByIdAsync:async id=>({id}),getVariableByIdAsync:async()=>null},
    createPage(){const p={type:'PAGE',id:'temporary',appendChild(n){n.parent=this;},remove(){this.removed=true;}};pages.push(p);return p;}};
  vm.runInContext(fs.readFileSync(require.resolve('../../dist/code.js'),'utf8'),vm.createContext({figma,__html__:'',TextEncoder:undefined,setTimeout(){}}));
  await figma.ui.onmessage(preview
    ? {type:'render-preview',requestId:'spinner-preview',componentKey:main.key,variantProperties:source.nodes[0].component.properties,modes:source.context.modes,platform:'universal'}
    : {type:'test-selection',requestId:'spinner-selected',componentKey:main.key,acceptedComponentKeys:[],allowedComponentProperties:[],platform:'universal',manualSourceHash:core.stableHash(report.sources.manual)});
  const error=messages.find(m=>m.type==='plugin-error');if(error)throw Error(error.message);
  const output=messages.find(m=>m.type===(preview?'preview-result':'selection-test-result'));
  if(!output)throw Error('No capture: '+messages.map(m=>m.type).join(','));
  return {output:clone(output),actual,created,pages};
}
module.exports={reports,evidence,clone,evaluate,capture};

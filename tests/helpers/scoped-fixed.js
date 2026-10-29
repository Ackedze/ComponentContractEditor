const {core,clone,scenario}=require('./direct-group');
// Derived only from the existing invented direct-group fixture.
function scopedScenario(platform='desktop',background='True'){
 const f=scenario(1);
 f.childManual.component.platform='universal';f.childManual.component.platforms=['universal'];
 f.childManual.representations[0].platform='universal';f.childManual.rules[0].applicability.platforms=['universal'];
 const childContract=core.compileManualSource(f.childManual,f.childEvidence).contract;
 function snapshotFor(p,bg){
  const s=clone(f.snapshot),root=s.nodes[0],member=s.nodes[1],prefix=p==='desktop'?'desktop':'mobile';
  const identity={componentKey:prefix+'-'+bg,componentSetKey:prefix+'-set',mainComponentId:prefix+'-main-'+bg};
  root.component.identity=identity;root.component.properties={Background:bg};root.component.propertyTypes={Background:'VARIANT'};root.semantic.role='root';root.childIds=['frame'];
  const frame={id:'frame',parentId:'root',childIds:[member.id],order:1,name:prefix+' frame',type:'FRAME',visible:true,unknownFacts:[],semantic:{path:'Group / '+prefix+' frame'},appearance:{opacity:1},resolvedModes:{},component:{properties:{},propertyTypes:{},propertyReferences:[],propertyReferenceBindings:{}}};
  member.parentId=frame.id;member.order=2;member.semantic.path=frame.semantic.path+' / Button';
  member.component.sourceIdentity.ownerComponentKey=identity.componentKey;member.component.sourceIdentity.ownerMainComponentId=identity.mainComponentId;
  s.nodes=[root,frame,member];s.context.platform=p;s.source.componentKey=identity.componentKey;s.source.componentSetKey=identity.componentSetKey;
  const child=s.componentDependencyCaptures[0].snapshot;child.context.platform=p;
  child.variantReference=core.captureVariantReference(clone(child),child.source.componentKey,child.source.componentSetKey);
  s.variantReference=core.captureVariantReference(clone(s),identity.componentKey,identity.componentSetKey);
  // The synthetic independent master is frozen before any test mutation.
  return core.materializeEffectiveBaseline(s,clone(s)).snapshot;
 }
 const captures=['desktop','mobile-web'].flatMap(p=>['True','False'].map(b=>snapshotFor(p,b))),structures={},variants=[];
 for(const s of captures){const shape=s.variantReference.nodes,structureId=core.stableHash(shape);structures[structureId]=shape;variants.push({componentKey:s.source.componentKey,componentSetKey:s.source.componentSetKey,structureId,properties:clone(s.nodes[0].component.properties)});}
 const evidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:'synthetic-scoped-fixed',structures,variants};
 const manual=clone(f.manual);manual.component.platforms=['desktop','mobile-web'];manual.targets=[manual.targets[0]];
 manual.representations=['desktop','mobile-web'].map(p=>({id:p,kind:'figma',platform:p,status:'verified',locator:{componentSetKey:p==='desktop'?'desktop-set':'mobile-set'}}));
 manual.rules[0].applicability.platforms=['desktop','mobile-web'];manual.rules[0].targetScope='self-and-descendants';manual.rules[0].boundaryPolicy='component-owned@1';
 manual.rules[0].permission='forbidden';manual.rules[0].constraints=[{type:'propertyForbidden'}];
 manual.metadata.dependencyCompletionVersion=1;
 const bindings=manual.representations.map(rep=>{const s=captures.find(s=>s.context.platform===rep.platform&&s.nodes[0].component.properties.Background==='True');
  const childPath=Object.entries(s.variantReference.nodeProperties).find(([,v])=>v.identity?.componentSetKey==='button-set')[0];
  return {kind:'fixed-nested-scoped',id:rep.id==='desktop'?'desktop-child':'mobile-child',targetRole:'root',relativePath:'',ownerComponentSetKeys:[rep.locator.componentSetKey],activeVariant:{property:'Background',values:['True']},childPath,representationIds:[rep.id]};});
 manual.componentDependencies=[{id:'button',componentId:childContract.package.componentId,revision:7,manualSourceHash:childContract.package.manualSourceHash,compiledHash:core.stableHash(childContract),bindings}];
 const snapshot=captures.find(s=>s.context.platform===platform&&s.nodes[0].component.properties.Background===background);
 const compile=()=>core.compileManualSource(manual,evidence,[childContract]);
 const run=()=>{const compiled=compile(),contract=core.prepareAuthoringPreviewContract(compiled.contract),prepared=core.prepareValidationSnapshot(snapshot,contract),engine=core.evaluateCompiledContract(snapshot,contract);return {compiled,contract,prepared,engine};};
 const sync=()=>{const host=snapshot.nodes.find(n=>n.id==='member-0'),actual=snapshot.componentDependencyCaptures[0].snapshot.nodes[0];for(const k of ['appearance','visible','resolvedModes'])host[k]=clone(actual[k]);};
 return {core,clone,manual,evidence,childContract,snapshot,compile,run,sync};
}
module.exports={scopedScenario,clone,core};

const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../../dist/core.cjs');
const root=path.resolve(__dirname,'../../../../shared/design-system_ab/experiments/web-core/core');
const clone=x=>JSON.parse(JSON.stringify(x));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const childContract=read('Spinner/compiled/component-contract.v2.json');
const pin=read('Button/contract.manual.json').componentDependencies[0];
const fixture=require('../fixtures/button-dependencies.json');
const acceptance=read('Spinner/qa/layout-live-acceptance.2026-09-27.json');
const childReport=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'Spinner',acceptance.reportResults[0].fixtureFile))));

// Synthetic integration matrix, not a claim that each state was captured live.
// Independent Spinner actual/reference derive from the archived accepted L01 report.
function scenario({side='left',size=40,spinnerSize=size<=40?16:24}={}) {
  const manual=clone(fixture.manual), snapshot=clone(fixture.regularSnapshot);
  manual.componentDependencies=[clone(pin)];
  manual.componentDependencies[0].bindings=manual.componentDependencies[0].bindings.filter(b=>b.id===side);
  const rule=clone(read('Button/contract.manual.json').rules.find(r=>r.id.endsWith('addon-size-follows-button-size')));
  rule.constraints=rule.constraints.filter(c=>c.dependency?.contractDependencyId);
  rule.constraints[0].dependency.subjects=rule.constraints[0].dependency.subjects.filter(s=>s.targetRole===`${side}-addon`);
  rule.status='reviewed';manual.rules=[rule];
  const ownerPath=side==='left'?'LeftAddon / LeftAddon':'RightAddon / RightAddon';
  const rootNode=snapshot.nodes[0], owner=snapshot.nodes[side==='left'?2:11], target=snapshot.nodes[side==='left'?1:10];
  rootNode.component.properties.Size=String(size);target.visible=true;
  snapshot.nodes=snapshot.nodes.filter(n=>!String(n.semantic.path).startsWith(`${rootNode.name} / ${ownerPath} / `));
  owner.component.properties={Type:'Spinner'};owner.component.propertyTypes={Type:'VARIANT'};owner.component.propertyReferences=[];
  owner.component.identity={componentKey:'fixture-addon-spinner-'+size,componentSetKey:size<=40?'24e2f4ddddc89ef024f8f1ef3f4bc51a0e5eac68':'f33ce04b0651b062f10be88deab065ba67bf7171',mainComponentId:'fixture-addon-main'};
  const selected=childContract.facts.variantEvidence.variants.find(v=>v.properties.Size===String(spinnerSize)&&v.properties.Static==='False'&&v.properties.Inverted==='False');
  if(!selected)throw Error('Unknown Spinner variant');
  const child=clone(childReport.snapshot), base=clone(child.instanceContentReferences.base);
  for(const s of [child,base]){
    s.source.componentKey=selected.componentKey;s.source.componentSetKey=selected.componentSetKey;
    s.context.platform='universal';
    const r=s.nodes.find(n=>s.selection.includes(n.id));
    r.component.properties.Size=String(spinnerSize);r.component.identity={componentKey:selected.componentKey,componentSetKey:selected.componentSetKey,mainComponentId:'spinner-main'};
    for(const n of s.nodes){
      // Keep the captured shape/layout semantics; synthetic size matrix only.
      n.bounds.width=n.bounds.width*spinnerSize/48;n.bounds.height=n.bounds.height*spinnerSize/48;
      if(n.baseline?.effective?.bounds){n.baseline.effective.bounds.width*=spinnerSize/48;n.baseline.effective.bounds.height*=spinnerSize/48;}
      n.resolvedModes=clone(s.context.modes);
    }
  }
  child.instanceContentReferences.base=base;
  child.variantReference=core.captureVariantReference(base,selected.componentKey,selected.componentSetKey);
  child.nodes=core.materializeEffectiveBaseline(child,base,true).snapshot.nodes;
  const nodeMap=Object.fromEntries(child.nodes.map(n=>[n.id,`${side}-spinner:${n.id}`]));
  owner.childIds=[nodeMap[child.selection[0]]];
  for(const n of child.nodes){
    const host=clone(n);host.id=nodeMap[n.id];host.parentId=n.id===child.selection[0]?owner.id:nodeMap[n.parentId];
    host.childIds=n.childIds.map(id=>nodeMap[id]);host.semantic.path=`${rootNode.name} / ${ownerPath} / ${n.semantic.path}`;
    snapshot.nodes.push(host);
  }
  snapshot.instanceContentReferences=undefined;snapshot.instanceContentResults=undefined;snapshot.instanceBoundaries=undefined;
  const baseline=clone(snapshot);baseline.componentDependencyCaptures=undefined;
  snapshot.variantReference=core.captureVariantReference(baseline,snapshot.source.componentKey,snapshot.source.componentSetKey);
  const shape=snapshot.variantReference.nodes, structureId=core.stableHash(shape);
  const evidence={schemaVersion:'apollo.variant-anatomy.v1',sourceHash:'synthetic-button-spinner',structures:{[structureId]:shape},variants:[{componentKey:snapshot.source.componentKey,componentSetKey:snapshot.source.componentSetKey,structureId,properties:{Size:String(size)}}]};
  snapshot.componentDependencyCaptures=[{nodeId:nodeMap[child.selection[0]],nodeMap,snapshot:child}];
  const syncActual=()=>{for(const n of child.nodes){const h=snapshot.nodes.find(x=>x.id===nodeMap[n.id]);for(const k of ['appearance','bounds','component','layout','visible','unknownFacts'])h[k]=clone(n[k]);}};
  const run=(contracts=[childContract])=>{
    const compiled=core.compileManualSource(manual,evidence,contracts),contract=core.prepareAuthoringPreviewContract(compiled.contract);
    const engine=core.evaluateCompiledContract(snapshot,contract),report=core.buildEditorValidationReport(engine,compiled,manual,snapshot);
    return {compiled,contract,engine,report};
  };
  return {manual,snapshot,child,base,nodeMap,owner,target,evidence,childContract,run,syncActual,root:rootNode};
}
module.exports={scenario,clone,core,childContract};

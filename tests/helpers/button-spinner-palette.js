const fs=require('node:fs'),path=require('node:path');
const {scenario,clone,core,childContract}=require('./button-spinner');
const root=path.resolve(__dirname,'../../../../shared/design-system_ab/experiments/web-core/core/Button');
const manual=JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json')));
const ruleId='component:web-core.button.loading-spinner-style-follows-view';
const expected=(view,surface='default')=>({Inverted:(surface==='inverted'?view!=='Primary':['Accent','Primary'].includes(view))?'True':'False',Static:view==='Accent'?'True':'False'});
// Synthetic relation tests, not fresh Figma capture or validation of child paint baselines.
function paletteScenario({view='Accent',size=56,side='left',platform='desktop',surface='default',values=expected(view,surface)}={}) {
 const f=scenario({size,side}),rep=manual.representations.find(r=>r.kind==='figma'&&r.platform===platform&&r.surface===surface);
 f.manual.semanticApi=clone(manual.semanticApi); f.manual.representations=clone(manual.representations);
 // Keep writable generation inputs aligned with the same semantic API revision.
 f.manual.generation=clone(manual.generation);
 f.manual.rules=[clone(manual.rules.find(r=>r.id===ruleId))];
 for(const c of f.manual.rules[0].constraints)c.dependency.subjects=c.dependency.subjects.filter(s=>s.targetRole===`${side}-addon`);
 f.snapshot.context.platform=platform;f.root.component.properties.View=view;
 f.snapshot.source.componentSetKey=rep.locator.componentSetKey;
 f.root.component.identity={...f.root.component.identity,componentKey:f.snapshot.source.componentKey,componentSetKey:f.snapshot.source.componentSetKey};
 f.snapshot.variantReference.componentSetKey=f.snapshot.source.componentSetKey;
 f.snapshot.variantReference.properties.View=view;
 f.snapshot.variantReference.nodeProperties[''].properties.View=view;
 f.evidence.variants[0].componentSetKey=f.snapshot.source.componentSetKey;
 f.evidence.variants[0].properties.View=view;
 const setValues=(next)=>{
  const props={Size:String(size<=40?16:24),...next};
  const selected=childContract.facts.variantEvidence.variants.find(v=>Object.entries(props).every(([k,val])=>v.properties[k]===val));
  if(!selected)throw Error('Synthetic case requires a real Spinner variant');
  for(const s of [f.child,f.base]){
   s.source.componentKey=selected.componentKey;
   const n=s.nodes.find(n=>s.selection.includes(n.id));
   n.component.properties={...n.component.properties,...props};
   n.component.identity.componentKey=selected.componentKey;
  }
  f.child.variantReference=core.captureVariantReference(f.base,selected.componentKey,selected.componentSetKey);
  f.syncActual();
 };
 setValues(values);
 return {...f,setValues,expected:expected(view,surface)};
}
module.exports={paletteScenario,expected,ruleId,manual,core,clone};

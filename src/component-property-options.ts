import { isDeclaredRootTarget, stableHash, type CollectionProperty, type CompiledContract, type JsonValue, type ManualSource, type PreviewSnapshot, type SemanticApiProperty, type VariantEvidence } from './core/index';

export type PropertyOption = {name: string; type: CollectionProperty['propertyType']; values: JsonValue[]; finite: boolean};
export type PropertyOptionsContext = {
  manual: ManualSource; snapshot: PreviewSnapshot | null; variantEvidence?: VariantEvidence;
  dependencyContracts?: CompiledContract[]; roles?: () => string[]; ownerRole?: () => string;
  representationIds?: () => string[]; targetNodes?: Record<string, any>[];
  scope?: 'target';
  allowDependencies?: boolean;
};
const hashes = new WeakMap<object, string>();
const hash = (value: object) => {let h=hashes.get(value);if(!h){h=stableHash(value);hashes.set(value,h);}return h;};

/** Choices describe available API, never the authored permission/domain. */
export function componentPropertyOptions(context: PropertyOptionsContext, scope: 'owner'|'members'|'target'): PropertyOption[] {
  const result=new Map<string,PropertyOption>();
  const add=(name:string,type:PropertyOption['type'],values:JsonValue[]=[],finite=false)=>{
    const key=JSON.stringify([name,type]),entry=result.get(key)||{name,type,values:[],finite:false};
    for(const value of values)if(!entry.values.some(v=>JSON.stringify(v)===JSON.stringify(value)))entry.values.push(value);
    entry.finite ||= finite;result.set(key,entry);
  };
  const roles=context.roles?.() || [],repIds=context.representationIds?.() || [];
  const platforms=context.manual.representations.filter(r=>!repIds.length||repIds.includes(r.id)).map(r=>r.platform);
  const rootRoles=context.manual.targets.filter(isDeclaredRootTarget).map(t=>t.semanticRole);
  const root=scope==='owner'||scope==='target'&&(roles.some(r=>rootRoles.includes(r))||context.targetNodes?.some(n=>n.parentId===null));
  const sources:Array<{evidence?:VariantEvidence;api:SemanticApiProperty[];reps:ManualSource['representations']}>=[];
  if(root)sources.push({evidence:context.variantEvidence,api:context.manual.semanticApi,reps:context.manual.representations});
  for(const pin of context.manual.componentDependencies || []){
    if(context.allowDependencies===false||scope==='target'&&root)continue;
    const bindings=pin.bindings.filter(b=>b.kind==='direct-child'
      && (!roles.length||roles.includes(b.targetRole))
      && (!context.ownerRole?.()||b.ownerTargetRole===context.ownerRole())
      && (!repIds.length||b.representationIds.some(id=>repIds.includes(id))));
    if(scope==='owner'||!bindings.length)continue;
    const contracts=(context.dependencyContracts||[]).filter(c=>c.package.componentId===pin.componentId
      && c.package.manualSourceHash===pin.manualSourceHash&&hash(c)===pin.compiledHash);
    if(contracts.length===1){
      const c=contracts[0];
      if(scope==='target'&&!roles.length&&context.targetNodes?.length&&!context.targetNodes.some(n=>{
        const identity=n.component?.identity;
        return c.facts.variantEvidence?.variants.some(v=>v.componentKey===identity?.componentKey||v.componentSetKey===identity?.componentSetKey);
      }))continue;
      sources.push({evidence:c.facts.variantEvidence,api:c.facts.semanticApi,reps:c.facts.representations});
    }
  }
  const nodes=context.targetNodes || context.snapshot?.nodes.filter(n=>scope==='owner'?context.snapshot!.selection.includes(String(n.id))
    :scope==='target'?roles.includes((n.semantic as any)?.role):!context.snapshot!.selection.includes(String(n.id))&&(!roles.length||roles.includes((n.semantic as any)?.role))) || [];
  for(const node of nodes){const c=(node.component || {}) as any;
    for(const [name,type] of Object.entries(c.propertyTypes || {}))if(['VARIANT','BOOLEAN','TEXT','INSTANCE_SWAP'].includes(String(type)))
      add(name,type as PropertyOption['type'],type==='BOOLEAN'?[false,true]:[],type==='BOOLEAN');
  }
  for(const source of sources){
    const reps=source.reps.filter(r=>r.kind==='figma'&&r.status!=='deprecated'&&(!platforms.length||platforms.includes(r.platform)));
    const keys=new Set(reps.flatMap(r=>[r.locator.componentKey,r.locator.componentSetKey]).filter((k):k is string=>typeof k==='string'));
    for(const v of source.evidence?.variants || [])if(!keys.size||keys.has(v.componentKey)||keys.has(v.componentSetKey))
      for(const [name,value] of Object.entries(v.properties))if(name!=='raw')add(name,'VARIANT',[value],true);
    for(const property of source.api)for(const binding of property.bindings){
      if(!reps.some(r=>r.id===binding.representationId)||!binding.path.startsWith('component.properties.'))continue;
      const name=binding.path.slice('component.properties.'.length),transform=binding.transform||'identity';
      if(transform==='boolean-string'){add(name,'VARIANT');continue;} // Exact case comes from the Figma catalog.
      if(transform==='pascal-case')add(name,'VARIANT',(property.domain||[]).filter((v):v is string=>typeof v==='string').map(v=>v.charAt(0).toUpperCase()+v.slice(1)),true);
      else if(transform==='number-to-string')add(name,'VARIANT',(property.domain||[]).map(String),!!property.domain?.length);
      else if(transform==='identity'){
        const existing=[...result.values()].filter(p=>p.name===name);
        const type=existing.length===1?existing[0].type:property.valueType==='boolean'?'BOOLEAN':property.kind==='variant'?'VARIANT':'TEXT';
        add(name,type,property.valueType==='boolean'?[false,true]:property.domain||[],property.valueType==='boolean'||!!property.domain?.length);
      }
    }
  }
  return [...result.values()].sort((a,b)=>a.name.localeCompare(b.name));
}

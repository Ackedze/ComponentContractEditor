const {core,clone,scenario}=require('./direct-group');
function fixture(){
 const f=scenario(2);
 const views=['Accent','Primary','Secondary','Outlined','Transparent','Text'];
 f.childEvidence.variants=[];
 for(const view of views)for(const singleIcon of ['False','True'])f.childEvidence.variants.push({componentKey:`${view}-${singleIcon}`,componentSetKey:'button-set',structureId:Object.keys(f.childEvidence.structures)[0],properties:{View:view,SingleIcon:singleIcon,Size:'56'}});
 f.childManual.semanticApi=[{id:'enabled',kind:'state',valueType:'boolean',bindings:[{representationId:'desktop',path:'component.properties.Enabled'}]}];
 f.childContract=core.compileManualSource(f.childManual,f.childEvidence).contract;
 const pin=f.manual.componentDependencies[0];pin.manualSourceHash=f.childContract.package.manualSourceHash;pin.compiledHash=core.stableHash(f.childContract);
 for(const overflow of ['false','true'])f.evidence.variants.push({componentKey:'group-'+overflow,componentSetKey:'group-set',structureId:Object.keys(f.evidence.structures)[0],properties:{Overflow:overflow,Size:'56'}});
 const paths=core.snapshotPaths(f.snapshot),anatomy=f.snapshot.nodes.map(n=>({id:n.id,parentId:n.parentId,childIds:n.childIds,name:n.name,type:n.type,visible:n.visible,order:n.order,depth:n.parentId===null?0:1,path:['Group',paths.get(n.id)].filter(Boolean).join(' / '),semanticRole:n.id==='root'?'root':'button-'+n.id.split('-').at(-1),properties:n,unknownFacts:[]}));
 const workspace={manual:f.manual,variantEvidence:f.evidence,dependencyContracts:[f.childContract],anatomy,variants:[{id:'group-variant',componentKey:'group-variant',label:'Group',properties:{}}],hasVariantEvidence:true,tokens:[],warnings:[]};
 return {f,workspace,core,clone};
}
module.exports={fixture};

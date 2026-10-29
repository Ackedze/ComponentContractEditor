const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),esbuild=require('esbuild');
const {fixture}=require('./helpers/property-options-fixture');
const bundle=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'../src/dependency-port-options.ts')],bundle:true,format:'cjs',platform:'node',write:false}).outputFiles[0].text;
const loaded={exports:{}};new Function('module','exports','require',bundle)(loaded,loaded.exports,require);
const {declaredDependencyPortOptions}=loaded.exports;
function context(){
 const {f,core,clone}=fixture();f.childManual.targets[0].pathHint='Button';
 f.childManual.targets.push({id:'addon',semanticRole:'addon',label:'Addon',pathHint:'Button / LeftAddon',lineage:[],resolution:'resolved'});
 f.childManual.rules.push({...clone(f.childManual.rules[0]),id:'synthetic.icon-ports',capability:'composition.members',constraints:[{type:'dependencyDomain',values:['Synthetic icons'],dependency:{
  field:'catalog',subjects:[{targetRole:'addon',relativePath:'LeftAddon'}],portNames:['Icon-16','Icon-20','Icon-24'],baselinePolicy:'require-domain'}}]});
 const result=core.compileManualSource(f.childManual,f.childEvidence);assert(!result.issues.some(i=>i.level==='error'));
 f.childContract=result.contract;const pin=f.manual.componentDependencies[0];pin.manualSourceHash=f.childContract.package.manualSourceHash;pin.compiledHash=core.stableHash(f.childContract);
 return {manual:f.manual,contracts:[f.childContract],subject:{targetRole:'button-0',relativePath:'LeftAddon / LeftAddon'},core,clone};
}
const options=c=>declaredDependencyPortOptions(c.manual,c.contracts,c.subject);
test('exact pinned child declares all icon ports at the nested owner path, independent of preview Size',()=>{
 const c=context(),before=c.core.stableHash(c.manual);
 assert.deepEqual(options(c),['Icon-16','Icon-20','Icon-24'].map(name=>({name,componentIds:['fixture.button']})));
 assert.equal(c.core.stableHash(c.manual),before);c.subject.targetRole='button-1';assert.equal(options(c).length,3);
});
test('missing, conflicting, foreign and stale revision/hash pins cannot provide port choices',()=>{
 for(const change of [c=>c.contracts=[],c=>c.contracts.push(c.clone(c.contracts[0])),
  c=>c.manual.componentDependencies[0].revision++,c=>c.manual.componentDependencies[0].manualSourceHash='f'.repeat(64),
  c=>c.manual.componentDependencies[0].compiledHash='f'.repeat(64),c=>c.contracts[0].package.componentId='other.button']){
  const c=context();change(c);assert.deepEqual(options(c),[]);
 }
});
test('port choices require the exact role, nested path and compatible active representation',()=>{
 for(const change of [c=>c.subject.targetRole='unknown',c=>c.subject.relativePath='LeftAddon',
  c=>c.subject.relativePath='RightAddon / RightAddon',c=>c.manual.componentDependencies[0].bindings[0].representationIds=['missing'],
  c=>c.manual.representations[0].platform='mobile-web',c=>c.manual.representations[0].status='deprecated',
  c=>{c.contracts[0].facts.targets.find(t=>t.id==='addon').representationHints=[{representationId:'mobile',pathHint:'Button / LeftAddon'}];c.manual.componentDependencies[0].compiledHash=c.core.stableHash(c.contracts[0]);}]){
  const c=context();change(c);assert.deepEqual(options(c),[]);
 }
});
test('representation and variant hints supply exact addresses without importing another target API',()=>{
 const c=context(),target=c.contracts[0].facts.targets.find(t=>t.id==='addon');
 target.pathHint='Button / Wrong';target.representationHints=[{representationId:'desktop',pathHint:'Button / LeftAddon'}];
 c.manual.componentDependencies[0].compiledHash=c.core.stableHash(c.contracts[0]);assert.equal(options(c).length,3);
 target.representationHints=[{representationId:'desktop',pathHint:'Button / Wrong'}];
 target.variantHints=[{representationId:'desktop',componentKey:'another-size',pathHint:'Button / LeftAddon'}];
 c.manual.componentDependencies[0].compiledHash=c.core.stableHash(c.contracts[0]);assert.equal(options(c).length,3);
 c.contracts[0].facts.targets.push(c.clone(target));c.manual.componentDependencies[0].compiledHash=c.core.stableHash(c.contracts[0]);assert.deepEqual(options(c),[]);
});

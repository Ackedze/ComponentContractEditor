const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),esbuild=require('esbuild');
const {fixture}=require('./helpers/property-options-fixture');
const bundle=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'../src/component-property-options.ts')],bundle:true,format:'cjs',platform:'node',write:false}).outputFiles[0].text;
const loaded={exports:{}};new Function('module','exports','require',bundle)(loaded,loaded.exports,require);
const {componentPropertyOptions}=loaded.exports;
function context(){const {f}=fixture();return {manual:f.manual,snapshot:f.snapshot,variantEvidence:f.evidence,dependencyContracts:[f.childContract],roles:()=>['button-0','button-1'],ownerRole:()=> 'root',representationIds:()=>['desktop']};}
test('pinned catalog supplies all View variants rather than only the current Secondary preview',()=>{
 const c=context(),view=componentPropertyOptions(c,'members').find(p=>p.name==='View');
 assert.deepEqual(view.values,['Accent','Primary','Secondary','Outlined','Transparent','Text']);assert.equal(view.finite,true);
});
test('host lowercase Overflow, child title-case SingleIcon and actual boolean values keep their types',()=>{
 const c=context();assert.deepEqual(componentPropertyOptions(c,'owner').find(p=>p.name==='Overflow').values,['false','true']);
 const members=componentPropertyOptions(c,'members');assert.deepEqual(members.find(p=>p.name==='SingleIcon').values,['False','True']);
 assert.deepEqual(members.find(p=>p.name==='Enabled').values,[false,true]);
});
test('missing, foreign or mismatched pins cannot provide another component API',()=>{
 for(const mutate of [c=>c.dependencyContracts=[],c=>c.manual.componentDependencies[0].compiledHash='foreign',c=>c.roles=()=>['unbound'],c=>c.ownerRole=()=> 'other-owner']){
  const c=context();mutate(c);assert.equal(componentPropertyOptions(c,'members').find(p=>p.name==='SingleIcon'),undefined);
 }
});
test('a root property picker does not mix in child properties',()=>{
 const c=context();c.roles=()=>['root'];c.targetNodes=[c.snapshot.nodes[0]];
 assert.equal(componentPropertyOptions(c,'target').find(p=>p.name==='SingleIcon'),undefined);
 assert.deepEqual(componentPropertyOptions(c,'target').find(p=>p.name==='Overflow').values,['false','true']);
});

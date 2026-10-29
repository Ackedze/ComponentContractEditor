const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),esbuild=require('esbuild');
const {core,clone,scenario}=require('./helpers/direct-group');
const bundle=esbuild.buildSync({entryPoints:[path.resolve(__dirname,'../src/dependency-package-import.ts')],bundle:true,format:'cjs',platform:'node',write:false}).outputFiles[0].text;
const importedModule={exports:{}};new Function('module','exports',bundle)(importedModule,importedModule.exports);
const {readDependencyPackage}=importedModule.exports;
const bytes=x=>new TextEncoder().encode(JSON.stringify(x));
const zip=(manual,extra=[])=>core.createZip([core.textZipEntry('contract.manual.json',manual),...extra]);
function chain(){
 const f=scenario(2),spinner=clone(f.childManual);spinner.component.componentId='fixture.spinner';spinner.component.contractId='fixture.spinner';spinner.metadata.revision=8;
 spinner.rules.forEach(r=>{r.id='spinner-opacity';});const contract=core.compileManualSource(spinner).contract;
 const pin={id:'spinner',componentId:contract.package.componentId,revision:8,manualSourceHash:contract.package.manualSourceHash,compiledHash:core.stableHash(contract),
  bindings:[{id:'spinner',targetRole:'root',relativePath:'',childPath:'Spinner',ownerComponentSetKeys:['addon-set'],activeVariant:{property:'Swap',values:['Spinner']}}]};
 f.childManual.componentDependencies=[pin];return {manual:f.childManual,contract,pin};
}

test('compiled JSON stays read-only and retains exact hashes',async()=>{
 const f=scenario(2),before=core.stableHash(f.childContract),c=await readDependencyPackage('child.json',bytes(f.childContract),'fixture.group');
 assert.deepEqual(c,clone(f.childContract));assert.equal(core.stableHash(c),before);
});
test('reviewed source-only ZIP compiles with its exact transitive closure',async()=>{
 const f=chain(),before=core.stableHash(f.manual),c=await readDependencyPackage('child.zip',zip(f.manual,[core.textZipEntry('dependencies/fixture.spinner/component-contract.v2.json',f.contract)]),'fixture.group');
 assert.equal(c.status,'ready');assert.equal(c.package.manualRevision,7);assert.equal(c.package.manualSourceHash,before);
 assert.deepEqual(c.componentDependencies[0].contract,clone(f.contract));assert.equal(c.componentDependencies[0].compiledHash,f.pin.compiledHash);assert.equal(core.stableHash(f.manual),before);
});
test('supplied compiled output remains an exact gate, including corrupted output',async()=>{
 const f=scenario(2),compiled=core.compileManualSource(f.childManual).contract;
 assert.deepEqual(await readDependencyPackage('paired.zip',zip(f.childManual,[core.textZipEntry('compiled/component-contract.v2.json',compiled)]),'fixture.group'),clone(compiled));
 const altered=clone(compiled);altered.rules[0].message='changed';
 await assert.rejects(readDependencyPackage('bad.zip',zip(f.childManual,[core.textZipEntry('compiled/component-contract.v2.json',altered)]),'fixture.group'),/Compiled не совпадает/);
});
test('source ZIP does not promote Draft or invalid source to an accepted dependency',async()=>{
 const f=scenario(2),draft=clone(f.childManual);draft.rules[0].status='draft';
 await assert.rejects(readDependencyPackage('draft.zip',zip(draft),'fixture.group'),/без review/);
 const invalid=clone(f.childManual);invalid.rules[0].constraints=[{type:'propertyDomain',values:[]}];
 await assert.rejects(readDependencyPackage('invalid.zip',zip(invalid),'fixture.group'),/не готов/);
});
test('missing and stale transitive pins stay rejected',async()=>{
 const f=chain();await assert.rejects(readDependencyPackage('missing.zip',zip(f.manual),'fixture.group'),/не готов|не принят/);
 const stale=clone(f.contract);stale.package.manualSourceHash='f'.repeat(64);
 await assert.rejects(readDependencyPackage('stale.zip',zip(f.manual,[core.textZipEntry('dependencies/fixture.spinner/component-contract.v2.json',stale)]),'fixture.group'),/не готов|не принят/);
});
test('invalid JSON, self dependency and unsupported runtime cannot enter the package list',async()=>{
 const f=scenario(2);await assert.rejects(readDependencyPackage('bad.json',new TextEncoder().encode('{bad'),'fixture.group'));
 await assert.rejects(readDependencyPackage('self.json',bytes(f.childContract),'fixture.button'),/самого себя/);
 const unsupported=clone(f.childContract);unsupported.runtimePolicy.directChildDependenciesVersion=2;
 await assert.rejects(readDependencyPackage('unsupported.json',bytes(unsupported),'fixture.group'),/dependency-runtime-unsupported/);
});

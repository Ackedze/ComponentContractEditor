const test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript'),vm=require('node:vm'),fs=require('node:fs');
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../src/capture-diagnostics.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,
 {exports:api,require:()=>require('../dist/core.cjs')});
function input(){return {snapshot:{selection:['root'],nodes:[{id:'root',variantAvailability:{reason:'reference-catalog-structure-drift'}}],
 source:{componentKey:'variant',representationId:'desktop'},instanceContentReferences:{attempts:[]}},manual:{targets:[]}};}
test('catalog drift names the source repair and does not change report evidence',()=>{
 const {snapshot,manual}=input(),before=JSON.stringify(snapshot);const messages=api.captureDiagnostics(snapshot,manual);
 assert.equal(messages.length,1);assert.match(messages[0],/Каталог.*эталон/);assert.match(messages[0],/generated facts/);assert.equal(JSON.stringify(snapshot),before);
});
test('missing selected-variant binding remains distinct from nested reference gap',()=>{
 const {snapshot,manual}=input();delete snapshot.nodes[0].variantAvailability;
 manual.targets=[{id:'b',semanticRole:'b',resolution:'resolved',pathHint:'Host / Button',lineage:[],variantHints:[{representationId:'desktop',componentKey:'other',pathHint:'Host / Button'}]}];
 assert.equal(api.captureDiagnostics(snapshot,manual).length,1);
 snapshot.instanceContentReferences.attempts.push({failure:'replacement-component-unavailable'});
 assert.equal(api.captureDiagnostics(snapshot,manual).length,2);
 manual.targets[0].variantHints[0].componentKey='variant';assert.equal(api.captureDiagnostics(snapshot,manual).length,1);
 snapshot.instanceContentReferences.attempts=[];assert.equal(api.captureDiagnostics(snapshot,manual).length,0);
});
test('declared root aliases do not demand a child occurrence binding',()=>{
 const {snapshot,manual}=input();delete snapshot.nodes[0].variantAvailability;
 manual.targets=[{id:'root',semanticRole:'buttons-group',resolution:'resolved',pathHint:'Host',lineage:[]}];
 assert.equal(api.captureDiagnostics(snapshot,manual).length,0);
});

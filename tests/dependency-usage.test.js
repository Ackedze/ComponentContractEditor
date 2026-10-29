const test=require('node:test'),assert=require('node:assert/strict');
const {scenario,clone,core}=require('./helpers/dependency-usage');
test('Editor delegates usage compilation and evaluation to the shared core',()=>{
 const f=scenario(),r=f.run(),shared=require('../../Apollo/packages/component-contract-core/dist/core.cjs');
 assert.deepEqual(clone(core.compileManualSource(f.manual,f.evidence,[f.childContract])),clone(shared.compileManualSource(f.manual,f.evidence,[f.childContract])));
 assert.deepEqual(clone(shared.evaluateCompiledContract(f.parent,r.contract)),clone(r.engine));
 assert.deepEqual(core.buildExportBundle(f.manual,f.evidence,[f.childContract]),shared.buildExportBundle(f.manual,f.evidence,[f.childContract]));
});
test('Editor report/download keeps the exact reader snapshot and source producer',()=>{
 const f=scenario(),r=f.run(),report=core.buildEditorValidationReport(r.engine,r.compiled,f.manual,f.parent,{hiddenTargetCoverageVersion:1});
 const download=core.buildValidationReportDownload({manual:f.manual,compiled:r.compiled,evaluatedContract:r.contract,snapshot:f.parent,anatomy:[],
  engineResult:r.engine,result:report,capture:null,trigger:'selected-instance',generatedAt:'2026-10-12T00:00:00Z'});
 const saved=JSON.parse(download.json);
 assert.equal(saved.editorVersion,`component-contract-editor@${require('../package.json').version}`);
 assert.equal(saved.sources.compiledContract.package.sourceExportVersion,'component-contract-editor@0.2.104');
 assert.deepEqual(clone(core.evaluateCompiledContract(saved.snapshot,saved.runtime.evaluatedContract)),saved.results.engine);
 assert.deepEqual(saved.snapshot.editorDependencyUsageV1,undefined);
 assert.equal(saved.snapshot.nodes[0].editorDependencyUsageV1['bottom-link'].characterCount,5);
});

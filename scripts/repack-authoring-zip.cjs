// Repack an old Editor ZIP with its original read-only Athena JSONs.
// Usage: node scripts/repack-authoring-zip.cjs OLD.zip ATHENA_DIR OUTPUT.zip
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const core=require('../dist/core.cjs');

async function main(){
 const [archive,sourceDir,output]=process.argv.slice(2);
 if(!archive||!sourceDir||!output)throw new Error('Usage: repack-authoring-zip.cjs OLD.zip ATHENA_DIR OUTPUT.zip');
 const entries=await core.readZip(fs.readFileSync(archive));
 const original=entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)}));
 const manualEntry=original.find(e=>e.name.endsWith('contract.manual.json'));
 assert(manualEntry,'Old ZIP must contain contract.manual.json');
 const originalManual=JSON.parse(manualEntry.text);
 const names=originalManual.source?.importedFiles||[];
 assert(names.length,'Manual must list its Athena inputs');
 const sources=names.map(name=>{
  const base=path.basename(name),file=path.join(sourceDir,base);
  assert(fs.existsSync(file),`Missing Athena source: ${base}`);
  return {name:base,text:fs.readFileSync(file,'utf8')};
 });
 const imported=core.importWorkspace([...original,...sources]);
 assert.deepEqual(imported.manual,originalManual,'Repack must keep authored rules byte-equivalent as JSON');
 assert(imported.anatomy.length>0 && imported.hasVariantEvidence,'Full generated Figma evidence is required');
 const bundle=core.buildExportBundle(imported.manual,imported.variantEvidence,imported.dependencyContracts);
 assert(bundle.validation.valid,'Combined source does not compile');
 const zip=core.buildAuthoringZip(bundle,[...original,...sources]);
 const reopened=core.importWorkspace((await core.readZip(zip)).map(e=>({name:e.name,text:core.zipEntryText(e)})));
 assert.deepEqual(reopened.manual,originalManual);
 assert.deepEqual(reopened.anatomy,imported.anatomy);
 assert.equal(reopened.hasVariantEvidence,true);
 fs.writeFileSync(output,zip,{flag:'wx'});
 console.log(JSON.stringify({output,revision:reopened.manual.metadata.revision,rules:reopened.manual.rules.length,anatomyNodes:reopened.anatomy.length,variants:reopened.variants.length}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

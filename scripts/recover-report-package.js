// Recovery copy only: preserve the report's manual verbatim, reuse read-only Athena
// evidence, compile derived artifacts and never overwrite an existing destination.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const core = require('../dist/core.cjs');

async function main() {
  const [reportPath, inputPath, outputPath] = process.argv.slice(2);
  if (!reportPath || !inputPath || !outputPath) throw new Error('Usage: node scripts/recover-report-package.js report.json original-input.zip new-recovery.zip');
  if (fs.existsSync(outputPath)) throw new Error('Destination already exists; refusing to overwrite it.');
  const reportBytes = fs.readFileSync(reportPath), inputBytes = fs.readFileSync(inputPath);
  const report = JSON.parse(reportBytes);
  assert.equal(report.documentType, 'component-contract-validation-report');
  const manual = report.sources.manual;
  assert.equal(core.stableHash(manual), report.run.manualSourceHash, 'Report manual hash mismatch');
  const entries = await core.readZip(new Uint8Array(inputBytes));
  const workspace = core.importWorkspace(entries.filter(e => e.name.endsWith('.json')).map(e => ({ name: e.name, text: core.zipEntryText(e) })));
  assert.equal(manual.component.componentId, workspace.manual.component.componentId, 'Component mismatch');
  assert.ok(manual.metadata.revision >= workspace.manual.metadata.revision, 'Recovery must not silently downgrade the base package');
  for (const rule of workspace.manual.rules) {
    assert.deepEqual(manual.rules.find(candidate => candidate.id === rule.id), rule, `Changed base rule ${rule.id}; manual reconciliation required`);
  }
  const evidence = entries.filter(e => e.name.startsWith('evidence/'));
  assert.ok(evidence.length && workspace.variantEvidence, 'Base ZIP must contain read-only Athena evidence');
  const bundle = core.buildExportBundle(manual, workspace.variantEvidence);
  assert.equal(bundle.validation.valid, true, 'Recovered source does not compile');
  assert.deepEqual(bundle.compiled.facts.variantEvidence, report.runtime.evaluatedContract.facts.variantEvidence,
    'Athena evidence differs from the source report; investigate before recovery');
  const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  const recovery = {
    documentType: 'component-contract-recovery-provenance',
    sourceReport: path.basename(reportPath), sourceReportSha256: sha256(reportBytes),
    athenaInput: path.basename(inputPath), athenaInputSha256: sha256(inputBytes),
    manualRevision: manual.metadata.revision, manualSourceHash: core.stableHash(manual),
    ruleCount: manual.rules.length, compilerVersion: bundle.compiled.package.sourceExportVersion,
    copiedEvidence: evidence.map(e => ({ name: e.name, sha256: sha256(e.data) })),
    normativeChanges: false, canonicalSourceReplaced: false,
  };
  const zip = core.createZip([
    ...evidence,
    core.textZipEntry('contract.manual.json', manual),
    core.textZipEntry('compiled/component-contract.v2.json', bundle.compiled),
    core.textZipEntry('coverage.json', bundle.coverage),
    core.textZipEntry('validation-report.json', bundle.validation),
    core.textZipEntry('recovery-provenance.json', recovery),
  ]);
  const restored = await core.readZip(zip);
  const imported = core.importWorkspace(restored.filter(e => e.name.endsWith('.json')).map(e => ({ name: e.name, text: core.zipEntryText(e) })));
  assert.deepEqual(imported.manual, manual, 'ZIP import changed manual source');
  for (const entry of evidence) assert.deepEqual(restored.find(e => e.name === entry.name).data, entry.data);
  assert.equal(sha256(fs.readFileSync(reportPath)), sha256(reportBytes));
  assert.equal(sha256(fs.readFileSync(inputPath)), sha256(inputBytes));
  fs.writeFileSync(outputPath, zip, { flag: 'wx' });
  console.log(JSON.stringify({ outputPath, ...recovery }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

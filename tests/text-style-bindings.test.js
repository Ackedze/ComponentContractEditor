const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const core=require('../dist/core.cjs');
const root=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Amount/authoring');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),clone=v=>JSON.parse(JSON.stringify(v));
const manual=read('contract.manual.json'),compiled=read('compiled/component-contract.v2.json');
const contract=core.prepareAuthoringPreviewContract(compiled),catalog=contract.facts.variantEvidence.textStyleCatalogs[0];
const fact=core.textStyleBindingFact(catalog.id),key=fact.split('.')[1];
const style=i=>'S:'+catalog.styles[i].key+',9221:132';
const text=(s,part='Major')=>s.nodes.find(n=>n.semantic.path==='Amount / '+part+' / '+part);
const fixture=time=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures/r3-editor-0.2.56/amount.validation-report.2026-09-29T'+time+'Z.json.gz'))));
const clean=()=>fixture('13-05-38-184').snapshot;
function run(s,c=contract){const engine=core.evaluateCompiledContract(s,c);return {engine,report:core.buildEditorValidationReport(engine,{contract:c,issues:[]},manual,s)};}
const checks=r=>r.engine.evaluations.filter(e=>e.ruleId.includes('-text-style-binding-required.'));
const result=(r,part='major')=>checks(r).find(e=>e.ruleId.includes('.'+part+'-')).classification;
for(const part of ['Major','Minor','Currency']) test(`${part}: detach without changing font values is a separate violation`,()=>{
  const s=clean(),n=text(s,part),font=clone(n.text);n.appearance.typography.styleId='';
  const r=run(s);assert.equal(result(r,part.toLowerCase()),'violation');assert.deepEqual(n.text,font);assert(r.report.scenarioCoverage.complete);
});
test('different approved styles are allowed without default-style or font-equality checks',()=>{
  const s=clean();['Major','Minor','Currency'].forEach((p,i)=>text(s,p).appearance.typography={styleId:style(i)});
  assert(checks(run(s)).every(e=>e.classification==='compliant'));
});
for(const id of ['S:'+'0'.repeat(40)+',123:45']) test(`unapproved/local style ${id} fails even with a library-like name`,()=>{
  const s=clean();text(s).appearance.typography={styleId:id,name:catalog.styles[0].name};assert.equal(result(run(s)),'violation');
});
test('all text ranges are checked; mixed approved styles pass and partial detach fails',()=>{
  const s=clean(),n=text(s);n.text.characters='1234';
  n.textStyleEvidenceV1={version:1,segments:[{start:0,end:2,styleId:style(0)},{start:2,end:4,styleId:style(1)}]};
  assert.equal(result(run(s)),'compliant');n.textStyleEvidenceV1.segments[1].styleId='';assert.equal(result(run(s)),'violation');
});
test('empty Custom text is allowed but still requires a style binding',()=>{
  const s=fixture('13-05-38-184').snapshot,n=text(s,'Currency');n.text.characters='';
  n.appearance.typography={styleId:style(0)};n.textStyleEvidenceV1={version:1,segments:[]};assert.equal(result(run(s),'currency'),'compliant');
  n.appearance.typography.styleId='';assert.equal(result(run(s),'currency'),'violation');
});
const unknownMutations=[
  n=>delete n.appearance.typography,n=>n.appearance.typography={},n=>n.appearance.typography.styleId='Symbol(mixed)',
  n=>n.unknownFacts.push('appearance.typography'),n=>n.appearance.typography.styleId='123:45',n=>n.textStyleEvidenceV1={version:2,styleId:style(0)},
  n=>n.textStyleEvidenceV1={version:1,styleId:style(0),segments:[]},
  n=>n.textStyleEvidenceV1={version:1,segments:[null]},
  n=>n.textStyleEvidenceV1={version:1,segments:[{start:1,end:n.text.characters.length,styleId:style(0)}]},
  n=>n.textStyleEvidenceV1={version:1,segments:[{start:0,end:n.text.characters.length}]},
];
unknownMutations.forEach((mutate,i)=>test(`missing/malformed style capture ${i} cannot be a complete pass`,()=>{
  const s=clean();mutate(text(s));const r=run(s);assert.equal(result(r),'human-review');assert(!r.report.scenarioCoverage.complete);
}));
test('unknown captured styles never inherit a cached approved derived binding',()=>{
  const s=core.prepareValidationSnapshot(clean(),contract),n=text(s);assert(n.textStyleBindingsV1[key].library);
  delete n.appearance.typography;const r=run(s);assert.equal(result(r),'human-review');assert(!r.report.scenarioCoverage.complete);
});
test('hidden text / hidden part do not require binding; unknown visibility does not pass',()=>{
  for(const part of ['Minor','Currency']){const s=clean(),n=text(s,part);n.visible=false;n.appearance.typography.styleId='';assert.notEqual(result(run(s),part.toLowerCase()),'violation');}
  const s=clean();delete text(s).visible;delete text(s).visibility;assert(!run(s).report.scenarioCoverage.complete);
});
test('external Addon descendants are not covered by Amount typography rules',()=>{
  const s=fixture('13-06-41-096').snapshot;for(const n of s.nodes.filter(n=>n.type==='TEXT'&&n.semantic.path.includes('Addon')))n.appearance.typography={styleId:''};
  const r=run(s);assert.equal(checks(r).length,3);assert(checks(r).every(e=>['compliant','not-applicable'].includes(e.classification)));
});
test('missing, duplicate or invalid pinned catalogs exclude compilation and keep validation incomplete',()=>{
  for(const mutate of [e=>delete e.textStyleCatalogs,e=>e.textStyleCatalogs.push(clone(e.textStyleCatalogs[0])),e=>e.textStyleCatalogs[0].styles[0].key='invalid']){
    const e=clone(compiled.facts.variantEvidence);mutate(e);const c=core.compileManualSource(manual,e);
    assert(c.issues.some(i=>i.code==='TEXT_STYLE_CATALOG_MISSING'));assert.equal(c.contract.nonExecutableRules.filter(r=>r.ruleId?.includes('text-style')||r.sourceRuleId?.includes('text-style')).length,3);
    const engine=core.evaluateCompiledContract(clean(),core.prepareAuthoringPreviewContract(c.contract));
    assert(!core.buildEditorValidationReport(engine,c,manual,clean()).scenarioCoverage.complete);
  }
});
test('runtime missing catalogs remains unknown, never guessed from font or style name',()=>{
  const c=clone(contract);delete c.facts.variantEvidence.textStyleCatalogs;assert.equal(result(run(clean(),c)),'human-review');
});
test('new feature is opt-in; old r3 contracts retain exact engine results',()=>{
  for(const time of ['13-04-23-316','13-04-50-809','13-05-38-184','13-06-02-132','13-06-41-096','13-06-58-937','13-07-07-337','13-07-37-413']){
    const r=fixture(time);const historical=JSON.parse(fs.readFileSync(path.join(root,'../history/r3-editor-0.2.56/compiled/component-contract.v2.json')));
    const e=core.evaluateCompiledContract(r.snapshot,core.prepareAuthoringPreviewContract(historical));
    assert.equal(core.stableHash(e),core.stableHash(r.results.engine));
  }
});
test('both missed detachments are detected in addition to the original violations',()=>{
  for(const [time,part] of [['13-06-02-132','currency'],['13-07-37-413','major']]){
    const r=run(fixture(time).snapshot);assert.equal(result(r,part),'violation');assert(r.report.scenarioCoverage.complete);
    assert.equal(r.engine.evaluations.filter(e=>e.classification==='violation').length,2);
  }
});
test('repeated preparation is deterministic and does not mutate raw capture',()=>{
  const s=clean(),before=JSON.stringify(s),p=core.prepareValidationSnapshot(s,contract);assert.deepEqual(core.prepareValidationSnapshot(p,contract),p);assert.equal(JSON.stringify(s),before);
});
test('native capture preserves range bindings and resolves file-local IDs by key',async()=>{
  let calls=0;const native={textStyleId:'123:45',getStyledTextSegments:()=>[{start:0,end:1,textStyleId:'123:45'},{start:1,end:2,textStyleId:style(1)}]};
  const captured=await core.captureTextStyleEvidence(native,async id=>{calls++;assert.equal(id,'123:45');return catalog.styles[0].key;});
  assert.equal(calls,1);assert.equal(captured.keysById['123:45'],catalog.styles[0].key);
  const s=clean(),n=text(s);n.text.characters='12';n.appearance.typography={styleId:'123:45'};n.textStyleEvidenceV1=captured;
  assert.equal(result(run(s)),'compliant');captured.keysById['123:45']='0'.repeat(40);assert.equal(result(run(s)),'violation');
  delete captured.keysById['123:45'];assert.equal(result(run(s)),'human-review');
});
test('failed range capture is incomplete, not silently converted to uniform capture',async()=>{
  for(const native of [{textStyleId:style(0)},{textStyleId:style(0),getStyledTextSegments:()=>{throw Error('capture failed');}}]){
    const s=clean(),n=text(s);n.appearance.typography={styleId:style(0)};n.textStyleEvidenceV1=await core.captureTextStyleEvidence(native,async()=>undefined);
    assert.equal(result(run(s)),'human-review');
  }
});
test('range evidence never changes legacy appearance/baseline equality',async()=>{
  const s=clean(),before=clone(text(s).appearance);const n=text(s);
  n.textStyleEvidenceV1=await core.captureTextStyleEvidence({textStyleId:n.appearance.typography.styleId,getStyledTextSegments:()=>[{start:0,end:n.text.characters.length,textStyleId:n.appearance.typography.styleId}]},async()=>undefined);
  const p=core.prepareValidationSnapshot(s,contract);assert.deepEqual(text(p).appearance,before);
  n.unknownFacts.push('textStyleEvidenceV1');assert.equal(result(run(s)),'human-review');
});

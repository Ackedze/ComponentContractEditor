const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), crypto = require('node:crypto');
const core = require('../dist/core.cjs');
const root = path.resolve(__dirname, '../../../shared/design-system_ab/experiments/web-core/core/Amount/authoring');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p)));
const manual = read('contract.manual.json'), evidence = core.extractVariantEvidence(read('evidence/contract.generated.json').contracts);
evidence.textStyleCatalogs=core.extractTextStyleCatalogs([{name:'Web _ Typography.json',data:read('sources/design-system_ab/JSONS/styles/Web _ Typography.json')}]);
const compiled = core.compileManualSource(manual,evidence), contract = core.prepareAuthoringPreviewContract(compiled.contract);
const review = read('reports/live-review-r2.2026-09-29.json');
const clone = v => JSON.parse(JSON.stringify(v));
function fixture(id='A05') {
  const entry = review.reportResults.find(r => r.caseId === id);
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root,entry.fixtureFile)));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  return JSON.parse(bytes).snapshot;
}
const node = (s,p) => s.nodes.find(n => n.semantic.path === 'Amount / '+p);
const bad = r => r.engine.evaluations.filter(e => e.classification === 'violation');
function run(s,c=contract) {
  const engine = core.evaluateCompiledContract(s,c);
  return {engine,prepared:core.prepareValidationSnapshot(s,c),report:core.buildEditorValidationReport(engine,{...compiled,contract:c},manual,s)};
}
function swap(s) {
  // Synthetic native swap: BOOLEAN anchor survives, name and subtree change.
  s.source.propertyReferenceIdentityVersion = 1;
  const addon=node(s,'Addon'), children=s.nodes.filter(n=>n.semantic.path.startsWith('Amount / Addon / '));
  s.nodes=s.nodes.filter(n=>!children.includes(n));
  addon.childIds=[]; addon.name='Arbitrary replacement'; addon.semantic.path='Amount / Arbitrary replacement';
  addon.component.identity={componentKey:'arbitrary-component-key'};
  addon.appearance.fill=[{type:'SOLID',visible:true,opacity:1,tokenId:null,colorHex:'#123456'}];
  return addon;
}
test('Amount r5 compiles to explicit capabilities without product policies',()=>{
  assert.deepEqual(compiled.issues,[]); assert.equal(manual.metadata.revision,5); assert.equal(manual.rules.length,31);
  assert.equal(compiled.contract.rules.length,47); assert.equal(compiled.contract.nonExecutableRules.length,0);
  assert.equal(compiled.contract.runtimePolicy.paintBindingFactsVersion,1);assert.equal(compiled.contract.runtimePolicy.slotTargetFactsVersion,1);
  assert(manual.rules.every(r=>!r.applicability.products.length&&!r.applicability.channels.length));
});
for(const entry of review.reportResults) test(`r4 re-evaluates archived ${entry.caseId} (not new live acceptance)`,()=>{
  const s=fixture(entry.caseId), before=JSON.stringify(s), r=run(s);
  const addon=s.nodes[0].component.properties['Addon#100902:0'];
  const expected=[];
  if(['A14B','A14C'].includes(entry.caseId)) {
    assert.equal(node(s,'Currency / Currency').appearance.typography.styleId,'');
    expected.push('component:web-core.amount.currency-text-style-binding-required.1.1');
  }
  if(addon)expected.push('component:web-core.amount.addon-content-is-configurable.1.2');
  if(entry.caseId==='A15')expected.push('component:web-core.amount.layer-properties-use-effective-baseline.1.6');
  if(entry.caseId==='A16')expected.push('component:web-core.amount.major-required.1.1','component:web-core.amount.fixed-part-order.visibility-011.1.1');
  assert.deepEqual(bad(r).map(e=>e.ruleId).sort(),expected.sort());
  assert.equal(r.report.scenarioCoverage.complete,!entry.caseId.startsWith('A17'));
  assert.equal(JSON.stringify(s),before);
  assert.deepEqual(core.prepareValidationSnapshot(r.prepared,contract),r.prepared);
});
for(const part of ['Major','Minor','Currency']) test(`${part}: detached color fails even when RGB is unchanged`,()=>{
  const s=fixture(),n=node(s,part+' / '+part); n.appearance.fill[0].tokenId=null;
  const r=run(s);assert(r.report.scenarioCoverage.complete);
  assert(bad(r).some(e=>e.ruleId.includes(part.toLowerCase()+'-colors-use-tokens')));
});
test('different tokens and typography in different parts are allowed; hidden paints are inactive',()=>{
  const s=fixture();for(const [i,part] of ['Major','Minor','Currency'].entries()){
    const n=node(s,part+' / '+part);n.appearance.fill[0].tokenId='token:'+i;n.text.fontSize=12+i*8;
    n.appearance.fill.push({type:'SOLID',visible:false,opacity:1,tokenId:null});
  }
  const r=run(s);assert.deepEqual(bad(r),[]);assert(r.report.scenarioCoverage.complete);
});
test('each paint and stroke checked; one token does not conceal a second raw color',()=>{
  for(const kind of ['fill','stroke']){const s=fixture();node(s,'Major / Major').appearance[kind].push({type:'SOLID',visible:true,opacity:1,tokenId:null});assert(bad(run(s)).some(e=>e.ruleId.includes('major-colors-use-tokens')));}
});
test('unknown paints, missing token capture and malformed IDs never produce full pass',()=>{
  for(const mutate of [n=>delete n.appearance.fill,n=>n.unknownFacts.push('appearance.fill'),n=>n.appearance.fill[0].tokenId={}]){
    const s=fixture();mutate(node(s,'Major / Major'));const r=run(s);assert(!r.report.scenarioCoverage.complete);assert(!bad(r).some(e=>e.ruleId.includes('major-colors-use-tokens')));
  }
});
test('gradient token contract checks every visible stop; raw/unknown stop not disguised',()=>{
  for(const [tokenId,expected] of [['token:stop','compliant'],[null,'violation'],[undefined,'human-review']]){
    const s=fixture(),n=node(s,'Major / Major');n.appearance.fill=[{type:'GRADIENT_LINEAR',visible:true,opacity:1,gradientTransform:[[1,0,0],[0,1,0]],gradientStops:[{position:0,tokenId:'token:first',color:{r:0,g:0,b:0,a:1}},{position:1,tokenId,color:{r:1,g:1,b:1,a:1}}]}];
    const r=run(s), e=r.engine.evaluations.find(e=>e.ruleId==='component:web-core.amount.major-colors-use-tokens.1.1'&&e.subjectNodeId===n.id);
    assert.equal(e?.classification,expected);
  }
});
test('Currency Custom accepts arbitrary and empty text, no format/length constraint',()=>{
  for(const text of ['', 'RUB', '🥑 anything\n随便 / % 001','x'.repeat(2000)]){
    const s=fixture('A13');node(s,'Currency / Currency').text.characters=text;
    const r=run(s);assert.deepEqual(bad(r),[]);assert(r.report.scenarioCoverage.complete);
    assert.equal(r.engine.evaluations.find(e=>e.ruleId.includes('currency-standard-text')).classification,'not-applicable');
  }
});
test('standard Currency uses selected Athena variant, never retained host text; changed symbol fails',()=>{
  for(const id of ['A05','A14B','A14C']){
    const s=fixture(id),n=node(s,'Currency / Currency');
    // Isolate currency text semantics; archived A14B/C independently have detached Text Styles.
    n.appearance.typography.styleId=node(s,'Major / Major').appearance.typography.styleId;
    const r=run(s);assert.deepEqual(bad(r),[]);
    assert.notEqual(r.prepared.nodes.find(x=>x.id===n.id).libraryTextV1,undefined);
    n.text.characters='WRONG';assert(bad(run(s)).some(e=>e.ruleId.includes('currency-standard-text')));
  }
});
test('missing/ambiguous library evidence is unknown, not fallback to actual text',()=>{
  for(const mutate of [c=>delete c.facts.variantEvidence.libraryText,c=>c.facts.variantEvidence.libraryText.push(clone(c.facts.variantEvidence.libraryText.find(x=>x.properties.Type==='USD'&&x.properties.Opacity==='False')))]){
    const c=clone(contract);mutate(c);const r=run(fixture('A14B'),c);assert(!r.report.scenarioCoverage.complete);assert(!bad(r).some(e=>e.ruleId.includes('currency-standard-text')));
  }
});
test('unknown or wrong-typed Currency.Type does not mean Custom',()=>{
  for(const mutate of [n=>delete n.component.properties.Type,n=>n.component.propertyTypes.Type='TEXT',n=>n.unknownFacts.push('component.properties.Type')]){
    const s=fixture();mutate(node(s,'Currency'));const r=run(s);assert(!r.report.scenarioCoverage.complete);assert.equal(r.prepared.nodes[0].semanticApi.currencyType,undefined);
  }
});
test('visible original placeholder fails even renamed/recolored; hidden placeholder passes',()=>{
  let s=fixture('A09');s.source.propertyReferenceIdentityVersion=1;node(s,'Addon').name='Renamed placeholder';node(s,'Addon').appearance.fill=[];assert(bad(run(s)).some(e=>e.ruleId.includes('addon-content-is-configurable')));
  s=fixture('A05');assert.deepEqual(bad(run(s)),[]);
});
test('arbitrary renamed native swap allowed without inherited placeholder baseline or internal policy',()=>{
  const s=fixture('A09'),a=swap(s),r=run(s);
  assert.deepEqual(bad(r),[]);assert(r.report.scenarioCoverage.complete,JSON.stringify(r.report.scenarioCoverage));
  const p=r.prepared.nodes.find(n=>n.id===a.id);assert.equal(p.semantic.role,'addon');assert.deepEqual(p.baseline.effective,{});
  assert.equal(p.appearance.fill[0].tokenId,null); // child's contract, not Amount's text rule
});
test('swap without unique native anchor, with stale anchor or missing key remains incomplete',()=>{
  for(const mutate of [s=>delete s.source.propertyReferenceIdentityVersion,s=>delete node(s,'Arbitrary replacement').component.propertyReferenceBindings.visible,s=>node(s,'Arbitrary replacement').component.propertyReferenceBindings.visible='Addon#stale',s=>delete node(s,'Arbitrary replacement').component.identity.componentKey]){
    const s=fixture('A09');swap(s);mutate(s);assert(!run(s).report.scenarioCoverage.complete);
  }
});
test('external slot ownership is opt-in; cached external marker cannot bypass missing evidence',()=>{
  for(const mutate of [s=>delete s.source.propertyReferenceIdentityVersion,s=>delete node(s,'Arbitrary replacement').component.propertyReferenceBindings.visible]){
    const s=fixture('A09');const n=swap(s);n.slotBoundaryV1={contentOwnership:'external'};mutate(s);assert(!run(s).report.scenarioCoverage.complete);
  }
  const s=fixture('A09');swap(s);const c=clone(contract);c.customizationPolicy.forEach(r=>r.controlPaths.forEach(p=>delete p.contentOwnership));assert(!run(s,c).report.scenarioCoverage.complete);
});
test('new typed constraints and conditions reject malformed authoring',()=>{
  for(const mutate of [r=>r.applicability.contextDomains=[],r=>r.applicability.contextDomains={'semanticApi.unknown':['Custom']},r=>r.applicability.contextDomains={'semanticApi.currencyType':[]},r=>r.constraints[0].textNormalization='guessed',r=>r.constraints[0].fact='appearance.fill']){
    const m=clone(manual);mutate(m.rules.find(r=>r.id.includes('currency-standard-text')));assert(core.compileManualSource(m,evidence).issues.some(i=>i.level==='error'));
  }
});
test('ZIP roundtrip retains all new controls/constraints and compiles identically',async()=>{
  const entries=await core.readZip(fs.readFileSync(path.join(root,'editor/Amount.editor-input.zip')));
  const imported=core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)})));
  assert.deepEqual(imported.manual,manual);assert.deepEqual(clone(core.compileManualSource(imported.manual,imported.variantEvidence).contract),read('compiled/component-contract.v2.json'));
});

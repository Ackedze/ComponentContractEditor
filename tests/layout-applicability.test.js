const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../dist/core.cjs');
const {capture,clone}=require('./helpers/spinner-geometry');
const root=path.resolve(__dirname,'../../../shared/design-system_ab/experiments/web-core/core/Spinner');
// r7 authoring regression is pinned; current r8 is covered by Spinner final-review tests.
const manual=JSON.parse(fs.readFileSync(path.join(root,'history/r7-editor-0.2.33/contract.manual.json')));
const evidence=core.extractVariantEvidence(JSON.parse(fs.readFileSync(path.join(root,'evidence/contract.generated.json'))).contracts);
// The truth-table/controller seed is the accepted pristine L01, not a disposable export.
// Historical G01–G04 exact replay remains a separate suite; no historical expectation is replaced.
const pristine=JSON.parse(require('node:zlib').gunzipSync(fs.readFileSync(path.join(root,
 'qa/fixtures/layout-r7/spinner.validation-report.2026-09-27T10-52-42-372Z.json.gz'))));
const fields=Object.entries(core.PROPERTY_APPLICABILITY).filter(([f])=>/padding|AlignItems/.test(f));
function run(snapshot,m=manual){const compiled=core.compileManualSource(m,evidence);assert.deepEqual(compiled.issues.filter(i=>i.level==='error'),[]);const contract=core.prepareAuthoringPreviewContract(compiled.contract),engine=core.evaluateCompiledContract(snapshot,contract);return {compiled,contract,engine,report:core.buildEditorValidationReport(engine,compiled,m,snapshot)};}
function set(obj,p,value){const keys=p.split('.'),last=keys.pop();for(const k of keys)obj=obj[k]||(obj[k]={});if(value===undefined)delete obj[last];else obj[last]=value;}
for(const [fact,policy] of fields)test(`${fact}: complete either-state truth table, missing evidence and opt-in only`,()=>{
 const m=clone(manual),field=fact.includes('padding')?'paddingApplicable':'axisAlignmentApplicable';
 const r=m.rules.find(r=>r.id.endsWith('auto-layout-1'));m.rules=[{...r,capability:fact,capabilitySet:undefined,capabilitySelection:undefined,targetScope:'self',constraints:[{type:'propertyForbidden'}],propertyApplicability:{[fact]:policy}}];
 for(const a of [true,false,undefined])for(const b of [true,false,undefined]){
  const s=clone(pristine.snapshot),n=s.nodes[0];set(n,fact,fact.includes('padding')?12:'MAX');set(n.baseline.effective,fact,fact.includes('padding')?0:'MIN');
  n.propertyActivityV1={[field]:a};n.baseline.effective.propertyActivityV1={[field]:b};
  const verdict=a===true||b===true?'violation':a===false&&b===false?'not-applicable':'human-review',result=run(s,m);
  assert.equal(result.engine.evaluations[0].classification,verdict,`${a}/${b}`);assert.equal(result.report.scenarioCoverage.complete,verdict!=='human-review');
  const details=core.buildEvaluationDetails(result.report,result.contract,pristine.anatomy);
  if(verdict==='not-applicable')assert.match(details[0].reasonLabel,/по условию контракта/);
  if(verdict==='human-review')assert.match(details[0].reasonLabel,/Недостаточно данных о применимости/);
  if(a===true&&b===true){set(n.baseline.effective,fact,undefined);assert.equal(run(s,m).report.scenarioCoverage.complete,false);}
 }
 const s=clone(pristine.snapshot),n=s.nodes[0];set(n,fact,fact.includes('padding')?12:'MAX');set(n.baseline.effective,fact,fact.includes('padding')?0:'MIN');
 n.propertyActivityV1={[field]:false};n.baseline.effective.propertyActivityV1={[field]:false};delete m.rules[0].propertyApplicability;
 assert.equal(run(s,m).engine.evaluations[0].classification,'violation');
});
test('capture distinguishes flow, GRID, NONE, non-layout and unknown; child count does not govern padding/alignment',()=>{
 for(const mode of ['HORIZONTAL','VERTICAL','GRID','NONE',undefined,'FUTURE']){
  const a=core.capturePropertyActivity({type:'FRAME',layoutMode:mode});
  assert.equal(a.paddingApplicable,['HORIZONTAL','VERTICAL','GRID'].includes(mode)?true:mode==='NONE'?false:undefined);
  assert.equal(a.axisAlignmentApplicable,['HORIZONTAL','VERTICAL'].includes(mode)?true:['NONE','GRID'].includes(mode)?false:undefined);
 }
 assert.equal(core.capturePropertyActivity({type:'ELLIPSE'}).paddingApplicable,false);
 assert.equal(core.capturePropertyActivity({type:'FRAME',get layoutMode(){throw Error('unavailable')}}).paddingApplicable,undefined);
 const a=core.capturePropertyActivity({type:'FRAME',layoutMode:'HORIZONTAL',children:[]});
 assert.equal(a.gapApplicable,false);assert.equal(a.paddingApplicable,true);assert.equal(a.axisAlignmentApplicable,true);
});
test('bundled controller captures independent activity; inactive stored fields skip, active and removal remain checked',async()=>{
 for(const preview of [false,true]){
  const clean=await capture(pristine,{preview});const result=run(clean.output.snapshot);
  assert.equal(result.report.scenarioCoverage.complete,true);assert.equal(result.engine.evaluations.filter(e=>e.classification==='violation').length,0);
  assert.equal(clean.output.snapshot.nodes[0].propertyActivityV1.paddingApplicable,true);
  assert.equal(clean.output.snapshot.nodes.find(n=>n.name==='Fixer').propertyActivityV1.paddingApplicable,false);
 }
 const inactive=await capture(pristine,{mutateActual(n){const f=n.children[0];f.paddingTop=12;f.primaryAxisAlignItems='MAX';f.counterAxisAlignItems='MAX';}});
 assert.equal(run(inactive.output.snapshot).engine.evaluations.filter(e=>e.classification==='violation').length,0);
 for(const disabled of [false,true]){
  const captured=await capture(pristine,{mutateActual(n){if(disabled){n.layoutMode='NONE';n.layoutSizingHorizontal='FIXED';n.width+=8;}n.paddingTop=12;n.primaryAxisAlignItems='MAX';}});
  const s=captured.output.snapshot,n=s.nodes[0];assert.equal(n.baseline.effective.propertyActivityV1.paddingApplicable,true);assert.equal(n.propertyActivityV1.paddingApplicable,!disabled);
  const result=run(s),facts=result.engine.evaluations.filter(e=>e.classification==='violation').flatMap(e=>e.trace.factPaths);
  assert.ok(facts.includes('layout.padding.top'));assert.ok(facts.includes('layout.primaryAxisAlignItems'));
  if(disabled)for(const f of ['layout.mode','layout.sizingHorizontal','bounds.width'])assert.ok(facts.includes(f),f);
 }
 const activated=await capture(pristine,{mutateActual(n){n.children[0].layoutMode='HORIZONTAL';n.children[0].paddingLeft=12;}});
 const f=activated.output.snapshot.nodes.find(n=>n.name==='Fixer');assert.equal(f.baseline.effective.propertyActivityV1.paddingApplicable,false);assert.equal(f.propertyActivityV1.paddingApplicable,true);
 assert.ok(run(activated.output.snapshot).engine.evaluations.some(e=>e.classification==='violation'&&e.trace.factPaths.includes('layout.padding.left')));
});
test('r7 preserves all source rules and constraints; exact maps survive compile, ZIP and import; unrelated policies reject',async()=>{
 const html=fs.readFileSync(path.resolve(__dirname,'../src/ui.html'),'utf8'),ui=fs.readFileSync(path.resolve(__dirname,'../src/ui.ts'),'utf8');
 assert.ok(html.includes(`class="build-version">v${require('../package.json').version}</span>`));
 for(const id of ['paddingTopApplicability','paddingRightApplicability','paddingBottomApplicability','paddingLeftApplicability','primaryAlignmentApplicability','counterAlignmentApplicability']){
  assert.ok(html.includes(`id="${id}"`),id);assert.ok(ui.includes(`[${id},`),id);
 }
 const old=JSON.parse(fs.readFileSync(path.join(root,'history/r6-editor-0.2.32/contract.manual.json')));
 assert.equal(manual.metadata.revision,7);assert.deepEqual(manual.rules.map(r=>r.id),old.rules.map(r=>r.id));
 for(const r of manual.rules){const before=old.rules.find(x=>x.id===r.id),copy=clone(r);copy.propertyApplicability=before.propertyApplicability;if(!before.propertyApplicability)delete copy.propertyApplicability;assert.deepEqual(copy,before);}
 const bundle=core.buildExportBundle(manual,evidence);assert.equal(bundle.validation.valid,true);assert.equal(bundle.compiled.rules.length,31);
 const zip=core.createZip([core.textZipEntry('contract.manual.json',manual)]),entries=await core.readZip(zip);
 assert.deepEqual(core.importWorkspace(entries.map(e=>({name:e.name,text:core.zipEntryText(e)}))).manual,manual);
 for(const [fact]of fields){const m=clone(manual);m.rules[0].propertyApplicability[fact]='future@2';assert.ok(core.validateManualSource(m).some(i=>i.code==='RULE_PROPERTY_APPLICABILITY'));}
 const unrelated=clone(manual);unrelated.rules[0].propertyApplicability['layout.mode']='flow-alignment-either@1';assert.ok(core.validateManualSource(unrelated).some(i=>i.code==='RULE_PROPERTY_APPLICABILITY'));
});

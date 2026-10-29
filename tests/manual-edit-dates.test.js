const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const core=require('../dist/core.cjs'),fixture=require('./fixtures/button-variants.json');
const timestamp='2026-10-22T10:00:00.000Z',clone=x=>JSON.parse(JSON.stringify(x));
// Execute the real UI handlers with rendering/persistence isolated. Policy logic is the real core.
const source=ts.createSourceFile('ui.ts',fs.readFileSync(path.join(__dirname,'../src/ui.ts'),'utf8'),ts.ScriptTarget.Latest,true);
const handlers=['deleteRule','applyProtectInternals'].map(name=>{
 const node=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);
 assert(node,`Missing UI handler ${name}`);return node.getText(source);
}).join('\n');
function scenario(){
 const manual=clone(fixture.manual);manual.metadata.createdAt='2026-09-26';manual.metadata.updatedAt='2026-10-01';
 let clocks=0;const effects=[];
 const ctx={workspace:{manual},editingRuleId:manual.rules[0].id,applyProtectInternalsPolicy:core.applyProtectInternalsPolicy,
  ensureRootTarget:()=>ctx.workspace.manual.targets[0],Date:class extends Date{constructor(){super(timestamp);clocks++}},
  toast:()=>{},resetRuleForm:()=>{},setAuthoringView:()=>{}};
 for(const name of ['renderRuleSelect','renderRuleCards','renderQuickPolicy','renderHeader','updateCompileState','persistSession'])ctx[name]=()=>effects.push(name);
 vm.createContext(ctx);vm.runInContext(ts.transpileModule(handlers,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,ctx);
 return{ctx,effects,clocks:()=>clocks};
}
test('deleting an existing rule advances revision and UTC edit time, preserving creation date',()=>{
 const f=scenario(),before=clone(f.ctx.workspace.manual),id=f.ctx.editingRuleId;f.ctx.deleteRule();const next=f.ctx.workspace.manual;
 assert.deepEqual(next.rules,before.rules.filter(r=>r.id!==id));assert.equal(next.metadata.revision,before.metadata.revision+1);
 assert.equal(next.metadata.updatedAt,timestamp);assert.equal(next.metadata.createdAt,before.metadata.createdAt);assert.equal(f.clocks(),1);
 assert(f.effects.includes('persistSession'));
});
test('empty or stale rule selection leaves the manual and clock unchanged',()=>{
 for(const id of [null,'missing-rule']){const f=scenario(),before=clone(f.ctx.workspace.manual);f.ctx.editingRuleId=id;f.ctx.deleteRule();assert.deepEqual(f.ctx.workspace.manual,before);assert.equal(f.clocks(),0);assert.deepEqual(f.effects,[]);}
});
test('protect internals stamps a real edit once; repeated policy and missing target are no-ops',()=>{
 const f=scenario(),before=clone(f.ctx.workspace.manual);f.ctx.applyProtectInternals();const changed=clone(f.ctx.workspace.manual);
 assert.equal(changed.metadata.revision,before.metadata.revision+1);assert.equal(changed.metadata.updatedAt,timestamp);
 assert.equal(changed.metadata.createdAt,before.metadata.createdAt);assert.equal(f.clocks(),1);
 f.ctx.applyProtectInternals();assert.deepEqual(f.ctx.workspace.manual,changed);assert.equal(f.clocks(),1);
 f.ctx.ensureRootTarget=()=>null;f.ctx.applyProtectInternals();assert.deepEqual(f.ctx.workspace.manual,changed);assert.equal(f.clocks(),1);
});

const test=require('node:test'),assert=require('node:assert/strict'),core=require('../dist/core.cjs');
const n=(id,type='FRAME',children=[])=>({id,name:id,type,children});
test('topology retains occurrence-owned edges; each child getter is read once',()=>{
 const child=n('child'),root=n('root');let reads=0;Object.defineProperty(root,'children',{get(){reads++;return reads===1?[child]:[root];}});
 const c=core.captureSceneTopology(root);assert(c.complete);assert.equal(reads,1);assert.deepEqual(c.entries.map(e=>[e.parentIndex,e.childIndexes]),[[null,[1]],[0,[]]]);
});
for(const [label,build,kind] of [
 ['ancestor loop',()=>{const root=n('root'),body=n('body','SLOT');root.children=[body];body.children=[root];return root;},'cycle'],
 ['same ID with incompatible types',()=>n('root','INSTANCE',[n('root','TEXT')]),'identity-conflict'],
 ['same ID twice as siblings',()=>n('root','INSTANCE',[n('child'),n('child')]),'duplicate-id'],
 ['shared child object',()=>{const child=n('child');return n('root','INSTANCE',[child,child]);},'duplicate-id'],
])test('unsafe API graph fails closed without recursive explosion: '+label,()=>{
 const c=core.captureSceneTopology(build());assert(!c.complete);assert(!c.limitReached);assert.equal(c.issues[0].kind,kind);
 assert(c.entries.length<=2);assert.equal(c.entries[0].parentIndex,null);assert.equal(new Set(c.entries.map(e=>e.figmaNodeId)).size,c.entries.length);
});
test('real large tree remains limited, not mistaken for repeated identities',()=>{
 const c=core.captureSceneTopology(n('root','INSTANCE',Array.from({length:501},(_,i)=>n('child'+i))));
 assert.equal(c.entries.length,500);assert(c.limitReached);assert.equal(c.issues.length,0);assert(!c.complete);
});
test('unreadable children fail closed; root is retained',()=>{
 const root=n('root');Object.defineProperty(root,'children',{get(){throw Error('API refusal');}});
 const c=core.captureSceneTopology(root);assert(!c.complete);assert.equal(c.issues[0].kind,'unreadable-node');assert.equal(c.entries.length,1);
});
test('explicit boundary omission does not even read external children',()=>{
 const body=n('body','SLOT');Object.defineProperty(body,'children',{get(){throw Error('must not inspect external payload');}});
 const c=core.captureSceneTopology(n('root','INSTANCE',[body]),500,e=>e.type==='SLOT');
 assert(c.complete);assert.equal(c.entries.length,2);assert.deepEqual(c.entries[1].childIndexes,[]);
});

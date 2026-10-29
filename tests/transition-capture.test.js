const test=require('node:test'),assert=require('node:assert/strict');
const {captureTransitionContext:capture}=require('../dist/core.cjs');
function fixture(){
 const page={id:'page',type:'PAGE'};
 const parent={id:'p',type:'FRAME',parent:page,width:500,height:400,layoutMode:'HORIZONTAL',layoutSizingHorizontal:'FIXED',layoutSizingVertical:'HUG',itemSpacing:16};
 const subject={id:'b',type:'INSTANCE',width:120,height:40,visible:true,parent,children:[]};
 const sibling={id:'s',type:'RECTANGLE',width:20,height:20,visible:true,parent};parent.children=[subject,sibling];return{subject,parent,sibling};
}
test('captures changing fixed ancestor, sibling and constraints; derived HUG size may follow the subject',()=>{
 const f=fixture(),a=capture(f.subject);assert.equal(a.complete,true);
 f.parent.height=450;assert.deepEqual(capture(f.subject).context,a.context);
 f.parent.width=550;assert.notDeepEqual(capture(f.subject).context,a.context);
 f.parent.width=500;f.sibling.width=40;assert.notDeepEqual(capture(f.subject).context,a.context);
 f.sibling.width=20;f.subject.minWidth=180;assert.notDeepEqual(capture(f.subject).context,a.context);
});
test('subject dimension changes affect in-flight fingerprint, not external context',()=>{
 const f=fixture(),a=capture(f.subject);f.subject.width=130;const b=capture(f.subject);
 assert.deepEqual(a.context,b.context);assert.notEqual(a.fingerprint,b.fingerprint);
});
test('unsupported grid, incomplete parent and limits do not create valid evidence',()=>{
 for(const change of [f=>f.parent.layoutMode='GRID',f=>delete f.parent.width,f=>f.parent.parent=null,
  f=>f.parent.children.push(...Array.from({length:201},(_,i)=>({id:String(i)}))),
  f=>f.subject.children=Array.from({length:500},(_,i)=>({id:String(i)}))]){
  const f=fixture();change(f);assert.equal(capture(f.subject).complete,false);
 }
});

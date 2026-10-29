const test=require('node:test'),assert=require('node:assert/strict');
const {captureTextDecoration}=require('../dist/core.cjs');
const node=ranges=>({type:'TEXT',characters:'abcd',getStyledTextSegments:()=>ranges});
test('decoration captures whole and mixed ranges in a stable set',()=>{
 assert.deepEqual(captureTextDecoration(node([{start:0,end:4,textDecoration:'NONE'}])),['NONE']);
 assert.deepEqual(captureTextDecoration(node([{start:0,end:2,textDecoration:'UNDERLINE'},{start:2,end:4,textDecoration:'NONE'}])),['NONE','UNDERLINE']);
 assert.deepEqual(captureTextDecoration(node([{start:0,end:4,textDecoration:'STRIKETHROUGH'}])),['STRIKETHROUGH']);
});
test('missing, malformed and incomplete range evidence stays unknown',()=>{
 for(const ranges of [undefined,[],[{start:1,end:4,textDecoration:'NONE'}],[{start:0,end:3,textDecoration:'NONE'}],[{start:0,end:4,textDecoration:'MIXED'}],[{start:0,end:4,textDecoration:{toString:()=> 'NONE'}}]])assert.equal(captureTextDecoration(node(ranges)),undefined);
 assert.equal(captureTextDecoration({type:'TEXT',characters:'abc',getStyledTextSegments(){throw Error('unavailable')}}),undefined);
 assert.equal(captureTextDecoration({type:'FRAME'}),undefined);
});
test('empty text needs explicit decoration evidence',()=>{
 assert.deepEqual(captureTextDecoration({type:'TEXT',characters:'',textDecoration:'NONE'}),['NONE']);
 assert.equal(captureTextDecoration({type:'TEXT',characters:''}),undefined);
});

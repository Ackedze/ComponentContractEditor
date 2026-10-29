const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {runNativeOccurrenceCapture}=require('../../Apollo/packages/component-contract-core/tests/helpers/native-occurrence-capture.cjs');
const invoke=async(figma,actual,request)=>{
 const messages=[];figma.showUI=()=>{};figma.on=()=>{};figma.ui={postMessage:m=>messages.push(m)};
 vm.runInNewContext(fs.readFileSync(require.resolve('../dist/code.js'),'utf8'),{figma,__html__:'',TextEncoder});
 await figma.ui.onmessage(Object.assign({type:'test-selection',requestId:'occurrence'},request));
 assert.deepEqual(messages.filter(m=>m.type==='plugin-error'),[]);
 const result=messages.find(m=>m.type==='selection-test-result');assert(result);return result;
};
for(const options of [{},{rename:true,reorder:true},{remote:true,reorder:true},{escaped:true},{badClone:'missing'},{badClone:'duplicate'},{badClone:'topology-drift'},{badClone:'unreadable-edge'},{reset:true}])
 test('Editor bundled capture preserves source occurrence and uncertainty '+JSON.stringify(options),async()=>{
  const {result,switches}=await runNativeOccurrenceCapture(invoke,options);
  assert.deepEqual(switches,options.badClone||options.reset?[]:[1]);
  assert.equal(result.matchedBaselineNodes,options.badClone?7:9);
  if(options.badClone)assert(result.snapshot.instanceContentReferences.attempts[0].failure);
  else assert(result.snapshot.instanceContentReferences.attempts.every(a=>!a.failure));
 });

const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 try{const page=await browser.newPage();
  for(const size of [{width:1280,height:720},{width:900,height:600}]){
   await page.setViewportSize(size);await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/ui.html')).href);
   await page.evaluate(()=>{document.querySelector('#authoringListView').hidden=true;document.querySelector('#authoringEditorView').hidden=false;document.querySelectorAll('details.rule-section').forEach(d=>d.open=true);});
   for(const id of ['rationale','additionalConstraints','capabilityInput','ruleOwner']){
    await page.evaluate(id=>{const field=document.getElementById(id);field.scrollIntoView({block:'center'});field.focus();},id);
    const g=await page.evaluate(()=>({bodyScroll:document.body.scrollTop,htmlScroll:document.documentElement.scrollTop,workspaceBottom:document.querySelector('#workspace').getBoundingClientRect().bottom,headerTop:document.querySelector('.app-header').getBoundingClientRect().top}));
    assert.ok(Math.abs(g.workspaceBottom-size.height)<2 && Math.abs(g.headerTop)<2,`${id}: viewport shifted ${JSON.stringify(g)}`);
    assert.equal(g.bodyScroll,0);assert.equal(g.htmlScroll,0);
   }
  }
  console.log('PASS: long rule form focus and scrollIntoView keep header and full-height workspace at viewport edges.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

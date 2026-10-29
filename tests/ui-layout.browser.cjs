// Optional browser gate; uses an existing Playwright/Chrome installation, no new dependency.
// PLAYWRIGHT_MODULE=/path/to/playwright CHROME_PATH=/path/to/chrome npm run test:layout
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    let scenarios = 0;
    for (const [width, height] of [[1440,900],[1280,720],[1200,640],[1024,600],[900,600],[800,500]]) {
      await page.setViewportSize({width,height});
      await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/ui.html')).href);
      for (const mode of ['authoring','validation']) {
        await page.locator(mode === 'authoring' ? '#authoringModeButton' : '#validationModeButton').click();
        for (const transition of mode === 'validation' ? [false,true] : [false]) {
          await page.evaluate(({transition}) => {
            document.querySelector('#transitionToolbar').hidden = !transition;
            document.querySelector('#transitionStatus').textContent = 'Состояние до: instance 13070:64074, ширина 192 px. Включите новое состояние у этого же экземпляра и нажмите проверку. '.repeat(3);
            document.querySelector('#testCompleteness').hidden = false;
            document.querySelector('#testCompleteness').textContent = 'Этот сценарий: проверка неполная · не выполнено: 7 (у 5 применимость неизвестна) · неприменимых правил пакета: 2. Каталог и независимый библиотечный эталон имеют разный состав. Обновите generated facts из Athena; затем подтвердите привязки целей для выбранного варианта. У части дочерних целей нет подтверждённой привязки. Не подтверждён независимый эталон вложенного варианта или замены.';
            document.querySelector('#ownershipCompleteness').hidden = false;
            document.querySelector('#ownershipCompleteness').textContent = 'Сам компонент: неполная (0 нарушений; 5 пробелов) · Применение: есть нарушения (1 нарушение; 2 пробела) · Вложенные контракты: проверено · Только требования загруженного пакета; не проверка всех возможных паттернов.';
            document.querySelector('#compileSummary').textContent = 'Контракт: Draft · 27 правил';
            document.querySelector('#compileDetails').textContent = '8 не исполняются в Editor · 0 ошибок · 1 предупреждение';
            document.querySelector('#componentName').textContent = 'Button с длинным названием компонента';
            document.querySelector('#componentMeta').textContent = '[D] Button · desktop · manual r23';
            document.querySelector('#workspace').dataset.testYBeforeToast = String(document.querySelector('#workspace').getBoundingClientRect().y);
            document.querySelector('#toastRegion').innerHTML = '<div class="toast warning">Проверка неполная. Откройте результаты в правой панели.</div>';
            document.querySelector('#testResults').innerHTML = ['0 нарушений','169 пройдено','7 не выполнено','183 не применяется'].map(t=>`<button class="result-chip"><strong>${t}</strong><span>Результаты проверки</span></button>`).join('');
            document.querySelector('#anatomyEmpty').hidden = true;
            document.querySelector('#anatomyTree').innerHTML = Array.from({length:60},(_,i)=>`<button class="tree-item" role="treeitem"><span class="tree-kind">C</span><span class="tree-label">Layer ${i}</span></button>`).join('');
            document.querySelectorAll('#captureBeforeButton,#clearBeforeButton,#testSelectionButton,#downloadReportButton,#showCompiledButton,#exportButton').forEach(n=>n.disabled=false);
          }, {transition});
          const geometry = await page.evaluate(() => {
            const box = selector => {const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
            const tree=document.querySelector('#anatomyTree');tree.scrollTop=tree.scrollHeight;
            const validation=document.body.dataset.workspaceMode==='validation';
            return {panel:validation?box('.validation-panel'):null,diagnosticsVisible:document.querySelector('#contractDiagnostics').offsetParent!==null,
              workspace:box('#workspace'),workspaceYBeforeToast:Number(document.querySelector('#workspace').dataset.testYBeforeToast),toast:box('.toast'),treeScroll:tree.scrollTop,
              actions:validation?[box('#testSelectionButton'),box('#downloadReportButton')]:[box('#exportButton')],
              documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight};
          });
          const label=`${width}x${height} ${mode} transition=${transition}`;
          for (const [name,rect] of Object.entries({...(geometry.panel?{panel:geometry.panel}:{}),...Object.fromEntries(geometry.actions.map((r,i)=>['action'+i,r]))})) {
            assert.ok(rect.x>=-1 && rect.y>=-1 && rect.right<=width+1 && rect.bottom<=height+1, `${label}: ${name} clipped ${JSON.stringify(rect)}`);
          }
          assert.ok(geometry.workspace.height>30,`${label}: no working area`);
          assert.ok(Math.abs(geometry.workspace.y-geometry.workspaceYBeforeToast)<1,`${label}: toast shifts workspace`);
          assert.ok(geometry.toast.width<=321 && geometry.toast.height<=64,`${label}: toast is not compact ${JSON.stringify(geometry.toast)}`);
          assert.ok(geometry.toast.x>=-1 && geometry.toast.y>=-1 && geometry.toast.right<=width+1 && geometry.toast.bottom<=height+1,`${label}: toast clipped ${JSON.stringify(geometry.toast)}`);
          assert.equal(geometry.diagnosticsVisible,mode==='validation',`${label}: contract diagnostics visibility`);
          assert.ok(geometry.treeScroll>0,`${label}: anatomy does not scroll`);
          assert.ok(geometry.documentWidth<=width+1 && geometry.documentHeight<=height+1,`${label}: document overflow`);
          const focusTarget=mode==='validation'?'#downloadReportButton':'#exportButton';
          await page.locator(focusTarget).focus();
          assert.equal(await page.evaluate(()=>document.activeElement.id),focusTarget.slice(1));
          if (mode === 'validation') {
            await page.locator('#contractDiagnostics').evaluate(details => { details.open = true; });
            await page.locator('#showCompiledButton').scrollIntoViewIfNeeded();
            assert.equal(await page.locator('#showCompiledButton').isVisible(), true, `${label}: compiled JSON action hidden`);
            await page.locator('#showCompiledButton').focus();
            assert.equal(await page.evaluate(()=>document.activeElement.id),'showCompiledButton');
            await page.locator('#contractDiagnostics').evaluate(details => { details.open = false; details.closest('.validation-panel').scrollTop = 0; });
          }
          if (process.env.SCREENSHOT_DIR && [1024,1440].includes(width) && mode==='authoring') {
            await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`editor-catalog-${width}x${height}.png`)});
          }
          if (mode === 'authoring') {
            await page.evaluate(() => {
              document.querySelector('#authoringListView').hidden = true;
              document.querySelector('#authoringEditorView').hidden = false;
              document.querySelector('#saveRuleButton').disabled = false;
              document.querySelector('#propertyList').innerHTML = Array.from({length:60},(_,i)=>`<button class="property-chip"><strong>Property ${i}</strong><span>Value</span></button>`).join('');
            });
            await page.locator('#saveRuleButton').scrollIntoViewIfNeeded();
            const reachable = await page.evaluate(() => {
              const save=document.querySelector('#saveRuleButton').getBoundingClientRect();
              const panel=document.querySelector('#authoringPanel').getBoundingClientRect();
              const properties=document.querySelector('#propertyList');properties.scrollTop=properties.scrollHeight;
              return {saveVisible:save.top>=panel.top && save.bottom<=panel.bottom && save.right<=panel.right,propertiesScroll:properties.scrollTop};
            });
            assert.ok(reachable.saveVisible,`${label}: save rule not reachable`);
            assert.ok(reachable.propertiesScroll>0,`${label}: properties do not scroll`);
            if (process.env.SCREENSHOT_DIR && [1024,1440].includes(width)) {
              await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`editor-rule-${width}x${height}.png`)});
            }
          }
          scenarios++;
          if (process.env.SCREENSHOT_DIR && width===1024 && mode==='validation' && transition) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'editor-layout-1024x600.png')});
        }
      }
      for (const [dialogId,bodySelector,closeId,actionId] of [
        ['testDetailsDialog','#testDetailList','closeTestDetailsButton'],
        ['compiledDialog','#compiledOutput','closeCompiledButton'],
        ['contractDialog','.contract-dialog-body','closeContractButton','saveContractButton']
      ]) {
        await page.evaluate(({dialogId,bodySelector}) => {
          const content=document.querySelector(bodySelector);
          if (dialogId==='compiledDialog') content.textContent='Compiled JSON line\n'.repeat(200);
          if (dialogId==='testDetailsDialog') {
            document.querySelector('#testDetailsSummary').textContent='Подробный результат проверки выбранного экземпляра с длинным именем. '.repeat(3);
            content.innerHTML=Array.from({length:30},(_,i)=>`<article class="test-detail-card"><span></span><div><h3>Правило ${i}</h3><p>Подробная диагностика результата проверки.</p></div></article>`).join('');
          }
          document.getElementById(dialogId).showModal();
          content.scrollTop=content.scrollHeight;
        },{dialogId,bodySelector});
        const geometry=await page.evaluate(({dialogId,bodySelector,closeId,actionId})=>{
          const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
          const content=document.querySelector(bodySelector);
          return {dialog:rect(document.getElementById(dialogId)),body:rect(content),scroll:content.scrollTop,
            controls:[closeId,actionId].filter(Boolean).map(id=>rect(document.getElementById(id)))};
        },{dialogId,bodySelector,closeId,actionId});
        for (const rect of [geometry.dialog,...geometry.controls]) assert.ok(rect.top>=0 && rect.left>=0 && rect.bottom<=height && rect.right<=width,`${width}x${height}: ${dialogId} control clipped`);
        assert.ok(geometry.scroll>0 && geometry.body.bottom<=geometry.dialog.bottom,`${width}x${height}: ${dialogId} body does not scroll inside dialog`);
        await page.locator('#'+closeId).click();
        assert.equal(await page.locator('#'+dialogId).evaluate(el=>el.open),false);
      }
    }
    assert.deepEqual(errors,[]);
    console.log(`PASS: ${scenarios} responsive layouts, full-height catalog and validation inspector, diagnostics visibility, transition hidden/visible, actions accessible, anatomy/properties/inspector scroll, 18 dialog layouts, no document overflow.`);
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

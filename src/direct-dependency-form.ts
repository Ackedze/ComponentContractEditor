import { linkComponentDependencies, selectedTargetPathHint, slug, stableHash,
  type CompiledContract, type ComponentDependency, type ManualSource, type PreviewSnapshot } from './core/index';
import { collectionChecks } from './member-collection-form';
import { readDependencyPackage } from './dependency-package-import';

export type DirectDependencyForm = {contracts: CompiledContract[]};

export function renderDirectDependencyForm(container: HTMLElement, manual: ManualSource, contracts: CompiledContract[], json: HTMLTextAreaElement,
  notify: (message: string, error?: boolean) => void, snapshot?: PreviewSnapshot): DirectDependencyForm {
 const form:DirectDependencyForm={contracts:JSON.parse(JSON.stringify(contracts))};container.replaceChildren();
 const field=(label:string,input:HTMLElement)=>{const row=document.createElement('label');row.className='field';const span=document.createElement('span');span.textContent=label;row.append(span,input);return row;};
 const select=(id:string)=>{const input=document.createElement('select');input.id=id;input.dataset.nativeSelect='';return input;};
 const button=(id:string,title:string)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='button button-secondary';b.textContent=title;return b;};
 const packageSelect=select('directDependencyPackage'),owner=select('directDependencyOwner'),info=document.createElement('p');info.className='field-help';info.id='directDependencyPinInfo';
 const representation=snapshot && manual.representations.find(r=>r.kind==='figma'&&r.platform===snapshot.context.platform
  && [r.locator.componentKey,r.locator.componentSetKey].some(key=>typeof key==='string'&&[snapshot.source?.componentKey,snapshot.source?.componentSetKey].includes(key)));
 const componentKey=typeof snapshot?.source?.componentKey==='string'?snapshot.source.componentKey:undefined;
 const targetPath=(target:ManualSource['targets'][number])=>(representation?selectedTargetPathHint(target,representation.id,componentKey):undefined) || target.pathHint || '';
 const rootTarget=(target:ManualSource['targets'][number])=>!!targetPath(target)&&targetPath(target).split(' / ').length===1;
 const rootTargets=manual.targets.filter(t=>t.resolution==='resolved'&&rootTarget(t));
 for(const target of manual.targets.filter(t=>t.resolution==='resolved')){const o=document.createElement('option');o.value=target.semanticRole;o.textContent=`${target.label} · ${target.semanticRole}`;owner.append(o);}
 owner.value=manual.targets.some(t=>t.semanticRole==='root'&&t.resolution==='resolved')?'root':rootTargets[0]?.semanticRole || owner.options[0]?.value || '';
 const importButton=button('importDirectDependencyButton','Загрузить пакет зависимости'),input=document.createElement('input');input.type='file';input.accept='.zip,.json';input.hidden=true;input.id='directDependencyFile';
 const add=button('addDirectDependencyButton','Добавить direct bindings'),list=document.createElement('div');list.id='directDependenciesList';
 const status=document.createElement('p');status.id='directDependencyStatus';status.className='dependency-import-status';status.hidden=true;status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const report=(message:string,error=false)=>{status.hidden=false;status.className=`dependency-import-status${error?' error':''}`;status.textContent=message;notify(message,error);};
 container.append(importButton,input,status,field('Закреплённый пакет · read-only',packageSelect),info,field('Owner · semantic role',owner),
  collectionChecks('directDependencyMembers','Дочерние occurrences',manual.targets.filter(t=>t.resolution==='resolved'&&!rootTarget(t)).map(t=>[t.semanticRole,`${t.label} · ${t.semanticRole} · ${t.variantHints?.length || 0} привязок вариантов`]),[]),
  collectionChecks('directDependencyRepresentations','Representations',manual.representations.filter(r=>r.kind==='figma'&&r.status!=='deprecated').map(r=>[r.id,`${r.id} · ${r.platform}`]),[]),add,list);
 if(!container.querySelector('#directDependencyMembers input')){const help=document.createElement('p');help.className='field-help';help.textContent='Дочерние semantic targets ещё не заданы. Сначала создайте и подтвердите привязки встроенных экземпляров в Anatomy; корень и вариант группы не являются дочерними occurrences.';container.querySelector('#directDependencyMembers')!.append(help);}
 const pins=():ComponentDependency[]=>{const value=JSON.parse(json.value || '[]');if(!Array.isArray(value))throw new Error('Component dependencies: ожидается массив.');return value;};
 const renderList=()=>{
  list.replaceChildren();let entries:ComponentDependency[];try{entries=pins();}catch(e){list.textContent=String(e);return;}
  entries.forEach((pin,index)=>{const row=document.createElement('div');row.className='dependency-pin-card';const title=document.createElement('strong');title.textContent=`${pin.componentId} · r${pin.revision} · ${pin.bindings.length} bindings`;
   const detail=document.createElement('small');detail.className='field-help';detail.textContent=`manual ${pin.manualSourceHash} · compiled ${pin.compiledHash}`;
   const bindings=document.createElement('p');bindings.className='field-help';bindings.textContent=pin.bindings.map(b=>`${b.id}: ${b.kind==='direct-child'?`${b.ownerTargetRole} → ${b.targetRole} (${b.representationIds.join(', ')})`:`${b.targetRole} / ${b.relativePath} / ${b.childPath}`}`).join('\n');
   const remove=button('removeDirectDependency-'+index,'Удалить pin');remove.addEventListener('click',()=>{const all=pins();all.splice(index,1);json.value=JSON.stringify(all,null,2);renderList();});row.append(title,detail,bindings,remove);list.append(row);});
 };
 const syncInfo=()=>{const c=form.contracts.find(c=>c.package.componentId===packageSelect.value);if(!c){info.textContent='Загрузите принятый compiled JSON или authoring ZIP с полным closure.';return;}
  const revision=c.package.manualRevision ?? c.rules[0]?.revision,hash=stableHash(c),pin={id:'preview',componentId:c.package.componentId,revision,manualSourceHash:c.package.manualSourceHash,compiledHash:hash,bindings:[]} as ComponentDependency;
  const linked=linkComponentDependencies({...manual,componentDependencies:[pin]},[c])[0];
  info.textContent=`${c.package.componentId} · r${revision}\nmanual ${c.package.manualSourceHash}\ncompiled ${hash}\n${c.status==='ready'&&!linked.issue?'Полный closure подтверждён':`Не готов: ${linked.issue || c.status}`}`;};
 const renderPackages=()=>{const chosen=packageSelect.value;packageSelect.replaceChildren();const empty=document.createElement('option');empty.value='';empty.textContent='Выберите пакет';packageSelect.append(empty);
  form.contracts.forEach(c=>{const o=document.createElement('option');o.value=c.package.componentId;o.textContent=`${c.package.componentId} · r${c.package.manualRevision ?? c.rules[0]?.revision}`;packageSelect.append(o);});packageSelect.value=chosen;syncInfo();};
 importButton.addEventListener('click',()=>input.click());
 input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;importButton.disabled=true;report(`Проверяем ${file.name}…`);try{
  const contract=await readDependencyPackage(file.name,new Uint8Array(await file.arrayBuffer()),manual.component.componentId);
  const existing=form.contracts.find(c=>c.package.componentId===contract.package.componentId);
  if(existing&&stableHash(existing)!==stableHash(contract)&&pins().some(p=>p.componentId===contract.package.componentId))throw new Error('Уже закреплена другая версия. Сначала явно удалите прежний pin.');
  form.contracts=form.contracts.filter(c=>c.package.componentId!==contract.package.componentId).concat(contract);renderPackages();packageSelect.value=contract.package.componentId;syncInfo();report(`${file.name} загружен. Выберите owner, occurrences и representations.`);
 }catch(e){report(e instanceof Error?e.message:String(e),true);}finally{input.value='';importButton.disabled=false;}});
 packageSelect.addEventListener('change',syncInfo);json.addEventListener('input',renderList);
 add.addEventListener('click',()=>{try{
  const c=form.contracts.find(c=>c.package.componentId===packageSelect.value);if(!c)throw new Error('Выберите пакет зависимости.');
  const members=Array.from(container.querySelectorAll<HTMLInputElement>('#directDependencyMembers input:checked')).map(i=>i.value),reps=Array.from(container.querySelectorAll<HTMLInputElement>('#directDependencyRepresentations input:checked')).map(i=>i.value);
  if(!owner.value||!members.length||!reps.length||members.includes(owner.value))throw new Error('Выберите отдельный owner, дочерние цели и representations.');
  const all=pins(),hash=stableHash(c),revision=Number(c.package.manualRevision ?? c.rules[0]?.revision);
  let pin=all.find(p=>p.componentId===c.package.componentId);
  if(pin&&pin.compiledHash!==hash)throw new Error('Pin уже указывает на другую версию.');
  let keys=Array.from(new Set(manual.representations.filter(r=>reps.includes(r.id)).flatMap(r=>[r.locator.componentKey,r.locator.componentSetKey]).filter((k):k is string=>typeof k==='string'&&!!k)));
  if(!rootTarget(manual.targets.find(t=>t.semanticRole===owner.value)!)){
    const owners=snapshot?.nodes.filter(n=>(n.semantic as any)?.role===owner.value) || [];
    if(owners.length!==1 || owners[0].type!=='INSTANCE' || (owners[0].unknownFacts as string[] || []).some(p=>p==='component'||p.startsWith('component.identity')))throw new Error('Для вложенного owner нужен свежий снимок с доказанной semantic привязкой и identity.');
    const identity=(owners[0].component as any)?.identity;
    keys=[identity?.componentKey,identity?.componentSetKey].filter(k=>typeof k==='string'&&!!k);
  }
  if(!keys.length)throw new Error('У выбранных representations нет ключей Figma.');
  if(!pin){const id=slug(c.package.componentId.replace(/\./g,'-'));const created:ComponentDependency={id,componentId:c.package.componentId,revision,manualSourceHash:c.package.manualSourceHash,compiledHash:hash,bindings:[]};all.push(created);pin=created;}
  for(const role of members){if(pin.bindings.some(b=>b.targetRole===role&&(b.kind!=='direct-child'||b.representationIds.some(id=>reps.includes(id)))))throw new Error(`У ${role} уже есть binding в выбранной representation.`);
   let id=slug(owner.value+'-'+role);while(pin.bindings.some(b=>b.id===id))id+='-next';pin.bindings.push({kind:'direct-child',id,targetRole:role,relativePath:'',ownerTargetRole:owner.value,ownerComponentKeys:keys,representationIds:reps});}
  const linked=linkComponentDependencies({...manual,componentDependencies:all},form.contracts);if(linked.some(d=>d.issue))throw new Error(linked.find(d=>d.issue)!.issue!);
  json.value=JSON.stringify(all,null,2);renderList();report('Direct bindings подготовлены. Сохраните паспорт.');
 }catch(e){report(e instanceof Error?e.message:String(e),true);}});
 renderPackages();renderList();return form;
}

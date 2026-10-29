import { memberCollectionErrors, type CollectionFilter, type CollectionProperty, type ManualSource, type MemberCollection, type PreviewSnapshot } from './core/index';

import { componentPropertyOptions, type PropertyOptionsContext } from './component-property-options';
import { renderPropertyValuePicker, propertyValuePickerSelection, readPropertyValuePicker } from './property-value-picker';

type Context = PropertyOptionsContext;
const field = (title: string, input: HTMLElement) => { const label=document.createElement('label');label.className='field';const span=document.createElement('span');span.textContent=title;label.append(span,input);return label; };
const select = (id: string, options: string[][], value: string) => { const input=document.createElement('select');input.id=id;input.dataset.nativeSelect='';options.forEach(([v,text])=>{const o=document.createElement('option');o.value=v;o.textContent=text;input.append(o);});input.value=value;return input; };
const text = (id: string, value='') => {const input=document.createElement('input');input.id=id;input.value=value;return input;};
const get = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)?.value || '';
const checked = (id: string) => !!(document.getElementById(id) as HTMLInputElement)?.checked;
const selected = (id: string) => Array.from(document.querySelectorAll<HTMLInputElement>(`#${id} input:checked`)).map(n=>n.value);

export function collectionChecks(id: string, title: string, options: string[][], values: string[]): HTMLElement {
 const section=document.createElement('fieldset');section.id=id;section.className='collection-choices';const legend=document.createElement('legend');legend.textContent=title;section.append(legend);
 for(const [value,label] of options){const row=document.createElement('label');row.className='check-field';const input=document.createElement('input');input.type='checkbox';input.value=value;input.checked=values.includes(value);
  const span=document.createElement('span');span.textContent=label;row.append(input,span);section.append(row);}
 return section;
}

export function propertyFields(prefix: string, title: string, value: CollectionProperty | undefined, values: unknown[] | undefined, context: Context, host=false, onlyVariant=false): HTMLElement {
 const section=document.createElement('fieldset');section.className='collection-choices';const legend=document.createElement('legend');legend.textContent=title;section.append(legend);
 const property=select(prefix+'Property',[],value?.property || ''),types=select(prefix+'Type',[['VARIANT','VARIANT · строка'],['BOOLEAN','BOOLEAN · true/false'],['TEXT','TEXT · строка'],['INSTANCE_SWAP','INSTANCE_SWAP · ID']],value?.propertyType || 'VARIANT');
 section.append(field('Свойство Figma',property),field('Тип свойства',types));
 const valuesContainer=document.createElement('div');section.append(valuesContainer);
 let first=true;
 const refresh=(propertyChanged=false)=>{
  const initialRender=first,selectedValues=first ? values || [] : propertyChanged ? [] : propertyValuePickerSelection(prefix+'Values');first=false;
  const options=componentPropertyOptions(context,host?'owner':context.scope || (context.targetNodes?'target':'members')).filter(p=>!onlyVariant||p.type==='VARIANT'),name=initialRender?property.value || value?.property || '':property.value;
  const names=[...new Set(options.map(p=>p.name))];
  property.replaceChildren();for(const n of ['',...names,...(name&&!names.includes(name)?[name]:[])]){const o=document.createElement('option');o.value=n;o.textContent=n ? n+(names.includes(n)?'':' · сохранённое свойство, нет API') : 'Выберите свойство';property.append(o);}property.value=name;
  const matches=options.filter(p=>p.name===name);
  if(matches.length===1 && (!value || propertyChanged))types.value=matches[0].type;
  types.disabled=matches.length===1&&matches[0].type===types.value;
  if(values!==undefined)valuesContainer.replaceChildren(renderPropertyValuePicker(prefix+'Values',matches.find(p=>p.type===types.value),selectedValues as any));
 };
 property.addEventListener('change',()=>refresh(true));types.addEventListener('change',()=>refresh());
 section.addEventListener('property-options-refresh',()=>refresh());refresh();return section;
}

function readProperty(prefix: string): CollectionProperty { return {property:get(prefix+'Property').trim(),propertyType:get(prefix+'Type') as CollectionProperty['propertyType']}; }
function readValues(prefix: string,revealError=true): Array<string|boolean> {
 const values=readPropertyValuePicker(prefix+'Values',revealError);
 if(values.some(v=>typeof v!=='string'&&typeof v!=='boolean'))throw new Error('Значения должны соответствовать типу свойства Figma.');
 return values as Array<string|boolean>;
}

const readFilter = (prefix: string,revealError=true): CollectionFilter | undefined => checked(prefix+'Enabled') ? {...readProperty(prefix),values:readValues(prefix,revealError)} : undefined;
export const readTypedFilterForm = readFilter;

export function renderTypedFilterForm(container: HTMLElement, prefix: string, title: string, initial: CollectionFilter | undefined, context: Context): void {
 const toggle=document.createElement('input');toggle.type='checkbox';toggle.id=prefix+'Enabled';toggle.checked=!!initial;
 const label=document.createElement('label');label.className='check-field';label.append(toggle,document.createTextNode(title));
 const fields=propertyFields(prefix,title,initial,initial?.values || [],context);fields.hidden=!toggle.checked;
 toggle.addEventListener('change',()=>fields.hidden=!toggle.checked);container.append(label,fields);
}

export function readMemberCollectionForm(context: Context,revealError=true): MemberCollection {
 const kind=get('collectionAssertion') as MemberCollection['assertion']['kind'];
 const bound=(id:string)=>{const v=get(id).trim();if(!v)return undefined;if(!/^\d+$/.test(v))throw new Error('Количество задаётся целым неотрицательным числом.');return Number(v);};
 const assertion: MemberCollection['assertion']=kind==='membership'?{kind}:kind==='count'?{kind,min:bound('collectionMin'),max:bound('collectionMax')}:
  kind==='position'?{kind,position:get('collectionPosition') as 'first'|'last'}:kind==='propertyDomain'||kind==='hostRequirement'?{kind,...readProperty('collectionAssertion'),values:readValues('collectionAssertion',revealError)}:
  {kind:'propertyMapping',...readProperty('collectionAssertion'),hostProperty:get('collectionHostProperty').trim(),hostPropertyType:get('collectionHostType') as CollectionProperty['propertyType'],transform:get('collectionTransform') as 'identity'|'string-to-boolean'};
 const c:MemberCollection={version:1,ownerTargetRole:get('collectionOwner'),memberTargetRoles:selected('collectionMembers'),representationIds:selected('collectionRepresentations'),visibleOnly:kind==='membership'?false:checked('collectionVisibleOnly'),assertion,
  ...(kind!=='membership'&&readFilter('collectionFilter',revealError)?{filter:readFilter('collectionFilter',revealError)}:{}),
  ...(kind!=='membership'&&readFilter('collectionWhenHost',revealError)?{whenHost:readFilter('collectionWhenHost',revealError)}:{}),
  ...(kind!=='membership'&&readFilter('collectionWhenMember',revealError)?{whenMember:readFilter('collectionWhenMember',revealError)}:{}),};
 const errors=memberCollectionErrors(c,context.manual);if(errors.length)throw new Error(errors.join(' '));return c;
}

export function renderMemberCollectionForm(container: HTMLElement, initial: MemberCollection | undefined, context: Context): void {
 context={...context,roles:()=>selected('collectionMembers'),ownerRole:()=>get('collectionOwner'),representationIds:()=>selected('collectionRepresentations')};
 const m=context.manual,roles=m.targets.filter(t=>t.resolution==='resolved').map(t=>[t.semanticRole,`${t.label} · ${t.semanticRole} · привязки вариантов: ${t.variantHints?.length || 0}`]);
 const kind=initial?.assertion.kind || 'count',operation=select('collectionAssertion',[['membership','Закрытый состав · включая скрытые'],['count','Количество'],['position','Первый / последний'],['propertyDomain','Допустимые значения дочернего свойства'],['propertyMapping','Дочернее свойство равно свойству владельца'],['hostRequirement','Выбранные элементы требуют значения владельца']],kind);
 const owner=select('collectionOwner',roles,initial?.ownerTargetRole || 'root');
 container.append(field('Владелец прямых дочерних экземпляров',owner),field('Что проверить',operation));
 const reps=m.representations.filter(r=>r.kind==='figma'&&r.status!=='deprecated');
 container.append(collectionChecks('collectionRepresentations','Representations',reps.map(r=>[r.id,`${r.id} · ${r.platform}`]),initial?.representationIds || (reps.length===1?[reps[0].id]:[])),
  collectionChecks('collectionMembers','Исходные экземпляры · выбор по semantic role',roles.filter(r=>r[0]!==owner.value),initial?.memberTargetRoles || []));
 const copy=select('collectionFromDependency',[['','Выбрать direct dependency'],...(m.componentDependencies || []).filter(d=>d.bindings.some(b=>b.kind==='direct-child')).map(d=>[d.id,d.componentId])],'');
 container.append(field('Заполнить состав из уже объявленных direct bindings',copy));
 copy.addEventListener('change',()=>{const bindings=m.componentDependencies?.find(d=>d.id===copy.value)?.bindings.filter(b=>b.kind==='direct-child') || [];
  const ownerRoles=new Set(bindings.map(b=>(b as any).ownerTargetRole));if(ownerRoles.size===1)owner.value=[...ownerRoles][0];
  container.querySelectorAll<HTMLInputElement>('#collectionMembers input').forEach(i=>i.checked=bindings.some(b=>b.targetRole===i.value));
  container.querySelectorAll<HTMLInputElement>('#collectionRepresentations input').forEach(i=>i.checked=bindings.some(b=>(b as any).representationIds.includes(i.value)));syncSummary();});
 const visible=document.createElement('input');visible.type='checkbox';visible.id='collectionVisibleOnly';visible.checked=initial?.visibleOnly??true;const vlabel=document.createElement('label');vlabel.className='check-field';vlabel.append(visible,document.createTextNode('Только effectively visible элементы'));container.append(vlabel);
 const assertionFields=document.createElement('div'),filters=document.createElement('div');container.append(assertionFields,filters);
 const summary=document.createElement('p');summary.id='collectionSummary';summary.className='field-help';container.append(summary);
 const syncSummary=()=>{try{const c=readMemberCollectionForm(context,false),a=c.assertion;
  summary.textContent=`${c.ownerTargetRole}: ${c.memberTargetRoles.length} исходных экземпляров, ${c.visibleOnly?'только видимые':'включая скрытые'}. ${a.kind==='count'?`Количество ${a.min??0}–${a.max??'∞'}`:a.kind==='position'?`Отобранные элементы — ${a.position==='first'?'первые':'последние'} среди видимых`:a.kind==='membership'?'Добавление, дубликат, удаление и подмена запрещены':a.kind==='propertyMapping'?`${a.property} = ${a.hostProperty}`:`${a.property} ∈ ${a.values.map(String).join(', ')}`}${c.filter?`; отбор ${c.filter.property} ∈ ${c.filter.values.join(', ')}`:''}${c.whenHost?`; если владелец ${c.whenHost.property} ∈ ${c.whenHost.values.join(', ')}`:''}${c.whenMember?`; если есть элемент ${c.whenMember.property} ∈ ${c.whenMember.values.join(', ')}`:''}.`;
 }catch(e){summary.textContent=e instanceof Error?e.message:String(e);}};
 const renderAssertion=()=>{
  assertionFields.replaceChildren();const a=initial?.assertion.kind===operation.value?initial.assertion:undefined;
  if(operation.value==='count')assertionFields.append(field('Минимум',text('collectionMin',a?.kind==='count'&&a.min!==undefined?String(a.min):'')),field('Максимум',text('collectionMax',a?.kind==='count'&&a.max!==undefined?String(a.max):'')));
  else if(operation.value==='position')assertionFields.append(field('Позиция среди членов коллекции',select('collectionPosition',[['first','Первый'],['last','Последний']],a?.kind==='position'?a.position:'first')));
  else if(['propertyDomain','propertyMapping','hostRequirement'].includes(operation.value)){
   const p=a&&'property'in a?a:undefined;assertionFields.append(propertyFields('collectionAssertion',operation.value==='hostRequirement'?'Требуемое свойство владельца':'Свойство элемента',p,a&&'values'in a?a.values:operation.value==='propertyMapping'?undefined:[],context,operation.value==='hostRequirement'));
   if(operation.value==='propertyMapping'){assertionFields.append(propertyFields('collectionHost','Свойство владельца',a?.kind==='propertyMapping'?{property:a.hostProperty,propertyType:a.hostPropertyType}:undefined,undefined,context,true),
    field('Явное преобразование',select('collectionTransform',[['identity','Без преобразования · одинаковые типы'],['string-to-boolean','VARIANT True/False → BOOLEAN']],a?.kind==='propertyMapping'?a.transform || 'identity':'identity')));}
  }
  visible.disabled=operation.value==='membership';filters.hidden=operation.value==='membership';syncSummary();
 };
 for(const [prefix,title,filter,host] of [['collectionFilter','Отобрать элементы по свойству',initial?.filter,false],['collectionWhenHost','Применять, когда свойство владельца',initial?.whenHost,true],['collectionWhenMember','Применять, когда есть хотя бы один такой элемент',initial?.whenMember,false]] as const){
  const toggle=document.createElement('input');toggle.type='checkbox';toggle.id=prefix+'Enabled';toggle.checked=!!filter;const row=document.createElement('label');row.className='check-field';row.append(toggle,document.createTextNode(title));
  const fields=propertyFields(prefix,title,filter,filter?.values || [],context,host);fields.hidden=!toggle.checked;toggle.addEventListener('change',()=>{fields.hidden=!toggle.checked;syncSummary();});filters.append(row,fields);
 }
 const refreshOptions=()=>container.querySelectorAll('.collection-choices').forEach(s=>s.dispatchEvent(new Event('property-options-refresh')));
 operation.addEventListener('change',renderAssertion);container.addEventListener('input',syncSummary);container.addEventListener('change',event=>{
  if(event.target instanceof Element && event.target.closest('#collectionOwner, #collectionMembers, #collectionRepresentations, #collectionFromDependency'))refreshOptions();
  syncSummary();
 });renderAssertion();
 // The caller mounts this row after rendering: resolve DOM-backed scope only then.
 queueMicrotask(()=>{if(container.isConnected){refreshOptions();syncSummary();}});
}

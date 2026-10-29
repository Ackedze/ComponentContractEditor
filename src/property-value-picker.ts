import type { JsonValue } from './core/index';
import type { PropertyOption } from './component-property-options';

export function renderPropertyValuePicker(id:string,option:PropertyOption|undefined,selected:JsonValue[],title='Допустимые значения'): HTMLElement {
  const section=document.createElement('fieldset');section.id=id;section.className='collection-choices property-value-picker';
  section.dataset.verified=String(!!option?.finite);
  const legend=document.createElement('legend');legend.textContent=title;section.append(legend);
  if(option?.type==='TEXT'&&!option.finite){
    section.dataset.freeText='true';const input=document.createElement('input');input.id=id+'Free';input.value=selected.map(String).join(', ');
    input.placeholder='Свободные текстовые значения через запятую';section.append(input);return section;
  }
  const values=[...(option?.values || [])];
  for(const value of selected)if(!values.some(v=>JSON.stringify(v)===JSON.stringify(value)))values.push(value);
  for(const value of values){
    const available=!!option?.finite&&option.values.some(v=>JSON.stringify(v)===JSON.stringify(value));
    const label=document.createElement('label');label.className='check-field';
    const input=document.createElement('input');input.type='checkbox';input.value=JSON.stringify(value);input.dataset.available=String(available);
    input.checked=selected.some(v=>JSON.stringify(v)===JSON.stringify(value));
    const text=document.createElement('span');text.textContent=String(value)+(available?'':' · сохранено, отсутствует в доступном API');
    label.append(input,text);section.append(label);
  }
  const help=document.createElement('small');help.className='field-help';
  help.textContent=option?.finite?'Выберите одно или несколько значений. Тип и регистр сохраняются.':'Загрузите каталог или закреплённую зависимость, чтобы получить доступные варианты.';
  section.append(help);return section;
}

export function propertyValuePickerSelection(id:string): JsonValue[] {
  const section=document.getElementById(id);
  if(section?.dataset.freeText==='true')return (document.getElementById(id+'Free') as HTMLInputElement).value.split(',').map(v=>v.trim()).filter(Boolean);
  return Array.from(section?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')||[]).map(i=>JSON.parse(i.value));
}
export function readPropertyValuePicker(id:string,revealError=true): JsonValue[] {
  const section=document.getElementById(id);
  if(section?.dataset.verified==='true'&&section.querySelector('input[data-available="false"]:checked')){
    if(revealError){
      section.setAttribute('aria-invalid','true');section.dataset.ruleInvalid='true';
      for(let parent:HTMLElement|null=section;parent;parent=parent.parentElement)if(parent instanceof HTMLDetailsElement)parent.open=true;
      section.scrollIntoView({block:'nearest'});section.querySelector<HTMLInputElement>('input[data-available="false"]:checked')?.focus({preventScroll:true});
    }
    throw new Error('Выберите значения из доступного API: сохранённое значение отсутствует в каталоге.');
  }
  return propertyValuePickerSelection(id);
}

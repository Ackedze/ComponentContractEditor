import { compileManualSource, dependencyPinIssue, importWorkspace, linkComponentDependencies, readZip, stableHash, zipEntryText,
  type CompiledContract, type ComponentDependency } from './core/index';

/** Source-only authoring ZIPs are compiled without changing their manual or pins.
 * A supplied compiled artifact remains an exact comparison, not a fallback. */
export async function readDependencyPackage(name: string, bytes: Uint8Array, hostComponentId: string): Promise<CompiledContract> {
  let contract: CompiledContract;
  if (name.toLowerCase().endsWith('.zip')) {
    const files = (await readZip(bytes)).map(entry => ({name: entry.name, text: zipEntryText(entry)}));
    const imported = importWorkspace(files);
    if (imported.manual.rules.some(rule => rule.status !== 'reviewed' && rule.status !== 'deprecated')) {
      throw new Error('В зависимости есть правила без review. Загрузите принятый пакет с reviewed-правилами.');
    }
    const regenerated = compileManualSource(imported.manual, imported.variantEvidence, imported.dependencyContracts);
    const errors = regenerated.issues.filter(issue => issue.level === 'error');
    if (errors.length || regenerated.contract.status !== 'ready') {
      throw new Error(`Пакет не готов к исполнению: ${errors[0]?.message || regenerated.contract.status}.`);
    }
    if (imported.compiledInput && stableHash(regenerated.contract) !== stableHash(imported.compiledInput)) {
      throw new Error('Compiled не совпадает с source/closure ZIP. Используйте совместимый экспорт принятого пакета.');
    }
    contract = (imported.compiledInput as CompiledContract | undefined) || regenerated.contract;
  } else {
    contract = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes));
  }
  if (!contract || typeof contract !== 'object' || !contract.package) throw new Error('Выберите compiled JSON или authoring ZIP зависимости.');
  if (contract.package.componentId === hostComponentId) throw new Error('Компонент не может зависеть от самого себя.');
  const revision = contract.package.manualRevision ?? contract.rules?.[0]?.revision;
  const pin = {id:'imported',componentId:contract.package.componentId,revision,manualSourceHash:contract.package.manualSourceHash,
    compiledHash:stableHash(contract),bindings:[]} as ComponentDependency;
  const issue = dependencyPinIssue(pin,contract) || linkComponentDependencies({component:{componentId:hostComponentId},componentDependencies:[pin]} as any,[contract])[0]?.issue;
  if (issue || contract.status !== 'ready') throw new Error(`Пакет не принят: ${issue || contract.status}.`);
  return contract;
}

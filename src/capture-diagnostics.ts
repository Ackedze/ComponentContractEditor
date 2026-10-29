import { isDeclaredRootTarget, type ManualSource, type PreviewSnapshot } from './core/index';

/** Guidance only: never changes facts, bindings or execution coverage. */
export function captureDiagnostics(snapshot: PreviewSnapshot, manual: ManualSource): string[] {
  const root = snapshot.nodes.find(node => snapshot.selection.includes(String(node.id)));
  const availability = root?.variantAvailability as {reason?:string} | undefined;
  const messages: string[] = [];
  if (availability?.reason === 'reference-catalog-structure-drift') messages.push(
    'Каталог и независимый библиотечный эталон имеют разный состав. Обновите generated facts из Athena; затем подтвердите привязки целей для выбранного варианта.');
  const key = snapshot.source?.componentKey, representation = snapshot.source?.representationId;
  if (key && representation && manual.targets.some(target => !isDeclaredRootTarget(target) && target.resolution === 'resolved' && target.pathHint?.includes(' / ')
    && !target.variantHints?.some(hint => hint.componentKey === key && hint.representationId === representation))) messages.push(
    'У части дочерних целей нет подтверждённой привязки для выбранного варианта. В Anatomy перепривяжите нужные цели и подтвердите source address.');
  if (snapshot.instanceContentReferences?.attempts.some(attempt => attempt.failure === 'replacement-component-unavailable'
    || attempt.failure === 'replacement-identity-or-port-mismatch')) messages.push(
    'Не подтверждён независимый эталон вложенного варианта или замены. Повторите capture; выполнение дочернего контракта само по себе не закрывает этот пробел.');
  return messages;
}

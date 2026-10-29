import { linkComponentDependencies, relativeTargetPath, type CompiledContract, type ManualSource } from './core/index';

export type DependencySubject = { targetRole: string; relativePath: string };
export type DeclaredPortOption = { name: string; componentIds: string[] };

/** Pinned declarations supply choices across variants, never observed facts or asset identities. */
export function declaredDependencyPortOptions(
  manual: ManualSource, contracts: CompiledContract[], subject: DependencySubject,
): DeclaredPortOption[] {
  return createDeclaredDependencyPortOptions(manual, contracts)(subject);
}

/** Validate pins once per rendered form; no persistent cache of mutable authoring sources. */
export function createDeclaredDependencyPortOptions(manual: ManualSource, contracts: CompiledContract[]) {
  const dependencies = linkComponentDependencies(manual, contracts);
  return (subject: DependencySubject): DeclaredPortOption[] => {
    const ports = new Map<string, Set<string>>();
    if (!manual.targets.some(t => t.semanticRole === subject.targetRole && t.resolution === 'resolved')) return [];
    for (const pin of dependencies) {
      if (pin.issue || !pin.contract) continue;
      const child = pin.contract;
      for (const binding of pin.bindings) {
        if (binding.kind !== 'direct-child' || binding.targetRole !== subject.targetRole) continue;
        const platforms = manual.representations.filter(r => r.kind === 'figma' && r.status !== 'deprecated'
          && binding.representationIds.includes(r.id)).map(r => r.platform);
        const reps = child.facts.representations.filter(r => r.kind === 'figma' && r.status !== 'deprecated' && platforms.includes(r.platform));
        if (!reps.length) continue;
        for (const portBinding of child.facts.dependencyBindings || []) {
          const targets = child.facts.targets.filter(t => t.semanticRole === portBinding.targetRole && t.resolution === 'resolved');
          if (targets.length !== 1) continue;
          const target = targets[0];
          const hints = target.representationHints?.length
            ? target.representationHints.filter(h => reps.some(r => r.id === h.representationId)).map(h => h.pathHint).filter((p): p is string => p !== undefined)
            : target.pathHint === undefined ? [] : [target.pathHint];
          hints.push(...(target.variantHints || []).filter(h => reps.some(r => r.id === h.representationId)).map(h => h.pathHint));
          if (!hints.some(h => [binding.relativePath, relativeTargetPath(h), portBinding.relativePath].filter(Boolean).join(' / ') === subject.relativePath)) continue;
          for (const name of portBinding.portNames) {
            if (!name || name.includes('#')) continue;
            const sources = ports.get(name) || new Set<string>(); sources.add(pin.componentId); ports.set(name, sources);
          }
        }
      }
    }
    return [...ports].sort(([a], [b]) => a.localeCompare(b)).map(([name, sources]) => ({name, componentIds: [...sources].sort()}));
  };
}

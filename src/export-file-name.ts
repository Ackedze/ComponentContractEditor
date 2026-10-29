import type { ComponentIdentity } from './core/types';

function filenamePart(value: string): string {
  return value.trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '');
}

/** Names the whole package, independently of the active representation preview. */
export function componentContractFilename(
  component: Pick<ComponentIdentity, 'family' | 'contractId' | 'platform' | 'platforms'>,
): string {
  const family = filenamePart(component.family) || filenamePart(component.contractId) || 'Component';
  const declaredPlatforms = component.platforms.map(platform => platform.trim()).filter(Boolean);
  const platforms = Array.from(new Set(declaredPlatforms.length
    ? declaredPlatforms
    : [component.platform.trim() || 'universal'])).sort();
  const defaultScope = platforms.length === 1 && ['desktop', 'universal'].includes(platforms[0]);
  const scope = defaultScope ? '' : platforms.map(filenamePart).filter(Boolean).join('.');
  return `${family}${scope ? `.${scope}` : ''}.component-contract.zip`;
}

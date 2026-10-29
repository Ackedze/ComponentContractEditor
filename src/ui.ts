import {
  applyProtectInternalsPolicy,
  buildExportBundle,
  buildAuthoringZip,
  buildEvaluationDetails,
  groupEvaluationDetails,
  buildEditorValidationReport,
  buildContractReadiness,
  nativeSlotCapturePlan,
  buildValidationReportDownload,
  prepareValidationSnapshot,
  createValidationIntent,
  validationInputs,
  resolveSnapshotTargets,
  targetResolutionReason,
  planTargetRemap,
  applyTargetRemap,
  editVariantTextTargets,
  type TargetRemapPlan,
  paintDiagnosticSummary,
  type ValidationCapture,
  type ValidationReportDownload,
  validateRuleEdit,
  forbiddenConstraintsForEdit,
  validationIssueLabel,
  allowedComponentPropertyNames,
  capabilitiesForSet,
  capabilitySetLabel,
  isDeclaredRootTarget,
  compileManualSource,
  componentDependencyKeys,
  createWorkspaceFromPreview,
  createEditorSession,
  createZip,
  evaluateCompiledContract,
  importWorkspace,
  mergeEditedApplicability,
  parseEditorSession,
  prepareAuthoringPreviewContract,
  PROTECTED_INTERNAL_CAPABILITY_SETS,
  PRODUCT_SCOPE_CATALOG,
  type ScopeChoice,
  readZip,
  sameManualComponentFamily,
  samePreviewComponent,
  slug,
  stableHash,
  snapshotPaths,
  textZipEntry,
  zipEntryText,
  type AnatomyNode,
  type CompiledContract,
  type ControlPath,
  type ImportedWorkspace,
  type EvaluationGroup,
  type JsonValue,
  type ManualRule,
  type ManualSource,
  type Permission,
  type PreviewSnapshot,
  type RuleStatus,
  type RuleExecutionRoute,
  type SemanticTarget,
  type Severity,
  type TargetScope,
  type TextFile,
  type TypedConstraint,
  type VariantScenario,
  type ValidationIssue,
} from './core/index';

// Re-exported message types are imported directly below at build time.
import type { PluginToUiMessage as PluginMessage, UiToPluginMessage as UiMessage } from './shared/messages';
import type { VariableModeCollection } from './shared/messages';
import { componentContractFilename } from './export-file-name';
import { collectionChecks, propertyFields, renderMemberCollectionForm, readMemberCollectionForm, renderTypedFilterForm, readTypedFilterForm } from './member-collection-form';
import { componentPropertyOptions, type PropertyOptionsContext } from './component-property-options';
import { createDeclaredDependencyPortOptions } from './dependency-port-options';
import { renderPropertyValuePicker, readPropertyValuePicker } from './property-value-picker';
import { renderDirectDependencyForm, type DirectDependencyForm } from './direct-dependency-form';
import { captureDiagnostics } from './capture-diagnostics';
let directDependencyForm: DirectDependencyForm | undefined;

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing UI element #${id}.`);
  return node as T;
}

const fileInput = element<HTMLInputElement>('fileInput');
const importButton = element<HTMLButtonElement>('importButton');
const emptyImportButton = element<HTMLButtonElement>('emptyImportButton');
const exportButton = element<HTMLButtonElement>('exportButton');
const downloadReportButton = element<HTMLButtonElement>('downloadReportButton');
const contractSettingsButton = element<HTMLButtonElement>('contractSettingsButton');
const componentMeta = element<HTMLElement>('componentMeta');
const validationComponentMeta = element<HTMLElement>('validationComponentMeta');
const validationComponentName = element<HTMLElement>('validationComponentName');
const authoringModeButton = element<HTMLButtonElement>('authoringModeButton');
const validationModeButton = element<HTMLButtonElement>('validationModeButton');
const validationProductSelect = element<HTMLSelectElement>('validationProductSelect');
const statusDot = element<HTMLSpanElement>('statusDot');
const statusText = element<HTMLSpanElement>('statusText');
const componentName = element<HTMLElement>('componentName');
const scenarioControls = element<HTMLDivElement>('scenarioControls');
const ruleCount = element<HTMLElement>('ruleCount');
const targetCount = element<HTMLElement>('targetCount');
const warningMetric = element<HTMLElement>('warningMetric');
const warningCount = element<HTMLElement>('warningCount');
const validationRuleCount = element<HTMLElement>('validationRuleCount');
const validationTargetCount = element<HTMLElement>('validationTargetCount');
const validationWarningMetric = element<HTMLElement>('validationWarningMetric');
const validationWarningCount = element<HTMLElement>('validationWarningCount');
const anatomyCount = element<HTMLElement>('anatomyCount');
const anatomySearch = element<HTMLInputElement>('anatomySearch');
const anatomyTree = element<HTMLDivElement>('anatomyTree');
const anatomyEmpty = element<HTMLDivElement>('anatomyEmpty');
const previewEmpty = element<HTMLDivElement>('previewEmpty');
const previewEmptyDescription = element<HTMLParagraphElement>('previewEmptyDescription');
const previewLoading = element<HTMLDivElement>('previewLoading');
const componentStage = element<HTMLElement>('componentStage');
const previewImage = element<HTMLImageElement>('previewImage');
const previewDimensions = element<HTMLElement>('previewDimensions');
const propertyList = element<HTMLDivElement>('propertyList');
const zoomOut = element<HTMLButtonElement>('zoomOut');
const zoomIn = element<HTMLButtonElement>('zoomIn');
const zoomValue = element<HTMLOutputElement>('zoomValue');
const authoringPanel = element<HTMLElement>('authoringPanel');
const authoringTitle = element<HTMLElement>('authoringTitle');
const authoringSubtitle = element<HTMLElement>('authoringSubtitle');
const authoringListView = element<HTMLElement>('authoringListView');
const authoringEditorView = element<HTMLElement>('authoringEditorView');
const backToRulesButton = element<HTMLButtonElement>('backToRulesButton');
const quickPolicySummary = element<HTMLElement>('quickPolicySummary');
const protectInternalsButton = element<HTMLButtonElement>('protectInternalsButton');
const ruleCards = element<HTMLDivElement>('ruleCards');
const ruleSearch = element<HTMLInputElement>('ruleSearch');
const clearRuleSearchButton = element<HTMLButtonElement>('clearRuleSearchButton');
const ruleSearchResults = element<HTMLParagraphElement>('ruleSearchResults');
let ruleSearchComponentId: string | undefined;
const ruleRationaleTooltip = element<HTMLDivElement>('ruleRationaleTooltip');
const ruleRationaleText = element<HTMLParagraphElement>('ruleRationaleText');
let ruleRationaleAnchor: HTMLButtonElement | null = null;
let ruleRationaleHideTimer: number | undefined;
const previewPinnedState = element<HTMLElement>('previewPinnedState');
const ruleSelect = element<HTMLSelectElement>('ruleSelect');
const newRuleButton = element<HTMLButtonElement>('newRuleButton');
const targetType = element<HTMLElement>('targetType');
const targetLabel = element<HTMLElement>('targetLabel');
const targetRole = element<HTMLElement>('targetRole');
const targetResolution = element<HTMLElement>('targetResolution');
const remapTargetsButton = element<HTMLButtonElement>('remapTargetsButton');
const addSemanticTargetButton = element<HTMLButtonElement>('addSemanticTargetButton');
const remapRuleTargetButton = element<HTMLButtonElement>('remapRuleTargetButton');
const remapDialog = element<HTMLDialogElement>('remapDialog');
const remapTargetSelect = element<HTMLSelectElement>('remapTargetSelect');
const remapNodeSelect = element<HTMLSelectElement>('remapNodeSelect');
const remapConfirm = element<HTMLInputElement>('remapConfirm');
const applyRemapButton = element<HTMLButtonElement>('applyRemapButton');
let remapPlan: TargetRemapPlan | null = null;
let ruleFormDirty = false;
const capabilityInput = element<HTMLInputElement>('capabilityInput');
const propertyPicker = element<HTMLElement>('propertyPicker');
const capabilityOptions = element<HTMLDivElement>('capabilityOptions');
const layerPropertyField = element<HTMLElement>('layerPropertyField');
const layerPropertyTab = element<HTMLButtonElement>('layerPropertyTab');
const componentPropertyTab = element<HTMLButtonElement>('componentPropertyTab');
const layerPropertyPanel = element<HTMLElement>('layerPropertyPanel');
const componentPropertyPanel = element<HTMLElement>('componentPropertyPanel');
const componentPropertyInput = element<HTMLSelectElement>('componentPropertyInput');
const componentPropertyHint = element<HTMLElement>('componentPropertyHint');
const capabilitySetSelect = element<HTMLSelectElement>('capabilitySetSelect');
const capabilitySetList = element<HTMLSpanElement>('capabilitySetList');
const targetScope = element<HTMLSelectElement>('targetScope');
const boundaryPolicy = element<HTMLSelectElement>('boundaryPolicy');
const targetApplicability = element<HTMLSelectElement>('targetApplicability');
const controlPathKind = element<HTMLSelectElement>('controlPathKind');
const controlPathHint = element<HTMLElement>('controlPathHint');
const controlPathValue = element<HTMLInputElement>('controlPathValue');
const slotAnchorProperty = element<HTMLInputElement>('slotAnchorProperty');
const slotOwnerTarget = element<HTMLInputElement>('slotOwnerTarget');
const slotContentOwnership = element<HTMLSelectElement>('slotContentOwnership');
const exclusivePath = element<HTMLInputElement>('exclusivePath');
const controlPathSection = element<HTMLDivElement>('controlPathSection');
const constraintType = element<HTMLSelectElement>('constraintType');
const constraintFields = element<HTMLDivElement>('constraintFields');
const constraintSection = element<HTMLDivElement>('constraintSection');
const constraintFact = element<HTMLInputElement>('constraintFact');
const additionalConstraints = element<HTMLTextAreaElement>('additionalConstraints');
const constraintEntrySelect = element<HTMLSelectElement>('constraintEntrySelect');
let activeConstraintIndex = 0;
const additionalControlPaths = element<HTMLTextAreaElement>('additionalControlPaths');
const applicabilitySection = element<HTMLDetailsElement>('applicabilitySection');
const contextConditions = element<HTMLTextAreaElement>('contextConditions');
const conditionSubject = element<HTMLSelectElement>('conditionSubject');
const contextDomains = element<HTMLTextAreaElement>('contextDomains');
const ruleValidationMode = element<HTMLSelectElement>('ruleValidationMode');
const validationPurposeSelect = element<HTMLSelectElement>('validationPurposeSelect');
const activeDependency = element<HTMLSelectElement>('activeDependency');
function dependencyOptions(select: HTMLSelectElement, value = '') {
  select.replaceChildren();
  for (const id of ['', ...(workspace?.manual.componentDependencies || []).map(d=>d.id),
    ...(value && !workspace?.manual.componentDependencies?.some(d=>d.id===value) ? [value] : [])]) {
    const option = document.createElement('option'); option.value = id;
    option.textContent = id || 'Без условия зависимости'; option.selected = id === value; select.append(option);
  }
}
const strokeApplicability = element<HTMLSelectElement>('strokeApplicability');
const gapApplicability = element<HTMLSelectElement>('gapApplicability');
const paddingTopApplicability = element<HTMLSelectElement>('paddingTopApplicability');
const paddingRightApplicability = element<HTMLSelectElement>('paddingRightApplicability');
const paddingBottomApplicability = element<HTMLSelectElement>('paddingBottomApplicability');
const paddingLeftApplicability = element<HTMLSelectElement>('paddingLeftApplicability');
const primaryAlignmentApplicability = element<HTMLSelectElement>('primaryAlignmentApplicability');
const counterAlignmentApplicability = element<HTMLSelectElement>('counterAlignmentApplicability');
const propertyApplicabilityInputs = [[strokeApplicability,'appearance.strokeWeight'],[gapApplicability,'layout.itemSpacing'],
  [paddingTopApplicability,'layout.padding.top'],
  [paddingRightApplicability,'layout.padding.right'],
  [paddingBottomApplicability,'layout.padding.bottom'],
  [paddingLeftApplicability,'layout.padding.left'],
  [primaryAlignmentApplicability,'layout.primaryAxisAlignItems'],
  [counterAlignmentApplicability,'layout.counterAxisAlignItems'],
] as const;
const variantScopeDropdown = element<HTMLDetailsElement>('variantScopeDropdown');
const variantScopeSummary = element<HTMLElement>('variantScopeSummary');
const variantScopeOptions = element<HTMLDivElement>('variantScopeOptions');
const modeScopeDropdown = element<HTMLDetailsElement>('modeScopeDropdown');
const modeScopeSummary = element<HTMLElement>('modeScopeSummary');
const modeScopeOptions = element<HTMLDivElement>('modeScopeOptions');
const severity = element<HTMLSelectElement>('severity');
const ruleStatus = element<HTMLSelectElement>('ruleStatus');
const ruleOwner = element<HTMLInputElement>('ruleOwner');
const ruleOwnershipKind = element<HTMLSelectElement>('ruleOwnershipKind');
const ruleOwnershipId = element<HTMLInputElement>('ruleOwnershipId');
const rationale = element<HTMLTextAreaElement>('rationale');
const remediationIntent = element<HTMLInputElement>('remediationIntent');
const deleteRuleButton = element<HTMLButtonElement>('deleteRuleButton');
const saveRuleButton = element<HTMLButtonElement>('saveRuleButton');
const ruleIdInput = element<HTMLInputElement>('ruleIdInput');
const productScopeDropdown = element<HTMLDetailsElement>('productScopeDropdown');
const productScopeOptions = element<HTMLDivElement>('productScopeOptions');
const productScopeCustom = element<HTMLInputElement>('productScopeCustom');
const channelScopeDropdown = element<HTMLDetailsElement>('channelScopeDropdown');
const channelScopeSummary = element<HTMLElement>('channelScopeSummary');
const channelScopeOptions = element<HTMLDivElement>('channelScopeOptions');
const channelScopeCustom = element<HTMLInputElement>('channelScopeCustom');
const scopeStatus = element<HTMLSelectElement>('scopeStatus');
const executionRoute = element<HTMLSelectElement>('executionRoute');
const externalRuleIds = element<HTMLInputElement>('externalRuleIds');
const missingFacts = element<HTMLInputElement>('missingFacts');
const sourceRefs = element<HTMLInputElement>('sourceRefs');
const ruleMessage = element<HTMLTextAreaElement>('ruleMessage');
const remediationMessage = element<HTMLTextAreaElement>('remediationMessage');
const compileSummary = element<HTMLElement>('compileSummary');
const compileDetails = element<HTMLElement>('compileDetails');
const testResults = element<HTMLDivElement>('testResults');
const showCompiledButton = element<HTMLButtonElement>('showCompiledButton');
const testSelectionButton = element<HTMLButtonElement>('testSelectionButton');
const compiledDialog = element<HTMLDialogElement>('compiledDialog');
const closeCompiledButton = element<HTMLButtonElement>('closeCompiledButton');
const compiledOutput = element<HTMLElement>('compiledOutput');
const contractDialog = element<HTMLDialogElement>('contractDialog');
const closeContractButton = element<HTMLButtonElement>('closeContractButton');
const cancelContractButton = element<HTMLButtonElement>('cancelContractButton');
const saveContractButton = element<HTMLButtonElement>('saveContractButton');
const componentIdInput = element<HTMLInputElement>('componentIdInput');
const familyIdInput = element<HTMLInputElement>('familyIdInput');
const contractIdInput = element<HTMLInputElement>('contractIdInput');
const familyInput = element<HTMLInputElement>('familyInput');
const layerInput = element<HTMLInputElement>('layerInput');
const libraryInput = element<HTMLInputElement>('libraryInput');
const platformInput = element<HTMLInputElement>('platformInput');
const platformsInput = element<HTMLInputElement>('platformsInput');
const lifecycleInput = element<HTMLSelectElement>('lifecycleInput');
const componentKeyInput = element<HTMLInputElement>('componentKeyInput');
const manualOwnerInput = element<HTMLInputElement>('manualOwnerInput');
const purposeInput = element<HTMLTextAreaElement>('purposeInput');
const useWhenInput = element<HTMLTextAreaElement>('useWhenInput');
const doNotUseWhenList = element<HTMLDivElement>('doNotUseWhenList');
const doNotUseWhenEmpty = element<HTMLParagraphElement>('doNotUseWhenEmpty');
const addDoNotUseConditionButton = element<HTMLButtonElement>('addDoNotUseConditionButton');
const relatedComponentIdsInput = element<HTMLInputElement>('relatedComponentIdsInput');
const keywordsInput = element<HTMLInputElement>('keywordsInput');
const representationsInput = element<HTMLTextAreaElement>('representationsInput');
const semanticApiInput = element<HTMLTextAreaElement>('semanticApiInput');
const validationContextInput = element<HTMLTextAreaElement>('validationContextInput');
const documentationInput = element<HTMLTextAreaElement>('documentationInput');
const examplesInput = element<HTMLTextAreaElement>('examplesInput');
const decisionsInput = element<HTMLTextAreaElement>('decisionsInput');
const componentDependenciesInput = element<HTMLTextAreaElement>('componentDependenciesInput');
const variantTextTargetsInput = element<HTMLTextAreaElement>('variantTextTargetsInput');
const generationProfilesInput = element<HTMLTextAreaElement>('generationProfilesInput');
const generationInstructionsInput = element<HTMLTextAreaElement>('generationInstructionsInput');
const testDetailsDialog = element<HTMLDialogElement>('testDetailsDialog');
const closeTestDetailsButton = element<HTMLButtonElement>('closeTestDetailsButton');
const testDetailsTitle = element<HTMLElement>('testDetailsTitle');
const testDetailsSummary = element<HTMLElement>('testDetailsSummary');
const testFilterBar = element<HTMLDivElement>('testFilterBar');
const testDetailList = element<HTMLDivElement>('testDetailList');

type UnifiedSelectController = {
  root: HTMLDivElement;
  trigger: HTMLButtonElement;
  value: HTMLSpanElement;
  menu: HTMLDivElement;
  search: HTMLInputElement;
  renderOptions: (query?: string) => void;
  sync: () => void;
  observer?: MutationObserver;
};

const unifiedSelects = new Map<HTMLSelectElement, UnifiedSelectController>();
let openUnifiedSelect: HTMLSelectElement | null = null;

function closeUnifiedSelect(select = openUnifiedSelect, restoreFocus = false): void {
  if (!select) return;
  const controller = unifiedSelects.get(select);
  if (!controller) return;
  controller.menu.hidden = true;
  controller.trigger.setAttribute('aria-expanded', 'false');
  controller.root.classList.remove('open');
  if (openUnifiedSelect === select) openUnifiedSelect = null;
  if (restoreFocus) controller.trigger.focus({ preventScroll: true });
}

function positionUnifiedSelectMenu(controller: UnifiedSelectController): void {
  const rect = controller.trigger.getBoundingClientRect();
  const viewportGap = 8;
  const width = Math.max(rect.width, 180);
  const availableBelow = window.innerHeight - rect.bottom - viewportGap;
  const availableAbove = rect.top - viewportGap;
  const opensUp = availableBelow < 180 && availableAbove > availableBelow;
  const maxHeight = Math.max(96, Math.min(300, (opensUp ? availableAbove : availableBelow) - 4));
  controller.menu.style.width = `${Math.min(width, window.innerWidth - viewportGap * 2)}px`;
  controller.menu.style.maxHeight = `${maxHeight}px`;
  controller.menu.style.left = `${Math.max(viewportGap, Math.min(rect.left, window.innerWidth - width - viewportGap))}px`;
  controller.menu.style.top = opensUp ? 'auto' : `${rect.bottom + 4}px`;
  controller.menu.style.bottom = opensUp ? `${window.innerHeight - rect.top + 4}px` : 'auto';
}

function syncUnifiedSelect(select: HTMLSelectElement): void {
  unifiedSelects.get(select)?.sync();
}

function syncAllUnifiedSelects(): void {
  unifiedSelects.forEach((controller) => controller.sync());
  updateRuleSectionSummaries();
}

function updateRuleSectionSummaries(): void {
  const value = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value || '';
  const label = (id: string) => (document.getElementById(id) as HTMLSelectElement | null)?.selectedOptions?.[0]?.textContent || '';
  const text = (id: string) => document.getElementById(id)?.textContent?.trim() || '';
  const count = (document.getElementById('constraintEntrySelect') as HTMLSelectElement | null)?.options.length || 1;
  const plural = count % 10 === 1 && count % 100 !== 11 ? 'ограничение' : count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14) ? 'ограничения' : 'ограничений';
  const constraint = value('constraintType') === 'memberCollection' ? text('collectionSummary')
    : ['propertyDomain', 'propertyExclusion'].includes(value('constraintType')) ? value('constraintValues') : '';
  const hasConditions = ['contextConditions','contextDomains'].some(id => !['','{}','[]'].includes(value(id).trim()));
  const summaries: Record<string, string> = {
    constraintSection: [label('constraintType'), `${count} ${plural}`, constraint.length > 120 ? `${constraint.slice(0,117)}…` : constraint].filter(Boolean).join(' · '),
    executionSection: [label('executionRoute'), value('externalRuleIds') ? 'Внешние правила заданы' : '', value('missingFacts') ? 'Есть недостающие факты' : ''].filter(Boolean).join(' · '),
    ownershipSection: value('ruleOwnershipKind') ? `${label('ruleOwnershipKind')} · ${value('ruleOwnershipId') || 'Укажите ID'}` : 'Не классифицировано',
    applicabilitySection: [label('ruleValidationMode'), text('variantScopeSummary'), text('modeScopeSummary'), document.querySelector('#productScopeDropdown > summary')?.textContent?.trim(), text('channelScopeSummary'), hasConditions ? 'Условия заданы' : '', value('scopeStatus') === 'needs-confirmation' ? 'Требует подтверждения' : ''].filter(Boolean).join(' · '),
  };
  for (const section of Array.from(document.querySelectorAll<HTMLDetailsElement>('details.rule-section'))) {
    const invalid = section.querySelector('[aria-invalid="true"]') !== null;
    section.dataset.hasError = String(invalid);
    const summary = document.getElementById(`${section.id}Summary`);
    if (summary) summary.textContent = `${summaries[section.id] || ''}${invalid ? ' · Ошибка' : ''}`;
  }
}

function revealRuleField(field: HTMLElement): void {
  let parent: HTMLElement | null = field;
  while (parent) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
    parent = parent.parentElement;
  }
}

/** Scroll the editor pane only; browser scrollIntoView also scrolls hidden body. */
function scrollRuleControlIntoView(control: HTMLElement): void {
  const panel = control.closest<HTMLElement>('.authoring-panel');
  if (!panel) return;
  const box = control.getBoundingClientRect(), bounds = panel.getBoundingClientRect();
  const heading = panel.querySelector('.panel-heading')?.getBoundingClientRect().height || 0;
  if (box.top < bounds.top + heading + 12 || box.bottom > bounds.bottom - 12)
    panel.scrollTop += box.top - (bounds.top + heading + (bounds.height - heading - box.height) / 2);
}

for (const type of ['input', 'change']) document.addEventListener(type, event => {
  if (event.target instanceof Element && event.target.closest('#authoringEditorView')) queueMicrotask(updateRuleSectionSummaries);
});

function focusSelectControl(select: HTMLSelectElement): void {
  const controller = unifiedSelects.get(select);
  if (controller) controller.trigger.focus({ preventScroll: true });
  else select.focus({ preventScroll: true });
}

function destroyUnifiedSelectsWithin(container: ParentNode): void {
  container.querySelectorAll<HTMLSelectElement>('select').forEach((select) => {
    const controller = unifiedSelects.get(select);
    if (!controller) return;
    if (openUnifiedSelect === select) openUnifiedSelect = null;
    controller.observer?.disconnect();
    controller.menu.remove();
    controller.root.remove();
    unifiedSelects.delete(select);
  });
}

function enhanceSelect(select: HTMLSelectElement): void {
  // Native dialog controls stay in the top layer; body-portalled menus do not.
  if (unifiedSelects.has(select) || select.closest('.sr-only') || select.hasAttribute('data-native-select')) return;
  const root = document.createElement('div');
  root.className = 'unified-select';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'unified-select-trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', select.getAttribute('aria-label') || 'Выбрать значение');
  const value = document.createElement('span');
  value.className = 'unified-select-value';
  const chevron = document.createElement('span');
  chevron.className = 'unified-select-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = '⌄';
  trigger.append(value, chevron);
  root.append(trigger);

  const menu = document.createElement('div');
  menu.className = 'property-picker-menu unified-select-menu';
  menu.id = `select-menu-${Math.random().toString(36).slice(2)}`;
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;
  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'unified-select-search';
  search.placeholder = 'Найти значение';
  search.setAttribute('aria-label', 'Найти значение в списке');
  trigger.setAttribute('aria-controls', menu.id);
  document.body.append(menu);

  const controller: UnifiedSelectController = {
    root,
    trigger,
    value,
    menu,
    search,
    renderOptions: () => undefined,
    sync: () => undefined,
  };

  controller.renderOptions = (query = '') => {
    menu.replaceChildren();
    const options = Array.from(select.options);
    const normalizedQuery = query.trim().toLowerCase();
    const searchable = options.length > 7;
    if (searchable) {
      search.value = query;
      menu.append(search);
    }
    const matches = options.filter((option) => !normalizedQuery || option.textContent?.toLowerCase().includes(normalizedQuery));
    matches.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'property-picker-option unified-select-option';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(option.value === select.value));
      button.disabled = option.disabled;
      const label = document.createElement('strong');
      label.textContent = option.textContent || option.value;
      button.append(label);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        controller.sync();
        closeUnifiedSelect(select, true);
      });
      button.addEventListener('keydown', (event) => {
        const buttons = Array.from(menu.querySelectorAll<HTMLButtonElement>('.unified-select-option:not(:disabled)'));
        const index = buttons.indexOf(button);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const offset = event.key === 'ArrowDown' ? 1 : -1;
          buttons[(index + offset + buttons.length) % buttons.length]?.focus({ preventScroll: true });
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          buttons[event.key === 'Home' ? 0 : buttons.length - 1]?.focus({ preventScroll: true });
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeUnifiedSelect(select, true);
        }
      });
      menu.append(button);
    });
    if (!matches.length) {
      const empty = document.createElement('span');
      empty.className = 'property-picker-empty';
      empty.textContent = 'Совпадений нет';
      menu.append(empty);
    }
  };

  controller.sync = () => {
    const selected = select.selectedOptions[0];
    value.textContent = selected?.textContent || 'Выберите значение';
    value.classList.toggle('placeholder', !select.value);
    trigger.disabled = select.disabled;
    trigger.setAttribute('aria-invalid', select.getAttribute('aria-invalid') || 'false');
    const description = select.getAttribute('aria-describedby');
    if (description) trigger.setAttribute('aria-describedby', description);
    else trigger.removeAttribute('aria-describedby');
    trigger.setAttribute('aria-label', `${select.getAttribute('aria-label') || 'Значение'}: ${value.textContent}`);
    if (!menu.hidden) controller.renderOptions(search.value);
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (openUnifiedSelect === select) {
      closeUnifiedSelect(select);
      return;
    }
    closeUnifiedSelect();
    controller.renderOptions();
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    root.classList.add('open');
    openUnifiedSelect = select;
    positionUnifiedSelectMenu(controller);
  });
  trigger.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    if (menu.hidden) trigger.click();
    const selected = menu.querySelector<HTMLButtonElement>('.unified-select-option[aria-selected="true"]');
    const fallback = menu.querySelector<HTMLButtonElement>('.unified-select-option:not(:disabled)');
    (selected || fallback)?.focus({ preventScroll: true });
  });
  search.addEventListener('input', () => {
    controller.renderOptions(search.value);
    search.focus({ preventScroll: true });
  });
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeUnifiedSelect(select, true);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      menu.querySelector<HTMLButtonElement>('.unified-select-option:not(:disabled)')?.focus({ preventScroll: true });
    }
  });
  select.addEventListener('change', controller.sync);
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  controller.observer = new MutationObserver(controller.sync);
  controller.observer.observe(select, { childList: true, subtree: true, attributes: true });
  select.classList.add('unified-select-native');
  select.insertAdjacentElement('afterend', root);
  unifiedSelects.set(select, controller);
  controller.sync();
}
const toastRegion = element<HTMLDivElement>('toastRegion');

let workspace: ImportedWorkspace | null = null;
let anatomy: AnatomyNode[] = [];
let snapshot: PreviewSnapshot | null = null;
let selectedNodeId: string | null = null;
let editingRuleId: string | null = null;
let scenarioProperties: Record<string, string> = {};
let activeVariant: VariantScenario | null = null;
let activeModes: Record<string, string> = {};
let availableModes: VariableModeCollection[] = [];
let zoom = 1;
let requestSequence = 0;
let pendingPreviewRequest = '';
let pendingSelectionTestRequest = '';
let selectionTestIntent: 'validate'|'before' = 'validate';
let transitionBefore: PreviewSnapshot | null = null;
let selectedRootNodeId = '';
let validationInputSignature = '';
let requestedValidationInputs: Record<string, JsonValue> = {};
let requestedValidationMode: 'component-audit' | 'specification' = 'component-audit';

function selectedValidationMode(): 'component-audit' | 'specification' {
  return validationPurposeSelect.value === 'specification' ? 'specification' : 'component-audit';
}

function readValidationInputs(): Record<string, JsonValue> {
  const values: Record<string, JsonValue> = {};
  element('validationInputFields').querySelectorAll<HTMLSelectElement>('select[data-input-id]').forEach(select => {
    if (select.dataset.inputType === 'enum') { if (select.value) values[select.dataset.inputId!] = select.value; }
    else if (select.value === 'true' || select.value === 'false') values[select.dataset.inputId!] = select.value === 'true';
  });
  return values;
}

function renderValidationInputs(): void {
  const properties = workspace ? validationInputs(workspace.manual) : [];
  const scoped = Boolean(workspace?.manual.rules.some(r => r.applicability.validationMode === 'specification'
    || r.constraints.some(c => Boolean(c.configuration?.specificationInput))));
  element('validationPurposeControl').hidden = !scoped;
  validationPurposeSelect.disabled = Boolean(pendingSelectionTestRequest);
  element('validationInputs').hidden = properties.length === 0 || (scoped && selectedValidationMode() === 'component-audit');
  element('validationInputFields').querySelectorAll<HTMLSelectElement>('select').forEach(select => { select.disabled = Boolean(pendingSelectionTestRequest); });
  const signature = workspace ? stableHash(workspace.manual) + ':' + selectedRootNodeId + ':' + selectedValidationMode() : '';
  if (signature === validationInputSignature) return;
  validationInputSignature = signature;
  const fields = element('validationInputFields');
  fields.replaceChildren();
  for (const property of properties) {
    const label = document.createElement('label'), text = document.createElement('span'), select = document.createElement('select');
    text.textContent = property.validationInput!.label;
    select.dataset.inputId = property.id;
    select.dataset.inputType = property.valueType;
    select.disabled = Boolean(pendingSelectionTestRequest);
    select.title = property.validationInput!.description;
    const choices = property.valueType === 'enum' ? [['', 'Не задано'], ...(property.domain || []).map(v => [String(v), String(v)])] : [['', 'Не задано'], ['true', 'Да · true'], ['false', 'Нет · false']];
    for (const [value, title] of choices) {
      const option = document.createElement('option'); option.value = value; option.textContent = title; select.append(option);
    }
    select.addEventListener('change', () => { clearTestPresentation(); renderAnatomy(); setStatus('Ожидание изменено — повторите проверку', 'warning'); });
    label.append(text, select); fields.append(label);
  }
}
let previewTimeoutId: number | undefined;
let lastCompiled: CompiledContract | null = null;
let instanceSelectionAvailable = false;
let testClassifications = new Map<string, string>();
let testNodeCounts = new Map<string, number>();
let lastTestDetails: EvaluationGroup[] = [];
let lastValidationDownload: ValidationReportDownload | null = null;
let snapshotCapture: ValidationCapture | null = null;
let activeTestFilter = 'violation';
let authoringView: 'list' | 'editor' = 'list';
let selectedGroupCapabilities = new Set<string>();
let propertySourceTab: 'layer' | 'component' = 'layer';
let workspaceMode: 'authoring' | 'validation' = 'authoring';
let importedSourceFiles: TextFile[] = [];
const componentWorkspaceCache = new Map<string, ImportedWorkspace>();

function post(message: UiMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

function persistSession(): void {
  if (!workspace) return;
  post({
    type: 'save-session',
    session: createEditorSession(workspace, {
      workspaceMode,
      validationProduct: validationProductSelect.value,
      scenarioProperties,
      activeModes,
    }),
  });
}

function nextRequestId(prefix: string): string {
  requestSequence += 1;
  return `${prefix}-${requestSequence}`;
}

function setStatus(text: string, kind: 'idle' | 'ready' | 'warning' | 'busy' = 'idle'): void {
  statusText.textContent = text;
  statusDot.className = `status-dot ${kind === 'idle' ? '' : kind}`.trim();
}

function toast(message: string, kind: 'info' | 'warning' | 'error' = 'info'): void {
  const normalized = message.replace(/\s+/g, ' ').trim();
  const compact = normalized.length > 112
    ? `${normalized.slice(0, 109).trimEnd()}…`
    : normalized;
  const item = document.createElement('div');
  item.className = `toast ${kind}`;
  item.textContent = compact;
  item.setAttribute('aria-label', normalized);
  while (toastRegion.childElementCount >= 2) toastRegion.firstElementChild?.remove();
  toastRegion.append(item);
  window.setTimeout(() => item.remove(), 5200);
}

function commaList(value: string): string[] {
  return Array.from(new Set(value.split(',').map((entry) => entry.trim()).filter(Boolean)));
}

function lineList(value: string): string[] {
  return value.split('\n').map((entry) => entry.trim()).filter(Boolean);
}

type DoNotUseCondition = ManualSource['semantics']['doNotUseWhen'][number];

function refreshDoNotUseConditions(): void {
  const entries = Array.from(doNotUseWhenList.querySelectorAll<HTMLElement>('[data-condition-entry]'));
  doNotUseWhenEmpty.hidden = entries.length > 0;
  entries.forEach((entry, index) => {
    const badge = entry.querySelector<HTMLElement>('[data-condition-number]');
    if (badge) badge.textContent = `Condition ${index + 1}`;
  });
}

function appendDoNotUseCondition(value: Partial<DoNotUseCondition> = {}, shouldFocus = false): void {
  const entry = document.createElement('div');
  entry.className = 'condition-card';
  entry.dataset.conditionEntry = 'true';

  const heading = document.createElement('div');
  heading.className = 'condition-card-heading';
  const badge = document.createElement('strong');
  badge.dataset.conditionNumber = 'true';
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'condition-remove';
  remove.textContent = 'Удалить';
  remove.setAttribute('aria-label', 'Удалить Condition');
  remove.addEventListener('click', () => {
    entry.remove();
    refreshDoNotUseConditions();
  });
  heading.append(badge, remove);

  const conditionField = document.createElement('label');
  conditionField.className = 'field';
  const conditionLabel = document.createElement('span');
  conditionLabel.textContent = 'Условие';
  const conditionInput = document.createElement('textarea');
  conditionInput.rows = 2;
  conditionInput.dataset.conditionText = 'true';
  conditionInput.placeholder = 'Например: нужен переход на другой URL без изменения состояния';
  conditionInput.value = value.condition || '';
  conditionField.append(conditionLabel, conditionInput);

  const alternativeField = document.createElement('label');
  alternativeField.className = 'field';
  const alternativeLabel = document.createElement('span');
  alternativeLabel.textContent = 'Использовать вместо этого · component ID';
  const alternativeInput = document.createElement('input');
  alternativeInput.dataset.conditionAlternative = 'true';
  alternativeInput.placeholder = 'Необязательно · например core.web.link';
  alternativeInput.value = value.useComponentId || '';
  alternativeField.append(alternativeLabel, alternativeInput);

  entry.append(heading, conditionField, alternativeField);
  doNotUseWhenList.append(entry);
  refreshDoNotUseConditions();
  if (shouldFocus) conditionInput.focus({preventScroll: true});
}

function renderDoNotUseConditions(values: DoNotUseCondition[]): void {
  doNotUseWhenList.replaceChildren();
  values.forEach((value) => appendDoNotUseCondition(value));
  refreshDoNotUseConditions();
}

function readDoNotUseConditions(): DoNotUseCondition[] {
  return Array.from(doNotUseWhenList.querySelectorAll<HTMLElement>('[data-condition-entry]')).flatMap((entry, index) => {
    const conditionInput = entry.querySelector<HTMLTextAreaElement>('[data-condition-text]');
    const alternativeInput = entry.querySelector<HTMLInputElement>('[data-condition-alternative]');
    const condition = conditionInput?.value.trim() || '';
    const useComponentId = alternativeInput?.value.trim() || '';
    if (!condition && !useComponentId) return [];
    if (!condition) {
      conditionInput?.setAttribute('aria-invalid', 'true');
      throw new Error(`Condition ${index + 1}: заполните условие.`);
    }
    conditionInput?.removeAttribute('aria-invalid');
    return [{ condition, ...(useComponentId ? { useComponentId } : {}) }];
  });
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseJsonField<T>(field: HTMLTextAreaElement, label: string, expected: 'array' | 'object'): T {
  let value: unknown;
  try {
    value = JSON.parse(field.value || (expected === 'array' ? '[]' : '{}'));
  } catch (error) {
    throw new Error(`${label}: некорректный JSON (${error instanceof Error ? error.message : String(error)}).`);
  }
  if (expected === 'array' && !Array.isArray(value)) throw new Error(`${label}: ожидается JSON-массив.`);
  if (expected === 'object' && (!value || typeof value !== 'object' || Array.isArray(value))) {
    throw new Error(`${label}: ожидается JSON-объект.`);
  }
  return value as T;
}

function optionalAuthoringSnapshot(): PreviewSnapshot | undefined {
  if (!workspace || !snapshot) return;
  try {
    const compiled = compileManualSource(workspace.manual, workspace.variantEvidence, workspace.dependencyContracts);
    if (compiled.issues.some(issue => issue.level === 'error')) return;
    return prepareValidationSnapshot(snapshot, compiled.contract);
  } catch (error) {
    toast(`Подсказки снимка недоступны: ${error instanceof Error ? error.message : String(error)}`, 'warning');
    return;
  }
}

function openContractSettings(): void {
  if (!workspace) return;
  const manual = workspace.manual;
  componentIdInput.value = manual.component.componentId;
  familyIdInput.value = manual.component.familyId;
  contractIdInput.value = manual.component.contractId;
  familyInput.value = manual.component.family;
  layerInput.value = manual.component.layer;
  libraryInput.value = manual.component.library;
  platformInput.value = manual.component.platform;
  platformsInput.value = manual.component.platforms.join(', ');
  lifecycleInput.value = manual.component.lifecycle;
  componentKeyInput.value = manual.component.componentKey;
  manualOwnerInput.value = manual.metadata.owners.manual;
  purposeInput.value = manual.semantics.purpose;
  useWhenInput.value = manual.semantics.useWhen.join('\n');
  renderDoNotUseConditions(manual.semantics.doNotUseWhen);
  relatedComponentIdsInput.value = manual.semantics.relatedComponentIds.join(', ');
  keywordsInput.value = manual.semantics.keywords.join(', ');
  representationsInput.value = prettyJson(manual.representations);
  semanticApiInput.value = prettyJson(manual.semanticApi);
  validationContextInput.value = prettyJson(manual.validationContext || []);
  documentationInput.value = prettyJson(manual.documentation);
  examplesInput.value = prettyJson(manual.examples);
  decisionsInput.value = prettyJson(manual.decisions);
  componentDependenciesInput.value = prettyJson(manual.componentDependencies || []);
  directDependencyForm = renderDirectDependencyForm(element('directDependencyForm'), manual, workspace.dependencyContracts || [], componentDependenciesInput,
    (message,error) => toast(message,error ? 'error' : undefined), optionalAuthoringSnapshot());
  variantTextTargetsInput.value = prettyJson(manual.targets.filter(t => t.variantContinuity).map(t => ({ targetId: t.id, anchorTargetId: t.variantContinuity!.anchorTargetId })));
  generationProfilesInput.value = prettyJson(manual.generation.profiles);
  generationInstructionsInput.value = manual.generation.instructions.join('\n');
  syncAllUnifiedSelects();
  contractDialog.showModal();
}

function saveContractSettings(): void {
  if (!workspace) return;
  try {
    const representations = parseJsonField<ManualSource['representations']>(representationsInput, 'Representations', 'array');
    const semanticApi = parseJsonField<ManualSource['semanticApi']>(semanticApiInput, 'Semantic API', 'array');
    const validationContext = parseJsonField<NonNullable<ManualSource['validationContext']>>(validationContextInput, 'Контекст проверки', 'array');
    const documentation = parseJsonField<ManualSource['documentation']>(documentationInput, 'Documentation refs', 'array');
    const examples = parseJsonField<ManualSource['examples']>(examplesInput, 'Examples', 'array');
    const decisions = parseJsonField<ManualSource['decisions']>(decisionsInput, 'Normative decisions', 'array');
    const componentDependencies = parseJsonField<NonNullable<ManualSource['componentDependencies']>>(componentDependenciesInput, 'Component dependencies', 'array');
    const profiles = parseJsonField<ManualSource['generation']['profiles']>(generationProfilesInput, 'Generation profiles', 'array');
    const doNotUseWhen = readDoNotUseConditions();
    const textTargets = parseJsonField<Array<{targetId: string; anchorTargetId: string}>>(variantTextTargetsInput, 'Текстовые цели', 'array');
    const editedTargets = editVariantTextTargets(workspace.manual, textTargets);
    const componentId = componentIdInput.value.trim();
    const contractId = contractIdInput.value.trim();
    const family = familyInput.value.trim();
    if (!componentId || !contractId || !family) throw new Error('Component ID, Contract ID и название обязательны.');
    workspace.manual.targets = editedTargets.targets;
    workspace.manual.rules = editedTargets.rules;
    workspace.manual.component = {
      componentId,
      familyId: familyIdInput.value.trim() || componentId,
      contractId,
      family,
      layer: layerInput.value.trim() || 'core',
      library: libraryInput.value.trim(),
      platform: platformInput.value.trim() || 'universal',
      platforms: commaList(platformsInput.value),
      lifecycle: lifecycleInput.value as ManualSource['component']['lifecycle'],
      componentKey: componentKeyInput.value.trim(),
    };
    workspace.manual.semantics = {
      purpose: purposeInput.value.trim(),
      useWhen: lineList(useWhenInput.value),
      doNotUseWhen,
      relatedComponentIds: commaList(relatedComponentIdsInput.value),
      keywords: commaList(keywordsInput.value),
    };
    workspace.manual.representations = representations;
    workspace.manual.semanticApi = semanticApi;
    if (validationContext.length) workspace.manual.validationContext = validationContext;
    else delete workspace.manual.validationContext;
    workspace.manual.documentation = documentation;
    workspace.manual.examples = examples;
    workspace.manual.decisions = decisions;
    if(componentDependencies.length) workspace.manual.componentDependencies=componentDependencies;
    else delete workspace.manual.componentDependencies;
    if(directDependencyForm) workspace.dependencyContracts=directDependencyForm.contracts;
    workspace.manual.generation = {
      profiles,
      instructions: lineList(generationInstructionsInput.value),
    };
    workspace.manual.metadata.owners.manual = manualOwnerInput.value.trim() || 'design-system-authors';
    workspace.manual.metadata.revision += 1;
    workspace.manual.metadata.updatedAt = new Date().toISOString();
    contractDialog.close();
    renderHeader();
    renderScenarioControls();
    updateCompileState();
    persistSession();
    toast('Паспорт manual-контракта сохранён.');
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), 'error');
  }
}

function setAuthoringView(next: 'list' | 'editor', scrollToTop = true): void {
  hideRuleRationale();
  authoringView = next;
  const isEditor = next === 'editor';
  authoringListView.hidden = isEditor;
  authoringEditorView.hidden = !isEditor;
  backToRulesButton.hidden = !isEditor;
  newRuleButton.hidden = isEditor;
  authoringTitle.textContent = isEditor
    ? (editingRuleId ? 'Изменение правила' : 'Новое правило')
    : 'Правила компонента';
  authoringSubtitle.textContent = isEditor
    ? (editingRuleId ? 'Проверьте изменения и сохраните правило' : 'Сначала выберите цель и свойство')
    : 'Ограничения, разрешения и условия';
  if (scrollToTop) authoringPanel.scrollTop = 0;
}

function normalizeScalar(value: string): JsonValue {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed && Number.isFinite(Number(trimmed))) return Number(trimmed);
  return trimmed;
}

function commaValues(value: string): JsonValue[] {
  return value.split(',').map((entry) => normalizeScalar(entry)).filter((entry) => entry !== '');
}

function currentNode(): AnatomyNode | undefined {
  return anatomy.find((node) => node.id === selectedNodeId);
}

function targetForNode(node: AnatomyNode): SemanticTarget | undefined {
  const matches = workspace?.manual.targets.filter(target => nodeForTarget(target)?.id === node.id) || [];
  return matches.length === 1 ? matches[0] : undefined;
}

function nodeForTarget(target: SemanticTarget): AnatomyNode | undefined {
  const binding = snapshot?.targetResolution?.targets.find(entry => entry.targetId === target.id);
  if (binding) return binding.resolution === 'resolved' ? anatomy.find(node => node.id === binding.nodeId) : undefined;
  const matches = anatomy.filter(node => snapshot
    ? node.semanticRole === target.semanticRole
    : node.path === target.pathHint);
  return matches.length === 1 ? matches[0] : undefined;
}

function currentTarget(): SemanticTarget | undefined {
  const node = currentNode();
  return node ? targetForNode(node) : undefined;
}

function editedRuleTarget(): SemanticTarget | undefined {
  const rule = workspace?.manual.rules.find(entry => entry.id === editingRuleId);
  return rule ? workspace?.manual.targets.find(target => target.id === rule.targetId) : undefined;
}

function focusedTarget(): SemanticTarget | undefined {
  return editingRuleId ? editedRuleTarget() : currentTarget();
}

function createTargetForNode(node: AnatomyNode): SemanticTarget {
  if (!workspace) throw new Error('Workspace is not loaded.');
  const existingRoles = new Set(workspace.manual.targets.map((target) => target.semanticRole));
  let semanticRole = node.semanticRole || slug(node.name);
  let suffix = 2;
  while (existingRoles.has(semanticRole)) {
    semanticRole = `${node.semanticRole || slug(node.name)}-${suffix}`;
    suffix += 1;
  }
  const target: SemanticTarget = {
    id: `target.${semanticRole}`,
    semanticRole,
    label: node.name,
    componentFamily: node.type === 'INSTANCE' ? node.name : workspace.manual.component.family,
    lineage: node.path.split('/').slice(0, -1).map((part) => slug(part.trim())),
    structuralFingerprint: stableHash({ type: node.type, path: node.path, order: node.order }).slice(0, 16),
    nameHint: node.name,
    pathHint: node.path,
    nodeIdHint: node.id,
    resolution: workspace.variantEvidence?.occurrenceAddressVersion===1 && node.parentId!==null ? 'unknown' : 'resolved',
  };
  workspace.manual.targets.push(target);
  return target;
}

function ensureCurrentTarget(): SemanticTarget | undefined {
  const node = currentNode();
  if (!node || !workspace) return undefined;
  return currentTarget() || createTargetForNode(node);
}

function rootNode(): AnatomyNode | undefined {
  return anatomy.find((node) => node.parentId === null) || anatomy[0];
}

function ensureRootTarget(): SemanticTarget | undefined {
  const node = rootNode();
  if (!node || !workspace) return undefined;
  return targetForNode(node) || createTargetForNode(node);
}

function reconcileTargets(nextAnatomy: AnatomyNode[], nextSnapshot: PreviewSnapshot): void {
  if (!workspace) return;
  if (remapDialog.open) {remapDialog.close();toast('Снимок обновился. Откройте перепривязку заново для сравнения актуальных данных.','warning');}
  const contract = compileManualSource(workspace.manual, workspace.variantEvidence, workspace.dependencyContracts).contract;
  if (workspace.variantEvidence) delete nextSnapshot.targetResolution;
  else nextSnapshot.targetResolution = resolveSnapshotTargets(nextSnapshot, contract);
  const prepared = prepareValidationSnapshot(nextSnapshot, contract);
  const roles = new Map(prepared.nodes.map(node => [String(node.id), (node.semantic as { role?: string })?.role]));
  nextAnatomy.forEach(node => { node.semanticRole = roles.get(node.id) ?? ''; });
  Object.assign(nextSnapshot, prepared);
  // Capture and scenario selection never rewrite normative manual targets.
}

function refreshTargetRemap(): void {
  remapConfirm.checked = false;
  remapPlan = null;
  applyRemapButton.disabled = true;
  const issues = element('remapIssues'), affected = element('remapAffected'), evidence = element('remapEvidence');
  issues.replaceChildren(); affected.replaceChildren(); evidence.replaceChildren();
  if (!workspace || !snapshot) return;
  const target = workspace.manual.targets.find(t => t.id === remapTargetSelect.value);
  element('remapBefore').textContent = target ? `${target.id}\nrole: ${target.semanticRole}\n${target.pathHint || 'Нет общей привязки'}` : 'Выберите цель';
  element('remapAfter').textContent = 'Выберите новый объект';
  element('remapContext').textContent = `Manual r${workspace.manual.metadata.revision} · снимок ${snapshot.generatedAt}. Между Desktop/Mobile привязки не копируются.`;
  if(workspace.variantEvidence?.occurrenceAddressVersion===1)element('remapContext').textContent += ` Привязка сохранится для выбранного варианта ${snapshot.source?.componentKey || 'не определён'}. Остальные Size/Overflow требуют собственной привязки.`;
  if (!target || !remapNodeSelect.value) return;
  remapPlan = planTargetRemap({manual:workspace.manual,snapshot,variantEvidence:workspace.variantEvidence,targetId:target.id,nodeId:remapNodeSelect.value});
  const plan = remapPlan;
  element('remapBefore').textContent = `${target.id}\nrole: ${target.semanticRole}\n${plan.previousPath || 'Привязка не задана'}`;
  element('remapAfter').textContent = `${target.id}\nrole: ${target.semanticRole}\n${plan.nextPath || 'Не подтверждено'}\n${plan.candidate?.type || ''}`;
  element('remapContext').textContent += ` Представление: ${plan.representationId || 'не определено'}.`;
  for (const [messages, blocked] of [[plan.blockers,true],[plan.warnings,false]] as const) for (const message of messages) {
    const p=document.createElement('p'); p.className=`remap-notice${blocked ? ' blocked' : ''}`;p.textContent=message;issues.append(p);
  }
  for (const rule of plan.affectedRules) {
    const li=document.createElement('li');li.textContent=`${rule.id} · ${rule.status} → draft\n${rule.title} — ${rule.reasons.join(', ')}`;affected.append(li);
  }
  for (const id of plan.affectedExamples) {const li=document.createElement('li');li.textContent=`Пример ${id} → draft`;affected.append(li);}
  if (!affected.children.length) {const li=document.createElement('li');li.textContent='Нет активных правил или примеров, ссылающихся на эту цель.';affected.append(li);}
  const pre=document.createElement('pre');pre.textContent=[
    ...(plan.candidate?.lineage || []).map(n=>`${n.type} · ${n.name}${n.componentSetKey ? `\n  set: ${n.componentSetKey}` : ''}${n.componentKey ? `\n  key: ${n.componentKey}` : ''}`),
    '',...plan.capabilities.map(c=>`${c.available ? '✓' : '—'} ${c.path} · ${c.ruleId}`),
  ].join('\n');evidence.append(pre);
}

function openTargetRemap(targetId?: string, nodeId?: string): void {
  if (!workspace || !snapshot) {toast('Сначала получите актуальный preview или проверьте instance.','warning');return;}
  if (ruleFormDirty) {toast('Сначала сохраните изменения правила или заново откройте его, чтобы явно отменить правки формы.','warning');return;}
  remapTargetSelect.replaceChildren(...workspace.manual.targets.map(target => {
    const option=document.createElement('option');option.value=target.id;option.textContent=`${target.label} · ${target.id}`;return option;
  }));
  if (targetId) remapTargetSelect.value=targetId;
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Выберите объект текущего снимка';
  remapNodeSelect.replaceChildren(placeholder,...anatomy.map(node => {
    const option=document.createElement('option');option.value=node.id;option.textContent=`${node.path} · ${node.type}`;return option;
  }));
  if (nodeId) remapNodeSelect.value=nodeId;
  refreshTargetRemap();
  remapDialog.showModal();
  remapNodeSelect.focus();
}

function addSelectedSemanticTarget(): void {
  const node=currentNode();
  if (!workspace || !snapshot || !node || node.parentId===null || currentTarget()) return;
  if (ruleFormDirty) {toast('Сначала сохраните или явно отмените изменения правила.','warning');return;}
  // The user explicitly registers a target; the local hint only avoids duplicate
  // draft registrations. Independent remap proof still gates resolution.
  const pending=workspace.manual.targets.find(target=>target.resolution!=='resolved' && target.nodeIdHint===node.id && target.pathHint===node.path);
  const target=pending || createTargetForNode(node);
  if (!pending) {
    target.resolution='unknown';
    workspace.manual.metadata.revision+=1;
    workspace.manual.metadata.updatedAt=new Date().toISOString();
    renderHeader();renderAnatomy();renderFocus();updateCompileState();persistSession();
  }
  openTargetRemap(target.id,node.id);
}

function confirmTargetRemap(): void {
  if (!workspace || !snapshot || !remapPlan) return;
  try {
    const input={manual:workspace.manual,snapshot,variantEvidence:workspace.variantEvidence,targetId:remapPlan.targetId,nodeId:remapPlan.nodeId};
    const next=applyTargetRemap(input,remapPlan.planHash,remapConfirm.checked);
    const selected=remapPlan.nodeId;
    workspace.manual=next;
    remapDialog.close();
    pendingPreviewRequest='';pendingSelectionTestRequest='';clearPreviewTimeout();
    reconcileTargets(anatomy,snapshot);
    selectedNodeId=selected;editingRuleId=null;ruleFormDirty=false;
    setAuthoringView('list');renderHeader();renderAnatomy();renderFocus();renderProperties();renderRuleSelect();resetRuleForm(false);updateCompileState();persistSession();
    toast(`Привязка сохранена, manual r${next.metadata.revision}. Затронутые правила — Draft; повторите проверку.`,'warning');
  } catch(error) {
    remapConfirm.checked=false;applyRemapButton.disabled=true;
    const p=document.createElement('p');p.className='remap-notice blocked';p.textContent=error instanceof Error ? error.message : String(error);element('remapIssues').prepend(p);
  }
}

function renderHeader(): void {
  const manual = workspace?.manual;
  renderValidationProductOptions();
  const family = manual?.component.family || 'Компонент не выбран';
  componentName.textContent = family;
  validationComponentName.textContent = family;
  const capturedRepresentation = snapshotCapture?.kind === 'selected-instance'
    ? manual?.representations.find(rep => rep.id === snapshot?.source?.representationId) : undefined;
  const meta = workspaceMode === 'validation' && capturedRepresentation
    ? `${String(capturedRepresentation.locator.name || capturedRepresentation.id)} · ${capturedRepresentation.platform} · manual r${manual?.metadata.revision}`
    : manual
    ? `${manual.component.library} · ${manual.component.platform} · manual r${manual.metadata.revision}`
    : 'Manual authoring · Apollo contract v2';
  componentMeta.textContent = meta;
  validationComponentMeta.textContent = meta;
  const rules = String(manual?.rules?.length || 0);
  const targets = String(manual?.targets?.length || 0);
  ruleCount.textContent = rules;
  validationRuleCount.textContent = rules;
  targetCount.textContent = targets;
  validationTargetCount.textContent = targets;
  const warnings = workspace?.warnings?.length || 0;
  warningMetric.hidden = warnings === 0;
  validationWarningMetric.hidden = warnings === 0;
  warningCount.textContent = String(warnings);
  validationWarningCount.textContent = String(warnings);
  importButton.textContent = 'Загрузить пакет';
  importButton.title = manual
    ? 'Выбрать другой Athena-пакет, manual source или ComponentContract ZIP' : 'Загрузить Athena-пакет, manual source или ComponentContract ZIP';
  contractSettingsButton.disabled = !manual;
  remapTargetsButton.disabled = !manual?.targets.length || !snapshot;
  const selected=currentNode();
  addSemanticTargetButton.disabled = !manual || !snapshot || !selected || selected.parentId===null || Boolean(currentTarget());
  exportButton.disabled = !manual;
  const validationContextReady = workspaceMode !== 'validation' || Boolean(validationProductSelect.value);
  testSelectionButton.disabled = !manual || !instanceSelectionAvailable || !validationContextReady || Boolean(pendingSelectionTestRequest);
  const hasTransitions=Boolean(manual?.rules.some(r=>r.status!=='deprecated'&&r.constraints.some(c=>c.type==='transitionInvariant')));
  element('transitionToolbar').hidden=!hasTransitions;
  element<HTMLButtonElement>('captureBeforeButton').disabled=testSelectionButton.disabled;
  element<HTMLButtonElement>('clearBeforeButton').disabled=!transitionBefore||Boolean(pendingSelectionTestRequest);
  element('transitionStatus').textContent=transitionBefore
    ? `Состояние до: instance ${transitionBefore.source?.rootNodeId}, ширина ${(transitionBefore.nodes[0].bounds as any)?.width ?? '?'} px. Включите новое состояние у этого же экземпляра и нажмите проверку.`
    : 'Для проверки перехода нужен исходный снимок того же instance. Снимок хранится только до закрытия или импорта пакета.';
  showCompiledButton.disabled = !manual;
  renderValidationInputs();
  previewPinnedState.textContent = snapshot ? 'Preview закреплён' : 'Preview не получен';
  previewPinnedState.className = `preview-pinned${snapshot ? ' ready' : ''}`;
}

function setWorkspaceMode(mode: 'authoring' | 'validation'): void {
  hideRuleRationale();
  workspaceMode = mode;
  document.body.dataset.workspaceMode = mode;
  authoringModeButton.setAttribute('aria-selected', String(mode === 'authoring'));
  validationModeButton.setAttribute('aria-selected', String(mode === 'validation'));
  if (mode === 'validation' && !validationProductSelect.value) {
    setStatus('Выберите Product проверки', 'warning');
  } else if (workspace) {
    setStatus(mode === 'validation' ? 'Готово к проверке instance' : 'Manual source готов', 'ready');
  }
  renderHeader();
  persistSession();
}

function validationSnapshot(source: PreviewSnapshot): PreviewSnapshot {
  return {
    ...source,
    context: {
      ...source.context,
      product: validationProductSelect.value,
    },
  };
}

function variantProperties(variants: VariantScenario[]): Record<string, string[]> {
  const values: Record<string, Set<string>> = {};
  variants.forEach((variant) => {
    Object.entries(variant.properties).forEach(([property, value]) => {
      if (!values[property]) values[property] = new Set();
      values[property].add(value);
    });
  });
  return Object.fromEntries(Object.entries(values).map(([key, entries]) => [key, Array.from(entries)]));
}

const CHANNEL_SCOPE_CATALOG: ScopeChoice[] = [
  { value: 'desktop', label: 'Desktop', description: 'Десктопный канал продукта' },
  { value: 'mobileweb', label: 'Mobile Web', description: 'Мобильный web-канал продукта' },
  { value: 'adaptive', label: 'Adaptive', description: 'Адаптивный сценарий продукта' },
];

function renderValidationProductOptions(): void {
  const current = validationProductSelect.value;
  const canonicalIds = new Set(PRODUCT_SCOPE_CATALOG.map((entry) => entry.value));
  const contractIds = new Set((workspace?.manual.rules || []).flatMap((rule) => rule.applicability.products || []));
  const legacyIds = Array.from(contractIds).filter((value) => !canonicalIds.has(value)).sort();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Выберите Product';
  const canonical = document.createElement('optgroup');
  canonical.label = 'ds-ai-hub Products';
  PRODUCT_SCOPE_CATALOG.forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.value;
    option.textContent = `${entry.label} · ${entry.value}`;
    canonical.append(option);
  });
  const children: Array<HTMLOptionElement | HTMLOptGroupElement> = [placeholder, canonical];
  if (legacyIds.length) {
    const legacy = document.createElement('optgroup');
    legacy.label = 'Legacy / IDs из контракта';
    legacyIds.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = `${value} · требуется mapping`;
      legacy.append(option);
    });
    children.push(legacy);
  }
  validationProductSelect.replaceChildren(...children);
  validationProductSelect.value = canonicalIds.has(current) || legacyIds.includes(current) ? current : '';
  syncUnifiedSelect(validationProductSelect);
}

function scopeCheckbox(
  value: string,
  label: string,
  checked: boolean,
  options: { property?: string; collection?: string; description?: string; all?: boolean; legacy?: boolean } = {},
): HTMLLabelElement {
  const item = document.createElement('label');
  item.className = 'scope-option';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = value;
  input.checked = checked;
  input.dataset.scopeValue = value;
  if (options.property) input.dataset.variantProperty = options.property;
  if (options.collection) input.dataset.modeCollection = options.collection;
  if (options.all) input.dataset.scopeAll = 'true';
  if (options.legacy) input.dataset.modeLegacy = 'true';
  const copy = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = label;
  copy.append(title);
  if (options.description) {
    const description = document.createElement('small');
    description.textContent = options.description;
    copy.append(description);
  }
  item.append(input, copy);
  return item;
}

function wireAllScope(container: HTMLElement, customInput?: HTMLInputElement): void {
  const all = container.querySelector<HTMLInputElement>('[data-scope-all="true"]');
  const specifics = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
    .filter((input) => input !== all);
  all?.addEventListener('change', () => {
    if (all.checked) specifics.forEach((input) => { input.checked = false; });
  });
  specifics.forEach((input) => input.addEventListener('change', () => {
    if (input.checked && all) all.checked = false;
    if (!specifics.some((entry) => entry.checked) && !customInput?.value.trim() && all) all.checked = true;
  }));
  customInput?.addEventListener('input', () => {
    if (customInput.value.trim() && all) all.checked = false;
    if (!customInput.value.trim() && !specifics.some((entry) => entry.checked) && all) all.checked = true;
  });
}

function renderFlatScope(
  container: HTMLElement,
  customInput: HTMLInputElement,
  catalog: ScopeChoice[],
  selected: string[] | undefined,
): void {
  const selectedValues = new Set(selected || []);
  const catalogValues = new Set(catalog.map((entry) => entry.value));
  container.replaceChildren(scopeCheckbox('all', 'Все', !selectedValues.size, {
    all: true,
    description: 'Правило действует независимо от этого измерения',
  }));
  catalog.forEach((entry) => container.append(scopeCheckbox(
    entry.value,
    entry.label,
    selectedValues.has(entry.value),
    { description: `${entry.description} · ${entry.value}` },
  )));
  customInput.value = Array.from(selectedValues).filter((value) => !catalogValues.has(value)).join(', ');
  wireAllScope(container, customInput);
}

function updateProductScopeSummary(): void {
  const summary = productScopeDropdown.querySelector('summary');
  if (!summary) return;
  const selected = selectedFlatScope(productScopeOptions, productScopeCustom);
  if (!selected.length) {
    summary.textContent = 'Все продукты';
    return;
  }
  const labels = new Map(PRODUCT_SCOPE_CATALOG.map((entry) => [entry.value, entry.label]));
  summary.textContent = selected.map((value) => labels.get(value) || value).join(', ');
}

function renderProductScope(selected: string[] | undefined): void {
  renderFlatScope(productScopeOptions, productScopeCustom, PRODUCT_SCOPE_CATALOG, selected);
  updateProductScopeSummary();
  productScopeOptions.onchange = updateProductScopeSummary;
  productScopeCustom.oninput = updateProductScopeSummary;
}

function selectedFlatScope(container: HTMLElement, customInput: HTMLInputElement): string[] {
  if (container.querySelector<HTMLInputElement>('[data-scope-all="true"]')?.checked) return [];
  return Array.from(new Set([
    ...Array.from(container.querySelectorAll<HTMLInputElement>('[data-scope-value]:checked'))
      .filter((input) => input.dataset.scopeAll !== 'true')
      .map((input) => input.value),
    ...commaList(customInput.value),
  ])).sort();
}

function renderVariantScope(scope: ManualRule['applicability']['variants'] = 'all'): void {
  const selected = scope === 'all' ? {} : scope;
  variantScopeOptions.replaceChildren(scopeCheckbox('all', 'Все варианты', scope === 'all', {
    all: true,
    description: 'Любая комбинация variant properties',
  }));
  if (workspace?.variants?.length) {
    const current = matchingVariant();
    const currentButton = document.createElement('button');
    currentButton.type = 'button';
    currentButton.className = 'button button-quiet scope-current-button';
    currentButton.textContent = `Только preview: ${current?.label || 'текущая комбинация'}`;
    currentButton.addEventListener('click', () => {
      variantScopeOptions.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
        const property = input.dataset.variantProperty;
        input.checked = input.dataset.scopeAll !== 'true'
          && Boolean(property)
          && scenarioProperties[property || ''] === input.value;
      });
      updateVariantScopeSummary();
    });
    variantScopeOptions.append(currentButton);
  }
  const properties = variantProperties(workspace?.variants || []);
  Object.entries(selected).forEach(([property, values]) => {
    properties[property] = Array.from(new Set([...(properties[property] || []), ...values]));
  });
  Object.entries(properties).sort(([left], [right]) => left.localeCompare(right)).forEach(([property, values]) => {
    const group = document.createElement('div');
    group.className = 'scope-option-group';
    const heading = document.createElement('strong');
    heading.textContent = property;
    group.append(heading);
    values.forEach((value) => group.append(scopeCheckbox(
      value,
      value,
      Boolean(selected[property]?.includes(value)),
      { property },
    )));
    variantScopeOptions.append(group);
  });
  if (!Object.keys(properties).length) {
    const empty = document.createElement('p');
    empty.className = 'scope-empty';
    empty.textContent = 'В импортированном evidence нет variant properties.';
    variantScopeOptions.append(empty);
  }
  wireAllScope(variantScopeOptions);
  variantScopeOptions.onchange = updateVariantScopeSummary;
  updateVariantScopeSummary();
}

function selectedVariantScope(): ManualRule['applicability']['variants'] {
  if (variantScopeOptions.querySelector<HTMLInputElement>('[data-scope-all="true"]')?.checked) return 'all';
  const result: Record<string, string[]> = {};
  variantScopeOptions.querySelectorAll<HTMLInputElement>('[data-variant-property]:checked').forEach((input) => {
    const property = input.dataset.variantProperty;
    if (!property) return;
    (result[property] ||= []).push(input.value);
  });
  Object.values(result).forEach((values) => values.sort());
  return Object.keys(result).length ? result : 'all';
}

function updateVariantScopeSummary(): void {
  const scope = selectedVariantScope();
  if (scope === 'all') {
    variantScopeSummary.textContent = 'Все варианты';
    return;
  }
  const propertyCount = Object.keys(scope).length;
  const valueCount = Object.values(scope).reduce((sum, values) => sum + values.length, 0);
  variantScopeSummary.textContent = `Свойств: ${propertyCount} · значений: ${valueCount}`;
}

function renderModeScope(scope: ManualRule['applicability']['modes'] = 'all'): void {
  const selected = scope === 'all' || Array.isArray(scope) ? {} : scope;
  const renderedCollections = new Set<string>();
  const allModes = scopeCheckbox('all', 'Все modes', scope === 'all', {
    all: true,
    description: 'Независимо от активных modes переменных',
  });
  allModes.classList.add('scope-all-option');
  modeScopeOptions.replaceChildren(allModes);
  availableModes.forEach((collection) => {
    renderedCollections.add(collection.collectionId);
    const dropdown = document.createElement('details');
    dropdown.className = 'scope-dropdown scope-mode-dropdown';
    dropdown.dataset.modeDropdown = 'true';
    dropdown.dataset.modeLabel = collection.collectionName;
    const summary = document.createElement('summary');
    const body = document.createElement('div');
    body.className = 'scope-options scope-dropdown-options';
    dropdown.append(summary, body);
    collection.modes.forEach((mode) => body.append(scopeCheckbox(
      mode.modeId,
      mode.name,
      Boolean(selected[collection.collectionId]?.includes(mode.modeId)),
      { collection: collection.collectionId, description: `Collection: ${collection.collectionName}` },
    )));
    modeScopeOptions.append(dropdown);
  });
  Object.entries(selected).forEach(([collectionId, modeIds]) => {
    if (renderedCollections.has(collectionId)) return;
    const dropdown = document.createElement('details');
    dropdown.className = 'scope-dropdown scope-mode-dropdown scope-option-warning';
    dropdown.dataset.modeDropdown = 'true';
    dropdown.dataset.modeLabel = `Коллекция вне preview: ${collectionId}`;
    const summary = document.createElement('summary');
    const body = document.createElement('div');
    body.className = 'scope-options scope-dropdown-options';
    dropdown.append(summary, body);
    modeIds.forEach((modeId) => body.append(scopeCheckbox(
      modeId,
      modeId,
      true,
      { collection: collectionId, description: 'Сохранено в manual source; требуется проверить mapping' },
    )));
    modeScopeOptions.append(dropdown);
  });
  if (Array.isArray(scope) && scope.length) {
    const dropdown = document.createElement('details');
    dropdown.className = 'scope-dropdown scope-mode-dropdown scope-option-warning';
    dropdown.dataset.modeDropdown = 'true';
    dropdown.dataset.modeLabel = 'Legacy: коллекция не указана';
    const summary = document.createElement('summary');
    const body = document.createElement('div');
    body.className = 'scope-options scope-dropdown-options';
    dropdown.append(summary, body);
    scope.forEach((mode) => body.append(scopeCheckbox(mode, mode, true, { legacy: true })));
    modeScopeOptions.append(dropdown);
  }
  if (!availableModes.length && scope === 'all') {
    const empty = document.createElement('p');
    empty.className = 'scope-empty';
    empty.dataset.modePlaceholder = 'true';
    empty.textContent = 'После live preview здесь появятся реальные коллекции и их modes. Пока правило действует во всех modes.';
    modeScopeOptions.append(empty);
  }
  wireAllScope(modeScopeOptions);
  const updateSummaries = (): void => {
    modeScopeOptions.querySelectorAll<HTMLDetailsElement>('[data-mode-dropdown="true"]').forEach((dropdown) => {
      const summary = dropdown.querySelector('summary');
      if (!summary) return;
      const selectedLabels = Array.from(dropdown.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'))
        .map((input) => input.closest('.scope-option')?.querySelector('strong')?.textContent || input.value);
      summary.textContent = `${dropdown.dataset.modeLabel}: ${selectedLabels.length ? selectedLabels.join(', ') : 'Все'}`;
    });
  };
  modeScopeOptions.onchange = () => {
    updateSummaries();
    updateModeScopeSummary();
  };
  updateSummaries();
  updateModeScopeSummary();
}

function updateModeScopeSummary(): void {
  const scope = selectedModeScope();
  if (scope === 'all') {
    modeScopeSummary.textContent = 'Все modes';
    return;
  }
  if (Array.isArray(scope)) {
    modeScopeSummary.textContent = `Legacy modes: ${scope.length}`;
    return;
  }
  const collectionCount = Object.keys(scope).length;
  const modeCount = Object.values(scope).reduce((sum, values) => sum + values.length, 0);
  modeScopeSummary.textContent = `Коллекций: ${collectionCount} · modes: ${modeCount}`;
}

function selectedModeScope(): ManualRule['applicability']['modes'] {
  if (modeScopeOptions.querySelector<HTMLInputElement>('[data-scope-all="true"]')?.checked) return 'all';
  const legacy = Array.from(modeScopeOptions.querySelectorAll<HTMLInputElement>('[data-mode-legacy]:checked')).map((input) => input.value);
  const result: Record<string, string[]> = {};
  modeScopeOptions.querySelectorAll<HTMLInputElement>('[data-mode-collection]:checked').forEach((input) => {
    const collection = input.dataset.modeCollection;
    if (!collection) return;
    (result[collection] ||= []).push(input.value);
  });
  Object.values(result).forEach((values) => values.sort());
  if (Object.keys(result).length) return result;
  return legacy.length ? legacy.sort() : 'all';
}

function updateChannelScopeSummary(): void {
  const selected = selectedFlatScope(channelScopeOptions, channelScopeCustom);
  if (!selected.length) {
    channelScopeSummary.textContent = 'Все каналы';
    return;
  }
  const labels = new Map(CHANNEL_SCOPE_CATALOG.map((entry) => [entry.value, entry.label]));
  channelScopeSummary.textContent = selected.length <= 2
    ? selected.map((value) => labels.get(value) || value).join(', ')
    : `Выбрано каналов: ${selected.length}`;
}

function renderChannelScope(selected: string[] | undefined): void {
  renderFlatScope(channelScopeOptions, channelScopeCustom, CHANNEL_SCOPE_CATALOG, selected);
  channelScopeOptions.onchange = updateChannelScopeSummary;
  channelScopeCustom.oninput = updateChannelScopeSummary;
  updateChannelScopeSummary();
}

function renderApplicabilityScope(rule?: ManualRule): void {
  renderVariantScope(rule?.applicability.variants || 'all');
  renderModeScope(rule?.applicability.modes || 'all');
  renderProductScope(rule?.applicability.products);
  renderChannelScope(rule?.applicability.channels);
  [variantScopeDropdown, modeScopeDropdown, channelScopeDropdown].forEach((dropdown) => {
    dropdown.open = false;
  });
}

function matchingVariant(): VariantScenario | null {
  if (!workspace) return null;
  return workspace.variants.find((variant) => Object.entries(scenarioProperties).every(
    ([property, value]) => variant.properties[property] === value,
  )) || activeVariant || workspace.variants[0] || null;
}

function activateImportedComponent(contractId: string): void {
  if (!workspace || contractId === workspace.activeContractId || !importedSourceFiles.length) return;
  if (workspace.activeContractId) componentWorkspaceCache.set(workspace.activeContractId, workspace);
  const next = componentWorkspaceCache.get(contractId) || importWorkspace(importedSourceFiles, contractId);
  if (sameManualComponentFamily(next.manual, workspace.manual)) {
    next.manual = workspace.manual;
  }
  componentWorkspaceCache.set(contractId, next);
  loadWorkspace(next);
  toast(`Активен ${next.manual.component.platform}: ${next.manual.component.family}.`);
}

function renderScenarioControls(): void {
  destroyUnifiedSelectsWithin(scenarioControls);
  scenarioControls.replaceChildren();
  if (!workspace) return;
  const componentChoices = workspace.componentChoices || [];
  const packageNeedsReconnect = importedSourceFiles.length === 0
    && ['athena-package', 'component-contract-v2'].includes(workspace.manual.source.kind);
  if (packageNeedsReconnect) {
    const label = document.createElement('label');
    label.className = 'scenario-control component-control';
    const name = document.createElement('span');
    name.textContent = 'Компонент';
    const reconnect = document.createElement('button');
    reconnect.type = 'button';
    reconnect.className = 'button button-secondary';
    reconnect.textContent = 'Подключить пакет';
    reconnect.addEventListener('click', () => fileInput.click());
    label.append(name, reconnect);
    scenarioControls.append(label);
  } else if (componentChoices.length > 1) {
    const label = document.createElement('label');
    label.className = 'scenario-control component-control';
    const name = document.createElement('span');
    name.textContent = 'Компонент';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Активный компонент');
    componentChoices.forEach((choice) => {
      const option = document.createElement('option');
      option.value = choice.contractId;
      option.textContent = `${choice.label} · ${choice.platform}`;
      option.selected = choice.contractId === workspace?.activeContractId;
      select.append(option);
    });
    select.addEventListener('change', () => activateImportedComponent(select.value));
    label.append(name, select);
    scenarioControls.append(label);
    enhanceSelect(select);
  }
  const propertyValues = variantProperties(workspace.variants || []);
  const properties = Object.keys(propertyValues);
  if (!properties.length) {
    const badge = document.createElement('span');
    badge.className = 'metric';
    badge.textContent = 'Default variant';
    scenarioControls.append(badge);
  }
  properties.forEach((property) => {
    const label = document.createElement('label');
    label.className = 'scenario-control';
    const name = document.createElement('span');
    name.textContent = property;
    const select = document.createElement('select');
    select.setAttribute('aria-label', property);
    propertyValues[property].forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      option.selected = scenarioProperties[property] === value;
      select.append(option);
    });
    select.addEventListener('change', () => {
      scenarioProperties[property] = select.value;
      activeVariant = matchingVariant();
      persistSession();
      renderLivePreview();
      updateCompileState();
    });
    label.append(name, select);
    scenarioControls.append(label);
    enhanceSelect(select);
  });
  availableModes.forEach((collection) => {
    const label = document.createElement('label');
    label.className = 'scenario-control mode-control';
    const name = document.createElement('span');
    name.textContent = collection.collectionName;
    const select = document.createElement('select');
    select.setAttribute('aria-label', `${collection.collectionName} mode`);
    collection.modes.forEach((mode) => {
      const option = document.createElement('option');
      option.value = mode.modeId;
      option.textContent = mode.name;
      option.selected = activeModes[collection.collectionId] === mode.modeId;
      select.append(option);
    });
    select.addEventListener('change', () => {
      activeModes[collection.collectionId] = select.value;
      persistSession();
      renderLivePreview();
      updateCompileState();
    });
    label.append(name, select);
    scenarioControls.append(label);
    enhanceSelect(select);
  });
}

function treeKind(type: string): string {
  if (type === 'INSTANCE' || type === 'COMPONENT') return 'C';
  if (type === 'TEXT') return 'T';
  if (type === 'FRAME' || type === 'GROUP') return 'F';
  if (type === 'SLOT') return 'S';
  return 'L';
}

function renderAnatomy(): void {
  anatomyTree.replaceChildren();
  anatomyCount.textContent = String(anatomy.length);
  anatomyEmpty.hidden = anatomy.length > 0;
  const query = anatomySearch.value.trim().toLowerCase();
  anatomy.filter((node) => !query || `${node.name} ${node.path} ${node.semanticRole}`.toLowerCase().includes(query))
    .forEach((node) => {
      const target = targetForNode(node);
      const testClassification = testClassifications.get(node.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `tree-item${node.id === selectedNodeId ? ' selected' : ''}${node.visible ? '' : ' hidden-node'}${testClassification ? ` test-${testClassification}` : ''}`;
      button.style.paddingLeft = `${6 + Math.min(node.depth, 7) * 13}px`;
      button.setAttribute('role', 'treeitem');
      button.setAttribute('aria-selected', String(node.id === selectedNodeId));
      button.title = testClassification ? `${node.path}\nTest: ${testClassification}` : node.path;
      const kind = document.createElement('span');
      kind.className = 'tree-kind';
      kind.textContent = treeKind(node.type);
      const label = document.createElement('span');
      label.className = 'tree-label';
      label.textContent = node.name;
      if (target && anatomy.some(other => other.id !== node.id && other.parentId === node.parentId && other.name === node.name)) {
        label.textContent += ` · ${target.semanticRole}`;
        label.title = `Owner: ${(node.properties.component as any)?.sourceIdentity?.ownerComponentKey || 'не подтверждён'}; привязки вариантов: ${target.variantHints?.length || 0}; ${target.resolution || 'unknown'}`;
      }
      const resolution = document.createElement('span');
      resolution.className = `resolution-dot ${target?.resolution || 'untracked'}`;
      resolution.title = target ? `Semantic target: ${target.resolution || 'unknown'}` : 'Manual target ещё не создан';
      const statuses = document.createElement('span');
      statuses.className = 'tree-status-stack';
      if (testClassification && testClassification !== 'not-applicable') {
        const testBadge = document.createElement('span');
        testBadge.className = `test-node-badge ${testClassification}`;
        const count = testNodeCounts.get(node.id) || 1;
        testBadge.textContent = testClassification === 'compliant' ? '✓' : String(count);
        testBadge.title = `Test: ${testClassification} · ${count}`;
        statuses.append(testBadge);
      }
      statuses.append(resolution);
      button.append(kind, label, statuses);
      button.addEventListener('click', () => selectNode(node.id));
      anatomyTree.append(button);
    });
}

function selectNode(id: string): void {
  selectedNodeId = id;
  // Inspecting a captured layer is not permission to add or remap a manual target.
  editingRuleId = null;
  ruleSelect.value = '';
  renderAnatomy();
  renderFocus();
  renderProperties();
  resetRuleForm(false);
  renderHeader();
  updateCompileState();
}

function renderFocus(): void {
  const node = currentNode();
  const target = focusedTarget();
  const nodeType = node?.type === 'COMPONENT' || node?.type === 'COMPONENT_SET'
    ? 'Component'
    : node?.type === 'INSTANCE'
      ? (node.parentId === null ? 'Component' : 'Instance')
      : node?.type === 'TEXT'
        ? 'Text'
        : node?.type === 'FRAME'
          ? 'Frame'
          : node?.type === 'GROUP'
            ? 'Group'
            : node?.type ? node.type.toLowerCase().replace(/^./, (value) => value.toUpperCase()) : 'Тип не определён';
  targetType.textContent = nodeType;
  targetLabel.textContent = node?.name || target?.label || 'Сначала выберите слой';
  targetRole.textContent = target?.semanticRole || node?.semanticRole || 'semantic target';
  const binding = snapshot?.targetResolution?.targets.find(entry => entry.targetId === target?.id);
  const resolution = binding?.resolution || target?.resolution || 'unknown';
  targetResolution.title = binding ? targetResolutionReason(binding.reason) : '';
  targetResolution.hidden = !target;
  targetResolution.textContent = resolution === 'resolved'
    ? 'найден'
    : resolution === 'missing'
      ? 'не найден'
      : resolution === 'ambiguous'
        ? 'неоднозначно'
        : binding ? 'требует сопоставления' : 'не проверен';
  targetResolution.className = `resolution-pill ${resolution}`;
  remapRuleTargetButton.disabled = !target || !snapshot;
  saveRuleButton.disabled = !workspace || (editingRuleId ? !target : !node);
  saveRuleButton.title = editingRuleId && !target
    ? 'Цель правила отсутствует в manual source. Восстановите цель или загрузите полный пакет.'
    : !editingRuleId && !node ? 'Для нового правила сначала выберите слой.' : '';
}

function flattenFacts(value: JsonValue | undefined, prefix = '', result: Array<[string, JsonValue | undefined]> = []): Array<[string, JsonValue | undefined]> {
  if (Array.isArray(value) || value === null || typeof value !== 'object') {
    result.push([prefix, value]);
    return result;
  }
  const entries = Object.entries(value);
  if (!entries.length && prefix) result.push([prefix, value]);
  entries.forEach(([key, child]) => flattenFacts(child as JsonValue | undefined, prefix ? `${prefix}.${key}` : key, result));
  return result;
}

function displayValue(value: JsonValue | undefined): string {
  const serialized = (typeof value === 'string' ? value : JSON.stringify(value)) ?? 'Не задано';
  return serialized.length > 52 ? `${serialized.slice(0, 49)}…` : serialized;
}

function componentPropertyNameFromCapability(capability: string): string {
  if (capability.startsWith('component.properties.')) return capability.slice('component.properties.'.length);
  if (capability.startsWith('component-property.')) return capability.slice('component-property.'.length);
  return '';
}

function humanComponentPropertyName(name: string): string {
  return name.replace(/#\d+:\d+$/, '').trim();
}

function displayCapabilityLabel(capability: string): string {
  const normalized = capability.startsWith('baseline.effective.')
    ? capability.slice('baseline.effective.'.length)
    : capability;
  const componentProperty = componentPropertyNameFromCapability(normalized);
  return componentProperty ? `Component Property · ${humanComponentPropertyName(componentProperty)}`
    : normalized.startsWith('variable.modes.') ? layerPropertyLabel(normalized) : capability;
}

function modeCatalogForCapability(capability: string): { collectionName: string; modes: Array<{ modeId: string; name: string }> } | undefined {
  const key = /^variable\.modes\.([a-f0-9]{40})$/i.exec(capability)?.[1];
  const variable = currentNode()?.properties.variable;
  if (!key || !variable || typeof variable !== 'object' || Array.isArray(variable)) return undefined;
  const catalog = variable.modeCatalog;
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) return undefined;
  const entry = catalog[key];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.collectionName !== 'string' || !Array.isArray(entry.modes)) return undefined;
  const modes = entry.modes.filter((mode): mode is { modeId: string; name: string } =>
    !!mode && typeof mode === 'object' && !Array.isArray(mode) && typeof mode.modeId === 'string' && typeof mode.name === 'string');
  return { collectionName: entry.collectionName, modes };
}

function layerPropertyLabel(capability: string): string {
  const modeCatalog = modeCatalogForCapability(capability);
  if (modeCatalog) return `Mode · ${modeCatalog.collectionName}`;
  const labels: Record<string, string> = {
    'composition.content': 'Содержимое слота',
    'composition.members': 'Состав коллекции',
    'appearance.fill': 'Заливка',
    'appearance.fillStyleId': 'Стиль заливки',
    'appearance.stroke': 'Обводка',
    'appearance.strokeStyleId': 'Стиль обводки',
    'appearance.strokeWeight': 'Толщина обводки',
    'appearance.strokeAlign': 'Положение обводки',
    'appearance.dashPattern': 'Штриховка обводки',
    'appearance.opacity': 'Прозрачность',
    'appearance.radius': 'Скругление',
    'appearance.effects': 'Эффекты',
    'appearance.effectStyleId': 'Стиль эффектов',
    'appearance.typography': 'Типографика',
    'layout.mode': 'Режим автолейаута',
    'layout.itemSpacing': 'Расстояние между элементами',
    'layout.padding.top': 'Верхний отступ',
    'layout.padding.right': 'Правый отступ',
    'layout.padding.bottom': 'Нижний отступ',
    'layout.padding.left': 'Левый отступ',
    'layout.padding.horizontal': 'Горизонтальные отступы',
    'layout.padding.vertical': 'Вертикальные отступы',
    'layout.primaryAxisAlignItems': 'Выравнивание по основной оси',
    'layout.counterAxisAlignItems': 'Выравнивание по поперечной оси',
    'layout.sizingHorizontal': 'Ширина в автолейауте',
    'layout.sizingVertical': 'Высота в автолейауте',
    'layout.gridStyleId': 'Стиль сетки',
    'layout.clipsContent': 'Обрезать содержимое',
    'bounds.width': 'Ширина',
    'bounds.height': 'Высота',
    visibility: 'Видимость',
    'token.binding': 'Привязка токена',
  };
  const segments = capability.split('.');
  return labels[capability] || segments[segments.length - 1].replace(/([a-z])([A-Z])/g, '$1 $2');
}

function syncControlPathUi(): void {
  const descriptions: Record<string, string> = {
    direct: 'Автор изменяет свойство непосредственно у выбранного слоя.',
    'host-property': 'Изменение разрешено только через публичное Component Property родительского компонента.',
    'nested-property': 'Изменение передаётся через Component Property вложенного instance.',
    'slot-api': 'Содержимое или компонент заменяется через объявленный слот.',
    'variable-binding': 'Значением управляет привязанная Figma Variable или дизайн-токен.',
    'inherited-port': 'Управление приходит через именованный control port другого component contract.',
  };
  controlPathHint.textContent = descriptions[controlPathKind.value] || '';
  element('slotAnchorField').hidden = controlPathKind.value !== 'slot-api';
  element('slotOwnerField').hidden = controlPathKind.value !== 'slot-api';
  element('slotContentField').hidden = controlPathKind.value !== 'slot-api';
  if (controlPathKind.value === 'slot-api' && !slotAnchorProperty.value.trim() && currentNode()?.type === 'SLOT') {
    const component = currentNode()?.properties.component;
    const bindings = component && typeof component === 'object' && !Array.isArray(component) ? component.propertyReferenceBindings : undefined;
    const anchor = bindings && typeof bindings === 'object' && !Array.isArray(bindings) ? bindings.slotContentId : undefined;
    if (typeof anchor === 'string' && anchor.trim()) slotAnchorProperty.value = anchor;
  }
}

function setPropertySourceTab(next: 'layer' | 'component', focus = false): void {
  propertySourceTab = next;
  const componentSelected = next === 'component';
  layerPropertyTab.setAttribute('aria-selected', String(!componentSelected));
  layerPropertyTab.tabIndex = componentSelected ? -1 : 0;
  componentPropertyTab.setAttribute('aria-selected', String(componentSelected));
  componentPropertyTab.tabIndex = componentSelected ? 0 : -1;
  layerPropertyPanel.hidden = componentSelected;
  componentPropertyPanel.hidden = !componentSelected;
  if (focus) {
    if (componentSelected) focusSelectControl(componentPropertyInput);
    else capabilityInput.focus({ preventScroll: true });
  }
  syncComponentPropertyUi();
  renderProperties();
}

function selectedCapability(): string {
  if (propertySourceTab === 'component') {
    const componentProperty = componentPropertyInput.value.trim();
    return componentProperty ? `component.properties.${componentProperty}` : '';
  }
  return capabilityInput.value.trim();
}

function componentPropertyValue(name: string): JsonValue | undefined {
  const component = currentNode()?.properties.component;
  if (!component || Array.isArray(component) || typeof component !== 'object') return undefined;
  const properties = component.properties;
  if (!properties || Array.isArray(properties) || typeof properties !== 'object') return undefined;
  return properties[name];
}

function propertyOptionsContext(): PropertyOptionsContext {
  const node=currentNode(),target=focusedTarget();
  return {manual:workspace!.manual,snapshot,variantEvidence:workspace!.variantEvidence,dependencyContracts:workspace!.dependencyContracts,
    roles:()=>target?[target.semanticRole]:[],allowDependencies:!!node||!!target,targetNodes:node?[{...node.properties,parentId:node.parentId}]:[]};
}

function syncComponentPropertyUi(): void {
  const name = componentPropertyInput.value.trim();
  const value = name ? componentPropertyValue(name) : undefined;
  const isBoolean = typeof value === 'boolean';
  componentPropertyHint.className = `component-property-hint${isBoolean ? ' is-boolean' : ''}`;
  componentPropertyHint.textContent = !name
    ? 'Выберите публичное свойство компонента отдельно от свойств слоя.'
    : isBoolean && selectedPermission() === 'forbidden'
      ? 'Запрещено для boolean означает: свойство должно быть выключено (false).'
      : `Текущее значение: ${value === undefined ? 'не найдено в preview' : displayValue(value)}`;
}

function renderProperties(): void {
  propertyList.replaceChildren();
  const node = currentNode();
  if (!node) {
    const empty = document.createElement('span');
    empty.className = 'hint';
    empty.textContent = 'Выберите область в anatomy tree.';
    propertyList.append(empty);
    return;
  }
  const factPriority = (path: string): number => {
    if (path === 'text.characters') return 0;
    if (path.startsWith('component.properties.')) return 1;
    if (path.startsWith('text.')) return 2;
    if (path === 'visible') return 3;
    if (path.startsWith('appearance.')) return 4;
    if (path.startsWith('layout.')) return 5;
    if (path.startsWith('variable.')) return 6;
    return 7;
  };
  const facts = flattenFacts(node.properties as unknown as JsonValue)
    .filter(([path]) => !path.startsWith('bounds.') || /width|height/.test(path))
    .filter(([path]) => !path.startsWith('component.propertyTypes.'))
    .filter(([path]) => !path.startsWith('variable.modeCatalog.') && !path.startsWith('resolvedModes.'))
    .sort(([left], [right]) => factPriority(left) - factPriority(right) || left.localeCompare(right))
    .slice(0, 100);
  facts.forEach(([path, value]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `property-chip${selectedCapability() === path ? ' active' : ''}`;
    const name = document.createElement('strong');
    name.textContent = displayCapabilityLabel(path);
    const observed = document.createElement('span');
    observed.textContent = modeCatalogForCapability(path)?.modes.find(mode => mode.modeId === value)?.name || displayValue(value);
    button.append(name, observed);
    button.addEventListener('click', () => {
      if (authoringView === 'list') resetRuleForm(false);
      if (path.startsWith('component.properties.')) {
        ensureComponentPropertyOption(componentPropertyNameFromCapability(path));
        componentPropertyInput.value = componentPropertyNameFromCapability(path);
        setPropertySourceTab('component');
      } else {
        capabilityInput.value = path;
        setPropertySourceTab('layer');
      }
      capabilitySetSelect.value = '';
      selectedGroupCapabilities.clear();
      syncCapabilityGroupUi();
      syncComponentPropertyUi();
      renderProperties();
      if (path.startsWith('variable.modes.') && selectedPermission() === 'constrained'
        && ['propertyDomain','propertyExclusion'].includes(constraintType.value)) renderConstraintFields();
      setAuthoringView('editor');
    });
    propertyList.append(button);
  });
}

function syncCapabilityGroupUi(): void {
  const capabilities = capabilitiesForSet(capabilitySetSelect.value);
  const usesSet = capabilities.length > 0;
  propertyPicker.hidden = usesSet;
  capabilityInput.disabled = usesSet;
  layerPropertyField.classList.toggle('uses-set', usesSet);
  capabilitySetList.hidden = !usesSet;
  capabilitySetList.replaceChildren();
  if (!usesSet) return;
  capabilities.forEach((capability) => {
    const item = document.createElement('label');
    item.className = 'capability-set-item';
    item.title = capability;
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = selectedGroupCapabilities.has(capability);
    check.setAttribute('aria-label', `Включить ${capability}`);
    check.addEventListener('change', () => {
      if (check.checked) selectedGroupCapabilities.add(capability);
      else selectedGroupCapabilities.delete(capability);
    });
    const name = document.createElement('code');
    name.textContent = capability;
    item.append(check, name);
    capabilitySetList.append(item);
  });
}

function renderCapabilityOptions(showMenu = false): void {
  capabilityOptions.replaceChildren();
  const selectedComponentProperty = componentPropertyInput.value;
  componentPropertyInput.replaceChildren();
  const emptyComponentProperty = document.createElement('option');
  emptyComponentProperty.value = '';
  emptyComponentProperty.textContent = 'Выберите Component Property';
  componentPropertyInput.append(emptyComponentProperty);
  const common = [
    'appearance.fill', 'appearance.stroke', 'appearance.opacity', 'appearance.radius', 'appearance.typography',
    'layout.mode', 'layout.itemSpacing', 'layout.padding.horizontal', 'layout.padding.vertical',
    'visibility', 'token.binding',
  ];
  const observed = currentNode() ? flattenFacts(currentNode()!.properties as unknown as JsonValue).map(([path]) => path) : [];
  const layerProperties = observed.filter((path) => (
    path === 'visible'
    || path.startsWith('appearance.')
    || path.startsWith('layout.')
    || path.startsWith('text.')
    || path.startsWith('variable.bindings.')
    || path.startsWith('variable.modes.')
    || path === 'bounds.width'
    || path === 'bounds.height'
  ));
  const query = capabilityInput.value.trim().toLowerCase();
  const availableLayerProperties = Array.from(new Set([...common, ...layerProperties,
    ...(currentNode()?.type === 'SLOT' ? ['composition.content'] : []),
    ...(isDeclaredRootTarget(focusedTarget()) ? ['composition.members'] : [])])).sort();
  const filteredLayerProperties = availableLayerProperties.filter((value) => (
    !query
    || value.toLowerCase().includes(query)
    || layerPropertyLabel(value).toLowerCase().includes(query)
    || value === 'composition.members' && 'состав коллекция элементы'.includes(query)
  ));
  filteredLayerProperties.forEach((value) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'property-picker-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(capabilityInput.value === value));
    const label = document.createElement('strong');
    label.textContent = layerPropertyLabel(value);
    const technicalName = document.createElement('code');
    technicalName.textContent = value;
    option.append(label, technicalName);
    option.addEventListener('click', () => {
      const previousMode = capabilityInput.value.startsWith('variable.modes.');
      capabilityInput.value = value;
      capabilityOptions.hidden = true;
      capabilityInput.setAttribute('aria-expanded', 'false');
      renderProperties();
      if ((previousMode || value.startsWith('variable.modes.') || value.startsWith('component.properties.')) && selectedPermission() === 'constrained'
        && ['propertyDomain', 'propertyExclusion'].includes(constraintType.value)) renderConstraintFields();
    });
    capabilityOptions.append(option);
  });
  if (!filteredLayerProperties.length) {
    const empty = document.createElement('span');
    empty.className = 'property-picker-empty';
    empty.textContent = 'Совпадений нет — можно сохранить введённое capability вручную.';
    capabilityOptions.append(empty);
  }
  capabilityOptions.hidden = !showMenu || propertySourceTab !== 'layer' || Boolean(capabilitySetSelect.value);
  capabilityInput.setAttribute('aria-expanded', String(!capabilityOptions.hidden));
  const componentProperties = observed
    .filter((path) => path.startsWith('component.properties.'))
    .map(componentPropertyNameFromCapability);
  const apiProperties=workspace?componentPropertyOptions(propertyOptionsContext(),'target').map(p=>p.name):[];
  Array.from(new Set([...componentProperties,...apiProperties, selectedComponentProperty].filter(Boolean))).sort().forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = humanComponentPropertyName(value);
    componentPropertyInput.append(option);
  });
  componentPropertyInput.value = selectedComponentProperty;
  syncUnifiedSelect(componentPropertyInput);
  syncComponentPropertyUi();
}

function ensureComponentPropertyOption(value: string): void {
  if (!value || Array.from(componentPropertyInput.options).some((option) => option.value === value)) return;
  const option = document.createElement('option');
  option.value = value;
  option.textContent = humanComponentPropertyName(value);
  componentPropertyInput.append(option);
  syncUnifiedSelect(componentPropertyInput);
}

function renderRuleSelect(): void {
  const current = ruleSelect.value;
  ruleSelect.replaceChildren();
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'Новое правило';
  ruleSelect.append(empty);
  workspace?.manual.rules.forEach((rule) => {
    const option = document.createElement('option');
    option.value = rule.id;
    option.textContent = `${rule.id} · ${rule.status}`;
    ruleSelect.append(option);
  });
  ruleSelect.value = workspace?.manual.rules.some((rule) => rule.id === current) ? current : '';
}

function permissionLabel(permission: Permission): string {
  if (permission === 'allowed') return 'Разрешено';
  if (permission === 'forbidden') return 'Запрещено';
  return 'С условиями';
}

function renderQuickPolicy(): void {
  const manual = workspace?.manual;
  const root = rootNode();
  const rootTarget = root ? targetForNode(root) : undefined;
  const protectedGroups = manual && rootTarget
    ? PROTECTED_INTERNAL_CAPABILITY_SETS.filter((capabilitySet) => manual.rules.some((rule) => (
      rule.targetId === rootTarget.id
      && rule.capabilitySet === capabilitySet
      && rule.permission === 'forbidden'
      && rule.targetScope === 'self-and-descendants'
    ))).length
    : 0;
  quickPolicySummary.textContent = manual
    ? `${protectedGroups}/2 групп защищено`
    : 'Выберите компонент';
  protectInternalsButton.disabled = !manual || !root;
  protectInternalsButton.textContent = protectedGroups === PROTECTED_INTERNAL_CAPABILITY_SETS.length ? 'Обновить' : 'Применить';
}

function ruleVariantLabel(rule: ManualRule): string {
  const entries = Object.entries(rule.applicability.variants === 'all' ? {} : rule.applicability.variants)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([property, values]) => `${property}=${values.join(' / ')}`);
  entries.push(...Object.entries(rule.applicability.context || {}).map(([key, value]) => `${key}=${JSON.stringify(value)}`));
  entries.push(...Object.entries(rule.applicability.contextDomains || {}).map(([key, values]) => `${key} ∈ ${values.map(v => JSON.stringify(v)).join(' / ')}`));
  if (rule.applicability.activeDependency) entries.push(`Активная зависимость: ${rule.applicability.activeDependency}`);
  return entries.length ? entries.join(' · ') : 'Все';
}

function hideRuleRationale(): void {
  window.clearTimeout(ruleRationaleHideTimer);
  ruleRationaleHideTimer = undefined;
  ruleRationaleAnchor?.removeAttribute('aria-describedby');
  ruleRationaleAnchor = null;
  ruleRationaleTooltip.hidden = true;
}

function scheduleRuleRationaleHide(): void {
  window.clearTimeout(ruleRationaleHideTimer);
  ruleRationaleHideTimer = window.setTimeout(() => {
    if (ruleRationaleAnchor?.matches(':hover') || document.activeElement === ruleRationaleAnchor || ruleRationaleTooltip.matches(':hover')) return;
    hideRuleRationale();
  }, 160);
}

function showRuleRationale(anchor: HTMLButtonElement, rule: ManualRule): void {
  hideRuleRationale();
  ruleRationaleAnchor = anchor;
  ruleRationaleText.textContent = rule.rationale.trim() || 'Rationale не заполнен.';
  anchor.setAttribute('aria-describedby', ruleRationaleTooltip.id);
  ruleRationaleTooltip.hidden = false;
  ruleRationaleTooltip.scrollTop = 0;
  positionRuleRationale();
}

function positionRuleRationale(): void {
  if (!ruleRationaleAnchor || ruleRationaleTooltip.hidden) return;
  const card = ruleRationaleAnchor.getBoundingClientRect();
  const panel = authoringPanel.getBoundingClientRect();
  if (card.bottom <= panel.top || card.top >= panel.bottom) {
    hideRuleRationale();
    return;
  }
  const tooltip = ruleRationaleTooltip.getBoundingClientRect();
  const margin = 12;
  const gap = 8;
  let left = card.left - tooltip.width - gap;
  if (left < margin) left = card.right + gap;
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltip.width - margin));
  const top = Math.max(margin, Math.min(card.top, window.innerHeight - tooltip.height - margin));
  ruleRationaleTooltip.style.left = `${left}px`;
  ruleRationaleTooltip.style.top = `${top}px`;
}

ruleRationaleTooltip.addEventListener('mouseenter', () => window.clearTimeout(ruleRationaleHideTimer));
ruleRationaleTooltip.addEventListener('mouseleave', scheduleRuleRationaleHide);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !ruleRationaleTooltip.hidden) hideRuleRationale();
});
document.addEventListener('pointerdown', event => {
  if (event.target instanceof Node && !ruleRationaleAnchor?.contains(event.target) && !ruleRationaleTooltip.contains(event.target)) hideRuleRationale();
});
document.addEventListener('scroll', event => {
  if (event.target instanceof Node && ruleRationaleTooltip.contains(event.target)) return;
  positionRuleRationale();
  scheduleRuleRationaleHide();
}, true);
window.addEventListener('resize', positionRuleRationale);
window.addEventListener('blur', hideRuleRationale);

function renderRuleCards(): void {
  hideRuleRationale();
  ruleCards.replaceChildren();
  const rules = workspace?.manual.rules || [];
  const componentId = workspace?.manual.component.componentId;
  if (componentId !== ruleSearchComponentId) {
    ruleSearch.value = '';
    ruleSearchComponentId = componentId;
  }
  const query = ruleSearch.value.trim().toLowerCase();
  const exactMatches = query ? rules.filter(rule => rule.id.toLowerCase() === query) : [];
  const matchingRules = exactMatches.length ? exactMatches : rules.filter(rule => !query || rule.id.toLowerCase().includes(query));
  ruleSearch.disabled = !workspace;
  clearRuleSearchButton.hidden = !ruleSearch.value;
  ruleSearchResults.hidden = !query;
  ruleSearchResults.textContent = query ? `Показано ${matchingRules.length} из ${rules.length}` : '';
  previewPinnedState.textContent = snapshot ? 'Preview закреплён' : 'Preview не получен';
  previewPinnedState.className = `preview-pinned${snapshot ? ' ready' : ''}`;
  if (!rules.length) {
    const empty = document.createElement('div');
    empty.className = 'rule-list-empty';
    empty.textContent = 'Правил пока нет. Используйте быструю настройку или кнопку +.';
    ruleCards.append(empty);
    return;
  }
  if (!matchingRules.length) {
    const empty = document.createElement('div');
    empty.className = 'rule-list-empty';
    empty.textContent = 'Правил с таким Rule ID не найдено. Измените запрос или очистите поиск.';
    ruleCards.append(empty);
    return;
  }
  matchingRules.forEach((rule) => {
    const target = workspace?.manual.targets.find((entry) => entry.id === rule.targetId);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `rule-card${rule.id === editingRuleId ? ' selected' : ''}`;
    button.dataset.ruleId = rule.id;
    button.setAttribute('aria-pressed', String(rule.id === editingRuleId));
    const main = document.createElement('span');
    main.className = 'rule-card-main';
    const title = document.createElement('strong');
    title.className = 'rule-card-title';
    if (rule.capabilitySet) {
      const total = capabilitiesForSet(rule.capabilitySet).length;
      const selected = rule.capabilitySelection?.length ?? total;
      title.textContent = `${capabilitySetLabel(rule.capabilitySet)} · ${selected}/${total}`;
    } else title.textContent = rule.constraints.some(c=>c.type==='memberCollection') ? 'Состав и условия коллекции' : displayCapabilityLabel(rule.capability);
    const targetLabel = document.createElement('span');
    targetLabel.className = 'rule-card-target';
    targetLabel.textContent = `${target?.label || rule.targetId} · ${rule.targetScope === 'descendants' ? 'только вложенные слои' : rule.targetScope === 'self-and-descendants' ? 'с потомками' : 'только слой'}`;
    const variants = document.createElement('span');
    variants.className = 'rule-card-variant';
    variants.textContent = ruleVariantLabel(rule);
    variants.title = `Variants: ${ruleVariantLabel(rule)}`;
    main.append(title, targetLabel, variants);
    const meta = document.createElement('span');
    meta.className = 'rule-card-meta';
    const permission = document.createElement('span');
    permission.className = `policy-state ${rule.permission}`;
    permission.textContent = permissionLabel(rule.permission);
    const status = document.createElement('span');
    status.className = 'rule-status';
    status.textContent = rule.status;
    const route = document.createElement('span');
    route.className = 'rule-status';
    route.textContent = rule.execution?.route || 'auto';
    meta.append(permission, route, status);
    button.append(main, meta);
    button.addEventListener('mouseenter', () => showRuleRationale(button, rule));
    button.addEventListener('mouseleave', scheduleRuleRationaleHide);
    button.addEventListener('focus', () => showRuleRationale(button, rule));
    button.addEventListener('blur', scheduleRuleRationaleHide);
    button.addEventListener('click', () => loadRule(rule));
    ruleCards.append(button);
  });
}

ruleSearch.addEventListener('input', renderRuleCards);
clearRuleSearchButton.addEventListener('click', () => {
  ruleSearch.value = '';
  renderRuleCards();
  ruleSearch.focus();
});
ruleSearch.addEventListener('keydown', event => {
  if (event.key === 'Escape' && ruleSearch.value) {
    event.preventDefault();
    ruleSearch.value = '';
    renderRuleCards();
  }
});

function selectedPermission(): Permission {
  const checked = document.querySelector<HTMLInputElement>('input[name="permission"]:checked');
  return (checked?.value || 'constrained') as Permission;
}

function syncPermissionUi(): void {
  const permission = selectedPermission();
  syncComponentPropertyUi();
  const controlPathApplies = permission !== 'forbidden';
  controlPathSection.dataset.disabled = String(!controlPathApplies);
  controlPathKind.disabled = !controlPathApplies;
  controlPathValue.disabled = !controlPathApplies;
  slotAnchorProperty.disabled = !controlPathApplies;
  slotOwnerTarget.disabled = !controlPathApplies;
  slotContentOwnership.disabled = !controlPathApplies;
  exclusivePath.disabled = !controlPathApplies;
  constraintSection.dataset.permission = permission;
  constraintType.disabled = permission !== 'constrained';
  constraintEntrySelect.disabled = permission !== 'constrained';
  if (permission === 'forbidden') {
    constraintType.value = 'propertyForbidden';
    renderConstraintFields({ type: 'propertyForbidden' });
    return;
  }
  if (permission === 'allowed') {
    constraintFields.replaceChildren();
    const note = document.createElement('div');
    note.className = 'hint';
    note.textContent = 'Policy-only: изменение разрешено через указанный control path, RuleIR не требуется.';
    constraintFields.append(note);
    return;
  }
  if (constraintType.value === 'propertyForbidden') constraintType.value = 'propertyDomain';
  renderConstraintFields();
}

function renderConstraintFields(initial?: TypedConstraint): void {
  const type = constraintType.value as TypedConstraint['type'];
  destroyUnifiedSelectsWithin(constraintFields);
  constraintFields.replaceChildren();
  const makeInput = (id: string, label: string, placeholder = '', value = '') => {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';
    const title = document.createElement('span');
    title.textContent = label;
    const input = document.createElement('input');
    input.id = id;
    input.placeholder = placeholder;
    input.value = value;
    wrapper.append(title, input);
    return wrapper;
  };
  const row = document.createElement('div');
  row.className = 'inline-fields';

  if(type==='instanceReplacementDomain'){
    row.className='inline-fields single';
    const input=document.createElement('textarea');input.hidden=true;input.readOnly=true;input.id='instanceReplacementDomain';
    input.value=prettyJson(initial?.replacement || {});row.append(input);
    const title=document.createElement('p');title.className='field-help';
    const target=workspace?.manual.targets.find(target=>target.semanticRole===initial?.replacement?.targetRole);
    title.textContent=`Цель: ${target?.label || initial?.replacement?.targetRole || 'не задана'}`;row.append(title);
    const list=document.createElement('ul');list.className='field-help';list.style.overflowWrap='anywhere';
    for(const alternative of initial?.replacement?.alternatives || []){
      const item=document.createElement('li');
      item.textContent=[alternative.componentSetKey,...Object.entries(alternative.properties || {}).map(([name,values])=>`${name}: ${values.join(', ')}`)].join(' · ');
      list.append(item);
    }
    row.append(list);
    const help=document.createElement('p');help.className='field-help';help.textContent='Допустимые замены сохранены из пакета. Для изменения этого набора обновите контракт.';row.append(help);
  } else if(type==='configurationMapping'){
    row.className='inline-fields single';
    const label=document.createElement('label');label.className='field';
    const title=document.createElement('span');title.textContent='Условное соответствие спецификации · JSON';
    const input=document.createElement('textarea');input.id='configurationMapping';input.rows=12;
    input.value=prettyJson(initial?.mapping || {activeRoles:[],cases:[]});
    label.append(title,input);row.append(label);
    const help=document.createElement('p');help.className='field-help';help.textContent='when: независимые API-ожидания или контекст сценария. requirements: фактические значения semantic targets. Не задаёт новых разрешений в обычном аудите.';row.append(help);
  } else if(type==='configurationDomain'){
    row.className='inline-fields single';
    const label=document.createElement('label');label.className='field';
    const title=document.createElement('span');title.textContent='Согласованные конфигурации · JSON';
    const input=document.createElement('textarea');input.id='configurationDomain';input.rows=12;
    input.value=prettyJson(initial?.configuration || {activeRoles:[],profiles:[]});
    label.append(title,input);row.append(label);
    const help=document.createElement('p');help.className='field-help';help.textContent='Профиль целиком задаёт допустимые значения выбранных semantic roles. Скрытые цели исключаются только при доказанной видимости. specificationInput — ID независимого enum-ожидания; не значение из макета.';row.append(help);
  } else if(type==='transitionInvariant'){
    row.className='inline-fields single';
    const state=(id:string,label:string,value:boolean)=>{const field=document.createElement('label');field.className='field';const title=document.createElement('span');title.textContent=label;
      const select=document.createElement('select');select.id=id;for(const v of ['false','true']){const o=document.createElement('option');o.value=v;o.textContent=v;select.append(o);}select.value=String(value);field.append(title,select);return field;};
    row.append(makeInput('transitionDependency','ID зависимости состояния','spinner',initial?.transition?.dependencyId||''),
      state('transitionFrom','Исходное состояние зависимости',initial?.transition?.from??false),
      state('transitionTo','Конечное состояние зависимости',initial?.transition?.to??true),
      makeInput('transitionInvariants','Неизменяемые факты через запятую','semanticApi.size, semanticApi.view',(initial?.transition?.invariantFacts||[]).join(', ')),
      makeInput('transitionTolerance','Допуск, px','0.01',String(initial?.transition?.tolerance??0.01)));
    const help=document.createElement('p');help.className='field-help';help.textContent='Один instance, одна сессия, неизменные внешние условия. Fact ниже: bounds.width или bounds.height. Плагин не переключает состояние автоматически.';row.append(help);
  } else if (type === 'memberCollection' && workspace) {
    row.className='inline-fields single';
    renderMemberCollectionForm(row, initial?.collection, {manual:workspace.manual,snapshot,variantEvidence:workspace.variantEvidence,dependencyContracts:workspace.dependencyContracts});
  } else if (type === 'dependencyDomain') {
    row.className = 'inline-fields single';
    const jsonField = (id: string, title: string, value: unknown) => {
      const label = document.createElement('label'); label.className = 'field';
      const text = document.createElement('span'); text.textContent = title;
      const input = document.createElement('textarea'); input.id = id; input.rows = 5;
      input.value = prettyJson(value); label.append(text,input); return label;
    };
    const selectField = (id: string, title: string, options: string[][], value: string) => {
      const label=document.createElement('label');label.className='field';
      const text=document.createElement('span');text.textContent=title;
      const select=document.createElement('select');select.id=id;
      for(const [key,name] of options){const option=document.createElement('option');option.value=key;option.textContent=name;select.append(option);}
      select.value=value;label.append(text,select);return label;
    };
    const d=initial?.dependency;
    const subjectPorts=new Map<string,string[]>();
    const declaredPorts=workspace?createDeclaredDependencyPortOptions(workspace.manual,workspace.dependencyContracts || []):()=>[];
    if(workspace){
      const candidates:Array<{targetRole:string;relativePath:string}>=workspace.manual.targets.filter(t=>t.resolution==='resolved').map(t=>({targetRole:t.semanticRole,relativePath:''}));
      const prepared=optionalAuthoringSnapshot();if(prepared){
        const paths=snapshotPaths(prepared);
        if(paths)for(const target of workspace.manual.targets.filter(t=>t.resolution==='resolved')){
          const nodes=prepared.nodes.filter(n=>(n.semantic as any)?.role===target.semanticRole);if(nodes.length!==1)continue;
          const prefix=paths.get(String(nodes[0].id))!;
          for(const node of prepared.nodes.filter(n=>n.type==='INSTANCE')){
            const path=paths.get(String(node.id))!;
            if(node.id===nodes[0].id || !prefix || path.startsWith(prefix+' / ')){
              const subject={targetRole:target.semanticRole,relativePath:node.id===nodes[0].id?'':prefix?path.slice(prefix.length+3):path};
              if(node.id!==nodes[0].id)candidates.push(subject);
              subjectPorts.set(JSON.stringify(subject),[...new Set(Object.entries((node.component as any)?.propertyTypes || {})
                .filter(([,type])=>type==='INSTANCE_SWAP').map(([name])=>name.replace(/#[^#]+$/,'')))].sort());
            }
          }
        }
      }
      for(const subject of d?.subjects || [])if(!candidates.some(c=>c.targetRole===subject.targetRole&&c.relativePath===subject.relativePath))candidates.push(subject);
      const choices=collectionChecks('dependencySubjectChoices','Выбрать подтверждённую semantic цель и вложенный instance',candidates.map(s=>[JSON.stringify(s),`${s.targetRole} → ${s.relativePath || 'сам instance'}`]),(d?.subjects || []).map(s=>JSON.stringify(s)));
      choices.addEventListener('change',()=>{const selected=Array.from(choices.querySelectorAll<HTMLInputElement>('input:checked')).map(i=>JSON.parse(i.value));element<HTMLTextAreaElement>('dependencySubjects').value=prettyJson(selected);});row.append(choices);
      renderTypedFilterForm(row,'dependencySubjectCondition','Проверять только при typed свойстве semantic цели',d?.subjectCondition,
        {...propertyOptionsContext(),scope:'target',targetNodes:undefined,roles:()=>Array.from(choices.querySelectorAll<HTMLInputElement>('input:checked')).map(i=>JSON.parse(i.value).targetRole)});
      choices.addEventListener('change',()=>row.querySelectorAll('.collection-choices').forEach(s=>s.dispatchEvent(new Event('property-options-refresh'))));
    }
    row.append(
      selectField('dependencyContractId','Контракт зависимости (пусто = INSTANCE_SWAP / каталог)',[['','INSTANCE_SWAP / каталог'],...(workspace?.manual.componentDependencies || []).map(p=>[p.id,p.componentId])],d?.contractDependencyId || ''),
      jsonField('dependencySubjects','Цели: semantic role и точный путь вложенного instance',d?.subjects || []),
      selectField('dependencyField','Что проверять',[['componentSetKey','Component set вложенного компонента'],['catalog','Каталог иконки в swap-порту'],['changed','Сохранить исходную иконку'],['portName','Активный INSTANCE_SWAP-порт'],['width','Ширина вложенного instance, px'],['height','Высота вложенного instance, px'],['variantProperty','VARIANT-свойство вложенного компонента']],d?.field || 'componentSetKey'),
      makeInput('dependencyProperty','VARIANT-свойство вложенного компонента','Size, Inverted, Static',d?.property || ''),
      makeInput('dependencyPorts','Имена INSTANCE_SWAP-портов (без #suffix)','Icon-24, Icon-20, Icon-16',(d?.portNames || []).join(', ')),
      makeInput('dependencyActivePorts','Проверять свойство только в активных портах (пусто = все)','Icon-20',(d?.activePorts || []).join(', ')),
      makeInput('dependencyCatalogs','Применять к каталогам (пусто = все; для порта, размеров и VARIANT)','Icons -- glyph-26',(d?.catalogs || []).join(', ')),
      makeInput('dependencyTolerance','Допуск размеров, px (пусто = точное совпадение)','0.01',d?.tolerance === undefined ? '' : String(d.tolerance)),
      selectField('dependencyBaseline','Политика исходного baseline',[['require-domain','Проверять и исходный компонент'],['allow-unchanged','Разрешить исходную иконку; проверять замену']],d?.baselinePolicy || 'require-domain'),
      makeInput('dependencyValues','Допустимые keys / каталоги / порты / размеры','Icon-20, Icon-24',(initial?.values || []).join(', ')),
      makeInput('dependencySource','Свойство владельца для таблицы соответствий','semanticApi.size',d?.sourceFact || ''),
      jsonField('dependencyCases','Таблица: when → values (вместо фиксированного списка)',d?.cases || []),
    );
    if(workspace){
      const variantFields=document.createElement('div');row.append(variantFields);
      const identityFields=document.createElement('div');identityFields.id='dependencyIdentityLock';row.append(identityFields);
      let identityPorts=[...(d?.portNames || [])];
      const selectedSubjects=()=>Array.from(row.querySelectorAll<HTMLInputElement>('#dependencySubjectChoices input:checked')).map(i=>JSON.parse(i.value) as {targetRole:string;relativePath:string});
      const renderVariant=()=>{
        const field=(row.querySelector('#dependencyField') as HTMLSelectElement).value,active=field==='variantProperty',identityLock=field==='changed';
        for(const id of ['dependencyContractId','dependencySubjects','dependencyPorts','dependencyActivePorts','dependencyCatalogs','dependencyTolerance','dependencyBaseline','dependencySource','dependencyCases'])
          row.querySelector('#'+id)!.closest<HTMLElement>('.field')!.hidden=identityLock;
        row.querySelector('#dependencyProperty')!.closest<HTMLElement>('.field')!.hidden=active||identityLock;
        row.querySelector('#dependencyValues')!.closest<HTMLElement>('.field')!.hidden=active||identityLock;
        variantFields.hidden=!active;variantFields.replaceChildren();
        if(active){const subjects=selectedSubjects();variantFields.append(propertyFields('dependencyVariant','VARIANT-свойство вложенного компонента',
          d?.property?{property:d.property,propertyType:'VARIANT'}:undefined,initial?.values||[],
          {...propertyOptionsContext(),scope:'target',targetNodes:undefined,allowDependencies:subjects.length>0&&subjects.every(s=>!s.relativePath),roles:()=>selectedSubjects().map(s=>s.targetRole)},false,true));}
        identityFields.hidden=!identityLock;
        if(identityLock){
          if(identityFields.querySelector('#dependencyIdentityPorts'))identityPorts=Array.from(identityFields.querySelectorAll<HTMLInputElement>('input:checked')).map(i=>i.value);
          const subjects=selectedSubjects(),observed=[...new Set(subjects.flatMap(s=>subjectPorts.get(JSON.stringify(s)) || []))];
          const declared=new Map<string,string[]>();
          for(const subject of subjects)for(const port of declaredPorts(subject))
            declared.set(port.name,[...new Set([...(declared.get(port.name)||[]),...port.componentIds])]);
          const available=[...new Set([...observed,...declared.keys()])].sort();
          const ports=[...available,...identityPorts.filter(p=>!available.includes(p))];
          const checks=collectionChecks('dependencyIdentityPorts','INSTANCE_SWAP-порты исходной иконки',ports.map(p=>[p,
            observed.includes(p)?p:declared.has(p)?`${p} · закреплённый контракт ${declared.get(p)!.join(', ')}`:`${p} · сохранённый порт, нет API текущего превью`]),identityPorts);
          const explanation=document.createElement('p');explanation.className='hint';
          explanation.textContent='Порты закреплённого контракта охватывают разные размеры. Выбор порта не ограничивает Applicability и не подтверждает его наличие в текущем превью. Иконка должна совпадать с независимым библиотечным эталоном текущего варианта. Замена компонента или его варианта запрещена. При отсутствии доказанного эталона результат — требуется проверка.';
          if(!ports.length){const empty=document.createElement('p');empty.className='hint';empty.textContent='Выберите вложенный instance, которому принадлежит INSTANCE_SWAP-порт. Если превью отсутствует, загрузите снимок.';checks.append(empty);}
          identityFields.replaceChildren(checks,explanation);
        }
      };
      row.querySelector('#dependencyField')!.addEventListener('change',renderVariant);
      row.querySelector('#dependencySubjectChoices')?.addEventListener('change',renderVariant);renderVariant();
    }
    const note=document.createElement('p');note.className='hint';
    note.textContent='Ключи каталога — read-only facts. Неизвестный ключ или неоднозначный порт не считаются нарушением. Скрытые и отсутствующие в variant цели исключаются.';
    row.append(note);
  } else if (type === 'propertyDomain' || type === 'propertyExclusion') {
    row.className = 'inline-fields single';
    const catalog = modeCatalogForCapability(constraintFact.value.trim() || capabilityInput.value.trim());
    if (catalog) {
      const label = document.createElement('div'); label.className='field';
      const title = document.createElement('span');
      title.textContent = `${type === 'propertyExclusion' ? 'Запрещённые' : 'Допустимые'} modes · ${catalog.collectionName}`;
      const select = document.createElement('div'); select.id='constraintModeValues'; select.className='scope-options';
      const values = (initial?.values || []).map(String);
      const choices = [...catalog.modes, ...values.filter(value => !catalog.modes.some(mode => mode.modeId === value))
        .map(modeId => ({modeId,name:`Не найден в текущем каталоге · ${modeId}`}))];
      for (const mode of choices) {
        const option=document.createElement('label'); option.className='scope-option';
        const check=document.createElement('input'); check.type='checkbox'; check.value=mode.modeId;
        check.checked=values.includes(mode.modeId);
        const text=document.createElement('span'); const name=document.createElement('strong'); name.textContent=mode.name;
        text.append(name); option.append(check,text); select.append(option);
      }
      label.append(title,select); row.append(label);
      const note=document.createElement('p'); note.className='hint';
      note.textContent='Можно выбрать несколько modes. Правило проверяет фактический режим этой коллекции; поле Modes в области действия лишь ограничивает применимость правила.';
      row.append(note);
    } else {
      const fact=constraintFact.value.trim() || selectedCapability(),name=componentPropertyNameFromCapability(fact);
      const api=workspace?.manual.semanticApi.find(p=>fact===`semanticApi.${p.id}`);
      const option=workspace&&name?componentPropertyOptions(propertyOptionsContext(),'target').find(p=>p.name===name)
        :api&&(api.domain?.length||api.valueType==='boolean')?{name:api.id,type:'VARIANT' as const,finite:true,values:api.valueType==='boolean'?[false,true]:api.domain!}:undefined;
      if(name||option)row.append(renderPropertyValuePicker('constraintValues',option,initial?.values || [],type==='propertyExclusion'?'Запрещённые значения':'Допустимые значения'));
      else row.append(makeInput('constraintValues', type === 'propertyExclusion' ? 'Запрещённые значения' : 'Допустимые значения', '', (initial?.values || []).join(', ')));
    }
  } else if (type === 'presence') {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';
    const title = document.createElement('span');
    title.textContent = 'Ожидание';
    const select = document.createElement('select');
    select.id = 'constraintExpected';
    [['true', 'Должен присутствовать'], ['false', 'Должен отсутствовать']].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = String(initial?.expected ?? true) === value;
      select.append(option);
    });
    wrapper.append(title, select);
    row.append(wrapper);
  } else if (type === 'propertyForbidden') {
    row.append(makeInput('baselineTargetRoles', 'Явные semantic roles (пусто — цель правила)', 'root, operation', (initial?.targetRoles || []).join(', ')));
    const targetsNote = document.createElement('p'); targetsNote.className='hint';
    targetsNote.textContent='Список ограничивает проверку только этими видимыми целями. Нужен scope корень/self; дочерние узлы и Addon не включаются автоматически.';
    constraintFields.append(targetsNote);
    const note = document.createElement('div');
    note.className = 'hint';
    note.textContent = 'Фактическое значение должно совпадать с effective baseline текущего variant/mode.';
    constraintFields.append(note);
    const sourceLabel = document.createElement('label'); sourceLabel.className = 'field';
    const sourceTitle = document.createElement('span'); sourceTitle.textContent = 'Источник эталона';
    const source = document.createElement('select'); source.id = 'baselineSource';
    for (const [value,label] of [['','Контекстный effective baseline'],['library-text','Текст выбранного library variant (Athena)']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = label; source.append(option);
    }
    source.value = initial?.baselineSource || ''; sourceLabel.append(sourceTitle,source); constraintFields.append(sourceLabel);
    row.append(makeInput('textNormalization', 'Нормализация текста: trim или пусто', 'trim', initial?.textNormalization || ''));
    constraintFields.append(row);
    const label=document.createElement('label');label.className='field';
    const title=document.createElement('span');title.textContent='Точечное исключение · JSON (необязательно)';
    const input=document.createElement('textarea');input.id='exceptConfiguration';input.rows=3;
    input.value=initial?.exceptConfiguration ? prettyJson(initial.exceptConfiguration) : '';
    label.append(title,input);constraintFields.append(label);
    return;
  } else if (type === 'quantity') {
    const dependencyLabel = document.createElement('label'); dependencyLabel.className = 'field';
    const dependencyTitle = document.createElement('span'); dependencyTitle.textContent = 'Считать экземпляры зависимости (вместо semantic roles)';
    const dependencySelect = document.createElement('select'); dependencySelect.id = 'constraintCountDependency';
    dependencyOptions(dependencySelect, initial?.contractDependencyId || '');
    dependencySelect.options[0].textContent = 'Semantic roles';
    dependencyLabel.append(dependencyTitle, dependencySelect); row.append(dependencyLabel);
    row.append(
      makeInput('constraintMin', 'Минимум', '0', initial?.min === undefined ? '' : String(initial.min)),
      makeInput('constraintMax', 'Максимум', '4', initial?.max === undefined ? '' : String(initial.max)),
      makeInput('constraintTargetRole', 'Роль элементов (legacy)', 'button', initial?.targetRole || ''),
      makeInput('constraintTargetRoles', 'Целевые роли через запятую', 'left-addon, right-addon', (initial?.targetRoles || []).join(', ')),
    );
    const visibleLabel = document.createElement('label');
    visibleLabel.className = 'check-field';
    const visible = document.createElement('input');
    visible.type = 'checkbox'; visible.id = 'constraintVisibleOnly'; visible.checked = initial?.visibleOnly === true;
    const visibleText = document.createElement('span'); visibleText.textContent = 'Считать только видимые внутри компонента';
    visibleLabel.append(visible, visibleText); row.append(visibleLabel);
    const dependencyNote = document.createElement('div'); dependencyNote.className = 'hint';
    dependencyNote.textContent = 'Для зависимости считаются только видимые экземпляры с подтверждёнными ключами; неизвестные факты не считаются нулём.';
    row.append(dependencyNote);
    const syncQuantityMode = () => {
      const dependencyMode = Boolean(dependencySelect.value);
      row.querySelectorAll<HTMLInputElement>('#constraintTargetRole, #constraintTargetRoles, #constraintVisibleOnly')
        .forEach(input => { input.disabled = dependencyMode; });
      dependencyNote.hidden = !dependencyMode;
    };
    dependencySelect.addEventListener('change', syncQuantityMode); syncQuantityMode();
  } else if (type === 'positionOrder') {
    row.className = 'inline-fields single';
    row.append(makeInput('constraintOrder', 'Semantic roles по порядку', 'status, heading, subtitle', (initial?.order || []).join(', ')));
    const scopeLabel = document.createElement('label'); scopeLabel.className = 'field';
    const scopeTitle = document.createElement('span'); scopeTitle.textContent = 'Какие части учитывать';
    const scopeSelect = document.createElement('select'); scopeSelect.id = 'constraintOrderScope';
    for (const [value, title] of [['visible','Только видимые части'],['structural','Все части, включая скрытые']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = title;
      option.selected = value === (initial?.orderScope || 'visible'); scopeSelect.append(option);
    }
    scopeLabel.append(scopeTitle,scopeSelect); row.append(scopeLabel);
  } else if (type === 'relationship') {
    const relationWrapper = document.createElement('label');
    relationWrapper.className = 'field';
    const title = document.createElement('span');
    title.textContent = 'Связь';
    const select = document.createElement('select');
    select.id = 'constraintRelation';
    ['direct-parent', 'ancestor', 'direct-child', 'descendant', 'before', 'after', 'adjacent'].forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      option.selected = initial?.relation === value;
      select.append(option);
    });
    relationWrapper.append(title, select);
    row.append(relationWrapper, makeInput('constraintTargetRole', 'Связанная роль', 'heading', initial?.targetRole || ''));
  } else if (type === 'bindingConsistency') {
    row.className = 'inline-fields single';
    for (const [id,title,values,current] of [
      ['constraintBindingKind','Что сравнивать',[['fill-token','Токен заливки'],['text-style','Text Style']],initial?.bindingKind || 'fill-token'],
      ['constraintBindingReference','Эталон',[['shared','Одинаковая привязка у всех частей'],['selected-variant','Text Style выбранного библиотечного варианта']],initial?.bindingReference || 'shared'],
    ] as Array<[string,string,string[][],string]>) {
      const label=document.createElement('label');label.className='field';
      const titleNode=document.createElement('span');titleNode.textContent=title;
      const select=document.createElement('select');select.id=id;
      values.forEach(([value,text])=>{const o=document.createElement('option');o.value=value;o.textContent=text;o.selected=value===current;select.append(o);});
      label.append(titleNode,select);row.append(label);
    }
    row.append(makeInput('constraintBindingRoles','Semantic roles текстовых частей','sign, major-text, minor-text, currency-text',(initial?.targetRoles || []).join(', ')));
    const hint=document.createElement('div');hint.className='hint';
    hint.textContent='Проверяются только видимые TEXT-цели. Привязка обязательна в каждом диапазоне. Содержимое других слотов не включается. Правило задаётся на root с Permission «С условиями».';
    row.append(hint);
  } else if (type === 'styleBinding') {
    row.className = 'inline-fields single';
    row.append(makeInput('constraintStyleCatalog', 'Каталог Text Style из пакета', 'Web _ Typography.json', initial?.styleCatalog || ''));
    const hint = document.createElement('div'); hint.className = 'hint';
    hint.textContent = 'Каждый текстовый диапазон должен быть привязан к стилю из этого каталога. Разные стили разрешены; имя, кегль и визуальное совпадение не заменяют ключ стиля.';
    row.append(hint);
  } else if (type === 'tokenBinding') {
    row.append(makeInput('constraintTokenIds', 'Token IDs', 'VariableID:…', (initial?.tokenIds || []).join(', ')));
    const wrapper = document.createElement('label');
    wrapper.className = 'check-field';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'constraintBindingRequired';
    input.checked = initial?.bindingRequired ?? true;
    const title = document.createElement('span');
    title.textContent = 'Binding обязателен';
    wrapper.append(input, title);
    row.append(wrapper);
  } else if (type === 'layoutConstraint') {
    const operatorWrapper = document.createElement('label');
    operatorWrapper.className = 'field';
    const title = document.createElement('span');
    title.textContent = 'Оператор';
    const select = document.createElement('select');
    select.id = 'constraintOperator';
    [['equals', 'Равно'], ['between', 'Диапазон'], ['at-most-line-height', 'Не больше эталонного line-height']].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = (initial?.operator || 'equals') === value;
      select.append(option);
    });
    operatorWrapper.append(title, select);
    row.append(
      operatorWrapper,
      makeInput('constraintValue', 'Значение', '16', initial?.value === undefined ? '' : String(initial.value)),
      makeInput('constraintMin', 'Минимум', '12', initial?.min === undefined ? '' : String(initial.min)),
      makeInput('constraintMax', 'Максимум', '20', initial?.max === undefined ? '' : String(initial.max)),
      makeInput('constraintLineHeightRole', 'Роль эталонного TEXT для line-height', 'major-text', initial?.targetRole || ''),
    );
  }
  constraintFields.append(row);
  row.querySelectorAll<HTMLSelectElement>('select').forEach(enhanceSelect);
}

function resetRuleForm(resetTarget = true): void {
  ruleFormDirty = false;
  clearRuleErrors();
  applicabilitySection.open = false;
  editingRuleId = null;
  if (resetTarget) ruleSelect.value = '';
  ruleIdInput.value = '';
  capabilityInput.value = '';
  componentPropertyInput.value = '';
  setPropertySourceTab('layer');
  capabilitySetSelect.value = '';
  selectedGroupCapabilities.clear();
  targetScope.value = 'self';
  boundaryPolicy.value = '';
  targetApplicability.value = '';
  syncCapabilityGroupUi();
  const constrained = document.querySelector<HTMLInputElement>('input[name="permission"][value="constrained"]');
  if (constrained) constrained.checked = true;
  controlPathKind.value = 'direct';
  syncControlPathUi();
  controlPathValue.value = '';
  slotAnchorProperty.value = '';
  slotOwnerTarget.value = '';
  slotContentOwnership.value = '';
  exclusivePath.checked = true;
  constraintType.value = 'propertyDomain';
  constraintFact.value = '';
  additionalConstraints.value = '[]';
  activeConstraintIndex = 0;
  renderConstraintEntries([{type:'propertyDomain'}]);
  additionalControlPaths.value = '[]';
  contextConditions.value = '{}';
  for (const [select] of propertyApplicabilityInputs) select.value = '';
  conditionSubject.value = 'component-root';
  contextDomains.value = '{}';
  ruleValidationMode.value = '';
  dependencyOptions(activeDependency);
  renderApplicabilityScope();
  scopeStatus.value = 'confirmed';
  executionRoute.value = 'auto';
  externalRuleIds.value = '';
  missingFacts.value = '';
  sourceRefs.value = '';
  severity.value = 'error';
  ruleStatus.value = 'draft';
  ruleOwner.value = 'design-system-authors';
  ruleOwnershipKind.value = '';
  ruleOwnershipId.value = '';
  rationale.value = '';
  ruleMessage.value = '';
  remediationMessage.value = '';
  remediationIntent.value = '';
  deleteRuleButton.disabled = true;
  renderCapabilityOptions();
  syncPermissionUi();
  renderRuleCards();
  renderQuickPolicy();
  if (authoringView === 'editor') setAuthoringView('editor', false);
  syncAllUnifiedSelects();
}

function loadRule(rule: ManualRule): void {
  ruleFormDirty = false;
  if (!workspace) return;
  clearRuleErrors();
  applicabilitySection.open = false;
  editingRuleId = rule.id;
  ruleIdInput.value = rule.id;
  ruleSelect.value = rule.id;
  const target = workspace.manual.targets.find((entry) => entry.id === rule.targetId);
  const node = target ? nodeForTarget(target) : undefined;
  selectedNodeId = node?.id || null;
  const componentPropertyName = componentPropertyNameFromCapability(rule.capability);
  capabilityInput.value = componentPropertyName ? '' : rule.capability;
  ensureComponentPropertyOption(componentPropertyName);
  componentPropertyInput.value = componentPropertyName;
  capabilitySetSelect.value = rule.capabilitySet || '';
  setPropertySourceTab(componentPropertyName ? 'component' : 'layer');
  selectedGroupCapabilities = new Set(
    rule.capabilitySet
      ? (rule.capabilitySelection || capabilitiesForSet(rule.capabilitySet))
      : [],
  );
  targetScope.value = rule.targetScope || 'self';
  boundaryPolicy.value = rule.boundaryPolicy || '';
  targetApplicability.value = rule.targetApplicability || '';
  syncCapabilityGroupUi();
  syncComponentPropertyUi();
  const permission = document.querySelector<HTMLInputElement>(`input[name="permission"][value="${rule.permission}"]`);
  if (permission) permission.checked = true;
  const control = rule.controlPaths[0];
  controlPathKind.value = control?.kind || 'direct';
  syncControlPathUi();
  controlPathValue.value = control?.kind === 'slot-api' ? control.target || '' : control?.property || control?.port || control?.variable || control?.target || '';
  slotAnchorProperty.value = control?.kind === 'slot-api' ? control.property || '' : '';
  slotOwnerTarget.value = control?.kind === 'slot-api' ? control.ownerTargetId || '' : '';
  slotContentOwnership.value = control?.kind === 'slot-api' ? control.contentOwnership || '' : '';
  exclusivePath.checked = control?.exclusive !== false;
  const constraint = rule.constraints[0] || { type: 'propertyDomain' as const };
  activeConstraintIndex = 0;
  renderConstraintEntries(rule.constraints.length ? rule.constraints : [constraint]);
  constraintType.value = constraint.type;
  constraintFact.value = constraint.fact || '';
  additionalConstraints.value = prettyJson(rule.constraints.slice(1));
  additionalControlPaths.value = prettyJson(rule.controlPaths.slice(1));
  contextConditions.value = prettyJson(rule.applicability.context || {});
  contextDomains.value = prettyJson(rule.applicability.contextDomains || {});
  for (const [select, fact] of propertyApplicabilityInputs) {
    const value = rule.propertyApplicability?.[fact] || '';
    if (!Array.from(select.options).some(option => option.value === value)) {
      const option = document.createElement('option'); option.value = value; option.textContent = `Неподдерживаемое условие: ${value}`; select.append(option);
    }
    select.value = value;
  }
  conditionSubject.value = rule.applicability.conditionSubject || 'target';
  ruleValidationMode.value = rule.applicability.validationMode || '';
  dependencyOptions(activeDependency, rule.applicability.activeDependency || '');
  if (rule.permission === 'constrained') {
    constraintSection.dataset.permission = rule.permission;
    constraintType.disabled = false;
    constraintEntrySelect.disabled = false;
    renderConstraintFields(constraint);
  } else {
    syncPermissionUi();
    if (rule.permission === 'forbidden' && constraint.type === 'propertyForbidden') renderConstraintFields(constraint);
  }
  renderApplicabilityScope(rule);
  scopeStatus.value = rule.applicability.scopeStatus || 'confirmed';
  executionRoute.value = rule.execution?.route || 'auto';
  externalRuleIds.value = rule.execution?.externalRuleIds?.join(', ') || '';
  missingFacts.value = rule.execution?.missingFacts?.join(', ') || '';
  sourceRefs.value = rule.sourceRefs?.join(', ') || '';
  severity.value = rule.severity;
  ruleStatus.value = rule.status;
  ruleOwner.value = rule.owner;
  ruleOwnershipKind.value = rule.ownership?.kind || '';
  ruleOwnershipId.value = rule.ownership?.ownerId || '';
  rationale.value = rule.rationale;
  ruleMessage.value = rule.message || '';
  remediationMessage.value = rule.remediationMessage || '';
  remediationIntent.value = rule.remediationIntent || '';
  deleteRuleButton.disabled = false;
  renderAnatomy();
  renderFocus();
  renderProperties();
  renderRuleCards();
  setAuthoringView('editor');
  syncAllUnifiedSelects();
}

function fieldValue(id: string): string {
  const field = document.getElementById(id);
  return field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement ? field.value : '';
}

function renderConstraintEntries(constraints: TypedConstraint[]): void {
  const labels: Record<string,string> = {componentSetKey:'Addon / component set',catalog:'Каталог',changed:'Исходная иконка',portName:'Активный порт',width:'Ширина иконки',height:'Высота иконки'};
  constraintEntrySelect.replaceChildren(...constraints.map((c,index) => {
    const option = document.createElement('option'); option.value=String(index);
    option.textContent=`${index+1} · ${labels[c.dependency?.field || ''] || c.type}`;return option;
  }));
  constraintEntrySelect.value=String(activeConstraintIndex);
  syncUnifiedSelect(constraintEntrySelect);
}

constraintEntrySelect.addEventListener('change', () => {
  try {
    const next=Number(constraintEntrySelect.value);
    const all=parseJsonField<TypedConstraint[]>(additionalConstraints,'Остальные ограничения','array');
    all.splice(activeConstraintIndex,0,{...constraintFromForm(),...(['configurationDomain','configurationMapping','memberCollection','instanceReplacementDomain'].includes(constraintType.value) ? {} : {fact:constraintFact.value.trim() || undefined})});
    const current=all[next];
    if (!current || all.some(c=>!c || typeof c!=='object' || !c.type)) throw new Error('Проверьте JSON остальных ограничений.');
    activeConstraintIndex=next;renderConstraintEntries(all);
    constraintType.value=current.type;constraintFact.value=current.fact || '';
    additionalConstraints.value=prettyJson(all.filter((_,index)=>index!==next));
    renderConstraintFields(current);syncAllUnifiedSelects();
  } catch(error) {
    constraintEntrySelect.value=String(activeConstraintIndex);syncUnifiedSelect(constraintEntrySelect);
    toast(error instanceof Error ? error.message : String(error),'error');
  }
});

function numberField(id: string): number | undefined {
  const value = fieldValue(id).trim();
  return value === '' || !Number.isFinite(Number(value)) ? undefined : Number(value);
}

function constraintFromForm(): TypedConstraint {
  const type = constraintType.value as TypedConstraint['type'];
  if(type==='memberCollection' && workspace)return {type,collection:readMemberCollectionForm({manual:workspace.manual,snapshot})};
  if(type==='configurationDomain') return {type,configuration:parseJsonField(element<HTMLTextAreaElement>('configurationDomain'),'Конфигурации','object')};
  if(type==='configurationMapping') return {type,mapping:parseJsonField(element<HTMLTextAreaElement>('configurationMapping'),'Соответствие спецификации','object')};
  if(type==='instanceReplacementDomain') return {type,replacement:parseJsonField(element<HTMLTextAreaElement>('instanceReplacementDomain'),'Допустимые замены','object')};
  if(type==='transitionInvariant'){
    const from=fieldValue('transitionFrom'),to=fieldValue('transitionTo'),tolerance=fieldValue('transitionTolerance').trim();
    if(!['true','false'].includes(from)||!['true','false'].includes(to)||!tolerance||!Number.isFinite(Number(tolerance)))throw new Error('Укажите true/false и числовой допуск.');
    return{type,transition:{dependencyId:fieldValue('transitionDependency').trim(),from:from==='true',to:to==='true',
      invariantFacts:commaList(fieldValue('transitionInvariants')),tolerance:Number(tolerance),evidenceProfile:'same-instance-context@1'}};
  }
  if (type === 'dependencyDomain') {
    const field = element<HTMLSelectElement>('dependencyField').value as NonNullable<TypedConstraint['dependency']>['field'];
    if(field==='changed'){
      const subjectCondition=readTypedFilterForm('dependencySubjectCondition');
      return {type,values:[false],dependency:{field,baselinePolicy:'require-domain',
        subjects:parseJsonField(element<HTMLTextAreaElement>('dependencySubjects'),'Цели зависимости','array'),
        portNames:Array.from(document.querySelectorAll<HTMLInputElement>('#dependencyIdentityPorts input:checked')).map(i=>i.value),
        ...(subjectCondition?{subjectCondition}:{})}};
    }
    const cases=parseJsonField<NonNullable<TypedConstraint['dependency']>['cases']>(element<HTMLTextAreaElement>('dependencyCases'),'Таблица соответствий','array');
    const values = field==='variantProperty'&&document.getElementById('dependencyVariantValues')?readPropertyValuePicker('dependencyVariantValues')
      :['width','height'].includes(field) ? commaValues(fieldValue('dependencyValues')) : commaList(fieldValue('dependencyValues'));
    const toleranceText = fieldValue('dependencyTolerance').trim();
    if (toleranceText && !Number.isFinite(Number(toleranceText))) throw new Error('Допуск размеров должен быть числом.');
    return {type, ...(values.length ? {values} : {}), dependency:{
      ...(fieldValue('dependencyContractId').trim()?{contractDependencyId:fieldValue('dependencyContractId').trim()}:{}),
      ...(readTypedFilterForm('dependencySubjectCondition')?{subjectCondition:readTypedFilterForm('dependencySubjectCondition')}:{}),
      subjects:parseJsonField(element<HTMLTextAreaElement>('dependencySubjects'),'Цели зависимости','array'),
      field,
      ...((field==='variantProperty'?fieldValue('dependencyVariantProperty'):fieldValue('dependencyProperty')).trim()?{property:(field==='variantProperty'?fieldValue('dependencyVariantProperty'):fieldValue('dependencyProperty')).trim()}:{}),
      ...(commaList(fieldValue('dependencyActivePorts')).length?{activePorts:commaList(fieldValue('dependencyActivePorts'))}:{}),
      ...(commaList(fieldValue('dependencyPorts')).length?{portNames:commaList(fieldValue('dependencyPorts'))}:{}),
      ...(commaList(fieldValue('dependencyCatalogs')).length?{catalogs:commaList(fieldValue('dependencyCatalogs'))}:{}),
      ...(toleranceText?{tolerance:Number(toleranceText)}:{}),
      baselinePolicy:element<HTMLSelectElement>('dependencyBaseline').value as 'require-domain'|'allow-unchanged',
      ...(fieldValue('dependencySource').trim()?{sourceFact:fieldValue('dependencySource').trim()}:{}),
      ...(cases?.length?{cases}:{}),
    }};
  }
  if (type === 'propertyDomain' || type === 'propertyExclusion') {
    const modes=document.getElementById('constraintModeValues');
    return { type, values: modes ? Array.from(modes.querySelectorAll<HTMLInputElement>('input:checked')).map(option=>option.value)
      :document.getElementById('constraintValues')?.classList.contains('property-value-picker')?readPropertyValuePicker('constraintValues'):commaValues(fieldValue('constraintValues')) };
  }
  if (type === 'presence') {
    const select = document.getElementById('constraintExpected') as HTMLSelectElement | null;
    return { type, expected: select?.value !== 'false' };
  }
  if (type === 'propertyForbidden') return { type, ...(commaList(fieldValue('baselineTargetRoles')).length ? {targetRoles:commaList(fieldValue('baselineTargetRoles')),visibleOnly:true} : {}), ...(fieldValue('baselineSource') === 'library-text' ? {baselineSource:'library-text' as const} : {}), ...(fieldValue('textNormalization').trim() ? {textNormalization:fieldValue('textNormalization').trim() as 'trim'} : {}), ...(fieldValue('exceptConfiguration').trim() ? {exceptConfiguration:parseJsonField(element<HTMLTextAreaElement>('exceptConfiguration'),'Исключение baseline','object')} : {}) };
  if (type === 'quantity' && fieldValue('constraintCountDependency')) return {
    type, min:numberField('constraintMin'), max:numberField('constraintMax'), contractDependencyId:fieldValue('constraintCountDependency'),
  };
  if (type === 'quantity') return {
    type,
    min: numberField('constraintMin'),
    max: numberField('constraintMax'),
    targetRole: fieldValue('constraintTargetRole').trim() || undefined,
    targetRoles: commaList(fieldValue('constraintTargetRoles')).length ? commaList(fieldValue('constraintTargetRoles')) : undefined,
    visibleOnly: (document.getElementById('constraintVisibleOnly') as HTMLInputElement | null)?.checked || undefined,
  };
  if (type === 'positionOrder') return {
    type,
    order: fieldValue('constraintOrder').split(',').map((value) => value.trim()).filter(Boolean),
    ...(fieldValue('constraintOrderScope') === 'structural' ? { orderScope: 'structural' as const } : {}),
  };
  if (type === 'relationship') {
    const select = document.getElementById('constraintRelation') as HTMLSelectElement | null;
    return {
      type,
      relation: select?.value as TypedConstraint['relation'],
      targetRole: fieldValue('constraintTargetRole').trim(),
    };
  }
  if (type === 'tokenBinding') {
    const required = document.getElementById('constraintBindingRequired') as HTMLInputElement | null;
    const tokenIds = fieldValue('constraintTokenIds').split(',').map((value) => value.trim()).filter(Boolean);
    return {
      type,
      ...(tokenIds.length ? { tokenIds } : {}),
      bindingRequired: required?.checked ?? true,
    };
  }
  if (type === 'styleBinding') return { type, styleCatalog: fieldValue('constraintStyleCatalog').trim() };
  if (type === 'bindingConsistency') return {type,
    bindingKind:fieldValue('constraintBindingKind') as TypedConstraint['bindingKind'],
    bindingReference:fieldValue('constraintBindingReference') as TypedConstraint['bindingReference'],
    targetRoles:commaList(fieldValue('constraintBindingRoles')),visibleOnly:true};
  const operator = (document.getElementById('constraintOperator') as HTMLSelectElement | null)?.value as TypedConstraint['operator'];
  if(operator==='at-most-line-height')return {type:'layoutConstraint',operator,fact:'bounds.height',targetRole:fieldValue('constraintLineHeightRole').trim()};
  return {
    type: 'layoutConstraint',
    operator: operator || 'equals',
    value: normalizeScalar(fieldValue('constraintValue')),
    min: numberField('constraintMin'),
    max: numberField('constraintMax'),
  };
}

function controlPathFromForm(target: SemanticTarget, capability: string): ControlPath {
  const kind = controlPathKind.value as ControlPath['kind'];
  const value = controlPathValue.value.trim();
  const control: ControlPath = { kind, required: kind !== 'direct', exclusive: exclusivePath.checked };
  if (kind === 'host-property' || kind === 'nested-property') control.property = value;
  else if (kind === 'inherited-port') control.port = value;
  else if (kind === 'variable-binding') control.variable = value;
  else if (kind === 'slot-api') { control.target = value || target.id; if (slotAnchorProperty.value.trim()) control.property = slotAnchorProperty.value.trim(); if (slotOwnerTarget.value.trim()) control.ownerTargetId = slotOwnerTarget.value.trim(); if (slotContentOwnership.value === 'external') control.contentOwnership = 'external'; }
  if (kind === 'inherited-port' && value && workspace && !workspace.manual.controlPorts.some((port) => port.id === value)) {
    workspace.manual.controlPorts.push({ id: value, label: value, targetId: target.id, capability, required: true });
  }
  return control;
}

function uniqueRuleId(base: string): string {
  const ids = new Set(workspace?.manual.rules.map((rule) => rule.id) || []);
  if (!ids.has(base) || editingRuleId === base) return base;
  let suffix = 2;
  while (ids.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function applyProtectInternals(): void {
  if (!workspace) return;
  const target = ensureRootTarget();
  if (!target) {
    toast('Сначала получите anatomy компонента.', 'warning');
    return;
  }
  const result = applyProtectInternalsPolicy(workspace.manual, target);
  workspace.manual = result.manual;
  if (result.changed) workspace.manual.metadata.updatedAt = new Date().toISOString();
  renderRuleSelect();
  renderRuleCards();
  renderQuickPolicy();
  renderHeader();
  updateCompileState();
  persistSession();
  if (result.changed) {
    toast(`Внутреннее устройство защищено: ${result.createdRuleIds.length} правил создано, ${result.updatedRuleIds.length} обновлено.`);
  } else toast('Защита внутреннего устройства уже настроена.');
}

function clearRuleErrors(): void {
  document.querySelectorAll('[data-rule-error]').forEach((node) => node.remove());
  document.querySelectorAll('[data-rule-invalid]').forEach((node) => {
    node.removeAttribute('aria-invalid');
    node.removeAttribute('aria-describedby');
    node.removeAttribute('data-rule-invalid');
  });
  element('ruleSaveErrors').replaceChildren();
  element('ruleSaveErrors').hidden = true;
}

function showRuleErrors(issues: ValidationIssue[]): void {
  clearRuleErrors();
  setStatus('Правило не сохранено · исправьте поля', 'warning');
  const summary = element('ruleSaveErrors');
  summary.hidden = false;
  summary.textContent = `Правило не сохранено. ${issues.map(validationIssueLabel).join(' ')}`;
  const fields: Record<string, string> = {
    rationale: 'rationale', id: 'ruleIdInput', capability: propertySourceTab === 'component' ? 'componentPropertyInput' : 'capabilityInput',
    ownership: ruleOwnershipKind.value ? 'ruleOwnershipId' : 'ruleOwnershipKind',
    capabilitySet: 'capabilitySetSelect', capabilitySelection: 'capabilitySetSelect',
    targetScope: 'targetScope', 'applicability/scopeStatus': 'scopeStatus',
    boundaryPolicy: 'boundaryPolicy', targetApplicability: 'targetApplicability',
    'propertyApplicability/appearance.strokeWeight': 'strokeApplicability',
    'propertyApplicability/layout.itemSpacing': 'gapApplicability',
    'propertyApplicability/layout.padding.top': 'paddingTopApplicability',
    'propertyApplicability/layout.padding.right': 'paddingRightApplicability',
    'propertyApplicability/layout.padding.bottom': 'paddingBottomApplicability',
    'propertyApplicability/layout.padding.left': 'paddingLeftApplicability',
    'propertyApplicability/layout.primaryAxisAlignItems': 'primaryAlignmentApplicability',
    'propertyApplicability/layout.counterAxisAlignItems': 'counterAlignmentApplicability',
    propertyApplicability: 'strokeApplicability',
    'execution/externalRuleIds': 'externalRuleIds', 'execution/missingFacts': 'missingFacts',
  };
  const constraintFields: Record<string, string> = {
    CONSTRAINT_VALUES: 'constraintValues', CONSTRAINT_RANGE: 'constraintMin',
    CONSTRAINT_ORDER: 'constraintOrder', CONSTRAINT_RELATION: 'constraintTargetRole',
    CONSTRAINT_TOKEN: 'constraintTokenIds',
    CONSTRAINT_DEPENDENCY: 'dependencySubjects',
    CONSTRAINT_CONFIGURATION: constraintType.value === 'configurationDomain' ? 'configurationDomain' : 'exceptConfiguration',
    CONSTRAINT_MAPPING: 'configurationMapping',
    CONSTRAINT_INSTANCE_REPLACEMENT: 'constraintType',
    MEMBER_COLLECTION_SCOPE: 'targetScope',
    MEMBER_COLLECTION: 'constraintType',
    MEMBER_COLLECTION_FIELDS: 'constraintType',
    MEMBER_COLLECTION_TYPE: 'constraintType',
  };
  let first: HTMLElement | null = null;
  issues.forEach((issue, index) => {
    const path = issue.path.replace(/^\/rules\/\d+\//, '');
    const field = document.getElementById(constraintFields[issue.code] || fields[path] || 'executionRoute');
    if (!field) return;
    revealRuleField(field);
    first ||= field;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('data-rule-invalid', 'true');
    const error = document.createElement('span');
    error.id = `rule-field-error-${index}`;
    error.className = 'rule-field-error';
    error.dataset.ruleError = 'true';
    error.textContent = validationIssueLabel(issue);
    field.setAttribute('aria-describedby', `${field.getAttribute('aria-describedby') || ''} ${error.id}`.trim());
    (field.closest('.field') || field.parentElement)?.append(error);
  });
  syncAllUnifiedSelects();
  const focus = first as HTMLElement | null;
  if (focus) {
    revealRuleField(focus);
    const control = focus instanceof HTMLSelectElement ? unifiedSelects.get(focus)?.trigger || focus : focus;
    scrollRuleControlIntoView(control);
    if (focus instanceof HTMLSelectElement) focusSelectControl(focus);
    else focus.focus({preventScroll: true});
  }
}

function saveRule(): void {
  if (!workspace) return;
  clearRuleErrors();
  const originalManual = JSON.parse(JSON.stringify(workspace.manual)) as ManualSource;
  // Editing a declaration does not require a live node and never rebinds its target.
  const target = editingRuleId ? editedRuleTarget() : ensureCurrentTarget();
  if (!target) {
    toast(editingRuleId
      ? 'Цель правила отсутствует в manual source. Восстановите цель или загрузите полный пакет.'
      : 'Сначала выберите semantic target.', 'warning');
    return;
  }
  const capabilitySet = capabilitySetSelect.value || undefined;
  const capability = capabilitySet ? '' : selectedCapability();
  if (!capability && !capabilitySet) {
    workspace.manual = originalManual;
    showRuleErrors([{ level: 'error', code: 'RULE_CAPABILITY', path: '/rules/0/capability', message: 'Выберите свойство.' }]);
    toast('Выберите capability или версионированную группу.', 'warning');
    if (propertySourceTab === 'component') focusSelectControl(componentPropertyInput);
    else capabilityInput.focus({ preventScroll: true });
    return;
  }
  const capabilitySelection = capabilitySet
    ? capabilitiesForSet(capabilitySet).filter((entry) => selectedGroupCapabilities.has(entry))
    : undefined;
  if (capabilitySet && !capabilitySelection?.length) {
    workspace.manual = originalManual;
    showRuleErrors([{ level: 'error', code: 'RULE_CAPABILITY_SELECTION_EMPTY', path: '/rules/0/capabilitySelection', message: 'Выберите хотя бы одно свойство группы.' }]);
    toast('Выберите хотя бы одно свойство внутри группы.', 'warning');
    capabilitySetList.focus({preventScroll: true});
    return;
  }
  const permission = selectedPermission();
  const baseId = `component:${workspace.manual.component.contractId}.${target.semanticRole}.${slug(capabilitySet || capability)}`;
  const requestedRuleId = ruleIdInput.value.trim();
  const route = executionRoute.value as RuleExecutionRoute;
  const previousRule = workspace.manual.rules.find((entry) => entry.id === editingRuleId);
  const propertyApplicability = { ...previousRule?.propertyApplicability };
  for (const [select, fact] of propertyApplicabilityInputs) {
    if (select.value) (propertyApplicability as Record<string,string>)[fact] = select.value;
    else delete propertyApplicability[fact];
  }
  let extras: TypedConstraint[];
  let extraControls: ControlPath[];
  let context: NonNullable<ManualRule['applicability']['context']>;
  let domains: NonNullable<ManualRule['applicability']['contextDomains']>;
  let primaryConstraint: TypedConstraint | undefined;
  try {
    if (permission === 'constrained' || permission === 'forbidden' && document.getElementById('exceptConfiguration')) primaryConstraint = constraintFromForm();
    extras = parseJsonField<TypedConstraint[]>(additionalConstraints, 'Дополнительные ограничения', 'array');
    extraControls = parseJsonField<ControlPath[]>(additionalControlPaths, 'Дополнительные control paths', 'array');
    context = parseJsonField<NonNullable<ManualRule['applicability']['context']>>(contextConditions, 'Semantic API условия', 'object');
    domains = parseJsonField<NonNullable<ManualRule['applicability']['contextDomains']>>(contextDomains, 'Semantic API набор значений', 'object');
    if (extras.some((entry) => !entry || typeof entry !== 'object' || Array.isArray(entry))) throw new Error('Каждое дополнительное ограничение должно быть объектом.');
    if (extraControls.some((entry) => !entry || typeof entry !== 'object' || Array.isArray(entry))) throw new Error('Каждый control path должен быть объектом.');
  } catch (error) {
    workspace.manual = originalManual;
    toast(error instanceof Error ? error.message : String(error), 'error');
    return;
  }
  const forbidden = permission === 'forbidden' ? forbiddenConstraintsForEdit(previousRule, { capability, capabilitySet, capabilitySelection },
    Boolean(componentPropertyNameFromCapability(capability)) && typeof componentPropertyValue(componentPropertyNameFromCapability(capability)) === 'boolean'
      ? [{ type: 'propertyDomain', values: [false] }] : []) : [];
  if (primaryConstraint?.type === 'propertyForbidden' && forbidden[0]?.type === 'propertyForbidden') {
    forbidden[0] = { ...forbidden[0] };
    delete forbidden[0].exceptConfiguration;
    if (primaryConstraint.exceptConfiguration) forbidden[0].exceptConfiguration = primaryConstraint.exceptConfiguration;
    delete forbidden[0].baselineSource;
    if (primaryConstraint.baselineSource) forbidden[0].baselineSource = primaryConstraint.baselineSource;
    delete forbidden[0].textNormalization;
    if (primaryConstraint.textNormalization) forbidden[0].textNormalization = primaryConstraint.textNormalization;
  }
  const rule: ManualRule = {
    id: editingRuleId || requestedRuleId || uniqueRuleId(baseId),
    targetId: target.id,
    targetScope: targetScope.value as TargetScope,
    ...(boundaryPolicy.value ? { boundaryPolicy: boundaryPolicy.value as ManualRule['boundaryPolicy'] } : {}),
    ...(targetApplicability.value ? { targetApplicability: targetApplicability.value as ManualRule['targetApplicability'] } : {}),
    capability,
    capabilitySet,
    capabilitySelection,
    permission,
    ...(Object.keys(propertyApplicability).length ? { propertyApplicability } : {}),
    controlPaths: primaryConstraint?.type === 'instanceReplacementDomain' ? previousRule?.controlPaths || [] : permission === 'forbidden' ? [] : [controlPathFromForm(target, capabilitySet || capability), ...extraControls],
    constraints: permission === 'constrained'
      ? [...extras.slice(0,activeConstraintIndex),{ ...primaryConstraint!, ...(['configurationDomain','configurationMapping','memberCollection','instanceReplacementDomain'].includes(primaryConstraint?.type || '') ? {} : {fact: constraintFact.value.trim() || undefined}) }, ...extras.slice(activeConstraintIndex)]
      : permission === 'forbidden'
        ? forbidden
        : [],
    applicability: mergeEditedApplicability(previousRule?.applicability, {
      variants: selectedVariantScope(),
      modes: selectedModeScope(),
      platforms: previousRule?.applicability.platforms ?? (workspace.manual.component.platform === 'universal' ? [] : [workspace.manual.component.platform]),
      products: selectedFlatScope(productScopeOptions, productScopeCustom),
      channels: selectedFlatScope(channelScopeOptions, channelScopeCustom),
      scopeStatus: scopeStatus.value as NonNullable<ManualRule['applicability']['scopeStatus']>,
      context,
      contextDomains: domains,
      conditionSubject: conditionSubject.value as 'target' | 'component-root',
      validationMode: ruleValidationMode.value === 'specification' ? 'specification' : undefined,
      activeDependency: activeDependency.value || undefined,
    }),
    severity: severity.value as Severity,
    rationale: rationale.value.trim(),
    message: ruleMessage.value.trim() || undefined,
    remediationMessage: remediationMessage.value.trim() || undefined,
    remediationIntent: remediationIntent.value.trim() || undefined,
    status: ruleStatus.value as RuleStatus,
    owner: ruleOwner.value.trim(),
    ...(ruleOwnershipKind.value ? { ownership: { kind: ruleOwnershipKind.value as NonNullable<ManualRule['ownership']>['kind'], ownerId: ruleOwnershipId.value.trim() } } : {}),
    sourceRefs: commaList(sourceRefs.value),
    execution: {
      route,
      externalRuleIds: commaList(externalRuleIds.value),
      missingFacts: commaList(missingFacts.value),
    },
  };
  const index = workspace.manual.rules.findIndex((entry) => entry.id === editingRuleId);
  if (rule.ownership) workspace.manual.metadata.ruleOwnershipVersion = 1;
  const errors = validateRuleEdit(workspace.manual, rule, editingRuleId);
  if (errors.length) {
    workspace.manual = originalManual;
    showRuleErrors(errors);
    toast('Правило не сохранено: исправьте выделенные поля.', 'error');
    return;
  }
  if (index >= 0) workspace.manual.rules[index] = rule;
  else workspace.manual.rules.push(rule);
  workspace.manual.rules.sort((left, right) => left.id.localeCompare(right.id));
  workspace.manual.metadata.revision += 1;
  workspace.manual.metadata.updatedAt = new Date().toISOString();
  editingRuleId = null;
  ruleFormDirty = false;
  setAuthoringView('list');
  renderRuleSelect();
  ruleSelect.value = '';
  deleteRuleButton.disabled = true;
  renderRuleCards();
  renderQuickPolicy();
  renderHeader();
  updateCompileState();
  persistSession();
  toast(index >= 0 ? 'Правило обновлено.' : 'Правило добавлено.');
}

function deleteRule(): void {
  if (!workspace || !editingRuleId) return;
  const rules = workspace.manual.rules.filter((rule) => rule.id !== editingRuleId);
  if (rules.length === workspace.manual.rules.length) return;
  workspace.manual.rules = rules;
  workspace.manual.metadata.revision += 1;
  workspace.manual.metadata.updatedAt = new Date().toISOString();
  resetRuleForm();
  renderRuleSelect();
  renderRuleCards();
  renderQuickPolicy();
  renderHeader();
  updateCompileState();
  persistSession();
  setAuthoringView('list');
  toast('Правило удалено.', 'warning');
}

function updateCompileState(): void {
  clearTestPresentation();
  if (!workspace) {
    lastCompiled = null;
    compileSummary.textContent = 'Нет импортированного источника';
    compileDetails.textContent = 'Compiled JSON всегда read-only';
    return;
  }
  try {
    const result = compileManualSource(workspace.manual, workspace.variantEvidence, workspace.dependencyContracts);
    lastCompiled = result.contract;
    const errors = result.issues.filter((issue) => issue.level === 'error').length;
    const warnings = result.issues.filter((issue) => issue.level === 'warning').length;
    const readiness = buildContractReadiness(result, workspace.manual);
    compileSummary.textContent = `Контракт: ${readiness.status === 'ready' ? 'готов к исполнению' : 'Draft'} · ${readiness.activeRules} правил`;
    compileDetails.textContent = `${readiness.unimplementedRules} не исполняются в Editor · ${errors} ошибок · ${warnings} предупреждений`;
    if (readiness.ownership) {
      const o = readiness.ownership;
      compileDetails.textContent += ` · Компонент: ${o.component.rules} правил / ${o.component.unimplementedRuleIds.length} не реализовано · Применение: ${o.usage.rules} / ${o.usage.unimplementedRuleIds.length} · Без владельца: ${o.unclassified.rules}`;
    }
    compileDetails.title = compileDetails.textContent;
    compileSummary.title = 'Готовность всего пакета; не зависит от Product и варианта текущего экземпляра.';
    setStatus(errors ? 'Требует исправлений' : 'Manual source сохранён', errors || warnings ? 'warning' : 'ready');
    compiledOutput.textContent = JSON.stringify(result.contract, null, 2);
  } catch (error) {
    lastCompiled = null;
    compileSummary.textContent = 'Ошибка компиляции';
    compileDetails.textContent = error instanceof Error ? error.message : String(error);
    setStatus('Ошибка компиляции', 'warning');
  }
}

function countLabel(classification: string, count: number): string {
  if (classification === 'violation') {
    const suffix = count % 10 === 1 && count % 100 !== 11 ? 'нарушение'
      : ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? 'нарушения' : 'нарушений');
    return `${count} ${suffix}`;
  }
  if (classification === 'compliant') return `${count} пройдено`;
  if (classification === 'human-review') return `${count} требуют проверки`;
  if (classification === 'not-evaluable') return `${count} нельзя проверить`;
  if (classification === 'not-applicable') return `${count} не применяются`;
  if (classification === 'not-executed') return `${count} не выполнено`;
  return `${count} ${classification}`;
}

function valueText(value: unknown): string {
  if (value === undefined) return '—';
  if (value && typeof value === 'object' && !Array.isArray(value) && (value as Record<string, unknown>).state) {
    const state = String((value as Record<string, unknown>).state);
    return state === 'absent' ? 'значение отсутствует' : `состояние: ${state}`;
  }
  const serialized = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  if (!serialized) return String(value);
  return serialized;
}

function appendDiagnosticValue(box: HTMLElement, value: unknown, factPath: string): void {
  const fullText = diagnosticValueText(value, factPath);
  const summary = paintDiagnosticSummary(value);
  const code = document.createElement('code');
  code.textContent = summary || fullText;
  code.className = summary ? 'test-paint-summary' : 'test-plain-value';
  box.append(code);
  if (summary || fullText.length > 240) {
    if (!summary) code.hidden = true;
    const details = document.createElement('details');
    details.className = 'test-raw-value';
    const heading = document.createElement('summary');
    heading.textContent = 'Полный JSON';
    const raw = document.createElement('code');
    raw.textContent = fullText;
    details.append(heading, raw);
    box.append(details);
  }
}

const PRODUCT_VALUE_LABELS: Record<string, string> = {
  ab: 'Альфа-Бизнес',
  abm: 'Альфа-Бизнес Мобайл',
  am: 'Альфа-Мобайл',
  ao: 'Альфа-Онлайн',
  site: 'Сайт',
};

function diagnosticValueText(value: unknown, factPath: string): string {
  if (factPath !== 'page.context.product') return valueText(value);
  const decorate = (id: unknown): string => {
    const key = String(id);
    return PRODUCT_VALUE_LABELS[key] ? `${PRODUCT_VALUE_LABELS[key]} (${key})` : key;
  };
  if (Array.isArray(value)) return value.map(decorate).join(', ');
  if (typeof value === 'string') return decorate(value);
  return valueText(value);
}

function focusTestNode(nodeId: string): void {
  if (!anatomy.some((node) => node.id === nodeId)) return;
  selectedNodeId = nodeId;
  renderAnatomy();
  renderFocus();
  renderProperties();
  testDetailsDialog.close();
}

function renderTestDetails(): void {
  const counts = new Map<string, number>();
  lastTestDetails.forEach((detail) => counts.set(detail.classification, (counts.get(detail.classification) || 0) + 1));
  const filters = ['violation', 'not-executed', 'human-review', 'not-evaluable', 'compliant', 'not-applicable']
    .filter((classification) => counts.has(classification));
  filters.push('all');
  testFilterBar.replaceChildren();
  filters.forEach((classification) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `test-filter-button ${classification}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(activeTestFilter === classification));
    button.textContent = classification === 'all'
      ? `Все · ${lastTestDetails.length}`
      : countLabel(classification, counts.get(classification) || 0);
    button.addEventListener('click', () => {
      activeTestFilter = classification;
      renderTestDetails();
    });
    testFilterBar.append(button);
  });

  const visible = activeTestFilter === 'all'
    ? lastTestDetails
    : lastTestDetails.filter((detail) => detail.classification === activeTestFilter);
  testDetailsTitle.textContent = activeTestFilter === 'all'
    ? 'Все результаты проверки'
    : countLabel(activeTestFilter, visible.length);
  const affectedNodes = new Set(visible.map((detail) => detail.nodeId).filter(Boolean)).size;
  testDetailsSummary.textContent = activeTestFilter === 'not-executed'
    ? 'Ограничения не были проверены. Это пробелы проверки, а не подтверждённые нарушения макета.'
    : `${workspace?.manual.component.family || 'Компонент'} · ${affectedNodes} затронутых узлов${affectedNodes ? ' · нажмите «Показать в Anatomy» для перехода' : ''}`;
  const rawCount = visible.reduce((sum, detail) => sum + detail.evaluations.length, 0);
  if (rawCount > visible.length) {
    testDetailsSummary.textContent += ` · Карточек: ${visible.length}, результатов правил: ${rawCount}. Полный список сохранён в JSON.`;
  }
  testDetailList.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'test-detail-empty';
    empty.textContent = 'В этой категории нет результатов.';
    testDetailList.append(empty);
    return;
  }

  visible.forEach((detail) => {
    const card = document.createElement('article');
    card.className = `test-detail-card ${detail.classification}`;
    const accent = document.createElement('span');
    accent.className = 'test-detail-accent';
    accent.setAttribute('aria-hidden', 'true');
    const main = document.createElement('div');
    main.className = 'test-detail-main';
    const kicker = document.createElement('div');
    kicker.className = 'test-detail-kicker';
    if (workspace?.manual.metadata.ruleOwnershipVersion === 1) {
      const owners = detail.evaluations.map(entry => {
        const atomic = lastCompiled?.rules.find(rule => rule.ruleId === entry.ruleId);
        const sourceId = String((atomic?.source as Record<string, unknown>)?.anchor || entry.ruleId);
        const rule = workspace!.manual.rules.find(rule => rule.id === sourceId);
        if (!rule) return 'Вложенный контракт / общая диагностика';
        const labels: Record<string,string> = { component: 'Сам компонент', 'product-policy': 'Продуктовая политика', pattern: 'Паттерн', 'editorial-policy': 'Редакционная политика' };
        return rule.ownership ? `${labels[rule.ownership.kind] || 'Не классифицировано'} · ${rule.ownership.ownerId}` : 'Без владельца';
      });
      const ownership = document.createElement('span');
      ownership.className = 'test-capability';
      ownership.textContent = [...new Set(owners)].join(' / ');
      kicker.append(ownership);
    }
    const classification = document.createElement('span');
    classification.className = 'test-classification';
    classification.textContent = detail.classificationLabel;
    const severityBadge = document.createElement('span');
    severityBadge.className = 'test-severity';
    severityBadge.textContent = detail.severity;
    const capability = document.createElement('code');
    capability.className = 'test-capability';
    capability.textContent = displayCapabilityLabel((detail.evaluations.length > 1 ? detail.factPath : detail.capability) || detail.factPath || 'rule');
    kicker.append(classification, severityBadge, capability);
    const title = document.createElement('h3');
    title.textContent = detail.nodeName;
    const reason = document.createElement('p');
    reason.className = 'test-detail-reason';
    reason.textContent = detail.reasonLabel;
    const ruleTitle = document.createElement('p');
    ruleTitle.className = 'test-rule-title';
    ruleTitle.textContent = detail.evaluations.length > 1
      ? `Одно отличие · срабатываний правил: ${detail.evaluations.length}`
      : `Правило: ${detail.ruleTitle}`;
    const path = document.createElement('p');
    path.className = 'test-node-path';
    path.textContent = detail.classification === 'not-executed' ? detail.ruleId : detail.nodePath;
    main.append(kicker, title, reason, ruleTitle, path);
    const ruleDetails = document.createElement('details');
    ruleDetails.className = 'test-rule-sources';
    const ruleSummary = document.createElement('summary');
    ruleSummary.textContent = detail.evaluations.length > 1 ? 'Сработавшие правила и RuleID' : 'RuleID';
    const ruleList = document.createElement('ul');
    detail.evaluations.forEach((evaluation) => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${evaluation.ruleTitle} · ${evaluation.severity}`;
      const id = document.createElement('code');
      id.textContent = evaluation.ruleId;
      item.append(label, id);
      ruleList.append(item);
    });
    ruleDetails.append(ruleSummary, ruleList);
    main.append(ruleDetails);

    if (detail.showComparison) {
      const diff = document.createElement('div');
      diff.className = 'test-value-diff';
      const actual = document.createElement('div');
      actual.className = 'test-value-box';
      const actualLabel = document.createElement('span');
      actualLabel.textContent = detail.actualLabel;
      actual.append(actualLabel);
      appendDiagnosticValue(actual, detail.actual, detail.factPath);
      const arrow = document.createElement('span');
      arrow.className = 'test-value-arrow';
      arrow.textContent = detail.comparisonSymbol;
      arrow.setAttribute('aria-hidden', 'true');
      const expected = document.createElement('div');
      expected.className = 'test-value-box';
      const expectedLabel = document.createElement('span');
      expectedLabel.textContent = detail.expectedLabel;
      expected.append(expectedLabel);
      appendDiagnosticValue(expected, detail.expected, detail.factPath);
      diff.append(actual, arrow, expected);
      main.append(diff);
    }

    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'button button-secondary test-detail-action';
    action.textContent = 'Показать в Anatomy';
    action.addEventListener('click', () => focusTestNode(detail.nodeId));
    card.append(accent, main);
    if (!detail.scopeMismatch && anatomy.some((node) => node.id === detail.nodeId)) card.append(action);
    testDetailList.append(card);
  });
}

function openTestDetails(classification: string): void {
  activeTestFilter = classification;
  renderTestDetails();
  testDetailsDialog.showModal();
}

function clearTestPresentation(): void {
  lastValidationDownload = null;
  downloadReportButton.disabled = true;
  element('testCompleteness').hidden = true;
  element('ownershipCompleteness').hidden = true;
  testResults.replaceChildren();
  testClassifications = new Map();
  testNodeCounts = new Map();
  lastTestDetails = [];
  if (testDetailsDialog.open) testDetailsDialog.close();
}

function renderTestResult(result: Record<string, unknown>, contract: CompiledContract): void {
  testResults.replaceChildren();
  lastTestDetails = groupEvaluationDetails(buildEvaluationDetails(result, contract, anatomy));
  testClassifications = new Map();
  testNodeCounts = new Map();
  const classificationPriority: Record<string, number> = {
    violation: 5,
    'human-review': 4,
    'not-evaluable': 3,
    compliant: 2,
    'not-applicable': 1,
  };
  lastTestDetails.forEach((evaluation) => {
    const nodeId = evaluation.nodeId;
    const classification = evaluation.classification;
    const previous = testClassifications.get(nodeId);
    if (nodeId && (!previous || (classificationPriority[classification] || 0) > (classificationPriority[previous] || 0))) {
      testClassifications.set(nodeId, classification);
    }
  });
  testClassifications.forEach((classification, nodeId) => {
    testNodeCounts.set(nodeId, lastTestDetails.filter((evaluation) => (
      evaluation.nodeId === nodeId && evaluation.classification === classification
    )).length);
  });
  renderAnatomy();
  if (!lastTestDetails.length) {
    const empty = document.createElement('span');
    empty.className = 'hint';
    empty.textContent = 'Нет исполняемых правил для сценария.';
    testResults.append(empty);
    return;
  }
  const counts = new Map<string, number>();
  lastTestDetails.forEach((evaluation) => {
    const classification = String(evaluation.classification || 'unknown');
    counts.set(classification, (counts.get(classification) || 0) + 1);
  });
  ['violation', 'not-executed', 'human-review', 'not-evaluable', 'compliant', 'not-applicable'].forEach((classification) => {
    const count = counts.get(classification);
    if (!count) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `result-chip ${classification}`;
    const title = document.createElement('strong');
    title.textContent = countLabel(classification, count);
    const detail = document.createElement('span');
    detail.textContent = classification === 'violation' ? 'Открыть и сравнить' : 'Открыть список';
    const rawCount = lastTestDetails.filter(entry => entry.classification === classification)
      .reduce((sum, entry) => sum + entry.evaluations.length, 0);
    if (rawCount > count) detail.textContent = `Срабатываний правил: ${rawCount} · открыть`;
    chip.append(title, detail);
    chip.addEventListener('click', () => openTestDetails(classification));
    testResults.append(chip);
  });
}

function assertAuthoringSource(): void {
  if (workspace?.manual.source.kind === 'component-contract-v2') {
    throw new Error('Нужен authoring ZIP с исходным contract.manual.json. Compiled JSON доступен только как read-only evidence; восстановить все правила из него нельзя.');
  }
}

function compileForExecution() {
  if (!workspace) return null;
  try {
    assertAuthoringSource();
    const result = compileManualSource(workspace.manual, workspace.variantEvidence, workspace.dependencyContracts);
    const errors = result.issues.filter(issue => issue.level === 'error');
    if (errors.length) throw new Error(`Контракт содержит ошибки компиляции (${errors.length}). Исправьте источник перед проверкой: ${errors[0].message}`);
    return result;
  } catch (error) {
    clearTestPresentation();
    setStatus('Контракт требует исправлений', 'warning');
    toast(error instanceof Error ? error.message : String(error), 'error');
    return null;
  }
}

function runTest(): void {
  if (!workspace || !snapshot) return;
  if (!validationProductSelect.value) {
    toast('Сначала выберите Product проверки.', 'warning');
    return;
  }
  try {
    clearTestPresentation();
    const compiled = compileForExecution();
    if (!compiled) return;
    const authoringContract = prepareAuthoringPreviewContract(compiled.contract);
    const sourceSnapshot=validationSnapshot(snapshot);
    const mode = requestedValidationMode;
    if (authoringContract.runtimePolicy.validationModeVersion === 1) sourceSnapshot.validationRequest = { version: 1, mode };
    else delete sourceSnapshot.validationRequest;
    delete sourceSnapshot.validationIntent;
    if ([1,2].includes(authoringContract.runtimePolicy.validationIntentVersion || 0)
      && (authoringContract.runtimePolicy.validationModeVersion !== 1 || mode === 'specification')) {
      sourceSnapshot.validationIntent = createValidationIntent(sourceSnapshot, authoringContract,
        requestedValidationInputs);
    }
    if(transitionBefore)sourceSnapshot.transitionBefore=transitionBefore;
    else delete sourceSnapshot.transitionBefore;
    const checkedSnapshot = prepareValidationSnapshot(sourceSnapshot, authoringContract);
    const engineResult = evaluateCompiledContract(checkedSnapshot, authoringContract);
    const result = buildEditorValidationReport(engineResult, compiled, workspace.manual, checkedSnapshot, {hiddenTargetCoverageVersion:1});
    renderTestResult(result, authoringContract);
    lastValidationDownload = buildValidationReportDownload({
      manual: workspace.manual, compiled, evaluatedContract: authoringContract,
      snapshot: checkedSnapshot, anatomy, engineResult, result,
      capture: snapshotCapture, trigger: 'selected-instance',
    });
    downloadReportButton.disabled = false;
    const coverage = result.scenarioCoverage;
    const completeness = element('testCompleteness');
    completeness.hidden = false;
    completeness.className = `test-completeness ${coverage.complete ? 'complete' : 'incomplete'}`;
    completeness.textContent = coverage.complete
      ? `Этот сценарий: проверка завершена. Неприменимых правил пакета: ${coverage.excludedRules}. Это не означает отсутствие нарушений или готовность всего контракта.`
      : `Этот сценарий: проверка неполная · не выполнено: ${coverage.notExecuted}${coverage.unknownApplicabilityRules ? ` (у ${coverage.unknownApplicabilityRules} применимость неизвестна)` : ''}${coverage.inconclusive ? ` · без однозначного результата: ${coverage.inconclusive}` : ''} · неприменимых правил пакета: ${coverage.excludedRules}.`;
    if (coverage.validationMode) completeness.textContent = `${coverage.validationMode === 'component-audit' ? 'Аудит компонента. Соответствие спецификации не проверялось.' : 'По спецификации, включая аудит компонента.'} ${completeness.textContent}`;
    if(checkedSnapshot.source?.nativeSlotCaptureScope)completeness.textContent+=' Внешнее содержимое SLOT не проверялось; проверены host и граница слота.';
    const captureGuidance = captureDiagnostics(checkedSnapshot, workspace.manual);
    if (captureGuidance.length) completeness.textContent += ' ' + captureGuidance.join(' ');
    setStatus(coverage.complete ? 'Проверка завершена' : 'Проверка неполная', coverage.complete ? 'ready' : 'warning');
    const ownership = result.ownershipCoverage;
    if (ownership) {
      const labels: Record<string,string> = { 'not-evaluated': 'нет проверок', incomplete: 'неполная', 'not-applicable': 'не применяется', violations: 'есть нарушения', checked: 'проверено' };
      const summary = (label: string, group: typeof ownership.component) => `${label}: ${labels[group.status]} (${group.violations} нарушений; ${group.notExecuted + group.inconclusive} пробелов)`;
      const element = document.getElementById('ownershipCompleteness')!;
      element.hidden = false;
      element.textContent = [summary('Сам компонент', ownership.component), summary('Применение', ownership.usage),
        ...(ownership.dependencies.evaluations ? [summary('Вложенные контракты', ownership.dependencies)] : []),
        ...(ownership.unclassified.evaluations ? [`Без подтверждённого владельца: ${ownership.unclassified.evaluations}`] : []),
        ...(ownership.infrastructure.evaluations ? [summary('Общие пробелы', ownership.infrastructure)] : []),
        'Только требования загруженного пакета; не проверка всех возможных паттернов.'].join(' · ');
    }
    const draftRules = compiled.contract.rules.filter((rule) => (
      (rule.authority as Record<string, unknown> | undefined)?.status === 'draft'
    )).length;
    toast(
      coverage.complete
        ? 'Проверка завершена. Результаты доступны в правой панели.'
        : 'Проверка неполная. Откройте результаты в правой панели.',
      coverage.complete ? undefined : 'warning',
    );
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), 'error');
  }
}

function requestSelectionTest(intent:'validate'|'before'='validate'): void {
  if (!workspace) return;
  selectionTestIntent=intent;
  if (!validationProductSelect.value) {
    toast('Сначала выберите Product проверки.', 'warning');
    return;
  }
  const result = compileForExecution();
  if (!result) return;
  clearPreviewTimeout();
  pendingPreviewRequest = '';
  clearTestPresentation();
  const compiled = result.contract;
  const requestId = nextRequestId('selection-test');
  pendingSelectionTestRequest = requestId;
  requestedValidationMode = selectedValidationMode();
  requestedValidationInputs = readValidationInputs();
  renderHeader();
  testSelectionButton.disabled = true;
  setStatus('Проверяем выделенный instance', 'busy');
  post({
    type: 'test-selection',
    requestId,
    componentKey: workspace.manual.component.componentKey,
    acceptedComponentKeys: [],
    representations: compiled.facts.representations,
    allowedComponentProperties: allowedComponentPropertyNames(compiled),
    platform: workspace.manual.component.platform,
    manualSourceHash: compiled.package.manualSourceHash,
    nativeSlotCapturePlan: nativeSlotCapturePlan(compiled),
    captureTransitionContext: compiled.runtimePolicy.transitionFactsVersion===1,
    expectedRootNodeId: selectedRootNodeId || undefined,
    componentDependencyKeys: componentDependencyKeys(compiled),
    directChildDependenciesVersion:compiled.runtimePolicy.directChildDependenciesVersion,
    instanceMainComponentAliasesVersion:compiled.runtimePolicy.instanceMainComponentAliasesVersion,
  });
}

function renderLivePreview(): void {
  if (!workspace) return;
  const result = compileForExecution();
  if (!result) return;
  clearTestPresentation();
  const variant = matchingVariant();
  activeVariant = variant;
  const componentKey = variant?.componentKey || workspace.manual.component.componentKey;
  if (!componentKey) {
    previewLoading.hidden = true;
    previewEmpty.hidden = false;
    componentStage.hidden = true;
    toast('В пакете нет componentKey — доступен только контрактный authoring.', 'warning');
    return;
  }
  const requestId = nextRequestId('preview');
  if (previewTimeoutId !== undefined) window.clearTimeout(previewTimeoutId);
  pendingPreviewRequest = requestId;
  previewEmpty.hidden = true;
  componentStage.hidden = true;
  previewLoading.hidden = false;
  setStatus('Рендерим preview', 'busy');
  const compiled = result.contract;
  post({
    type: 'render-preview',
    requestId,
    componentKey,
    variantProperties: scenarioProperties,
    componentDependencyKeys: componentDependencyKeys(compiled),
    directChildDependenciesVersion:compiled.runtimePolicy.directChildDependenciesVersion,
    instanceMainComponentAliasesVersion:compiled.runtimePolicy.instanceMainComponentAliasesVersion,
    representations: compiled.facts.representations,
    modes: activeModes,
    platform: workspace.manual.component.platform,
  });
  previewTimeoutId = window.setTimeout(() => {
    if (pendingPreviewRequest !== requestId) return;
    pendingPreviewRequest = '';
    previewLoading.hidden = true;
    if (previewImage.hasAttribute('src')) componentStage.hidden = false;
    else previewEmpty.hidden = false;
    setStatus('Preview не ответил', 'warning');
    toast('Figma preview превысил 20 секунд. Можно продолжить authoring по импортированным facts или повторить сценарий.', 'warning');
  }, 20000);
}

function clearPreviewTimeout(): void {
  if (previewTimeoutId !== undefined) window.clearTimeout(previewTimeoutId);
  previewTimeoutId = undefined;
}

function setPreviewImage(dataUrl: string, width: number, height: number): void {
  previewImage.src = dataUrl;
  previewImage.style.width = `${Math.max(1, width)}px`;
  previewImage.style.height = `${Math.max(1, height)}px`;
  previewDimensions.textContent = `${Math.round(width)} × ${Math.round(height)}`;
  previewEmpty.hidden = true;
  previewLoading.hidden = true;
  componentStage.hidden = false;
  applyZoom();
}

function applyZoom(): void {
  componentStage.style.transform = `scale(${zoom})`;
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;
}

function showImportWarnings(warnings: string[]): void {
  warnings.forEach(warning => {
    if (warning === 'No structure signature found. Live Figma preview can repopulate the anatomy tree.') {
      if (!anatomy.length) toast('Пакет загружен. Дерево слоёв появится после preview; существующие правила можно редактировать.');
    } else toast(warning, 'warning');
  });
}

function loadWorkspace(next: ImportedWorkspace, shouldRender = true, shouldPersist = true): void {
  transitionBefore=null;
  validationInputSignature = '';
  requestedValidationInputs = {};
  validationPurposeSelect.value = 'component-audit';
  requestedValidationMode = 'component-audit';
  if (remapDialog.open) remapDialog.close();
  clearPreviewTimeout();
  clearTestPresentation();
  workspace = next;
  anatomy = next.anatomy;
  snapshot = null;
  snapshotCapture = null;
  selectedNodeId = anatomy[0]?.id || null;
  activeVariant = next.variants[0] || null;
  scenarioProperties = { ...(activeVariant?.properties || {}) };
  activeModes = {};
  availableModes = [];
  editingRuleId = null;
  setAuthoringView('list', false);
  renderHeader();
  renderScenarioControls();
  renderAnatomy();
  renderFocus();
  renderProperties();
  renderRuleSelect();
  resetRuleForm();
  updateCompileState();
  if (shouldPersist) persistSession();
  showImportWarnings(next.warnings);
  if (shouldRender && next.hasVariantEvidence) {
    previewEmptyDescription.textContent = 'Плагин временно импортирует экземпляр по variant componentKey, экспортирует изображение и удаляет служебную страницу.';
    renderLivePreview();
  } else if (shouldRender) {
    previewLoading.hidden = true;
    componentStage.hidden = true;
    previewEmpty.hidden = false;
    previewEmptyDescription.textContent = 'В manual source нет variant keys. На вкладке «Проверка» выберите instance этого компонента и нажмите «Проверить».';
    setStatus('Контракт загружен · выберите instance', 'ready');
  }
}

function loadManualKeepingPreview(next: ImportedWorkspace): void {
  if (!workspace || !snapshot) {
    loadWorkspace(next);
    return;
  }
  clearTestPresentation();
  const retained = workspace;
  workspace = {
    ...next,
    anatomy,
    variantEvidence: next.variantEvidence || retained.variantEvidence,
    dependencyContracts: next.dependencyContracts?.length ? next.dependencyContracts : retained.dependencyContracts,
    variants: retained.variants,
    hasVariantEvidence: retained.hasVariantEvidence,
    tokens: Array.from(new Set([...retained.tokens, ...next.tokens])).sort(),
  };
  reconcileTargets(anatomy, snapshot);
  selectedNodeId = anatomy.some((node) => node.id === selectedNodeId) ? selectedNodeId : anatomy[0]?.id || null;
  editingRuleId = null;
  setAuthoringView('list', false);
  renderHeader();
  renderScenarioControls();
  renderAnatomy();
  renderFocus();
  renderProperties();
  renderRuleSelect();
  resetRuleForm();
  updateCompileState();
  persistSession();
  setStatus('Manual rules загружены · preview сохранён', 'ready');
  showImportWarnings(next.warnings);
  toast('Manual rules заменены. Текущий preview и snapshot сохранены.');
}

async function importFiles(files: File[]): Promise<void> {
  setStatus('Читаем пакет', 'busy');
  const textFiles: Array<{ name: string; text: string }> = [];
  for (const file of files) {
    if (/\.zip$/i.test(file.name)) {
      const entries = await readZip(new Uint8Array(await file.arrayBuffer()));
      entries.filter((entry) => /\.json$/i.test(entry.name)).forEach((entry) => {
        textFiles.push({ name: entry.name, text: zipEntryText(entry) });
      });
    } else {
      textFiles.push({ name: file.name, text: await file.text() });
    }
  }
  importedSourceFiles = textFiles;
  componentWorkspaceCache.clear();
  const next = importWorkspace(textFiles);
  transitionBefore = null;
  componentWorkspaceCache.set(next.manual.component.contractId, next);
  const keepPreview = Boolean(
    workspace
    && snapshot
    && next.manual.source.kind === 'manual-source'
    && samePreviewComponent(workspace.manual, next.manual),
  );
  if (keepPreview) loadManualKeepingPreview(next);
  else loadWorkspace(next);
  toast(`Импортировано ${textFiles.length} JSON-файлов.`);
}

function exportBundle(): void {
  if (!workspace) return;
  assertAuthoringSource();
  const bundle = buildExportBundle(workspace.manual, workspace.variantEvidence, workspace.dependencyContracts,
    workspace.compiledInput?.package && (workspace.compiledInput.package as any).manualSourceHash === stableHash(workspace.manual)
      ? {projection: workspace.compiledInput as any} : {});
  if (!bundle.validation.valid) {
    toast('Экспорт создан со статусом draft: исправьте ошибки validation report.', 'warning');
  }
  const zip = buildAuthoringZip(bundle, importedSourceFiles);
  const blob = new Blob([zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) as ArrayBuffer], { type: 'application/zip' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = componentContractFilename(workspace.manual.component);
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  toast('Экспортирован manual source, compiled v2, coverage и validation report.');
}

function downloadValidationReport(): void {
  if (!lastValidationDownload) return;
  const href = URL.createObjectURL(new Blob([lastValidationDownload.json], { type: 'application/json;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = lastValidationDownload.fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  toast('Отчёт скачан. Он содержит правила, названия и тексты слоёв. Ничего не отправляется автоматически.');
}

window.onmessage = (event: MessageEvent<{ pluginMessage?: PluginMessage }>) => {
  const message = event.data.pluginMessage;
  if (!message) return;
  if (message.type === 'plugin-ready') {
    selectedRootNodeId = message.selectedRootNodeId || '';
    instanceSelectionAvailable = message.instanceSelectionAvailable;
    renderHeader();
    return;
  }
  if (message.type === 'session-restored') {
    if (workspace) return;
    const session = parseEditorSession(message.session);
    if (!session) return;
    loadWorkspace(session.workspace, false, false);
    scenarioProperties = { ...session.ui.scenarioProperties };
    activeModes = { ...session.ui.activeModes };
    renderScenarioControls();
    validationProductSelect.value = session.ui.validationProduct;
    syncUnifiedSelect(validationProductSelect);
    setWorkspaceMode(session.ui.workspaceMode);
    const packageNeedsReconnect = ['athena-package', 'component-contract-v2'].includes(session.workspace.manual.source.kind);
    if (packageNeedsReconnect) {
      setStatus('Подключите пакет для выбора компонентов', 'warning');
      toast('Manual-сессия восстановлена. Повторно подключите исходный пакет, чтобы выбрать другой компонент.', 'warning');
    } else {
      setStatus('Каталог и manual-сессия восстановлены', 'ready');
      toast(`Восстановлен ${session.workspace.manual.component.family}, manual r${session.workspace.manual.metadata.revision}.`);
    }
    return;
  }
  if (message.type === 'selection-availability') {
    const nextRoot = message.selectedRootNodeId || '';
    if (nextRoot !== selectedRootNodeId) { selectedRootNodeId = nextRoot; clearTestPresentation(); renderAnatomy(); setStatus('Выбран другой instance — проверка не выполнена', 'warning'); }
    instanceSelectionAvailable = message.instanceSelectionAvailable;
    renderHeader();
    return;
  }
  if (message.type === 'plugin-error') {
    const isPreviewError = Boolean(message.requestId && message.requestId === pendingPreviewRequest);
    const isSelectionTestError = Boolean(message.requestId && message.requestId === pendingSelectionTestRequest);
    if (message.requestId && !isPreviewError && !isSelectionTestError && !message.requestId.startsWith('selection-')) return;
    if (isPreviewError) {
      clearPreviewTimeout();
      pendingPreviewRequest = '';
      previewLoading.hidden = true;
      if (!previewImage.src) previewEmpty.hidden = false;
    }
    if (isSelectionTestError) pendingSelectionTestRequest = '';
    setStatus(isSelectionTestError ? 'Instance не проверен' : 'Preview недоступен', 'warning');
    renderHeader();
    toast(message.message, 'error');
    return;
  }
  if (message.type === 'preview-result') {
    if (message.requestId !== pendingPreviewRequest || !workspace) return;
    const previousTarget = focusedTarget();
    clearPreviewTimeout();
    pendingPreviewRequest = '';
    reconcileTargets(Array.isArray(message.anatomy) ? message.anatomy : [], message.snapshot);
    anatomy = Array.isArray(message.anatomy) ? message.anatomy : [];
    snapshot = message.snapshot;
    snapshotCapture = { kind: 'preview', requestId: message.requestId, warnings: message.warnings || [] };
    availableModes = Array.isArray(message.variableModes) ? message.variableModes : [];
    availableModes.forEach((collection) => {
      if (!activeModes[collection.collectionId]) activeModes[collection.collectionId] = collection.activeModeId;
    });
    selectedNodeId = (previousTarget ? nodeForTarget(previousTarget)?.id : undefined)
      || (editingRuleId ? null : anatomy[0]?.id || null);
    setPreviewImage(message.imageDataUrl, message.width, message.height);
    (Array.isArray(message.warnings) ? message.warnings : []).forEach((warning) => toast(warning, 'warning'));
    renderAnatomy();
    renderScenarioControls();
    if (modeScopeOptions.querySelector('[data-mode-placeholder="true"]')) {
      const editingRule = workspace.manual.rules.find((rule) => rule.id === editingRuleId);
      renderModeScope(editingRule?.applicability.modes || 'all');
    }
    renderFocus();
    renderProperties();
    renderCapabilityOptions();
    renderQuickPolicy();
    renderRuleCards();
    renderHeader();
    updateCompileState();
    persistSession();
    return;
  }
  if (message.type === 'selection-result') {
    const next = createWorkspaceFromPreview(message.identity, message.anatomy);
    loadWorkspace(next, false);
    snapshot = message.snapshot;
    snapshotCapture = { kind: 'selection', requestId: message.requestId, warnings: [] };
    setPreviewImage(message.imageDataUrl, message.width, message.height);
    renderQuickPolicy();
    renderRuleCards();
    renderHeader();
    updateCompileState();
    persistSession();
    toast('Текущий компонент взят как evidence.');
    return;
  }
  if (message.type === 'selection-test-result') {
    if (message.requestId !== pendingSelectionTestRequest || !workspace) return;
    pendingSelectionTestRequest = '';
    if (selectedRootNodeId && selectedRootNodeId !== message.snapshot.source?.rootNodeId) {
      clearTestPresentation(); renderAnatomy(); renderHeader(); setStatus('Выделение изменилось — повторите проверку', 'warning');
      toast('Во время снимка выбран другой instance. Задайте его ожидания и повторите проверку.', 'warning');
      return;
    }
    const currentCompiled = compileForExecution();
    if (!currentCompiled) { renderHeader(); return; }
    const currentManualSourceHash = currentCompiled.contract.package.manualSourceHash;
    if (message.manualSourceHash !== currentManualSourceHash) {
      toast('Manual source изменился во время снимка. Проверка перезапущена на актуальной ревизии.', 'warning');
      requestSelectionTest(selectionTestIntent);
      return;
    }
    const previousTarget = focusedTarget();
    reconcileTargets(Array.isArray(message.anatomy) ? message.anatomy : [], message.snapshot);
    anatomy = Array.isArray(message.anatomy) ? message.anatomy : [];
    snapshot = message.snapshot;
    snapshotCapture = {
      kind: 'selected-instance', requestId: message.requestId, warnings: message.warnings || [],
      componentKey: message.componentKey,
      matchedBaselineNodes: message.matchedBaselineNodes,
      unmatchedBaselineNodeIds: message.unmatchedBaselineNodeIds || [],
    };
    selectedNodeId = (previousTarget ? nodeForTarget(previousTarget)?.id : undefined)
      || (editingRuleId ? null : anatomy[0]?.id || null);
    setPreviewImage(message.imageDataUrl, message.width, message.height);
    (Array.isArray(message.warnings) ? message.warnings : []).forEach((warning) => toast(warning, 'warning'));
    renderAnatomy();
    renderFocus();
    renderProperties();
    renderCapabilityOptions();
    renderQuickPolicy();
    renderRuleCards();
    renderHeader();
    if(selectionTestIntent==='before'){
      const result=compileForExecution();
      if(!result)return;
      const compiled=result.contract;
      const before=prepareValidationSnapshot(validationSnapshot(snapshot),compiled);
      const root=before.nodes.find(n=>before.selection.includes(String(n.id))) as any;
      const usable=before.transitionCapture?.complete&&(compiled.facts.transitions||[]).some(t=>root?.dependencyCompositionV1?.[t.transition.dependencyId]?.active===t.transition.from);
      if(!usable){transitionBefore=null;toast('Исходное состояние не подтверждено. Выключите активную зависимость и повторите снимок; проверьте полноту окружения.','warning');}
      else{delete before.transitionBefore;transitionBefore=before;toast('Состояние до сохранено. Измените состояние того же instance и запустите проверку.');}
      setStatus(usable ? 'Исходный снимок сохранён' : 'Исходный снимок не подтверждён', usable ? 'ready' : 'warning');
      renderHeader();
    }else runTest();
    persistSession();
  }
};

importButton.addEventListener('click', () => fileInput.click());
element('captureBeforeButton').addEventListener('click',()=>requestSelectionTest('before'));
element('clearBeforeButton').addEventListener('click',()=>{transitionBefore=null;clearTestPresentation();renderHeader();});
emptyImportButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files || []);
  if (!files.length) return;
  importFiles(files).catch((error) => {
    setStatus('Ошибка импорта', 'warning');
    toast(error instanceof Error ? error.message : String(error), 'error');
  }).finally(() => { fileInput.value = ''; });
});
exportButton.addEventListener('click', () => {
  try { exportBundle(); } catch(error) { toast(error instanceof Error ? error.message : 'Экспорт не прошёл проверку source/facts/projection.', 'error'); }
});
remapTargetsButton.addEventListener('click',()=>openTargetRemap());
remapRuleTargetButton.addEventListener('click',()=>openTargetRemap(workspace?.manual.rules.find(rule=>rule.id===editingRuleId)?.targetId || currentTarget()?.id));
remapTargetSelect.addEventListener('change',refreshTargetRemap);
remapNodeSelect.addEventListener('change',refreshTargetRemap);
remapConfirm.addEventListener('change',()=>{applyRemapButton.disabled=!remapPlan?.canApply || !remapConfirm.checked;});
element('refreshRemapButton').addEventListener('click',refreshTargetRemap);
element('closeRemapButton').addEventListener('click',()=>remapDialog.close());
element('cancelRemapButton').addEventListener('click',()=>remapDialog.close());
applyRemapButton.addEventListener('click',confirmTargetRemap);
remapDialog.addEventListener('close',()=>{remapPlan=null;remapConfirm.checked=false;});
for (const event of ['input','change']) authoringEditorView.addEventListener(event, e=>{if ((e.target as HTMLElement).id!=='ruleSelect') ruleFormDirty=true;});
ruleOwnershipKind.addEventListener('change', () => {
  if (ruleOwnershipKind.value === 'component' && workspace) ruleOwnershipId.value = workspace.manual.component.componentId;
  else ruleOwnershipId.value = '';
});
downloadReportButton.addEventListener('click', downloadValidationReport);
contractSettingsButton.addEventListener('click', openContractSettings);
addDoNotUseConditionButton.addEventListener('click', () => appendDoNotUseCondition({}, true));
closeContractButton.addEventListener('click', () => contractDialog.close());
cancelContractButton.addEventListener('click', () => contractDialog.close());
saveContractButton.addEventListener('click', saveContractSettings);
contractDialog.addEventListener('click', (event) => {
  if (event.target === contractDialog) contractDialog.close();
});
anatomySearch.addEventListener('input', renderAnatomy);
protectInternalsButton.addEventListener('click', applyProtectInternals);
constraintType.addEventListener('change', () => renderConstraintFields());
document.querySelectorAll<HTMLInputElement>('input[name="permission"]').forEach((input) => {
  input.addEventListener('change', syncPermissionUi);
});
capabilityInput.addEventListener('input', () => {
  setPropertySourceTab('layer');
  if (capabilityInput.value) {
    componentPropertyInput.value = '';
    syncUnifiedSelect(componentPropertyInput);
  }
  syncComponentPropertyUi();
  renderCapabilityOptions(true);
  renderProperties();
});
capabilityInput.addEventListener('focus', () => renderCapabilityOptions(true));
capabilityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    capabilityOptions.hidden = true;
    capabilityInput.setAttribute('aria-expanded', 'false');
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    renderCapabilityOptions(true);
    capabilityOptions.querySelector<HTMLButtonElement>('button')?.focus({preventScroll: true});
  }
});
componentPropertyInput.addEventListener('change', () => {
  setPropertySourceTab('component');
  if (componentPropertyInput.value) {
    capabilityInput.value = '';
    capabilitySetSelect.value = '';
    syncUnifiedSelect(capabilitySetSelect);
    selectedGroupCapabilities.clear();
    syncCapabilityGroupUi();
  }
  syncComponentPropertyUi();
  if(['propertyDomain','propertyExclusion'].includes(constraintType.value))renderConstraintFields();
  renderProperties();
});
controlPathKind.addEventListener('change', syncControlPathUi);
capabilitySetSelect.addEventListener('change', () => {
  setPropertySourceTab('layer');
  if (capabilitySetSelect.value) {
    capabilityInput.value = '';
    componentPropertyInput.value = '';
    syncUnifiedSelect(componentPropertyInput);
  }
  selectedGroupCapabilities = new Set(capabilitiesForSet(capabilitySetSelect.value));
  syncCapabilityGroupUi();
  syncComponentPropertyUi();
  renderProperties();
});
layerPropertyTab.addEventListener('click', () => setPropertySourceTab('layer', true));
componentPropertyTab.addEventListener('click', () => setPropertySourceTab('component', true));
[layerPropertyTab, componentPropertyTab].forEach((tab) => {
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setPropertySourceTab(propertySourceTab === 'layer' ? 'component' : 'layer', true);
  });
});
document.addEventListener('pointerdown', (event) => {
  if (event.target instanceof Node && propertyPicker.contains(event.target)) return;
  capabilityOptions.hidden = true;
  capabilityInput.setAttribute('aria-expanded', 'false');
});
document.addEventListener('pointerdown', (event) => {
  if (!openUnifiedSelect || !(event.target instanceof Node)) return;
  const controller = unifiedSelects.get(openUnifiedSelect);
  if (controller && (controller.root.contains(event.target) || controller.menu.contains(event.target))) return;
  closeUnifiedSelect();
});
document.addEventListener('scroll', (event) => {
  const controller = openUnifiedSelect ? unifiedSelects.get(openUnifiedSelect) : undefined;
  if (controller && event.target instanceof Node && controller.menu.contains(event.target)) return;
  closeUnifiedSelect();
}, true);
window.addEventListener('scroll', () => {
  const scrollingElement = document.scrollingElement;
  if (scrollingElement && (scrollingElement.scrollLeft !== 0 || scrollingElement.scrollTop !== 0)) {
    scrollingElement.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  }
}, { passive: true });
window.addEventListener('resize', () => closeUnifiedSelect());
newRuleButton.addEventListener('click', () => {
  resetRuleForm();
  setAuthoringView('editor');
});
addSemanticTargetButton.addEventListener('click',addSelectedSemanticTarget);
backToRulesButton.addEventListener('click', () => setAuthoringView('list'));
ruleSelect.addEventListener('change', () => {
  const rule = workspace?.manual.rules.find((entry) => entry.id === ruleSelect.value);
  if (rule) loadRule(rule);
  else resetRuleForm(false);
});
saveRuleButton.addEventListener('click', saveRule);
element('authoringEditorView').addEventListener('input', clearRuleErrors);
element('authoringEditorView').addEventListener('change', clearRuleErrors);
deleteRuleButton.addEventListener('click', deleteRule);
testSelectionButton.addEventListener('click', () => requestSelectionTest());
authoringModeButton.addEventListener('click', () => setWorkspaceMode('authoring'));
validationModeButton.addEventListener('click', () => setWorkspaceMode('validation'));
validationPurposeSelect.addEventListener('change', () => {
  requestedValidationInputs = {};
  clearTestPresentation();
  renderValidationInputs();
  renderAnatomy();
  setStatus('Режим изменён — повторите проверку', 'warning');
});
validationProductSelect.addEventListener('change', () => {
  clearTestPresentation();
  if (validationProductSelect.value) setStatus(`Product проверки: ${validationProductSelect.value}`, 'ready');
  else setStatus('Выберите Product проверки', 'warning');
  renderHeader();
  persistSession();
});
showCompiledButton.addEventListener('click', () => {
  updateCompileState();
  if (lastCompiled) compiledDialog.showModal();
});
closeCompiledButton.addEventListener('click', () => compiledDialog.close());
compiledDialog.addEventListener('click', (event) => {
  if (event.target === compiledDialog) compiledDialog.close();
});
closeTestDetailsButton.addEventListener('click', () => testDetailsDialog.close());
testDetailsDialog.addEventListener('click', (event) => {
  if (event.target === testDetailsDialog) testDetailsDialog.close();
});
zoomOut.addEventListener('click', () => { zoom = Math.max(0.35, zoom - 0.15); applyZoom(); });
zoomIn.addEventListener('click', () => { zoom = Math.min(2.5, zoom + 0.15); applyZoom(); });

document.querySelectorAll<HTMLSelectElement>('select').forEach(enhanceSelect);
resetRuleForm();
renderHeader();
renderAnatomy();
renderFocus();
renderProperties();
post({ type: 'ready' });

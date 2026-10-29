import { captureInstanceAudit, exportPreview, slug, collectNodes, captureComponentDependencies } from './core/figma-capture';
import { configureInstanceMainAliases } from './core/instance-main-aliases';
import { resolveCaptureRepresentation } from './core/capture-representation';
import { captureVariantReference } from './core/variant-facts';
import type {
  PluginToUiMessage,
  PreviewRequest,
  TestSelectionRequest,
  UiToPluginMessage,
  VariableModeCollection,
} from './shared/messages';

const EDITOR_SESSION_STORAGE_KEY = 'component-contract-editor.session.v1';
let sessionWriteQueue: Promise<void> = Promise.resolve();
// Hidden nodes must be captured to distinguish unavailable from merely invisible.
figma.skipInvisibleInstanceChildren = false;

figma.showUI(__html__, {
  width: 1200,
  height: 720,
  themeColors: true,
});

function post(message: PluginToUiMessage): void {
  figma.ui.postMessage(message);
}

function saveSession(message: Extract<UiToPluginMessage, { type: 'save-session' }>): Promise<void> {
  sessionWriteQueue = sessionWriteQueue.catch(() => undefined).then(async () => {
    await figma.clientStorage.setAsync(EDITOR_SESSION_STORAGE_KEY, message.session);
  });
  return sessionWriteQueue;
}

async function mainComponentKey(node: SceneNode): Promise<string> {
  if (node.type === 'COMPONENT') return node.key;
  if (node.type !== 'INSTANCE') return '';
  const main = await node.getMainComponentAsync();
  return main?.key || '';
}

function propertyValues(instance: InstanceNode): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (const [name, property] of Object.entries(instance.componentProperties)) {
    if (typeof property.value === 'string' || typeof property.value === 'boolean') result[name] = property.value;
  }
  return result;
}

function collectVariableIds(value: unknown, result: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectVariableIds(entry, result));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const candidate = value as Record<string, unknown>;
  if (candidate.type === 'VARIABLE_ALIAS' && typeof candidate.id === 'string') {
    result.add(candidate.id);
    return;
  }
  Object.values(candidate).forEach((entry) => collectVariableIds(entry, result));
}

async function variableModeCollections(root: SceneNode): Promise<VariableModeCollection[]> {
  const variableIds = new Set<string>();
  const resolvedVariableModes = { ...root.resolvedVariableModes };
  let visited = 0;
  const visit = (node: SceneNode) => {
    if (visited >= 500) return;
    visited += 1;
    collectVariableIds((node as SceneNode & { boundVariables?: unknown }).boundVariables, variableIds);
    if ('children' in node) node.children.forEach(visit);
  };
  visit(root);
  const discovered = await Promise.all(Array.from(variableIds).map(async (variableId) => {
    try {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (!variable) return null;
      return await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
    } catch {
      // Preview remains useful when a remote collection is not available to this file.
      return null;
    }
  }));
  const collections = new Map<string, VariableCollection>();
  discovered.forEach((collection) => {
    if (collection) collections.set(collection.id, collection);
  });
  const resolvedCollections = await Promise.all(Object.keys(resolvedVariableModes).map(async id => {
    try { return await figma.variables.getVariableCollectionByIdAsync(id); }
    catch { return null; }
  }));
  resolvedCollections.forEach(collection => { if (collection) collections.set(collection.id, collection); });
  return Array.from(collections.values()).filter(collection =>
    typeof collection.name === 'string' && Array.isArray(collection.modes) &&
    collection.modes.every(mode => typeof mode.modeId === 'string' && typeof mode.name === 'string')
  ).map((collection) => ({
    collectionId: collection.id,
    collectionKey: collection.key,
    collectionName: collection.name,
    activeModeId: resolvedVariableModes[collection.id] || collection.defaultModeId,
    modes: collection.modes.map((mode) => ({ modeId: mode.modeId, name: mode.name })),
  })).sort((left, right) => left.collectionName.localeCompare(right.collectionName));
}

async function renderPreview(message: PreviewRequest): Promise<void> {
  if (!message.componentKey) throw new Error('componentKey is required for live preview.');
  let temporaryPage: PageNode | null = null;
  let instance: InstanceNode | null = null;
  try {
    const component = await figma.importComponentByKeyAsync(message.componentKey);
    temporaryPage = figma.createPage();
    temporaryPage.name = '__ComponentContractEditor_Preview__';
    instance = component.createInstance();
    temporaryPage.appendChild(instance);
    const compatibleProperties: Record<string, string | boolean> = {};
    for (const [name, value] of Object.entries(message.variantProperties)) {
      if (Object.prototype.hasOwnProperty.call(instance.componentProperties, name)) compatibleProperties[name] = value;
    }
    if (Object.keys(compatibleProperties).length) instance.setProperties(compatibleProperties);
    for (const [collectionId, modeId] of Object.entries(message.modes)) {
      const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
      if (collection) instance.setExplicitVariableModeForCollection(collection, modeId);
    }
    const preview = await exportPreview(instance);
    const modeLookup = await Promise.race([
      variableModeCollections(instance).then((value) => ({ value, timedOut: false })),
      new Promise<{ value: VariableModeCollection[]; timedOut: boolean }>((resolve) => {
        setTimeout(() => resolve({ value: [], timedOut: true }), 3000);
      }),
    ]);
    const variableModes = modeLookup.value;
    const resolvedModes = Object.fromEntries(variableModes.map((collection) => [
      collection.collectionId,
      message.modes[collection.collectionId] || collection.activeModeId,
    ]));
    const renderedMain = await instance.getMainComponentAsync();
    const representation = message.representations === undefined ? undefined : resolveCaptureRepresentation(
      message.representations, renderedMain?.key || '',
      renderedMain?.parent?.type === 'COMPONENT_SET' ? renderedMain.parent.key : '',
    );
    const collected = await collectNodes(instance, representation?.platform || message.platform, resolvedModes);
    if (collected.snapshot.source) {
      collected.snapshot.source.componentKey = renderedMain?.key;
      collected.snapshot.source.componentSetKey = renderedMain?.parent?.type === 'COMPONENT_SET' ? renderedMain.parent.key : undefined;
      if (representation) collected.snapshot.source.representationId = representation.id;
    }
    if (renderedMain) collected.snapshot.variantReference = captureVariantReference(collected.snapshot, renderedMain.key,
      renderedMain.parent?.type === 'COMPONENT_SET' ? renderedMain.parent.key : '',
      Object.keys((renderedMain.parent?.type === 'COMPONENT_SET' ? renderedMain.parent : renderedMain).componentPropertyDefinitions));
    configureInstanceMainAliases(collected.snapshot,message.instanceMainComponentAliasesVersion===1);
    await captureComponentDependencies(collected.anatomy,collected.snapshot,temporaryPage,message.componentDependencyKeys,message.directChildDependenciesVersion,message.instanceMainComponentAliasesVersion);
    post({
      type: 'preview-result',
      requestId: message.requestId,
      imageDataUrl: preview.dataUrl,
      width: preview.width,
      height: preview.height,
      anatomy: collected.anatomy,
      snapshot: collected.snapshot,
      componentProperties: propertyValues(instance),
      variableModes,
      warnings: [
        ...(collected.anatomy.length >= 500 ? ['Preview anatomy was capped at 500 nodes.'] : []),
        ...(modeLookup.timedOut ? ['Variable mode discovery timed out; preview was rendered without mode controls.'] : []),
      ],
    });
  } finally {
    instance?.remove();
    temporaryPage?.remove();
  }
}

async function captureSelection(requestId: string): Promise<void> {
  const node = figma.currentPage.selection[0];
  if (!node || !['INSTANCE', 'COMPONENT'].includes(node.type)) {
    throw new Error('Select one component instance or main component in Figma.');
  }
  const componentKey = await mainComponentKey(node);
  const collected = await collectNodes(node, 'universal', {});
  const preview = await exportPreview(node);
  post({
    type: 'selection-result',
    requestId,
    identity: {
      componentId: `manual.${slug(node.name)}`,
      familyId: `manual.${slug(node.name)}`,
      contractId: `manual.${slug(node.name)}`,
      family: node.name.replace(/^\[[DMT]\]\s*/, ''),
      layer: 'unknown',
      library: 'Current Figma file',
      platform: 'universal',
      platforms: [],
      lifecycle: 'active',
      componentKey,
    },
    anatomy: collected.anatomy,
    snapshot: collected.snapshot,
    imageDataUrl: preview.dataUrl,
    width: preview.width,
    height: preview.height,
  });
}

function selectedInstance(): InstanceNode {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1 || selection[0].type !== 'INSTANCE') {
    throw new Error('Выберите ровно один instance компонента в Figma. Main component здесь не проверяется.');
  }
  return selection[0];
}

async function testSelection(message: TestSelectionRequest): Promise<void> {
  const output = await captureInstanceAudit(selectedInstance(), message);
  post(Object.assign({ type: 'selection-test-result' as const, requestId: message.requestId }, output));
}

function postSelectionAvailability(): void {
  const selection = figma.currentPage.selection;
  post({
    type: 'selection-availability',
    selectedRootNodeId: selection.length === 1 && selection[0].type === 'INSTANCE' ? selection[0].id : '',
    selectionAvailable: selection.length === 1 && ['INSTANCE', 'COMPONENT'].includes(selection[0].type),
    instanceSelectionAvailable: selection.length === 1 && selection[0].type === 'INSTANCE',
  });
}

figma.on('selectionchange', postSelectionAvailability);

figma.ui.onmessage = async (message: UiToPluginMessage) => {
  try {
    if (message.type === 'ready') {
      const selection = figma.currentPage.selection;
      post({
        type: 'plugin-ready',
        selectedRootNodeId: selection.length === 1 && selection[0].type === 'INSTANCE' ? selection[0].id : '',
        selectionAvailable: selection.length === 1 && ['INSTANCE', 'COMPONENT'].includes(selection[0].type),
        instanceSelectionAvailable: selection.length === 1 && selection[0].type === 'INSTANCE',
      });
      const session = await figma.clientStorage.getAsync(EDITOR_SESSION_STORAGE_KEY);
      post({ type: 'session-restored', session: session || null });
      return;
    }
    if (message.type === 'save-session') {
      await saveSession(message);
      return;
    }
    if (message.type === 'render-preview') {
      await renderPreview(message);
      return;
    }
    if (message.type === 'capture-selection') {
      await captureSelection(message.requestId);
      return;
    }
    if (message.type === 'test-selection') await testSelection(message);
  } catch (error) {
    post({
      type: 'plugin-error',
      requestId: 'requestId' in message ? message.requestId : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

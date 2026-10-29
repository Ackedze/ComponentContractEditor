import type { EditorSessionState } from '../core/session';
import type { AnatomyNode, ComponentIdentity, ComponentRepresentation, PreviewSnapshot } from '../core/types';
import type { NativeSlotCapturePlan } from '../core/native-slot-capture';

export type VariableModeCollection = {
  collectionId: string;
  collectionKey?: string;
  collectionName: string;
  activeModeId: string;
  modes: Array<{ modeId: string; name: string }>;
};

export type PreviewRequest = {
  type: 'render-preview';
  requestId: string;
  componentKey: string;
  variantProperties: Record<string, string>;
  modes: Record<string, string>;
  platform: string;
  componentDependencyKeys?: string[];
  directChildDependenciesVersion?:1;
  instanceMainComponentAliasesVersion?:1;
  representations?: ComponentRepresentation[];
};

export type TestSelectionRequest = {
  type: 'test-selection';
  requestId: string;
  componentKey: string;
  acceptedComponentKeys: string[];
  allowedComponentProperties: string[];
  platform: string;
  manualSourceHash: string;
  captureTransitionContext?: boolean;
  expectedRootNodeId?: string;
  componentDependencyKeys?: string[];
  directChildDependenciesVersion?:1;
  instanceMainComponentAliasesVersion?:1;
  representations?: ComponentRepresentation[];
  nativeSlotCapturePlan?: NativeSlotCapturePlan;
};

export type UiToPluginMessage =
  | { type: 'ready' }
  | PreviewRequest
  | TestSelectionRequest
  | { type: 'save-session'; session: EditorSessionState }
  | { type: 'capture-selection'; requestId: string };

export type PluginToUiMessage =
  | {
      type: 'plugin-ready';
      selectedRootNodeId?: string;
      selectionAvailable: boolean;
      instanceSelectionAvailable: boolean;
    }
  | { type: 'session-restored'; session: EditorSessionState | null }
  | {
      type: 'preview-result';
      requestId: string;
      imageDataUrl: string;
      width: number;
      height: number;
      anatomy: AnatomyNode[];
      snapshot: PreviewSnapshot;
      componentProperties: Record<string, string | boolean>;
      variableModes: VariableModeCollection[];
      warnings: string[];
    }
  | {
      type: 'selection-result';
      requestId: string;
      identity: ComponentIdentity;
      anatomy: AnatomyNode[];
      snapshot: PreviewSnapshot;
      imageDataUrl: string;
      width: number;
      height: number;
    }
  | {
      type: 'selection-test-result';
      requestId: string;
      componentKey: string;
      anatomy: AnatomyNode[];
      snapshot: PreviewSnapshot;
      imageDataUrl: string;
      width: number;
      height: number;
      matchedBaselineNodes: number;
      unmatchedBaselineNodeIds: string[];
      warnings: string[];
      manualSourceHash: string;
    }
  | {
      type: 'selection-availability';
      selectedRootNodeId?: string;
      selectionAvailable: boolean;
      instanceSelectionAvailable: boolean;
    }
  | { type: 'plugin-error'; requestId?: string; message: string };

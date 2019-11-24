// @flow
import { EditorState, AtomicBlockUtils } from 'draft-js';

import type {
  DraftEditorState,
  DraftContentBlock,
  DraftEntity,
  DraftEntityType,
} from './models/types';

export function getInlineStyleSelected(editorState: DraftEditorState): Array<string> {
  const styleList = editorState
    .getCurrentInlineStyle()
    .toList()
    .toJS();
  return styleList;
}

export function isBlockActive(editorState: DraftEditorState, type: string): boolean {
  if (!editorState) return false;

  const startKey = editorState.getSelection().getStartKey();
  const selectedBlockType = editorState
    .getCurrentContent()
    .getBlockForKey(startKey)
    .getType();

  return selectedBlockType === type;
}

export function getActiveColor(editorState: DraftEditorState, type: string): ?string {
  if (!editorState) return null;

  const styles = editorState.getCurrentInlineStyle();
  const colorLabel = styles.filter(value => value.startsWith(`${type}-`)).first();
  const color = colorLabel ? colorLabel.replace(`${type}-`, '') : '';
  return color;
}

export function insertAtomicBlock(
  editorState: DraftEditorState,
  entityType: DraftEntityType,
  entityData: ?Object,
): DraftEditorState {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(entityType, 'IMMUTABLE', entityData);
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

  return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
}

// Below functions come from https://github.com/jpuri/draftjs-utils

/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksMap(editorState: EditorState): Object {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();
  return blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]]);
}

/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksList(editorState: DraftEditorState): Object {
  return getSelectedBlocksMap(editorState).toList();
}

/**
 * Function returns the first selected block.
 */
export function getSelectedBlock(editorState: DraftEditorState): ?DraftContentBlock {
  if (editorState) {
    return getSelectedBlocksList(editorState).get(0);
  }
  return undefined;
}

export function getSelectionEntity(editorState: DraftEditorState): ?DraftEntity {
  let entity;
  const selection = editorState.getSelection();
  let start = selection.getStartOffset();
  let end = selection.getEndOffset();
  if (start === end && start === 0) {
    end = 1;
  } else if (start === end) {
    start -= 1;
  }
  const block = getSelectedBlock(editorState);

  if (!block) return null;

  for (let i = start; i < end; i += 1) {
    const currentEntity = block.getEntityAt(i);
    if (!currentEntity) {
      entity = null;
      break;
    }
    if (i === start) {
      entity = currentEntity;
    } else if (entity !== currentEntity) {
      entity = null;
      break;
    }
  }

  return entity;
}

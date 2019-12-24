// @flow
import React, { useState, useEffect, useMemo } from 'react';
import {
  Editor as DraftEditor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  SelectionState,
} from 'draft-js';
import { convertFromHTML } from 'draft-convert';

import importHTMLOptions from './encoder/importHTML';
import config from './renderer/config';
import decorators from './decorators';
import { colorStyleMap, bgStyleMap } from './colors';
import { EditorContext, DispatchContext, EntityContext } from './context';
import { insertAtomicBlock, getSelectionEntity } from './utils';
import WysiwygToolbar from './toolbar/WysiwygToolbar';
import { EditorArea } from './WysiwygEditor.style';
import { IFRAME, IMAGE, HR, LINK } from './renderer/constants';
import { type DraftEditorState, type DraftTextDirection } from './models/types';
import ImagePropertiesDialog from './toolbar/ImagePropertiesDialog';
import IframePropertiesDialog from './toolbar/IframePropertiesDialog';
import LinkPropertiesDialog from './toolbar/LinkPropertiesDialog';
import { useDialogState } from './components/Dialog';

type Action = {
  type: string,
  block?: Object,
  entityKey?: string,
  data?: Object,
};

type Props = {
  /** must be HTML format */
  initialContent: string,
  fullscreen: boolean,
  toggleFullscreen: () => void,
  editorFocused: boolean,
  setEditorFocused: (focus: boolean) => void,
  toggleEditorMode: () => void,
  uploadLocalImage?: (onSuccess: (string) => void, onError: string | Object) => void,
  onChange: DraftEditorState => void,
  enableViewSource?: boolean,
  /** show console.log of WysiwygEditor */
  debug: boolean,
};

function WysiwygEditor({
  initialContent,
  fullscreen,
  editorFocused,
  uploadLocalImage,
  toggleFullscreen,
  toggleEditorMode,
  setEditorFocused,
  enableViewSource,
  onChange,
  debug,
}: Props) {
  const insertImageDialog = useDialogState();
  const insertIframeDialog = useDialogState();
  const insertLinkDialog = useDialogState();
  const contentState = useMemo((): Object => {
    const state = convertFromHTML(importHTMLOptions)(initialContent);
    return state;
  }, [initialContent]);
  const [editorState, setEditorState] = useState<DraftEditorState>(
    EditorState.createWithContent(contentState, decorators),
  );
  const [currentContent, setCurrentContent] = useState(editorState.getCurrentContent());
  const [action, dispatchAction] = useState<?Action>(null);
  const currentSelectedEntity = !editorState.getSelection().isCollapsed()
    ? getSelectionEntity(editorState)
    : null;

  useEffect(() => {
    onChange(currentContent);

    if (debug) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG] ContentState', convertToRaw(currentContent));
      // console.log('[DEBUG] SelectionState', editorState.getSelection().toJS()); // eslint-disable-line no-console
    }
  }, [onChange, currentContent, debug]);

  function handleChange(state: DraftEditorState) {
    const _currentContent = state.getCurrentContent();
    setEditorState(state);
    setCurrentContent(_currentContent);
  }

  useEffect(() => {
    if (action) {
      switch (action.type) {
        case 'editBlockData': {
          if (action.block) {
            // Create a fake selection because of special block
            const selectionState = SelectionState.createEmpty(action.block.getKey());
            // Put data in block
            const newContentState = Modifier.mergeBlockData(
              editorState.getCurrentContent(),
              selectionState,
              action.data,
            );
            const newState = EditorState.push(editorState, newContentState, 'change-block-data');
            handleChange(newState);
          }
          break;
        }
        case 'editBlockEntityData': {
          if (action.block) {
            const _currentContent = editorState.getCurrentContent();
            // $FlowFixMe: block is safe
            const entityId = action.block.getEntityAt(0);
            _currentContent.replaceEntityData(entityId, action.data);
            // Force selection to put cursor at the right place (after the block)
            const withProperCursor = EditorState.forceSelection(
              editorState,
              _currentContent.getSelectionAfter(),
            );
            handleChange(withProperCursor);
          }
          break;
        }
        case 'editLink': {
          const _currentContent = editorState.getCurrentContent();
          const selection = editorState.getSelection();
          _currentContent.replaceEntityData(action.entityKey, action.data);
          handleChange(EditorState.forceSelection(editorState, selection));
          break;
        }
        case 'removeLink': {
          const selection = editorState.getSelection();
          handleChange(RichUtils.toggleLink(editorState, selection, null));
          break;
        }
        case 'blur':
          setEditorFocused(false);
          break;
        case 'focus':
          setEditorFocused(true);
          break;
        default:
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  function onTitleClick(level: string) {
    handleChange(RichUtils.toggleBlockType(editorState, `header-${level}`));
  }

  function onAlignmentClick(dir: DraftTextDirection) {
    const newContentState = Modifier.mergeBlockData(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      { alignment: dir },
    );

    const newState = EditorState.push(editorState, newContentState, 'change-block-data');
    handleChange(newState);
  }

  function handleColor(color: string, label: string = 'color-', list: Object = colorStyleMap) {
    const selection = editorState.getSelection();

    // Let's just allow one color at a time. Turn off all active colors.
    const nextContentState = Object.keys(list).reduce((_contentState, _color) => {
      return Modifier.removeInlineStyle(_contentState, selection, _color);
    }, editorState.getCurrentContent());
    let nextEditorState = EditorState.push(editorState, nextContentState, 'change-inline-style');

    if (color) {
      const currentStyle = editorState.getCurrentInlineStyle();
      // Unset style override for current color.
      if (selection.isCollapsed()) {
        nextEditorState = currentStyle.reduce((_state, _color) => {
          return RichUtils.toggleInlineStyle(_state, _color);
        }, nextEditorState);
      }
      // If the color is being toggled on, apply it.
      if (!currentStyle.has(color)) {
        nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, `${label}${color}`);
      }
    }

    handleChange(nextEditorState);
  }

  function onColorClick(color: string) {
    handleColor(color, 'color-', colorStyleMap);
  }

  function onHighlightClick(color: string) {
    handleColor(color, 'bg-', bgStyleMap);
  }

  function insertLinkClick() {
    insertLinkDialog.show();
  }

  function insertLink(data) {
    const selection = editorState.getSelection();
    const _content = editorState.getCurrentContent();
    const contentWithEntity = _content.createEntity(LINK, 'MUTABLE', data);
    const newEditorState = EditorState.push(editorState, contentWithEntity, 'apply-entity');
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    handleChange(RichUtils.toggleLink(newEditorState, selection, entityKey));
  }

  function insertImageClick() {
    insertImageDialog.show();
  }

  function insertImage(data) {
    const newEditorState = insertAtomicBlock(editorState, IMAGE, data);
    handleChange(newEditorState);
  }

  function insertHorizontalRuleClick() {
    const newEditorState = insertAtomicBlock(editorState, HR);
    handleChange(newEditorState);
  }

  function insertIframeClick() {
    insertIframeDialog.show();
  }

  function insertIframe(data) {
    const newEditorState = insertAtomicBlock(editorState, IFRAME, data);
    handleChange(newEditorState);
  }

  function insertSoftNewlineClick() {
    handleChange(RichUtils.insertSoftNewline(editorState));
  }

  function onUndoClick() {
    handleChange(EditorState.undo(editorState));
  }

  function onRedoClick() {
    handleChange(EditorState.redo(editorState));
  }

  function onClearFormatClick() {
    const styles = [
      'BOLD',
      'ITALIC',
      'UNDERLINE',
      'STRIKETHROUGH',
      'CODE',
      ...Object.keys(colorStyleMap),
      ...Object.keys(bgStyleMap),
    ];

    const contentWithoutStyles = styles.reduce(
      (newContentState, style) =>
        Modifier.removeInlineStyle(newContentState, editorState.getSelection(), style),
      editorState.getCurrentContent(),
    );

    const newState = EditorState.push(editorState, contentWithoutStyles, 'change-inline-style');

    handleChange(newState);
  }

  function handleKeyCommand(command: string) {
    const selection = editorState.getSelection();
    const newState = RichUtils.handleKeyCommand(editorState, command);

    console.log('command', command);

    // Support handling for default command
    if (newState) {
      handleChange(newState);
      return 'handled';
    }

    if (!selection.isCollapsed() && command === 'insert-link') {
      insertLinkClick();
      return 'handled';
    }

    if (command === 'insert-new-softline') {
      insertSoftNewlineClick();
      return 'handled';
    }

    if (command === 'undo') {
      onUndoClick();
      return 'handled';
    }

    if (command === 'redo') {
      onRedoClick();
      return 'handled';
    }

    return 'not-handled';
  }

  return (
    <EditorContext.Provider value={{ editorState, setFocus: setEditorFocused, handleChange }}>
      <DispatchContext.Provider value={dispatchAction}>
        <EntityContext.Provider value={currentSelectedEntity}>
          <ImagePropertiesDialog {...insertImageDialog} onConfirm={insertImage} />
          <IframePropertiesDialog {...insertIframeDialog} onConfirm={insertIframe} />
          <LinkPropertiesDialog {...insertLinkDialog} onConfirm={insertLink} />
          <WysiwygToolbar
            editorState={editorState}
            onTitleClick={onTitleClick}
            onAlignmentClick={onAlignmentClick}
            onColorClick={onColorClick}
            onHighlightClick={onHighlightClick}
            insertLinkClick={insertLinkClick}
            insertImageClick={insertImageClick}
            uploadLocalImage={uploadLocalImage}
            insertIframeClick={insertIframeClick}
            insertSoftNewlineClick={insertSoftNewlineClick}
            insertHorizontalRuleClick={insertHorizontalRuleClick}
            onUndoClick={onUndoClick}
            onRedoClick={onRedoClick}
            onFullscreenClick={toggleFullscreen}
            onClearFormatClick={onClearFormatClick}
            toggleEditorMode={toggleEditorMode}
            fullscreenMode={fullscreen}
            enableViewSource={enableViewSource}
          />
          <EditorArea>
            <DraftEditor
              readOnly={!editorFocused}
              onChange={handleChange}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand}
              textDirectionality="RTL"
              stripPastedStyles
              {...config}
            />
          </EditorArea>
        </EntityContext.Provider>
      </DispatchContext.Provider>
    </EditorContext.Provider>
  );
}

export default WysiwygEditor;

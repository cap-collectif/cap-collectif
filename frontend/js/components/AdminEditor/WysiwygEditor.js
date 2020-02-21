// @flow
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Editor as DraftEditor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  SelectionState,
  genKey,
  ContentBlock,
  ContentState,
} from 'draft-js';
import { convertFromHTML } from 'draft-convert';
import { Map } from 'immutable';

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
import TablePropertiesDialog from './toolbar/TablePropertiesDialog';
import { useDialogState } from './components/Dialog';
import { getImageInitialSize } from './encoder/utils';

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
  attachFile?: (onSuccess: (string) => void, onError: string | Object) => void,
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
  attachFile,
  toggleFullscreen,
  toggleEditorMode,
  setEditorFocused,
  enableViewSource,
  onChange,
  debug,
}: Props) {
  const editor = useRef(null);
  const editorDOMRef = useRef(null);

  const insertImageDialog = useDialogState();
  const insertIframeDialog = useDialogState();
  const insertLinkDialog = useDialogState();
  const insertTableDialog = useDialogState();
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
  // eslint-disable-next-line no-unused-vars
  const [hasScrolling, setHasScrolling] = useState(false);

  useEffect(() => {
    onChange(currentContent);

    if (debug) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG] ContentState', convertToRaw(currentContent));
      // console.log('[DEBUG] SelectionState', editorState.getSelection().toJS()); // eslint-disable-line no-console
    }
  }, [onChange, currentContent, debug]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!editorDOMRef.current && editor.current) {
      editorDOMRef.current = editor.current.editorContainer.closest('.rich-text-editor');
    } else if (!editor.current) {
      editorDOMRef.current = null;
    } else {
      setHasScrolling(
        (editorDOMRef.current?.scrollHeight || 0) > (editorDOMRef.current?.clientHeight || 0),
      );
    }
  });

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

  function insertTable(size) {
    let selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      return null;
    }
    // don't insert a table within a table
    if (
      editorState
        .getCurrentContent()
        .getBlockForKey(selection.getAnchorKey())
        .getType() === 'table'
    ) {
      return null;
    }

    const defaultCellStyle = {
      border: '1px solid rgba(0, 0, 0, 0.2)',
      padding: '6px',
      'text-align': 'center',
    };
    const cols = Array(parseInt(size.columns, 10)).fill(1);
    const tableShape = Array(parseInt(size.lines, 10))
      .fill(cols)
      .map(row => row.map(() => ({ element: 'td', style: { ...defaultCellStyle } })));

    const tableKey = genKey();
    const newBlocks = [];
    tableShape.forEach((row, i) => {
      row.forEach((cell, j) => {
        let newBlock;
        let data = Map({
          tableKey,
          tablePosition: `${tableKey}-${i}-${j}`,
          'text-align': 'center',
        });
        if (i === 0 && j === 0) {
          data = data
            .set('tableShape', tableShape)
            .set('tableStyle', { 'border-collapse': 'collapse', margin: '15px 0', width: '100%' })
            .set('rowStyle', []);
        }
        // eslint-disable-next-line prefer-const
        newBlock = new ContentBlock({ key: genKey(), type: 'table', text: ' ', data });
        newBlocks.push(newBlock);
      });
    });
    const selectionKey = selection.getAnchorKey();
    let ccontentState = editorState.getCurrentContent();
    ccontentState = Modifier.splitBlock(contentState, selection);
    const blockArray = contentState.getBlocksAsArray();
    const currBlock = contentState.getBlockForKey(selectionKey);
    const index = blockArray.findIndex(block => block === currBlock);
    const isEnd = index === blockArray.length - 1;
    if (blockArray[index] && blockArray[index].getType() === 'table') {
      newBlocks.unshift(new ContentBlock({ key: genKey() }));
    }
    if (blockArray[index + 1] && blockArray[index + 1].getType() === 'table') {
      newBlocks.push(new ContentBlock({ key: genKey() }));
    }
    blockArray.splice(index + 1, 0, ...newBlocks);
    if (isEnd) {
      blockArray.push(new ContentBlock({ key: genKey() }));
    }
    const entityMap = ccontentState.getEntityMap();
    ccontentState = ContentState.createFromBlockArray(blockArray, entityMap);
    let newEditorState = EditorState.push(editorState, ccontentState, 'insert-fragment');
    const key = newBlocks[0].getKey();
    selection = SelectionState.createEmpty(key);
    newEditorState = EditorState.acceptSelection(newEditorState, selection);
    handleChange(newEditorState);
  }

  function insertTableClick() {
    insertTableDialog.show();
  }

  async function insertImage(data) {
    const img = await getImageInitialSize(data.src);
    data.width = img.width;
    data.height = img.height;
    data.href = '';
    data.targetBlank = false;
    data.alignment = 'center';
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
  const blockRendererFn = config.getBlockRendererFn(editor.current);

  return (
    <EditorContext.Provider value={{ editorState, setFocus: setEditorFocused, handleChange }}>
      <DispatchContext.Provider value={dispatchAction}>
        <EntityContext.Provider value={currentSelectedEntity}>
          {/** $$FlowFixMe https://github.com/facebook/flow/issues/5882 */}
          <ImagePropertiesDialog {...insertImageDialog} onConfirm={insertImage} />
          <IframePropertiesDialog {...insertIframeDialog} onConfirm={insertIframe} />
          <LinkPropertiesDialog {...insertLinkDialog} onConfirm={insertLink} />
          {/** $$FlowFixMe https://github.com/facebook/flow/issues/5882 */}
          <TablePropertiesDialog {...insertTableDialog} onConfirm={insertTable} />
          <WysiwygToolbar
            editorState={editorState}
            onTitleClick={onTitleClick}
            onAlignmentClick={onAlignmentClick}
            onColorClick={onColorClick}
            onHighlightClick={onHighlightClick}
            insertLinkClick={insertLinkClick}
            insertImageClick={insertImageClick}
            uploadLocalImage={uploadLocalImage}
            insertLink={insertLink}
            attachFile={attachFile}
            insertIframeClick={insertIframeClick}
            insertSoftNewlineClick={insertSoftNewlineClick}
            insertTableClick={insertTableClick}
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
              ref={editor}
              readOnly={!editorFocused}
              onChange={handleChange}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand}
              textDirectionality="RTL"
              stripPastedStyles
              {...config}
              blockRendererFn={blockRendererFn}
            />
          </EditorArea>
        </EntityContext.Provider>
      </DispatchContext.Provider>
    </EditorContext.Provider>
  );
}

export default WysiwygEditor;

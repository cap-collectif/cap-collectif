// @flow
import React, { useState, useEffect, useMemo } from 'react';
import {
  Editor as DraftEditor,
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  Modifier,
  convertToRaw,
} from 'draft-js';
import { convertFromHTML } from 'draft-convert';

import importHTMLOptions from './encoder/importHTML';
import config from './renderer/config';
import decorators from './decorators';
import { colorStyleMap, bgStyleMap } from './colors';
import EditorContext from './context';
import WysiwygToolbar from './toolbar/WysiwygToolbar';
import { EditorArea } from './WysiwygEditor.style';
import { type DraftTextDirection } from './models/types';

type Props = {
  /** must be HTML format */
  content: string,
  fullscreen: boolean,
  toggleFullscreen: Function,
  editorFocused: boolean,
  toggleEditorFocused: Function,
  toggleEditorMode: Function,
  uploadLocalImage?: (Function, Function) => void,
  onChange: Function,
  /** show console.log of WysiwygEditor */
  debug: boolean,
};

function WysiwygEditor({
  content,
  fullscreen,
  uploadLocalImage,
  toggleFullscreen,
  toggleEditorMode,
  onChange,
  debug,
}: Props) {
  const contentState = useMemo(() => {
    const state = convertFromHTML(importHTMLOptions)(content);
    return state;
  }, [content]);
  const [editorState, setEditorState] = useState<Object>(
    EditorState.createWithContent(contentState, decorators),
  );

  useEffect(() => {
    onChange(editorState);

    if (debug) {
      console.log('[DEBUG] ContentState', convertToRaw(editorState.getCurrentContent()));
      console.log('[DEBUG] SelectionState', editorState.getSelection().toJS());
    }
  }, [onChange, editorState, debug]);

  function handleChange(state: Object) {
    setEditorState(state);
  }

  function onTitleClick(level) {
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

  function onInsertLinkClick() {
    const selection = editorState.getSelection();
    const link = window.prompt('URL du lien'); // eslint-disable-line no-alert

    if (!link) {
      handleChange(RichUtils.toggleLink(editorState, selection, null));
      return 'handled';
    }

    const _content = editorState.getCurrentContent();
    const contentWithEntity = _content.createEntity('LINK', 'MUTABLE', {
      url: link,
    });
    const newEditorState = EditorState.push(editorState, contentWithEntity, 'apply-entity');
    const entityKey = contentWithEntity.getLastCreatedEntityKey();

    handleChange(RichUtils.toggleLink(newEditorState, selection, entityKey));

    return 'handled';
  }

  function onInsertImage() {
    const urlValue = window.prompt("Lien de l'image"); // eslint-disable-line no-alert
    const captionValue = window.prompt("Description de l'image"); // eslint-disable-line no-alert
    const _contentState = editorState.getCurrentContent();
    const contentStateWithEntity = _contentState.createEntity('IMAGE', 'IMMUTABLE', {
      src: urlValue,
      alt: captionValue,
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    handleChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
  }

  function onInsertHorizontalRule() {
    const _contentState = editorState.getCurrentContent();
    const contentStateWithEntity = _contentState.createEntity('HR', 'IMMUTABLE');
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    handleChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
  }

  function onInsertEmbed() {
    const urlValue = window.prompt("Lien source de l'iframe");
    const _contentState = editorState.getCurrentContent();
    const contentStateWithEntity = _contentState.createEntity('IFRAME', 'IMMUTABLE', {
      src: urlValue,
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

    handleChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
  }

  function onUndoClick() {
    handleChange(EditorState.undo(editorState));
  }

  function onRedoClick() {
    handleChange(EditorState.redo(editorState));
  }

  function onInsertSoftNewlineClick() {
    handleChange(RichUtils.insertSoftNewline(editorState));
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

    if (newState) {
      handleChange(newState);
      return 'handled';
    }

    if (!selection.isCollapsed() && command === 'insert-link') {
      onInsertLinkClick();
      return 'handled';
    }

    if (command === 'insert-new-softline') {
      onInsertSoftNewlineClick();
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
    <EditorContext.Provider value={{ editorState, handleChange }}>
      <WysiwygToolbar
        editorState={editorState}
        handleChange={handleChange}
        onTitleClick={onTitleClick}
        onAlignmentClick={onAlignmentClick}
        onColorClick={onColorClick}
        onHighlightClick={onHighlightClick}
        onInsertLinkClick={onInsertLinkClick}
        onInsertImage={onInsertImage}
        uploadLocalImage={uploadLocalImage}
        onInsertEmbed={onInsertEmbed}
        onInsertSoftNewlineClick={onInsertSoftNewlineClick}
        onInsertHorizontalRuleClick={onInsertHorizontalRule}
        onUndoClick={onUndoClick}
        onRedoClick={onRedoClick}
        onFullscreenClick={toggleFullscreen}
        onClearFormatClick={onClearFormatClick}
        toggleEditorMode={toggleEditorMode}
        fullscreenMode={fullscreen}
      />
      <EditorArea>
        <DraftEditor
          onChange={handleChange}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          {...config}
        />
      </EditorArea>
    </EditorContext.Provider>
  );
}

export default WysiwygEditor;

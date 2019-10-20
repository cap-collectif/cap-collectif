// @flow
import React, { useState, useEffect, useMemo } from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import { Editor as DraftEditor, EditorState, RichUtils, Modifier, convertToRaw } from 'draft-js';
import { convertFromHTML } from 'draft-convert';

import importHTMLOptions from './encoder/importHTML';
import config from './renderer/config';
import decorators from './decorators';
import { colorStyleMap, bgStyleMap } from './colors';
import EditorContext from './context';
import { insertAtomicBlock } from './utils';
import WysiwygToolbar from './toolbar/WysiwygToolbar';
import { EditorArea } from './WysiwygEditor.style';
import { type DraftTextDirection } from './models/types';

type Props = {
  intl: IntlShape,
  /** must be HTML format */
  content: string,
  fullscreen: boolean,
  toggleFullscreen: () => void,
  editorFocused: boolean,
  toggleEditorFocused: () => void,
  toggleEditorMode: () => void,
  uploadLocalImage?: (onSuccess: (string) => void, onError: string | Object) => void,
  onChange: Object => void,
  /** show console.log of WysiwygEditor */
  debug: boolean,
};

function WysiwygEditor({
  intl,
  content,
  fullscreen,
  uploadLocalImage,
  toggleFullscreen,
  toggleEditorMode,
  onChange,
  debug,
}: Props) {
  const contentState = useMemo((): Object => {
    const state = convertFromHTML(importHTMLOptions)(content);
    return state;
  }, [content]);
  const [editorState, setEditorState] = useState<Object>(
    EditorState.createWithContent(contentState, decorators),
  );

  useEffect(() => {
    onChange(editorState);

    if (debug) {
      console.log('[DEBUG] ContentState', convertToRaw(editorState.getCurrentContent())); // eslint-disable-line no-console
      console.log('[DEBUG] SelectionState', editorState.getSelection().toJS()); // eslint-disable-line no-console
    }
  }, [onChange, editorState, debug]);

  function handleChange(state: Object) {
    setEditorState(state);
  }

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

  function insertLinkClick(): string {
    const selection = editorState.getSelection();
    const link = window.prompt(intl.formatMessage({ id: 'editor.link.url' })); // eslint-disable-line no-alert

    if (link === '') {
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

  function insertImageClick() {
    const urlValue = window.prompt(intl.formatMessage({ id: 'editor.image.url' })); // eslint-disable-line no-alert
    const captionValue = window.prompt(intl.formatMessage({ id: 'editor.image.description' })); // eslint-disable-line no-alert
    const newEditorState = insertAtomicBlock(editorState, 'IMAGE', {
      src: urlValue,
      alt: captionValue,
    });

    handleChange(newEditorState);
  }

  function insertHorizontalRuleClick() {
    const newEditorState = insertAtomicBlock(editorState, 'HR');

    handleChange(newEditorState);
  }

  function insertIframeClick() {
    const urlValue = window.prompt(intl.formatMessage({ id: 'editor.iframe.url' })); // eslint-disable-line no-alert
    const newEditorState = insertAtomicBlock(editorState, 'IMAGE', { src: urlValue });

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
    <EditorContext.Provider value={{ editorState, handleChange }}>
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

export default injectIntl(WysiwygEditor);

// @flow
import React, { useState, useEffect } from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import { convertToRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

import exportHTMLOptions from './encoder/exportHTML';

import useIsMounted from './hooks/useIsMounted';
import useToggle from './hooks/useToggle';
import * as Icons from './components/Icons';
import WysiwygEditor from './WysiwygEditor';
import CodeEditor from './CodeEditor';
import { EditorWrapper, NotificationBanner } from './Editor.style';
import { type DraftEditorState } from './models/types';

type Props = {
  intl: IntlShape,
  id?: string,
  name: string,
  /** must be HTML format */
  initialContent: string,
  onContentChange?: (string, {| html: string, raw: ?Object |}) => void,
  uploadLocalImage?: (Function, Function) => void,
  attachFile?: (Function, Function) => void,
  enableViewSource?: boolean,
  /** show console.log of WysiwygEditor */
  debug?: boolean,
  disabled?: boolean,
};

function Editor({
  id = '',
  name,
  initialContent = '',
  onContentChange = () => {},
  uploadLocalImage,
  attachFile,
  debug = true,
  disabled = false,
  enableViewSource,
  intl,
}: Props) {
  const { current: isMounted } = useIsMounted();
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'code' | null>(null);
  const [notification, setNotification] = useState<?{ type: string, message: string }>(null);
  const [fullscreen, toggleFullscreen] = useToggle(false);
  const [editorFocused, setEditorFocused] = useState(disabled);
  const [currentContent, setCurrentContent] = useState<?DraftEditorState>(null); // raw state
  const [htmlSource, setHtmlSource] = useState<string>(initialContent); // html state

  function toggleEditorMode() {
    setEditorMode(state => (state === 'wysiwyg' ? 'code' : 'wysiwyg'));
  }

  // Side-effect to detect editor mode
  useEffect(() => {
    // TODO: improve detection of pure html on starting
    if (/ class=/i.test(initialContent) || / id=/i.test(initialContent)) {
      setNotification({
        type: 'info',
        message: intl.formatMessage({ id: 'editor.notification.autoconvert' }),
      });
      setEditorMode('code');
    } else {
      setEditorMode('wysiwyg');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Side-effect to disappear notification after 10s
  useEffect(() => {
    setTimeout(() => {
      setNotification(null);
    }, 10000);
  }, [notification]);

  // Side-effect to keep WysiwygEditor sync
  useEffect(() => {
    if (currentContent && editorMode === 'wysiwyg') {
      let html = stateToHTML(currentContent, exportHTMLOptions(currentContent));
      const raw = convertToRaw(currentContent);

      if (html !== htmlSource) {
        // Detect empty WYSIWYG, it's shitty sorry \o/
        if (
          raw.blocks.length === 1 &&
          raw.blocks[0].type === 'unstyled' &&
          raw.blocks[0].text === ''
        ) {
          html = '';
        }

        // Remove all extra-space and line jump
        html = html.replace(/&nbsp;/g, '').replace(/\n/g, '');
        setHtmlSource(html);
        onContentChange(name, { html, raw });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorMode, currentContent]);

  // Side-effect to keep CodeEditor sync
  useEffect(() => {
    if (editorMode === 'code') {
      onContentChange(name, { html: htmlSource, raw: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorMode, htmlSource]);

  if (!isMounted) return null;

  return (
    <EditorWrapper id={id} focused={editorFocused} fullscreen={fullscreen}>
      {editorMode === 'wysiwyg' ? (
        <WysiwygEditor
          debug={debug}
          initialContent={htmlSource}
          toggleEditorMode={toggleEditorMode}
          toggleFullscreen={toggleFullscreen}
          setEditorFocused={setEditorFocused}
          uploadLocalImage={uploadLocalImage}
          attachFile={attachFile}
          fullscreen={fullscreen}
          editorFocused={editorFocused}
          onChange={setCurrentContent}
          enableViewSource={enableViewSource}
        />
      ) : (
        <CodeEditor
          content={htmlSource}
          onChange={setHtmlSource}
          toggleFullscreen={toggleFullscreen}
          toggleEditorMode={toggleEditorMode}
          fullscreen={fullscreen}
        />
      )}
      {notification && (
        <NotificationBanner>
          <Icons.Info width="1em" height="1em" viewBox="0 0 24 24" /> {notification.message}
        </NotificationBanner>
      )}
    </EditorWrapper>
  );
}

export default injectIntl(Editor);

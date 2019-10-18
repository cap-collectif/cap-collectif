// @flow
import React, { useState, useEffect } from 'react';
import { convertToRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

import exportHTMLOptions from './encoder/exportHTML';

import useIsMounted from './hooks/useIsMounted';
import useToggle from './hooks/useToggle';
import * as Icons from './components/Icons';
import WysiwygEditor from './WysiwygEditor';
import CodeEditor from './CodeEditor';
import { EditorWrapper, NotificationBanner } from './Editor.style';

type Props = {
  name: string,
  /** must be HTML format */
  initialContent: string,
  onContentChange?: (string, {| html: string, raw: ?Object |}) => void,
  allowFullscreen?: boolean,
  allowViewSource?: boolean,
  allowEmbed?: boolean,
  /** show console.log of WysiwygEditor */
  debug?: boolean,
};

function Editor({
  name,
  initialContent = '',
  onContentChange = () => {},
  debug = false,
  allowFullscreen = true,
  allowViewSource = true,
  allowEmbed = true,
}: Props) {
  const { current: isMounted } = useIsMounted();
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'code' | null>(null);
  const [notification, setNotification] = useState<?{ type: string, message: string }>(null);
  const [fullscreen, toggleFullscreen] = useToggle(false);
  const [editorFocused, toggleEditorFocused] = useToggle(false);
  const [editorState, setEditorState] = useState<?Object>(null); // raw state
  const [htmlSource, setHtmlSource] = useState<string>(initialContent); // html state

  function toggleEditorMode() {
    setEditorMode(state => (state === 'wysiwyg' ? 'code' : 'wysiwyg'));
  }

  // Side-effect to detect editor mode
  useEffect(() => {
    // TODO: improve detection of pure html on starting
    if (/class=/i.test(initialContent) || /id=/i.test(initialContent)) {
      setNotification({
        type: 'info',
        message:
          "L'éditeur WYSIWYG a basculé automatiquement en mode éditeur HTML car du code personnalisé a été détecté.",
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
    if (editorState && editorMode === 'wysiwyg') {
      const currentContent = editorState.getCurrentContent();
      // const html = convertToHTML(exportHTMLOptions)(currentContent);
      const html = stateToHTML(currentContent, exportHTMLOptions(editorState));
      const raw = editorState ? convertToRaw(currentContent) : {};

      if (html !== htmlSource) {
        setHtmlSource(html);
        onContentChange(name, { html, raw });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorMode, editorState]);

  // Side-effect to keep CodeEditor sync
  useEffect(() => {
    if (editorMode === 'code') {
      onContentChange(name, { html: htmlSource, raw: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorMode, htmlSource]);

  if (!isMounted) return null;

  return (
    <EditorWrapper focused={editorFocused} fullscreen={fullscreen}>
      {editorMode === 'wysiwyg' ? (
        <WysiwygEditor
          debug={debug}
          content={htmlSource}
          toggleEditorMode={toggleEditorMode}
          toggleFullscreen={toggleFullscreen}
          toggleEditorFocused={toggleEditorFocused}
          fullscreen={fullscreen}
          editorFocused={editorFocused}
          onChange={setEditorState}
          allowFullscreen={allowFullscreen}
          allowEmbed={allowEmbed}
          allowViewSource={allowViewSource}
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

export default Editor;

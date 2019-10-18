// @flow
import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/vsDark';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';

import { CodeEditorArea, Line } from './CodeEditor.style';
import CodeToolbar from './toolbar/CodeToolbar';

const PARSER = {
  html: parserHtml,
};

type Props = {
  /** must be HTML format */
  content: string,
  language?: 'html',
  onChange: string => void,
  fullscreen: boolean,
  toggleFullscreen: Function,
  toggleEditorMode: Function,
};

function CodeEditor({
  content,
  language = 'html',
  fullscreen,
  toggleFullscreen,
  toggleEditorMode,
  onChange,
}: Props) {
  const [state, setState] = useState(
    prettier.format(content, {
      parser: language,
      plugins: [PARSER[language]],
      printWidth: 80,
      proseWrap: 'never',
      htmlWhitespaceSensitivity: 'css',
      tabWidth: 2,
      tabs: false,
    }),
  );

  function handleChange(code: string) {
    setState(code);
    onChange(code);
  }

  const handleHighlight = code => (
    <Highlight {...defaultProps} theme={theme} code={code} language={language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            <Line {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </Line>
          ))}
        </>
      )}
    </Highlight>
  );

  return (
    <>
      <CodeToolbar
        editorState={state}
        onFullscreenClick={toggleFullscreen}
        toggleEditorMode={toggleEditorMode}
        fullscreenMode={fullscreen}
      />
      <CodeEditorArea>
        <Editor
          value={state}
          onValueChange={handleChange}
          highlight={handleHighlight}
          tabSize={2}
          className="container__editor"
          padding={60}
          style={{
            whiteSpace: 'pre',
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: '1em',
          }}
        />
      </CodeEditorArea>
    </>
  );
}

export default CodeEditor;

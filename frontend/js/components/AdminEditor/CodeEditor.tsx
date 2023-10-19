// @ts-nocheck
import React, { useState } from 'react'
import Editor from 'react-simple-code-editor'
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'
import { CodeEditorArea, Line } from './CodeEditor.style'
import CodeToolbar from './toolbar/CodeToolbar'

type Props = {
  /** must be HTML format */
  content: string
  language?: 'html'
  onChange: (arg0: string) => void
  fullscreen: boolean
  toggleFullscreen: () => void
  toggleEditorMode: () => void
}

function CodeEditor({ content, language = 'html', fullscreen, toggleFullscreen, toggleEditorMode, onChange }: Props) {
  const [state, setState] = useState<string>(content.trim())

  function handleChange(code: string) {
    setState(code)
    onChange(code)
  }

  const handleHighlight = (code: string) => (
    <Highlight {...defaultProps} theme={theme} code={code} language={language}>
      {({
        tokens,
        getLineProps,
        getTokenProps,
      }: {
        tokens: Array<Array<Record<string, any>>>
        getLineProps: (...args: Array<any>) => any
        getTokenProps: (...args: Array<any>) => any
      }) => (
        <>
          {tokens.map((line, i) => (
            <Line
              {...getLineProps({
                line,
                key: i,
              })}
            >
              {line.map((token, key) => (
                <span
                  {...getTokenProps({
                    token,
                    key,
                  })}
                />
              ))}
            </Line>
          ))}
        </>
      )}
    </Highlight>
  )

  return (
    <>
      <CodeToolbar
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
  )
}

export default CodeEditor

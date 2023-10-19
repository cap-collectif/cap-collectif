import type { ComponentType } from 'react'
import 'react'
import styled from 'styled-components'

export const CodeEditorWrapper: ComponentType<{}> = styled('div')`
  position: relative;
  max-width: 100%;
  height: 480px;
  margin: auto;
  display: flex;
  flex-direction: column;
`
export const CodeEditorArea: ComponentType<{}> = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: text;
  overflow-y: scroll;
  text-align: left; /* force default left by default */
  background-color: #282c34;
  color: #fff;

  & *:focus {
    outline: 0;
  }

  .container__editor {
    counter-reset: line;
  }
`
export const Line: ComponentType<{}> = styled('div')`
  &:before {
    position: absolute;
    width: 30px;
    left: 0;
    text-align: right;
    opacity: 0.3;
    user-select: none;
    counter-increment: line;
    content: counter(line);
  }
`

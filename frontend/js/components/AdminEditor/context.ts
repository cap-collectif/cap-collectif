import React from 'react'
import type { DraftEditorState } from './models/types'
import './models/types'

export type EditorContextType = {
  handleChange: (arg0: DraftEditorState) => void
  setFocus: (arg0: boolean) => void
  editorState: DraftEditorState
}
export const EditorContext = React.createContext<EditorContextType | null | undefined>(null)
export const DispatchContext = React.createContext<(...args: Array<any>) => any>(null)
export const EntityContext = React.createContext<string | null | undefined>(null)

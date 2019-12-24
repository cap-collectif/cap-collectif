// @flow
import React from 'react';

import { type DraftEditorState } from './models/types';

export type EditorContextType = {|
  handleChange: DraftEditorState => void,
  setFocus: boolean => void,
  editorState: DraftEditorState,
|};

export const EditorContext = React.createContext<?EditorContextType>(null);

export const DispatchContext = React.createContext<Function>(null);

export const EntityContext = React.createContext<?string>(null);

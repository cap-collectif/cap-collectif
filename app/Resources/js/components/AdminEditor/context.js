// @flow
import React from 'react';

export type EditorContextType = {|
  handleChange: Object => void,
  editorState: Object,
|};

const EditorContext = React.createContext<?EditorContextType>(null);

export default EditorContext;

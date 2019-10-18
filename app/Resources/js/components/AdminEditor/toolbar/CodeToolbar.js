// @flow
import React from 'react';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';
import ToggleViewSource from './ToggleViewSource';
import { Toolbar, ToolbarGroup } from './Toolbar.style';

type Props = {
  editorState: string,
  fullscreenMode: boolean,
  onFullscreenClick: Function,
  toggleEditorMode: Function,
};

function CodeToolbar({ editorState, fullscreenMode, onFullscreenClick, toggleEditorMode }: Props) {
  return (
    <Toolbar>
      <ToolbarGroup>
        <ToggleViewSource toggleEditorMode={toggleEditorMode} active disabled={!!editorState} />
        <FormatButton tabIndex="-1" onClick={onFullscreenClick}>
          {fullscreenMode ? <Icons.FullscreenExit /> : <Icons.Fullscreen />}
        </FormatButton>
      </ToolbarGroup>
    </Toolbar>
  );
}

export default CodeToolbar;

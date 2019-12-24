// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';
import ToggleViewSource from './ToggleViewSource';
import { Toolbar, ToolbarGroup } from './Toolbar.style';

type Props = {|
  intl: IntlShape,
  fullscreenMode: boolean,
  onFullscreenClick: Function,
  toggleEditorMode: Function,
|};

function CodeToolbar({ intl, fullscreenMode, onFullscreenClick, toggleEditorMode }: Props) {
  return (
    <Toolbar>
      <ToolbarGroup>
        <ToggleViewSource toggleEditorMode={toggleEditorMode} active />
        <FormatButton
          tabIndex="-1"
          onClick={onFullscreenClick}
          title={intl.formatMessage({
            id: fullscreenMode ? 'editor.fullscreen.exit' : 'editor.fullscreen',
          })}>
          {fullscreenMode ? <Icons.FullscreenExit /> : <Icons.Fullscreen />}
        </FormatButton>
      </ToolbarGroup>
    </Toolbar>
  );
}

export default injectIntl(CodeToolbar);

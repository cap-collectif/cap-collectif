// @flow
import * as React from 'react';
import { useSelector } from 'react-redux';
import Jodit, { type Props as JoditProp } from './JoditEditor';

import type { GlobalState } from '~/types';

// TODO: during the switch we can not add correct props, types
// Once the old editor is removed, please fix this.
type Props = {|
  +clientConfig?: boolean,
  +initialContent?: string,
  ...JoditProp,
|};

const EditorSwitcher = ({ initialContent, clientConfig, ...props }: Props) => {
  const currentLanguage = useSelector((state: GlobalState) => state.language.currentLanguage);

  return (
    <Jodit
      {...props}
      value={initialContent}
      currentLanguage={currentLanguage}
      clientConfig={clientConfig}
    />
  );
};

export default EditorSwitcher;

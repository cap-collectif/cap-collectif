// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from 'storybook-addon-knobs';

import LanguageChangeButton from '../../../components/Ui/Button/LanguageChangeButton';

storiesOf('Core|Buttons/LanguageChangeButton', module).add('default', () => {
  const props = {
    onChange: () => {},
    defaultLanguage: 'Français',
    languageList: [
      { name: 'Français', translated: false },
      { name: 'English', translated: false },
      { name: 'Español', translated: true },
      { name: 'Deutsch', translated: true },
      { name: 'Nederlander', translated: true },
    ],
  };
  const pullRight = boolean('pullright', false);

  return <LanguageChangeButton {...props} pullRight={pullRight} />;
});

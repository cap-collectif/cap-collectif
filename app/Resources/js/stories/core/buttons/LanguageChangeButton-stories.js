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
      { language: 'Français', translated: false },
      { language: 'English', translated: false },
      { language: 'Español', translated: true },
      { language: 'Deutsch', translated: true },
      { language: 'Nederlander', translated: true },
    ],
  };
  const pullRight = boolean('pullright', false);

  return <LanguageChangeButton {...props} pullRight={pullRight} />;
});

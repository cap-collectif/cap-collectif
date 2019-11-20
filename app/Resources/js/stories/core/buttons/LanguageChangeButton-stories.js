// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import LanguageChangeButton from '../../../components/Ui/Button/LanguageChangeButton';

storiesOf('Core|Buttons/LanguageChangeButton', module).add('default', () => {
  const props = {
    onChange: () => {},
    defaultLanguage: { language: 'Français', translated: true },
    languageList: [
      { language: 'Deutsch', translated: true },
      { language: 'Nederlander', translated: false },
    ],
  };
  return <LanguageChangeButton {...props} />;
});

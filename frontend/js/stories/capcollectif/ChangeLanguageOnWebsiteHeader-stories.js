// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ChangeLanguageOnWebsiteHeader from '../../components/Ui/ChangeLanguageOnWebsiteHeader/ChangeLanguageOnWebsiteHeader';

const props = {
  onChange: () => {},
  onClose: () => {
    // reset styles so that is still visible in the storybook
    setTimeout(() => {
      const container = document.getElementById('changeLanguageProposalContainer');
      if (container) {
        container.style.minHeight = '75px';
        container.style.height = 'unset';
        container.style.overflowY = 'visible';
        container.style.paddingTop = '20px';
        container.style.paddingBottom = '20px';
      }
    }, 2000);
  },
  defaultLanguage: 'fr-FR',
  localeChoiceTranslations: [
    { code: 'de-DE', message: 'Möchten Sie die Seite in Ihrer Sprache anzeigen?', label: 'Weiter' },
    {
      code: 'en-GB',
      message: 'Do you want to consult the website in your language?',
      label: 'Continue',
    },
    {
      code: 'fr-FR',
      message: 'Voulez-vous consulter le site dans votre langue ?',
      label: 'Continuer',
    },
  ],
  languageList: [
    { translationKey: 'french', code: 'fr-FR' },
    { translationKey: 'english', code: 'en-GB' },
    { translationKey: 'spanish', code: 'sp-SP' },
    { translationKey: 'deutsch', code: 'de-DE' },
  ],
};

storiesOf('Cap Collectif/ChangeLanguageOnWebsiteHeader', module).add('default', () => {
  return <ChangeLanguageOnWebsiteHeader {...props} />;
});

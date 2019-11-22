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
  defaultLanguage: 'Français',
  languageList: ['Français', 'English', 'Español', 'Deutsch', 'Nederlander'],
};

storiesOf('Cap Collectif|ChangeLanguageOnWebsiteHeader', module).add('default', () => {
  return <ChangeLanguageOnWebsiteHeader {...props} />;
});

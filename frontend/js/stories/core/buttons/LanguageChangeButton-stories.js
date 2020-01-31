// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from 'storybook-addon-knobs';

import { LanguageButton } from '~/components/LanguageButton/LanguageButton';
import { $refType, $fragmentRefs } from '../../mocks/relay';

storiesOf('Core|Buttons/LanguageButton', module).add('default', () => {
  const props = {
    onChange: () => {},
    defaultLanguage: 'Français',
    languages: [
      { $refType, $fragmentRefs, id: 'fr-FR', code: 'FR_FR' },
      { $refType, $fragmentRefs, id: 'en-GB', code: 'EN_GB' },
      { $refType, $fragmentRefs, id: 'es-ES', code: 'ES_ES' },
      { $refType, $fragmentRefs, id: 'de-DE', code: 'DE_DE' },
      { $refType, $fragmentRefs, id: 'nl-NL', code: 'NL_NL' },
      { $refType, $fragmentRefs, id: 'sv-SV', code: 'SV_SV' },
    ],
  };
  const pullRight = boolean('pullright', false);

  return <LanguageButton {...props} pullRight={pullRight} />;
});

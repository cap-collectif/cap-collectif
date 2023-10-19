// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { boolean } from '@storybook/addon-knobs'
import { LanguageButton } from '~/components/LanguageButton/LanguageButton'
import { $refType, $fragmentRefs } from '../../mocks/relay'

storiesOf('Core/Buttons/LanguageButton', module).add('default', () => {
  const props = {
    onChange: () => {},
    defaultLanguage: 'Français',
    languages: [
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'fr-FR',
        code: 'FR_FR',
      },
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'en-GB',
        code: 'EN_GB',
      },
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'es-ES',
        code: 'ES_ES',
      },
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'de-DE',
        code: 'DE_DE',
      },
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'nl-NL',
        code: 'NL_NL',
      },
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'sv-SE',
        code: 'SV_SE',
      },
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'oc-OC',
        code: 'OC_OC',
      },
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
        id: 'eu-EU',
        code: 'EU_EU',
      },
    ],
  }
  const pullRight = boolean('pullright', false)
  return <LanguageButton {...props} pullRight={pullRight} />
})

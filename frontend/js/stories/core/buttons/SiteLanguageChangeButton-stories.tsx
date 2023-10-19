// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { number, color } from '@storybook/addon-knobs'
import SiteLanguageChangeButton from '../../../components/Ui/Button/SiteLanguageChangeButton'

const props = {
  onChange: () => {},
  defaultLanguage: 'fr-FR',
  languageList: [
    {
      translationKey: 'french',
      code: 'fr-FR',
    },
    {
      translationKey: 'english',
      code: 'en-GB',
    },
    {
      translationKey: 'deutsch',
      code: 'de-DE',
    },
  ],
}
storiesOf('Core/Buttons/SiteLanguageChangeButton', module)
  .add('default', () => {
    return <SiteLanguageChangeButton {...props} />
  })
  .add('customization', () => {
    const minWidth = number('minWidth', 170)
    const textColor = color('textColor', 'rgba(255,255,255,1)')
    const backgroundColor = color('backgroundColor', 'rgba(105,105,105,1)')
    return (
      <SiteLanguageChangeButton
        {...props}
        minWidth={minWidth}
        textColor={textColor}
        backgroundColor={backgroundColor}
      />
    )
  })
  .add('small variant (wip)', () => {
    return (
      <div
        style={{
          marginLeft: 'calc(50% - 20px)',
        }}
      >
        <SiteLanguageChangeButton {...props} small />
      </div>
    )
  })

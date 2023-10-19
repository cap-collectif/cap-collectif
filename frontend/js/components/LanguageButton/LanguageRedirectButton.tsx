import React from 'react'
import { useIntl } from 'react-intl'
import { DropdownLanguageButton } from '~/components/LanguageButton/LanguageButton'
import { LanguageContainer, LanguageTitle } from '~/components/LanguageButton/Language'
import Menu from '../DesignSystem/Menu/Menu'
import { ICON_NAME } from '~ds/Icon/Icon'

type CurrentLanguageProps = {
  language: string
}
type AvailableLanguageProps = {
  id: string
  redirect: string
  traductionKey: string
}
export type Props = {
  languages: [AvailableLanguageProps]
  currentLanguage: string
}

const Language = ({ language }: CurrentLanguageProps) => {
  const intl = useIntl()
  return (
    <LanguageContainer>
      {/* <Dot green={language.translated} /> */}
      <LanguageTitle>
        {intl.formatMessage({
          id: language,
        })}
      </LanguageTitle>
    </LanguageContainer>
  )
}

export const LanguageRedirectButton = ({ languages, currentLanguage }: Props) => {
  return (
    <Menu>
      <Menu.Button>
        <DropdownLanguageButton rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary" variantSize="medium">
          <Language language={currentLanguage} />
        </DropdownLanguageButton>
      </Menu.Button>
      <Menu.List>
        {languages.map(language => (
          <Menu.ListItem as="a" key={language.id} href={language.redirect}>
            <Language language={language.traductionKey} />
          </Menu.ListItem>
        ))}
      </Menu.List>
    </Menu>
  )
}
export default LanguageRedirectButton

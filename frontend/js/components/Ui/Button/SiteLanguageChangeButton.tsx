import React, { useState } from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import Menu from '../../DesignSystem/Menu/Menu'
import Button from '~ds/Button/Button'
import { ICON_NAME } from '~ds/Icon/Icon'

export type LocaleMap = {
  translationKey: string
  code: string
}
type Props = {
  id?: string | null | undefined
  onChange: (arg0: LocaleMap) => void
  languageList: Array<LocaleMap>
  defaultLanguage: string
  minWidth?: number
  maxWidth?: number
  textColor: string
  backgroundColor: string
  small: boolean
  borderless: boolean
}
const Language = styled.div<{
  color: string
}>`
  font-family: 'OpenSans', helvetica, arial, sans-serif;
  font-size: 16px;
  color: ${props => props.color};
`
const LanguageContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
`
const DropdownLanguageButton = styled(Button)<{
  minWidth?: number
  maxWidth?: number
  backgroundColor: string
  borderless: boolean
}>`
  display: flex;
  justify-content: space-between;
  min-width: ${props => (props.minWidth !== undefined ? `${props.minWidth}px` : '100%')};
  max-width: ${props => (props.maxWidth !== undefined ? `${props.maxWidth}px` : '100%')};
  background: ${({ backgroundColor }) => `${backgroundColor} ` || 'rgba(108, 117, 125, 0.2)'};
  border: ${props => props.borderless && 'none'};
  border-radius: 4px;
`
const Placeholder: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  width: 21px;
`
const LanguageTitle: StyledComponent<any, {}, HTMLSpanElement> = styled.span`
  color: initial;
  text-decoration: none;
`

const renderCurrentLanguage = (language: LocaleMap, textColor: string, small: boolean) => (
  <LanguageContainer>
    {!small && (
      <Language color={textColor}>
        <span>{language.translationKey}</span>
      </Language>
    )}
  </LanguageContainer>
)

const SiteLanguageChangeButton = ({
  onChange,
  languageList,
  defaultLanguage,
  minWidth,
  maxWidth,
  textColor,
  backgroundColor,
  small,
  borderless,
}: Props) => {
  const [currentLanguage, updateLanguage] = useState(languageList.find(e => e.code === defaultLanguage))
  if (!currentLanguage) return null
  return (
    <Menu placement="top" margin="auto">
      <Menu.Button>
        <DropdownLanguageButton
          id="language-change-button-dropdown"
          minWidth={minWidth}
          maxWidth={maxWidth}
          backgroundColor={backgroundColor}
          borderless={borderless}
          padding={0}
          variant="primary"
          variantSize="small"
          leftIcon={ICON_NAME.EARTH}
          rightIcon={small ? undefined : ICON_NAME.ARROW_DOWN_O}
        >
          {renderCurrentLanguage(currentLanguage, textColor, small)}
        </DropdownLanguageButton>
      </Menu.Button>
      <Menu.List id="language-change-menu-list">
        {languageList
          .filter(language => language.code !== currentLanguage.code || small)
          .sort((l1: LocaleMap, l2: LocaleMap) => {
            return l1.translationKey >= l2.translationKey ? 1 : -1
          })
          .map(language => (
            <Menu.ListItem
              id={`language-choice-${language.code}`}
              key={language.code}
              onClick={() => {
                updateLanguage(language)
                onChange(language)
              }}
            >
              {small &&
                (language.code === (currentLanguage as unknown as string) ? (
                  <i className="cap-android-done mr-5" />
                ) : (
                  <Placeholder />
                ))}
              <LanguageTitle>{language.translationKey}</LanguageTitle>
            </Menu.ListItem>
          ))}
      </Menu.List>
    </Menu>
  )
}

SiteLanguageChangeButton.defaultProps = {
  small: false,
  textColor: '#000',
  backgroundColor: '#FFF',
  borderless: false,
}
export default SiteLanguageChangeButton

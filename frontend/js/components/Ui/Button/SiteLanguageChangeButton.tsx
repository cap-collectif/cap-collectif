import { Box, CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'
import { Menu, MenuItem } from '@szhsin/react-menu'
import React, { useState } from 'react'
import styled from 'styled-components'

export type LocaleMap = {
  translationKey: string
  code: string
}
type Props = {
  id?: string | null | undefined
  onChange: (arg0: LocaleMap) => void
  languageList: Array<LocaleMap>
  defaultLanguage: string
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

const Placeholder = styled.div`
  width: 21px;
`
const LanguageTitle = styled.span`
  color: initial;
  text-decoration: none;
`

const renderCurrentLanguage = (language: LocaleMap, textColor: string, small: boolean) => (
  <Flex>
    {!small && (
      <Language color={textColor}>
        <span>{language.translationKey}</span>
      </Language>
    )}
  </Flex>
)

const SiteLanguageChangeButton = ({
  onChange,
  languageList,
  defaultLanguage,
  textColor,
  backgroundColor,
  small,
  borderless,
}: Props) => {
  const [currentLanguage, updateLanguage] = useState(languageList.find(e => e.code === defaultLanguage))
  if (!currentLanguage) return null
  return (
    <Box
      sx={{
        ul: {
          borderRadius: 4,
          overflow: 'hidden',
          border: 'normal',
          borderColor: 'gray.200',
        },
      }}
    >
      <Menu
        menuButton={
          <Flex
            as="button"
            justifyContent={['center', 'space-between']}
            id="language-change-button-dropdown"
            backgroundColor={backgroundColor ?? 'rgba(108, 117, 125, 0.2)'}
            border={borderless ? 'none' : undefined}
            p={1}
            minWidth="100%"
            maxWidth="100%"
            borderRadius="button"
          >
            <Icon name={CapUIIcon.Earth} size={CapUIIconSize.Md} />
            {renderCurrentLanguage(currentLanguage, textColor, small)}
            {!small ? <Icon name={CapUIIcon.ArrowDownO} size={CapUIIconSize.Md} /> : null}
          </Flex>
        }
      >
        {languageList
          .filter(language => language.code !== currentLanguage.code || small)
          .sort((l1: LocaleMap, l2: LocaleMap) => {
            return l1.translationKey >= l2.translationKey ? 1 : -1
          })
          .map(language => (
            // TODO Apply react-menu on DS
            <Flex
              as={MenuItem}
              bg="white"
              px={3}
              py={2}
              color="gray.900"
              _hover={{ bg: 'gray.100', cursor: 'pointer' }}
              _focus={{ bg: 'gray.100' }}
              sx={{
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
              textAlign="left"
              width="100%"
              minWidth="200px"
              alignItems="center"
              borderBottom="normal"
              borderColor="gray.200"
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
            </Flex>
          ))}
      </Menu>
    </Box>
  )
}

SiteLanguageChangeButton.defaultProps = {
  small: false,
  textColor: '#000',
  backgroundColor: '#FFF',
  borderless: false,
}
export default SiteLanguageChangeButton

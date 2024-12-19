import { Box, CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'
import { Menu, MenuItem } from '@szhsin/react-menu'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

export type LocaleMap = {
  translationKey: string
  code: string
}
type Props = {
  id?: string | null | undefined
  onChange: (arg0: LocaleMap) => void
  languageList: Array<LocaleMap>
  defaultLanguage: string
  textColor?: string
  backgroundColor?: string
  borderless?: boolean
  cookiesLanguage?: LocaleMap
}

const SiteLanguageChangeButton = ({
  onChange,
  languageList,
  defaultLanguage,
  textColor = 'black',
  backgroundColor = 'white',
  borderless = false,
  cookiesLanguage,
}: Props) => {
  const intl = useIntl()
  const [currentLanguage, updateLanguage] = useState(
    cookiesLanguage ? cookiesLanguage : languageList.find(e => e.code === defaultLanguage),
  )
  if (!currentLanguage) return null

  return (
    <Box
      sx={{
        ul: {
          zIndex: 1050,
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
            sx={{
              textTransform: 'capitalize',
            }}
            minWidth="100%"
            maxWidth="100%"
            borderRadius="button"
          >
            <Icon name={CapUIIcon.Earth} size={CapUIIconSize.Md} color="white" />
            <Flex>
              <Box as="div" color={textColor} fontSize={pxToRem(16)}>
                <span>{intl.formatMessage({ id: currentLanguage.translationKey })}</span>
              </Box>
            </Flex>
            <Icon name={CapUIIcon.ArrowDownO} size={CapUIIconSize.Md} color="white" />
          </Flex>
        }
      >
        {languageList
          .sort((l1: LocaleMap, l2: LocaleMap) => {
            return l1.translationKey >= l2.translationKey ? 1 : -1 // gitleaks:allow
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
                textTransform: 'capitalize',
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
              <Box as="span" color="initial" sx={{ textDecoration: 'none' }}>
                {intl.formatMessage({ id: language.translationKey })}
              </Box>
            </Flex>
          ))}
      </Menu>
    </Box>
  )
}

export default SiteLanguageChangeButton

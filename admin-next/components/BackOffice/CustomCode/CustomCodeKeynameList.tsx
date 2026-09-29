import { Box, CapUIFontSize, CapUIFontWeight, Flex, Link, Tag, Text } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { useAllFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { getBaseUrlWithAdminNextSupport } from '@utils/config'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { CustomCodeItem } from './customCodeVersioning.types'

const CUSTOM_CODE_PAGE_PATHS: Partial<Record<string, string>> = {
  'homepage.customcode': '',
  'event.customcode': '/events',
  'blog.customcode': '/blog',
  'themes.customcode': '/themes',
  'projects.customcode': '/projects',
  'contact.customcode': '/contact',
}

type CustomCodeKeynameListProps = {
  items: CustomCodeItem[]
  selectedKeyname: string
  onSelect: (keyname: string) => void
}

export const CustomCodeKeynameList: FC<CustomCodeKeynameListProps> = ({ items, selectedKeyname, onSelect }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const { multilangue } = useAllFeatureFlags()
  const localePrefix = intl.locale.split(/[-_]/)[0].toLowerCase()
  const platformUrl = multilangue
    ? `${getBaseUrlWithAdminNextSupport()}/${localePrefix}`
    : getBaseUrlWithAdminNextSupport()

  return (
    <Flex direction="column" spacing={3}>
      {items.map(item => (
        <Box
          key={item.keyname}
          bg="white"
          border="1px solid"
          borderColor={item.keyname === selectedKeyname ? 'blue.500' : 'gray.200'}
          borderRadius="8px"
          p={4}
        >
          <Box
            as="button"
            type="button"
            width="100%"
            bg="transparent"
            border="none"
            p={0}
            onClick={() => onSelect(item.keyname)}
            textAlign="left"
            sx={{ cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="flex-start" gap={2}>
              <Box>
                <Text color="gray.900" fontWeight={CapUIFontWeight.Semibold}>
                  {item.label}
                </Text>
                <Text color="gray.600" fontSize={CapUIFontSize.BodySmall}>
                  {item.description}
                </Text>
                {viewerSession.isSuperAdmin ? (
                  <Text color="gray.600" fontSize={CapUIFontSize.BodySmall}>
                    {item.keyname}
                  </Text>
                ) : null}
              </Box>
              <Tag flexShrink={0} variantColor={item.hasCode ? 'success' : 'infoGray'}>
                <Tag.Label>
                  {intl.formatMessage({
                    id: item.hasCode ? 'admin.settings.header.enabled' : 'admin.custom-code.empty',
                  })}
                </Tag.Label>
              </Tag>
            </Flex>
          </Box>
          {CUSTOM_CODE_PAGE_PATHS[item.keyname] !== undefined ? (
            <Link href={`${platformUrl}${CUSTOM_CODE_PAGE_PATHS[item.keyname]}`} target="_blank" rel="noreferrer">
              {intl.formatMessage({ id: 'global.see' })}
            </Link>
          ) : null}
        </Box>
      ))}
    </Flex>
  )
}

import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { GeographicalAreasListQuery } from '@relay/GeographicalAreasListQuery.graphql'
import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  Menu,
  ListCard,
} from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import GeographicalAreaDeleteModal from './GeographicalAreaDeleteModal'
import { useState } from 'react'
import GeographicalAreasEmptyPage from './GeographicalAreasEmptyPage'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { formatCodeToLocale } from '@utils/locale-helper'

export const QUERY = graphql`
  query GeographicalAreasListQuery {
    globalDistricts {
      edges {
        node {
          id
          translations {
            locale
            name
          }
        }
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isEnabled
      isDefault
      traductionKey
    }
  }
`

const GeographicalAreasList = () => {
  const intl = useIntl()
  const query = useLazyLoadQuery<GeographicalAreasListQuery>(QUERY, {})
  const { globalDistricts, availableLocales } = query
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [geographicalAreaId, setGeographicalAreaId] = useState<string | null>(null)
  const multilangue = useFeatureFlag('multilangue')

  const defaultLocale = availableLocales.find(locale => locale.isDefault)
  const [localeSelected, setLocaleSelected] = useState({
    label: intl.formatMessage({ id: defaultLocale?.traductionKey || 'french' }),
    value: formatCodeToLocale(defaultLocale?.code || 'FR_FR'),
  })

  return globalDistricts?.edges?.length ? (
    <Box bg="white" p={6} borderRadius="8px" mb={8}>
      <Flex justify="space-between" alignItems="flex-start">
        <Heading as="h4" color="blue.800" fontWeight={600} mb={4}>
          {intl.formatMessage({ id: 'areas-list' })}
        </Heading>
        {multilangue && (
          <Menu
            disclosure={
              <Button variantColor="primary" variantSize="big" variant="tertiary" rightIcon={CapUIIcon.ArrowDownO}>
                {localeSelected.label}
              </Button>
            }
            onChange={setLocaleSelected}
            value={localeSelected}
          >
            <Menu.List>
              {availableLocales.map(locale => (
                <Menu.Item
                  key={locale.code}
                  type="button"
                  value={{
                    label: intl.formatMessage({
                      id: locale.traductionKey,
                    }),
                    value: formatCodeToLocale(locale.code),
                  }}
                >
                  {intl.formatMessage({
                    id: locale.traductionKey,
                  })}
                </Menu.Item>
              ))}
            </Menu.List>
          </Menu>
        )}
      </Flex>

      <Flex justify="space-between" spacing={8}>
        <Box maxWidth="375px">
          <Text color="gray.600" mb={5}>
            {intl.formatMessage({ id: 'areas-helptext' })}
          </Text>
          <Button as="a" href="/admin-next/geographical-area" variant="primary">
            {intl.formatMessage({ id: 'add.geographical.area' })}
          </Button>
        </Box>
        <GeographicalAreaDeleteModal show={isOpen} onClose={onClose} geographicalAreaId={geographicalAreaId} />
        <ListCard width="100%">
          {globalDistricts?.edges
            ?.filter(Boolean)
            .map(edge => edge?.node)
            .filter(Boolean)
            .map(area => (
              <ListCard.Item key={area?.id}>
                <ListCard.Item.Label>
                  {area?.translations.find(t => t.locale === localeSelected.value)?.name ||
                    intl.formatMessage({ id: 'translation-not-available' })}
                </ListCard.Item.Label>
                <ButtonGroup>
                  <ButtonQuickAction
                    as="a"
                    href={`/admin-next/geographical-area?id=${area?.id}`}
                    variantColor="primary"
                    icon={CapUIIcon.Pencil}
                    label={intl.formatMessage({ id: 'global.edit' })}
                  />
                  <ButtonQuickAction
                    onClick={() => {
                      setGeographicalAreaId(area?.id || null)
                      onOpen()
                    }}
                    variantColor="danger"
                    icon={CapUIIcon.Trash}
                    label={intl.formatMessage({ id: 'global.delete' })}
                  />
                </ButtonGroup>
              </ListCard.Item>
            ))}
        </ListCard>
      </Flex>
    </Box>
  ) : (
    <GeographicalAreasEmptyPage />
  )
}

export default GeographicalAreasList

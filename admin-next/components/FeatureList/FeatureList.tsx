import { FC, useMemo, useState } from 'react'
import {
  Accordion,
  Box,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Flex,
  headingStyles,
  Search,
  Switch,
  Tag,
  Text,
} from '@cap-collectif/ui'
import { useAllFeatureFlags } from '@shared/hooks/useFeatureFlag'
import { IntlShape, useIntl } from 'react-intl'
import { getFeatureItemsFiltered, Item, Items } from './FeatureList.utils'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import ToggleFeatureMutation from '../../mutations/ToggleFeatureMutation'
import { FeatureFlagType } from '@relay/ToggleFeatureMutation.graphql'
import { SetSaving, useNavBarContext } from '../NavBar/NavBar.context'
import { useAppContext } from '../AppProvider/App.context'

const toggleFeatureFlag = (name: FeatureFlagType, enabled: boolean, intl: IntlShape, callBack: SetSaving) => {
  callBack(true)

  return ToggleFeatureMutation.commit({
    input: {
      type: name,
      enabled,
    },
  }).then(response => {
    callBack(false)

    if (!response.toggleFeature?.featureFlag) {
      return mutationErrorToast(intl)
    }
  })
}

const FeatureList: FC = () => {
  const allFeatureFlags = useAllFeatureFlags()
  const { viewerSession } = useAppContext()
  const intl = useIntl()
  const [term, setTerm] = useState('')
  const { setSaving } = useNavBarContext()
  const featureItemsFiltered = useMemo(
    () => getFeatureItemsFiltered(term, intl, allFeatureFlags, viewerSession.isSuperAdmin),
    [term, intl, allFeatureFlags, viewerSession.isSuperAdmin],
  )

  return (
    <Flex direction="column" spacing={6}>
      <Search
        variantColor="hierarchy"
        value={term}
        inputId="term"
        onChange={setTerm}
        placeholder={intl.formatMessage({ id: 'global.menu.search' })}
      />

      <Box bg="white" borderRadius="8px">
        <Accordion defaultAccordion="general" allowMultiple>
          {featureItemsFiltered.map(featureItem => (
            <Accordion.Item id={featureItem.id} key={featureItem.id}>
              <Accordion.Button>{intl.formatMessage({ id: featureItem.title })}</Accordion.Button>
              <Accordion.Panel pl={11}>
                <Flex direction="column" spacing={9}>
                  {featureItem.groups.map((group, idx) => {
                    return (
                      <Flex
                        direction="row"
                        justify="space-between"
                        key={`group-${idx}`}
                        className="feature-group"
                        spacing={11}
                      >
                        <Flex direction="column" flex={1} spacing={1}>
                          <Flex direction="row" spacing={1}>
                            <Text {...headingStyles.h4} color="gray.900">
                              {intl.formatMessage({
                                id: group.title,
                              })}
                            </Text>

                            {group.onlySuperAdmin && (
                              <Tag variantColor="infoGray">
                                <Tag.LeftIcon name={CapUIIcon.Lock} size={CapUIIconSize.Sm} mr={0} />
                              </Tag>
                            )}
                          </Flex>

                          {group.description && (
                            <Text fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S} color="gray.700">
                              {intl.formatMessage({
                                id: group.description,
                              })}
                            </Text>
                          )}
                        </Flex>

                        <Flex direction="column" flex={2} spacing={6}>
                          {(Object.entries(group.items) as [keyof Items, Item][]).map(
                            ([featureFlagName, featureFlagData]) => (
                              <Flex key={`flag-${featureFlagName}`} direction="row" justify="space-between" spacing={6}>
                                <Flex direction="column" spacing={1}>
                                  <Flex direction="row" spacing={1}>
                                    <Text
                                      fontSize={CapUIFontSize.BodyRegular}
                                      color="gray.900"
                                      fontWeight={CapUIFontWeight.Semibold}
                                    >
                                      {intl.formatMessage({
                                        id: featureFlagData.title,
                                      })}
                                    </Text>
                                    {featureFlagData.onlySuperAdmin && (
                                      <Tag variantColor="infoGray">
                                        <Tag.LeftIcon name={CapUIIcon.Lock} size={CapUIIconSize.Sm} mr={0} />
                                      </Tag>
                                    )}

                                    {(featureFlagName.includes('unstable__') || featureFlagName.includes('beta__')) && (
                                      <Tag variantColor={featureFlagName.includes('unstable__') ? 'danger' : 'warning'}>
                                        <Tag.Label>
                                          {intl.formatMessage({
                                            id: featureFlagName.includes('unstable__')
                                              ? 'work_in_progress'
                                              : 'global.beta',
                                          })}
                                        </Tag.Label>
                                      </Tag>
                                    )}
                                  </Flex>

                                  {featureFlagData.description && (
                                    <Text
                                      fontSize={CapUIFontSize.BodySmall}
                                      lineHeight={CapUILineHeight.S}
                                      color="gray.700"
                                    >
                                      {intl.formatMessage({
                                        id: featureFlagData.description,
                                      })}
                                    </Text>
                                  )}
                                </Flex>

                                <Box flexShrink={0}>
                                  <Switch
                                    id={`toggle-${featureFlagName}`}
                                    checked={allFeatureFlags[featureFlagName]}
                                    onChange={e =>
                                      toggleFeatureFlag(
                                        featureFlagName,
                                        (e.target as HTMLInputElement).checked,
                                        intl,
                                        setSaving,
                                      )
                                    }
                                  />
                                </Box>
                              </Flex>
                            ),
                          )}
                        </Flex>
                      </Flex>
                    )
                  })}
                </Flex>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Box>
    </Flex>
  )
}

export default FeatureList

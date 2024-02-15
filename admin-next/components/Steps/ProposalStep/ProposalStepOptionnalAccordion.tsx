import {
  CapUIBorder,
  CapUISpotIcon,
  CapUISpotIconSize,
  Checkbox,
  Flex,
  FormLabel,
  SpotIcon,
  Text,
  Tooltip,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import TextEditor from '../../Form/TextEditor/TextEditor'
import * as React from 'react'
import { EnabledEnum, MainViewEnum, zoomLevels } from '../CollectStep/CollectStepForm'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { ProposalStepOptionnalAccordion_step$key } from '../../../__generated__/ProposalStepOptionnalAccordion_step.graphql'
import { useEffect } from 'react'
import { addRequiredInfo } from '../CollectStep/ProposalFormForm.utils'
import { useCollectStep } from '../CollectStep/CollectStepContext'

type Props = {
  step: ProposalStepOptionnalAccordion_step$key
  defaultLocale: string
  formMethods: UseFormReturn<any>
  isEditing: boolean
  proposalFormKey?: string
}

const STEP_FRAGMENT = graphql`
  fragment ProposalStepOptionnalAccordion_step on ProposalStep {
    __typename
    ... on CollectStep {
      form {
        nbrOfMessagesSent
      }
    }
  }
`

const ProposalStepOptionnalAccordion: React.FC<Props> = ({ step: stepRef, defaultLocale, formMethods, isEditing, proposalFormKey = 'form' }) => {
  const intl = useIntl()
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const { watch, setValue, control, setError, clearErrors, formState, trigger } = formMethods
  const { errors } = formState

  const isListViewEnabled = watch(`${proposalFormKey}.isListViewEnabled`)
  const isGridViewEnabled = watch(`${proposalFormKey}.isGridViewEnabled`)
  const isMapViewEnabled = watch(`${proposalFormKey}.isMapViewEnabled`)
  const mainView = watch('mainView')

  const isCollectStep = step.__typename === 'CollectStep'
  const hasMainViewSelected = isListViewEnabled || isGridViewEnabled || isMapViewEnabled

  useEffect(() => {
    if (!hasMainViewSelected) {
      setError(`${proposalFormKey}.isListViewEnabled`, {
        type: 'custom',
        message: intl.formatMessage({ id: 'please-select-main-view' }),
      })
    } else {
      clearErrors(`${proposalFormKey}.isListViewEnabled`)
      trigger(`${proposalFormKey}.isListViewEnabled`)
    }
  }, [hasMainViewSelected, setError, clearErrors, intl, trigger, proposalFormKey])

  useEffect(() => {
    const views = {
      LIST: isListViewEnabled,
      GRID: isGridViewEnabled,
      MAP: isMapViewEnabled,
    }

    const activeViews = Object.entries(views).reduce((acc, [key, enabled]) => {
      if (enabled) {
        acc.push(key)
      }
      return acc
    }, [])

    const currentMainView = mainView['labels'][0] ?? null

    if (activeViews.includes(currentMainView) === false) {
      setValue('mainView', { labels: [activeViews[0]] })
    }
  }, [isListViewEnabled, isGridViewEnabled, isMapViewEnabled, mainView, setValue])

  const getMainViewChoices = () => {
    let options = []
    if (isListViewEnabled) {
      options.push({
        id: MainViewEnum.LIST,
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'collect.step.mainView.list',
        }),
      })
    }
    if (isGridViewEnabled) {
      options.push({
        id: MainViewEnum.GRID,
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'collect.step.mainView.grid',
        }),
      })
    }
    if (isMapViewEnabled) {
      options.push({
        id: MainViewEnum.MAP,
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'collect.step.mainView.map',
        }),
      })
    }

    return options
  }

  return (
    <>
      <Flex mt={2} direction="row" gap={4}>
        <Flex
          direction="column"
          gap={1}
          borderRadius={CapUIBorder.Normal}
          sx={{ cursor: 'pointer' }}
          _hover={{
            borderColor: !hasMainViewSelected ? 'red.500' : 'blue.500',
            bg: !hasMainViewSelected ? '' : 'blue.100',
          }}
          alignItems="center"
          width="120px"
          height="140px"
          borderWidth={1}
          borderColor={!hasMainViewSelected ? 'red.500' : 'gray.200'}
          justifyItems="center"
        >
          <SpotIcon name={CapUISpotIcon.TABLEAU} size={CapUISpotIconSize.Md} />
          <Text color="neutral-gray.900" fontSize={3} fontWeight={400}>
            {intl.formatMessage({
              id: 'collect.step.mainView.list',
            })}
          </Text>
          <Checkbox
            id={`mainView-${MainViewEnum.LIST}`}
            name={MainViewEnum.LIST}
            value={MainViewEnum.LIST}
            checked={isListViewEnabled}
            onClick={() => {
              setValue(`${proposalFormKey}.isListViewEnabled`, !isListViewEnabled)
            }}
          />
        </Flex>
        <Flex
          direction="column"
          gap={1}
          borderRadius={CapUIBorder.Normal}
          sx={{ cursor: 'pointer' }}
          _hover={{
            borderColor: !hasMainViewSelected ? 'red.500' : 'blue.500',
            bg: !hasMainViewSelected ? '' : 'blue.100',
          }}
          alignItems="center"
          width="120px"
          height="140px"
          borderWidth={1}
          borderColor={!hasMainViewSelected ? 'red.500' : 'gray.200'}
          justifyItems="center"
        >
          <SpotIcon name={CapUISpotIcon.VIGNETTE} size={CapUISpotIconSize.Md} />
          <Text color="neutral-gray.900" fontSize={3} fontWeight={400}>
            {intl.formatMessage({
              id: 'collect.step.mainView.grid',
            })}
          </Text>
          <Checkbox
            id={`mainView-${MainViewEnum.GRID}`}
            name={MainViewEnum.GRID}
            value={MainViewEnum.GRID}
            checked={isGridViewEnabled}
            onClick={() => {
              setValue(`${proposalFormKey}.isGridViewEnabled`, !isGridViewEnabled)
            }}
          />
        </Flex>
        {
          <Flex
            direction="row"
            borderRadius={CapUIBorder.Normal}
            sx={{ cursor: 'pointer' }}
            _hover={{
              borderColor: !hasMainViewSelected ? 'red.500' : 'blue.500',
              bg: !hasMainViewSelected ? '' : 'blue.100',
            }}
            alignItems="flex-start"
            width={isMapViewEnabled ? 'auto' : '120px'}
            height={isMapViewEnabled ? 'auto' : '140px'}
            borderWidth={1}
            borderColor={!hasMainViewSelected ? 'red.500' : 'gray.200'}
            justifyItems="center"
            gap={4}
          >
            <Flex direction="column" width={isMapViewEnabled ? '64px' : '100%'} alignItems="center" gap={1}>
              <SpotIcon name={CapUISpotIcon.CARTE} size={CapUISpotIconSize.Md} />
              <Text color="neutral-gray.900" fontSize={3} fontWeight={400}>
                {intl.formatMessage({
                  id: 'collect.step.mainView.map',
                })}
              </Text>
              <Checkbox
                id={`mainView-${MainViewEnum.MAP}`}
                name={MainViewEnum.MAP}
                value={MainViewEnum.MAP}
                checked={isMapViewEnabled}
                onClick={() => {
                  setValue(`${proposalFormKey}.isMapViewEnabled`, !isMapViewEnabled)
                  addRequiredInfo('usingAddress', setValue, proposalFormKey)
                }}
              />
            </Flex>
            {isMapViewEnabled && (
              <Flex direction={'column'} width="230px" p={2} gap={0} height="100%" sx={{ cursor: 'default' }}>
                <FormControl
                  name={`${proposalFormKey}.mapCenter.formatted`}
                  control={control}
                  sx={{
                    position: 'relative',
                    ul: {
                      position: 'absolute',
                      top: '54px',
                      zIndex: 1,
                    },
                  }}
                  mb={1}
                >
                  <FormLabel
                    label={intl.formatMessage({
                      id: 'initial-position-of-the-map',
                    })}
                  />
                  <FieldInput
                    data-cy="map_address"
                    name={`${proposalFormKey}.mapCenter.formatted`}
                    type="address"
                    control={control}
                    getAddress={add => {
                      setValue(`${proposalFormKey}.mapCenter.json`, JSON.stringify([add]))
                    }}
                    getPosition={(lat: number, lng: number) => {
                      setValue(`${proposalFormKey}.mapCenter.lat`, lat)
                      setValue(`${proposalFormKey}.mapCenter.lng`, lng)
                    }}
                  />
                </FormControl>
                <Flex direction="row" gap={2}>
                  <FormControl name={`${proposalFormKey}.mapCenter.lat`} control={control} mb={1}>
                    <FormLabel
                      label={intl.formatMessage({
                        id: 'proposal_form.lat_map',
                      })}
                    />
                    <FieldInput name={`${proposalFormKey}.mapCenter.lat`} type="number" control={control} />
                  </FormControl>
                  <FormControl name={`${proposalFormKey}.mapCenter.lng`} control={control} mb={1}>
                    <FormLabel
                      label={intl.formatMessage({
                        id: 'proposal_form.lng_map',
                      })}
                    />
                    <FieldInput name={`${proposalFormKey}.mapCenter.lng`} type="number" control={control} />
                  </FormControl>
                </Flex>
                <FormControl name={`${proposalFormKey}.zoomMap`} control={control}>
                  <FormLabel
                    label={intl.formatMessage({
                      id: 'proposal_form.zoom',
                    })}
                  />
                  <FieldInput
                    id="zoomMap"
                    menuPortalTarget={undefined}
                    name={`${proposalFormKey}.zoomMap`}
                    type="select"
                    control={control}
                    options={zoomLevels.map(level => {
                      return {
                        label: `${level.id} ${
                          level.name
                            ? `- ${intl.formatMessage({
                                id: level.name,
                              })}`
                            : ''
                        }`,
                        value: String(level.id),
                      }
                    })}
                  />
                </FormControl>
              </Flex>
            )}
          </Flex>
        }
      </Flex>

      {errors[proposalFormKey]?.isListViewEnabled && (
        <Text color="red.500">{errors[proposalFormKey].isListViewEnabled.message}</Text>
      )}

      {hasMainViewSelected && (
        <FormControl name="mainView" control={control} isRequired>
          <FormLabel label={intl.formatMessage({ id: 'default.view' })} />
          <FieldInput
            type="radio"
            name="mainView"
            id="mainView"
            control={control}
            // @ts-ignore
            checked={mainView}
            choices={getMainViewChoices()}
          />
        </FormControl>
      )}
      <FormControl name="metaDescription" control={control}>
        <FormLabel
          htmlFor="metaDescription"
          label={intl.formatMessage({
            id: 'global.meta.description',
          })}
        >
          <Text fontSize={2} color="gray.500">
            {intl.formatMessage({ id: 'global.optional' })}
          </Text>
        </FormLabel>
        <FieldInput id="metaDescription" type="textarea" control={control} name="metaDescription" />
      </FormControl>
      <FormProvider {...formMethods}>
        <TextEditor
          name="customCode"
          required={false}
          label={intl.formatMessage({
            id: 'admin.customcode',
          })}
          platformLanguage={defaultLocale}
          selectedLanguage={defaultLocale}
          buttonLabels={{
            submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
          }}
        />
      </FormProvider>

      {isCollectStep && (
        <FormControl name={`${proposalFormKey}.canContact`} control={control} mb={6}>
          <FormLabel
            htmlFor={`${proposalFormKey}.canContact`}
            label={intl.formatMessage({
              id: 'admin.proposal.form.canContact.label',
            })}
          />
          <FieldInput
            data-cy="canContact"
            id={`${proposalFormKey}.canContact`}
            name={`${proposalFormKey}.canContact`}
            control={control}
            type="checkbox"
          >
            <Flex direction="row" align="center">
              {intl.formatMessage({
                id: 'admin.proposal.form.canContact.text',
              })}
              <Tooltip
                label={intl.formatMessage(
                  { id: 'messages.sent.to.author.count' },
                  {
                    num: !!step.form ? step.form.nbrOfMessagesSent : 0,
                  },
                )}
              >
                <Flex
                  as="p"
                  width="16px"
                  direction="row"
                  align="center"
                  justify="center"
                  p="2px"
                  bg="gray.200"
                  m={0}
                  ml={1}
                  borderRadius="2px"
                >
                  {!!step.form ? step.form.nbrOfMessagesSent : 0}
                </Flex>
              </Tooltip>
            </Flex>
          </FieldInput>
        </FormControl>
      )}

      <FormControl name="enabled" control={control}>
        <FormLabel label={intl.formatMessage({ id: 'global.publication' })} />
        <FieldInput
          type="radio"
          name="enabled"
          id="enabled"
          control={control}
          choices={[
            {
              id: EnabledEnum.PUBLISHED,
              useIdAsValue: true,
              label: intl.formatMessage({
                id: 'admin.fields.step.is_enabled',
              }),
            },
            {
              id: EnabledEnum.DRAFT,
              useIdAsValue: true,
              label: intl.formatMessage({
                id: 'admin.fields.proposal.state.choices.draft',
              }),
            },
          ]}
        />
      </FormControl>
    </>
  )
}

export default ProposalStepOptionnalAccordion

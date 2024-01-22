import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Accordion,
  Box,
  Button,
  CapUIAccordionColor,
  CapUIBorder,
  CapUISpotIcon,
  CapUISpotIconSize,
  Checkbox,
  Flex,
  FormLabel,
  SpotIcon,
  Text,
  toast,
  Tooltip,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import TextEditor from '@components/Form/TextEditor/TextEditor'
import ProposalFormForm from '@components/Steps/CollectStep/ProposalFormForm'
import ProposalStepRequirementsTabs from '@components/Requirements/ProposalStepRequirementsTabs'
import CollectStepVoteTabsForm from '@components/Steps/CollectStep/CollectStepVoteTabsForm'
import {RequirementsFormValues} from '@components/Requirements/Requirements'
import {
  CollectStepFormQuery,
  MainView,
  ProposalArchivedUnitTime,
  ProposalStepStatusColor,
  ProposalStepVoteType,
} from '@relay/CollectStepFormQuery.graphql'
import CollectStepStatusesList from '@components/Steps/CollectStep/CollectStepStatusesList'
import { CollectStepStatusesList_step$key } from '@relay/CollectStepStatusesList_step.graphql'
import { CollectStepVoteTabsForm_step$key } from '@relay/CollectStepVoteTabsForm_step.graphql'
import { ProposalFormForm_step$key } from '@relay/ProposalFormForm_step.graphql'
import RequirementsTabsSkeleton from '@components/Requirements/RequirementsTabsSkeleton'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import {
  getCollectStepInput,
  getInitialValues,
  getProposalFormUpdateVariablesInput,
} from '@components/Steps/CollectStep/CollectStepForm.utils'
import UpdateCollectStepMutation from '@mutations/UpdateCollectStepMutation'
import DeleteStepMutation from '@mutations/DeleteStepMutation'
import { useAppContext } from '@components/AppProvider/App.context'
import UpdateProposalFormMutation from '@mutations/UpdateProposalFormMutation'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {useCollectStep} from "./CollectStepContext";

export interface CollectStepFormProps {
  stepId: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}
type StepTypeDurationTypeUnion = 'CUSTOM' | 'TIMELESS'
type StepVisibiltyTypeUnion = 'PUBLIC' | 'RESTRICTED'
type EnabledUnion = 'PUBLISHED' | 'DRAFT'

export type FormValues = {
  id: string
  label: string
  body: string | null
  title: string
  startAt: string | null
  endAt: string | null
  statuses?:
    | Array<{
    id: string
    name: string
    color: ProposalStepStatusColor
  }>
    | undefined
  defaultStatus: string | null
  form: {
    id: string | null
    title: string | null
    titleHelpText: string | null
    usingSummary: boolean
    summaryHelpText: string | null
    usingDescription: boolean
    description: string | null
    usingIllustration: boolean
    illustrationHelpText: string | null
    usingThemes: boolean
    themeHelpText: string | null
    themeMandatory: boolean
    usingCategories: boolean
    descriptionMandatory: boolean
    categoryHelpText: string | null
    descriptionHelpText: string | null
    categories: Array<{
      id: string
      name: string
      color: string
      icon: string | null
      categoryImage: {
        id: string
        image: {
          url: string
          id: string
        } | null
      } | null
    }> | null
    categoryMandatory: boolean
    usingAddress: boolean
    addressHelpText: string | null
    usingDistrict: boolean
    districts: Array<{
      geojson: string | null
      displayedOnMap: boolean
      border: {
        color: string | null
        opacity: number | null
        size: number | null
      } | null
      background: {
        color: string | null
        opacity: number | null
      } | null
      translations: Array<{
        name: string
        locale: string
      }>
    }>
    districtHelpText: string | null
    districtMandatory: boolean
    isGridViewEnabled: boolean
    isListViewEnabled: boolean
    isMapViewEnabled: boolean
    mapCenter?: {
      formatted: string | null
      json: string
      lat: number
      lng: number
    } | null
    zoomMap?: string | null
    canContact: boolean
    nbrOfMessagesSent: number
    proposalInAZoneRequired: boolean
  }
  stepDurationType?: {
    labels: Array<string>
  }
  stepVisibilityType?: {
    labels: Array<string>
  }
  voteType: ProposalStepVoteType | undefined
  votesMin: number | null | undefined
  votesLimit: number | null | undefined
  votesRanking: boolean | undefined
  budget: number | null | undefined
  voteThreshold: number | null | undefined
  publishedVoteDate: string | null | undefined
  votesHelpText: string | null | undefined
  secretBallot: boolean | undefined
  isProposalSmsVoteEnabled: boolean | undefined
  proposalArchivedTime?: number | undefined
  proposalArchivedUnitTime?: ProposalArchivedUnitTime | undefined
  allowAuthorsToAddNews: boolean | undefined
  defaultSort: string | null | undefined
  private: boolean | undefined
  mainView: {
    labels: Array<string>
  }
  enabled: {
    labels: Array<string>
  }
  metaDescription: string
  customCode: string
} & RequirementsFormValues

const COLLECT_FRAGMENT = graphql`
  query CollectStepFormQuery($stepId: ID!) {
    step: node(id: $stepId) {
      id
      ... on CollectStep {
        title
        body
        label
        metaDescription
        customCode
        timeRange {
          startAt
          endAt
        }
        timeless
        allowAuthorsToAddNews
        defaultSort
        private
        statuses {
          id
          name
          color
        }
        defaultStatus {
          id
          name
          color
        }
        enabled
        ...CollectStepStatusesList_step
        ...ProposalFormForm_step
        form {
          id
          title
          isGridViewEnabled
          isListViewEnabled
          isMapViewEnabled
          titleHelpText
          descriptionMandatory
          categoryHelpText
          descriptionHelpText
          usingSummary
          summaryHelpText
          usingDescription
          description
          usingIllustration
          illustrationHelpText
          usingThemes
          themeHelpText
          themeMandatory
          usingCategories
          categories {
            id
            name
            color
            icon
            categoryImage {
              id
              image {
                url
                id
              }
            }
          }
          categoryMandatory
          usingAddress
          addressHelpText
          usingDistrict
          districts {
            id
            name
            titleOnMap
            geojson
            displayedOnMap
            geojsonStyle
            border {
              enabled
              color
              opacity
              size
            }
            background {
              enabled
              color
              opacity
              size
            }
            translations {
              name
              locale
            }
          }
          districtHelpText
          districtMandatory
          zoomMap
          mapCenter {
            formatted
            json
            lat
            lng
          }
          canContact
          nbrOfMessagesSent
          proposalInAZoneRequired
        }
        project {
          id
          title
          canEdit
          adminAlphaUrl
        }
        voteType
        votesMin
        votable
        votesLimit
        votesRanking
        voteThreshold
        votesHelpText
        budget
        publishedVoteDate
        isSecretBallot
        isProposalSmsVoteEnabled
        proposalArchivedTime
        proposalArchivedUnitTime
        ...Requirements_requirementStep @relay(mask: false)
        requirements {
          totalCount
          edges {
            node {
              id
              __typename
            }
          }
        }
        mainView
        ...ProposalStepRequirementsTabs_proposalStep
        ...CollectStepVoteTabsForm_step
      }
    }
    ...ProposalFormForm_query
    ...CollectStepStatusesList_query
    siteColors {
      keyname
      value
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
    }
    viewer {
      __typename
      id
      username
      isAdmin
      organizations {
        __typename
        id
        username
      }
    }
  }
`
export const zoomLevels = [
  { id: 1, name: 'map.zoom.world' },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5, name: 'map.zoom.mainland' },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10, name: 'map.zoom.city' },
  { id: 11 },
  { id: 12 },
  { id: 13 },
  { id: 14 },
  { id: 15, name: 'map.zoom.street' },
  { id: 16 },
  { id: 17 },
  { id: 18, name: 'map.zoom.building' },
]
export const StepDurationTypeEnum: Record<StepTypeDurationTypeUnion, StepTypeDurationTypeUnion> = {
  CUSTOM: 'CUSTOM',
  TIMELESS: 'TIMELESS',
} as const
export const StepVisibilityTypeEnum: Record<StepVisibiltyTypeUnion, StepVisibiltyTypeUnion> = {
  PUBLIC: 'PUBLIC',
  RESTRICTED: 'RESTRICTED',
} as const

export const EnabledEnum: Record<EnabledUnion, EnabledUnion> = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
} as const
export const MainViewEnum: Record<MainView, MainView> = {
  GRID: 'GRID',
  LIST: 'LIST',
  MAP: 'MAP',
} as const

const CollectStepForm: React.FC<CollectStepFormProps> = ({ stepId, setHelpMessage }) => {
  const query = useLazyLoadQuery<CollectStepFormQuery>(COLLECT_FRAGMENT, {
    stepId,
  })
  const intl = useIntl()
  const { setBreadCrumbItems } = useNavBarContext()
  const { viewerSession } = useAppContext()
  const { step, availableLocales, viewer, siteColors } = query
  const bgColor = siteColors.find(elem => elem.keyname === 'color.btn.primary.bg').value
  const project = step?.project
  const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr'

  const {operationType, setOperationType} = useCollectStep();
  const isEditing = operationType === 'EDIT'

  const getBreadCrumbItems = () => {
    const breadCrumbItems = [
      {
        title: project?.title ?? '',
        href: project?.adminAlphaUrl ?? '',
      },
      {
        title: intl.formatMessage({ id: 'add-step' }),
        href: `/admin-next/project/${project?.id}/create-step`,
      },
      {
        title: intl.formatMessage({ id: 'collect-step' }),
        href: '',
      },
    ]
    if (isEditing) {
      return breadCrumbItems.filter(item => item.title !== intl.formatMessage({ id: 'add-step' }))
    }
    return breadCrumbItems
  }
  const onSubmit = async (values: FormValues) => {
    const owner = viewer?.organizations?.[0] ?? viewer
    const proposalFormUpdateInput = getProposalFormUpdateVariablesInput(values['form'])
    try {
      const proposalFormUpdateResponse = await UpdateProposalFormMutation.commit({
        input: {
          ...proposalFormUpdateInput,
          proposalFormId: step?.form?.id || '',
        },
      })
      if (proposalFormUpdateResponse) {
        const input = getCollectStepInput(
          values,
          // @ts-ignore
          proposalFormUpdateResponse.updateProposalForm?.proposalForm.id,
          stepId,
          bgColor,
        )
        try {
          // @ts-ignore
          const response = await UpdateCollectStepMutation.commit({ input })
          if (!response.updateCollectStep) {
            return mutationErrorToast(intl)
          }
          toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'admin.update.successful' }),
          })
          setOperationType('EDIT')
        } catch {
          return mutationErrorToast(intl)
        }
      }
    } catch (e) {
      return mutationErrorToast(intl)
    }
  }
  const onBack = async () => {
    if (!project?.adminAlphaUrl) {
      return
    }

    if (!isEditing) {
      window.location.href = project.adminAlphaUrl
      return
    }

    try {
      await DeleteStepMutation.commit({ input: { stepId } })
      window.location.href = project.adminAlphaUrl
    } catch (error) {
      return mutationErrorToast(intl)
    }
  }
  React.useEffect(() => {
    setBreadCrumbItems(getBreadCrumbItems())
    return () => setBreadCrumbItems([])
  }, [])

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(step, stepId, bgColor),
    resolver: yupResolver(
      yup.object({
        label: yup
          .string()
          .ensure()
          .min(2, intl.formatMessage({ id: 'collect.form.title.min_length' })),
      }),
    ),
  })

  const { handleSubmit, formState, control, watch, setValue } = formMethods
  const { isSubmitting, isValid } = formState
  const stepDurationType = watch('stepDurationType')
  const isCustomStepDuration = stepDurationType?.labels?.[0] === StepDurationTypeEnum.CUSTOM
  return (
    <Box bg="white" width="70%" p={6} borderRadius="8px">
      <Text fontWeight={600} color="blue.800" fontSize={4}>
        {intl.formatMessage({ id: 'customize-your-collect-step' })}
      </Text>
      <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)} gap={6}>
        <FormControl
          name="label"
          control={control}
          isRequired
          mb={6}
          onMouseEnter={() => {
            setHelpMessage('step.create.label.helpText')
          }}
        >
          <FormLabel htmlFor="label" label={intl.formatMessage({ id: 'step-label-name' })} />
          <FieldInput
            id="label"
            name="label"
            control={control}
            type="text"
            placeholder={intl.formatMessage({ id: 'step-label-name-placeholder' })}
          />
        </FormControl>
        <FormProvider {...formMethods}>
          <TextEditor
            name="body"
            label={intl.formatMessage({ id: 'step-description' })}
            platformLanguage={defaultLocale}
            selectedLanguage={defaultLocale}
            buttonLabels={{
              submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
            }}
            advancedEditor
          />
        </FormProvider>
        <FormControl name="stepDurationType" control={control} mb={6}>
          <FormLabel htmlFor="stepDurationType" label={intl.formatMessage({ id: 'step-duration' })} />
          <FieldInput
            id="stepDurationType"
            name="stepDurationType"
            control={control}
            type="radio"
            choices={[
              {
                id: StepDurationTypeEnum.TIMELESS,
                label: intl.formatMessage({ id: 'timeless' }),
                useIdAsValue: true,
              },
              {
                id: StepDurationTypeEnum.CUSTOM,
                label: intl.formatMessage({ id: 'global.custom.feminine' }),
                useIdAsValue: true,
              },
            ]}
          />
        </FormControl>
        {isCustomStepDuration && (
          <Box color="gray.900" mt={6}>
            <Flex>
              <FormControl name="startAt" control={control} width="max-content" mr={6}>
                <FormLabel htmlFor="startAt" label={intl.formatMessage({ id: 'start-date' })}>
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FieldInput id="startAt" name="startAt" control={control} type="dateHour" dateInputProps={{ isOutsideRange: true }}  />
              </FormControl>
              <FormControl name="endAt" control={control} width="max-content">
                <FormLabel htmlFor="endAt" label={intl.formatMessage({ id: 'ending-date' })}>
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FieldInput id="endAt" name="endAt" control={control} type="dateHour" dateInputProps={{ isOutsideRange: true }}  />
              </FormControl>
            </Flex>
          </Box>
        )}
        <Box>
          <Box mb={4}>
            <Accordion
              color={CapUIAccordionColor.Transparent}
            >
              <Accordion.Item
                id={intl.formatMessage({ id: 'proposal-form' })}
                onMouseEnter={e => {
                  setHelpMessage('step.create.proposalForm.helpText')
                }}
              >
                <Accordion.Button>{intl.formatMessage({ id: 'proposal-form' })}</Accordion.Button>
                <Accordion.Panel>
                  <ProposalFormForm
                    control={control}
                    values={watch('form')}
                    setValue={setValue}
                    query={query}
                    step={step as ProposalFormForm_step$key}
                    defaultLocale={defaultLocale}
                    formMethods={formMethods}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion color={CapUIAccordionColor.Transparent}>
              <Accordion.Item id={intl.formatMessage({ id: 'vote-capitalize' })}>
                <Accordion.Button>{intl.formatMessage({ id: 'vote-capitalize' })}</Accordion.Button>
                <Accordion.Panel>
                  <CollectStepVoteTabsForm
                    step={step as CollectStepVoteTabsForm_step$key}
                    defaultLocale={defaultLocale}
                    formMethods={formMethods}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion color={CapUIAccordionColor.Transparent}>
              <Accordion.Item id={intl.formatMessage({ id: 'required-infos-to-participate' })}>
                <Accordion.Button>{intl.formatMessage({ id: 'required-infos-to-participate' })}</Accordion.Button>
                <Accordion.Panel>
                  <React.Suspense fallback={<RequirementsTabsSkeleton />}>
                    <ProposalStepRequirementsTabs proposalStep={step} formMethods={formMethods} />
                  </React.Suspense>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion color={CapUIAccordionColor.Transparent}>
              <Accordion.Item id={intl.formatMessage({ id: 'status.plural' })}>
                <Accordion.Button>{intl.formatMessage({ id: 'status.plural' })}</Accordion.Button>
                <Accordion.Panel>
                  <CollectStepStatusesList
                    formMethods={formMethods}
                    step={step as CollectStepStatusesList_step$key}
                    // @ts-ignore
                    setValue={setValue}
                    query={query}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion color={CapUIAccordionColor.Transparent}>
              <Accordion.Item id={intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}>
                <Accordion.Button>{intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}</Accordion.Button>
                <Accordion.Panel>
                  <FormControl name="allowAuthorsToAddNews" control={control} mb={6}>
                    <FormLabel
                      htmlFor="allowAuthorsToAddNews"
                      label={intl.formatMessage({ id: 'proposal-news-label' })}
                    />
                    <FieldInput id="allowAuthorsToAddNews" name="allowAuthorsToAddNews" control={control} type="checkbox">
                      {intl.formatMessage({ id: 'admin.allow.proposal.news' })}
                    </FieldInput>
                  </FormControl>
                  <FormControl name="stepVisibilityType" control={control} mb={6}>
                    <FormLabel htmlFor="stepVisibilityType" label={intl.formatMessage({ id: 'project-visibility' })} />
                    <FieldInput
                      id="stepVisibilityType"
                      name="stepVisibilityType"
                      control={control}
                      type="radio"
                      choices={[
                        {
                          id: StepVisibilityTypeEnum.PUBLIC,
                          label: `${intl.formatMessage({
                            id: 'public',
                          })} - (${intl.formatMessage({ id: 'everybody' })})`,
                          useIdAsValue: true,
                        },
                        {
                          id: StepVisibilityTypeEnum.RESTRICTED,
                          label: `${intl.formatMessage({
                            id: 'global-restricted',
                          })} - (${intl.formatMessage({
                            id: 'authors-and-administrators',
                          })})`,
                          useIdAsValue: true,
                        },
                      ]}
                    />
                  </FormControl>
                  <FormControl name="defaultSort" control={control} maxWidth="256px">
                    <FormLabel
                      htmlFor="defaultSort"
                      label={intl.formatMessage({
                        id: 'admin_next.fields.step.default_sort',
                      })}
                    />
                    <FieldInput
                      name="defaultSort"
                      control={control}
                      type="select"
                      options={[
                        {
                          label: intl.formatMessage({ id: 'global.random' }),
                          value: 'RANDOM',
                        },
                        {
                          label: intl.formatMessage({
                            id: 'global.filter_f_comments',
                          }),
                          value: 'COMMENTS',
                        },
                        {
                          label: intl.formatMessage({
                            id: 'global.filter_f_last',
                          }),
                          value: 'LAST',
                        },
                        {
                          label: intl.formatMessage({
                            id: 'global.filter_f_old',
                          }),
                          value: 'OLD',
                        },
                        {
                          label: intl.formatMessage({
                            id: 'step.sort.votes',
                          }),
                          value: 'VOTES',
                        },
                        {
                          label: intl.formatMessage({
                            id: 'global.filter_f_least-votes',
                          }),
                          value: 'LEAST_VOTE',
                        },
                        {
                          label: intl.formatMessage({
                            id: 'global.filter_f_cheap',
                          }),
                          value: 'CHEAP',
                        },
                        {
                          label: intl.formatMessage({
                            id: 'global.filter_f_expensive',
                          }),
                          value: 'EXPENSIVE',
                        },
                      ]}
                      defaultOptions
                    />
                  </FormControl>
                  <FormControl name="defaultStatus" control={control} maxWidth="256px">
                    <FormLabel
                      htmlFor="defaultStatus"
                      label={intl.formatMessage({
                        id: 'admin.fields.step.default_status',
                      })}
                    />
                    <FieldInput
                      name="defaultStatus"
                      control={control}
                      type="select"
                      options={step.statuses.map(status => ({
                        label: status.name,
                        value: status.id,
                      }))}
                      defaultOptions
                    />
                  </FormControl>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion color={CapUIAccordionColor.Transparent}>
              <Accordion.Item id={intl.formatMessage({ id: 'optional-settings' })}>
                <Accordion.Button>{intl.formatMessage({ id: 'optional-settings' })}</Accordion.Button>
                <Accordion.Panel gap={6}>
                  <Flex mt={2} direction="row" gap={4}>
                    <Flex
                      direction="column"
                      gap={1}
                      borderRadius={CapUIBorder.Normal}
                      sx={{ cursor: 'pointer' }}
                      _hover={{
                        borderColor: 'blue.500',
                        bg: 'blue.100',
                      }}
                      alignItems="center"
                      width="120px"
                      height="140px"
                      borderWidth={1}
                      borderColor={'gray.200'}
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
                        checked={watch('form.isListViewEnabled')}
                        onClick={() => {
                          if (watch('form.isListViewEnabled')) {
                            setValue('form.isListViewEnabled', false)
                          } else {
                            setValue('form.isListViewEnabled', true)
                          }
                        }}
                      />
                    </Flex>
                    <Flex
                      direction="column"
                      gap={1}
                      borderRadius={CapUIBorder.Normal}
                      sx={{ cursor: 'pointer' }}
                      _hover={{
                        borderColor: 'blue.500',
                        bg: 'blue.100',
                      }}
                      alignItems="center"
                      width="120px"
                      height="140px"
                      borderWidth={1}
                      borderColor={'gray.200'}
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
                        checked={watch('form.isGridViewEnabled')}
                        onClick={() => {
                          if (watch('form.isGridViewEnabled')) {
                            setValue('form.isGridViewEnabled', false)
                          } else {
                            setValue('form.isGridViewEnabled', true)
                          }
                        }}
                      />
                    </Flex>
                    <Flex
                      direction="row"
                      borderRadius={CapUIBorder.Normal}
                      sx={{ cursor: 'pointer' }}
                      _hover={{
                        borderColor: 'blue.500',
                        bg: 'blue.100',
                      }}
                      alignItems="flex-start"
                      width={watch('form.isMapViewEnabled') ? 'auto' : '120px'}
                      height={watch('form.isMapViewEnabled') ? 'auto' : '140px'}
                      borderWidth={1}
                      borderColor={'gray.200'}
                      justifyItems="center"
                      gap={4}
                    >
                      <Flex
                        direction="column"
                        width={watch('form.isMapViewEnabled') ? '64px' : '100%'}
                        alignItems="center"
                        gap={1}
                      >
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
                          checked={watch('form.isMapViewEnabled')}
                          onClick={() => {
                            if (watch('form.isMapViewEnabled')) {
                              setValue('form.isMapViewEnabled', false)
                            } else {
                              setValue('form.isMapViewEnabled', true)
                            }
                          }}
                        />
                      </Flex>
                      {watch('form.isMapViewEnabled') && (
                        <Flex direction={'column'} width="230px" p={2} gap={0} height="100%" sx={{ cursor: 'default' }}>
                          <FormControl
                            name="form.mapCenter.formatted"
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
                              name="form.mapCenter.formatted"
                              type="address"
                              control={control}
                              getAddress={add => {
                                setValue(
                                  'form.mapCenter.json',
                                  JSON.stringify([add]),
                                )
                              }}
                              getPosition={(lat: number, lng: number) => {
                                setValue('form.mapCenter.lat', lat)
                                setValue('form.mapCenter.lng', lng)
                              }}
                            />
                          </FormControl>
                          <Flex direction="row" gap={2}>
                            <FormControl name="form.mapCenter.lat" control={control} mb={1}>
                              <FormLabel
                                label={intl.formatMessage({
                                  id: 'proposal_form.lat_map',
                                })}
                              />
                              <FieldInput name="form.mapCenter.lat" type="number" control={control} />
                            </FormControl>
                            <FormControl name="form.mapCenter.lng" control={control} mb={1}>
                              <FormLabel
                                label={intl.formatMessage({
                                  id: 'proposal_form.lng_map',
                                })}
                              />
                              <FieldInput name="form.mapCenter.lng" type="number" control={control} />
                            </FormControl>
                          </Flex>
                          <FormControl name="form.zoomMap" control={control}>
                            <FormLabel
                              label={intl.formatMessage({
                                id: 'proposal_form.zoom',
                              })}
                            />
                            <FieldInput
                              name="form.zoomMap"
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
                  </Flex>
                  <FormControl name="mainView" control={control}>
                    <FormLabel label={intl.formatMessage({ id: 'default.view' })} />
                    <FieldInput
                      type="radio"
                      name="mainView"
                      id="mainView"
                      control={control}
                      // @ts-ignore
                      checked={watch('mainView')}
                      choices={[
                        {
                          id: MainViewEnum.MAP,
                          useIdAsValue: true,
                          label: intl.formatMessage({
                            id: 'collect.step.mainView.map',
                          }),
                        },
                        {
                          id: MainViewEnum.GRID,
                          useIdAsValue: true,
                          label: intl.formatMessage({
                            id: 'collect.step.mainView.grid',
                          }),
                        },
                        {
                          id: MainViewEnum.LIST,
                          useIdAsValue: true,
                          label: intl.formatMessage({
                            id: 'collect.step.mainView.list',
                          }),
                        },
                      ]}
                    />
                  </FormControl>
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
                        submit: isEditing
                          ? intl.formatMessage({ id: 'global.edit' })
                          : intl.formatMessage({ id: 'global.add' }),
                      }}
                    />
                  </FormProvider>
                  <FormControl name="form.canContact" control={control} mb={6}>
                    <FormLabel
                      htmlFor="form.canContact"
                      label={intl.formatMessage({
                        id: 'admin.proposal.form.canContact.label',
                      })}
                    />
                    <FieldInput id="form.canContact" name="form.canContact" control={control} type="checkbox">
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
                </Accordion.Panel>
              </Accordion.Item>

            </Accordion>
          </Box>
          <Flex>
            <Button
              variantSize="big"
              variant="primary"
              type="submit"
              mr={4}
              isLoading={isSubmitting}
              disabled={!isValid}
            >
              {isEditing ? intl.formatMessage({ id: 'global.save' }) : intl.formatMessage({ id: 'add-the-step' })}
            </Button>
            <Button variantSize="big" variant="secondary" disabled={isSubmitting} onClick={onBack}>
              {intl.formatMessage({ id: 'global.back' })}
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default CollectStepForm

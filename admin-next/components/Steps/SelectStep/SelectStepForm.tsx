import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import {
  MainView,
  ProposalArchivedUnitTime,
  ProposalStepStatusColor,
  ProposalStepVoteType,
  SelectStepFormQuery,
} from '@relay/SelectStepFormQuery.graphql'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Box,
  Accordion,
  CapUIAccordionColor,
  FormLabel,
  Text,
  Flex,
  CapUIBorder,
  SpotIcon,
  CapUISpotIconSize,
  CapUISpotIcon,
  Button,
  Checkbox,
  toast,
  Tooltip,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import TextEditor from '@components/Form/TextEditor/TextEditor'
import VoteTabsForm from '@components/Steps/SelectStep/VoteTabsForm'
import ProposalStepRequirementsTabs from '@components/Requirements/ProposalStepRequirementsTabs'
import RequirementsTabsSkeleton from '@components/Requirements/RequirementsTabsSkeleton'
import SelectStepStatusesList, { getStatusesInputList } from '@components/Steps/SelectStep/SelectStepStatusesList'
import { SelectStepStatusesList_step$key } from '@relay/SelectStepStatusesList_step.graphql'
import {
  getRequirementsInput,
  RequirementsFormValues
} from '@components/Requirements/Requirements'
import DeleteStepMutation from '@mutations/DeleteStepMutation'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import UpdateProposalFormMutation from '@mutations/UpdateProposalFormMutation'
import UpdateSelectionStepMutation from '@mutations/UpdateSelectionStep'
import { getDefaultValues } from '@components/Steps/SelectStep/SelectStepForm.utils'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ProposalStepRequirementsTabs_proposalStep$key } from '@relay/ProposalStepRequirementsTabs_proposalStep.graphql'

export interface SelectStepFormProps {
  stepId: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}
type StepTypeDurationTypeUnion = 'CUSTOM' | 'TIMELESS'
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
  }
  stepDurationType?: {
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
  allowingProgressSteps: boolean | undefined
  mainView: {
    labels: string[]
  }
  enabled: {
    labels: Array<string>
  }
  metaDescription: string
  customCode: string
} & RequirementsFormValues

const SELECTION_QUERY = graphql`
  query SelectStepFormQuery($stepId: ID!) {
    step: node(id: $stepId) {
      id
      ... on SelectionStep {
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
        allowingProgressSteps
        ...SelectStepStatusesList_step
        form {
          id
          zoomMap
          mapCenter {
            formatted
            json
            lat
            lng
          }
          isGridViewEnabled
          isListViewEnabled
          isMapViewEnabled
          nbrOfMessagesSent
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
        ...VoteTabsForm_step
      }
    }
    ...SelectStepStatusesList_query
    siteColors {
      keyname
      value
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
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
export const EnabledEnum: Record<EnabledUnion, EnabledUnion> = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
} as const
export const MainViewEnum: Record<MainView, MainView> = {
  GRID: 'GRID',
  LIST: 'LIST',
  MAP: 'MAP',
} as const

const SelectStepForm: React.FC<SelectStepFormProps> = ({ stepId, setHelpMessage }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<SelectStepFormQuery>(SELECTION_QUERY, {
    stepId,
  })
  const { setBreadCrumbItems, setSaving: triggerNavBarSaving } = useNavBarContext()
  const { step, availableLocales, siteColors } = query
  const bgColor = siteColors.find(elem => elem.keyname === 'color.btn.primary.bg').value
  const project = step?.project

  const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr'

  const isEditing = React.useMemo(() => !!step?.label, [step])

  const getBreadCrumbItems = () => {
    const breadCrumbItems = [
      {
        title: project?.title ?? '',
        href: project?.adminAlphaUrl ?? '',
      },
      {
        title: intl.formatMessage({ id: 'add-step' }),
        href: `/project/${project?.id}/create-step`,
      },
      {
        title: intl.formatMessage({ id: 'select-step' }),
        href: '',
      },
    ]
    if (isEditing) {
      return breadCrumbItems.filter(item => item.title !== intl.formatMessage({ id: 'add-step' }))
    }
    return breadCrumbItems
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

  const onSubmit = async (values: FormValues) => {
    try {
      const input = {
        mapCenter: values.form.mapCenter?.json,
        zoomMap: Number(values.form.zoomMap),
        isGridViewEnabled: values.form.isGridViewEnabled,
        isMapViewEnabled: values.form.isMapViewEnabled,
        isListViewEnabled: values.form.isListViewEnabled,
        usingWebPage: false,
        usingFacebook: false,
        usingTwitter: false,
        usingInstagram: false,
        usingYoutube: false,
        usingLinkedIn: false,
      }
      const proposalFormUpdateResponse = await UpdateProposalFormMutation.commit({
        input: {
          ...input,
          proposalFormId: step?.form?.id || '',
        },
      })
      if (proposalFormUpdateResponse) {
        const StepInput = {
          stepId: stepId,
          label: values.label,
          body: values.body,
          bodyUsingJoditWysiwyg: false,
          endAt: values.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS ? null : values.endAt,
          startAt: values.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS ? null : values.startAt,
          isEnabled: values.enabled.labels[0] === EnabledEnum.PUBLISHED,
          timeless: values.stepDurationType?.labels[0] === StepDurationTypeEnum.TIMELESS,
          metaDescription: values.metaDescription,
          customCode: values.customCode,
          requirementsReason: values.requirementsReason,
          mainView: values.mainView.labels[0],
          statuses: getStatusesInputList(values.statuses, bgColor),
          defaultStatus: values.defaultStatus,
          defaultSort: values.defaultSort,
          votesHelpText: values.votesHelpText,
          votesMin: values.votesMin,
          votesLimit: values.votesLimit,
          votesRanking: values.votesRanking,
          voteThreshold: values.voteThreshold,
          isProposalSmsVoteEnabled: values.isProposalSmsVoteEnabled,
          proposalArchivedTime: values.proposalArchivedTime,
          proposalArchivedUnitTime: values.proposalArchivedUnitTime,
          allowAuthorsToAddNews: Boolean(values.allowAuthorsToAddNews),
          budget: values.budget,
          publishedVoteDate: values.publishedVoteDate,
          voteType: values.voteType,
          secretBallot: values.secretBallot,
          ...getRequirementsInput(values),
        }

        const UpdateSelectionStepMutationResponse = await UpdateSelectionStepMutation.commit({
          // @ts-ignore
          input: StepInput,
        })

        if (!UpdateSelectionStepMutationResponse.updateSelectionStep) {
          return mutationErrorToast(intl)
        }
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'admin.update.successful' }),
        })
      }
    } catch {
      return mutationErrorToast(intl)
    }
  }

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getDefaultValues(step, stepId, bgColor),
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

  const isListViewEnabled = watch('form.isListViewEnabled');
  const isGridViewEnabled = watch('form.isGridViewEnabled');
  const isMapViewEnabled = watch('form.isMapViewEnabled');

  const getMainViewChoices = () => {
    let options = [];
    if (isMapViewEnabled) {
      options.push({
        id: MainViewEnum.MAP,
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'collect.step.mainView.map',
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
    if (isListViewEnabled) {
      options.push({
        id: MainViewEnum.LIST,
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'collect.step.mainView.list',
        }),
      })
    }

    return options;
  };

  return (
        <Box bg="white" width="70%" p={6} borderRadius="8px">
            <Text fontWeight={600} color="blue.800" fontSize={4}>
                {intl.formatMessage({ id: 'customize-your-select-step' })}
            </Text>
            <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)} gap={6}>
                <FormControl name="label" control={control} isRequired mb={6} onMouseEnter={() => {
                    setHelpMessage('step.create.label.helpText')
                }}>
                    <FormLabel
                        htmlFor="label"
                        label={intl.formatMessage({ id: 'step-label-name' })}
                    />
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
                        advancedEditor={false}
                    />
                </FormProvider>
                <FormControl name="stepDurationType" control={control} mb={6}>
                    <FormLabel
                        htmlFor="stepDurationType"
                        label={intl.formatMessage({ id: 'step-duration' })}
                    />
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
                            <FormControl
                                name="startAt"
                                control={control}
                                width="max-content"
                                mr={6}>
                                <FormLabel
                                    htmlFor="startAt"
                                    label={intl.formatMessage({ id: 'start-date' })}>
                                    <Text fontSize={2} color="gray.500">
                                        {intl.formatMessage({ id: 'global.optional' })}
                                    </Text>
                                </FormLabel>
                                <FieldInput
                                    id="startAt"
                                    name="startAt"
                                    control={control}
                                    type="dateHour" dateInputProps={{ isOutsideRange: true }} 
                                />
                            </FormControl>
                            <FormControl name="endAt" control={control} width="max-content">
                                <FormLabel
                                    htmlFor="endAt"
                                    label={intl.formatMessage({ id: 'ending-date' })}>
                                    <Text fontSize={2} color="gray.500">
                                        {intl.formatMessage({ id: 'global.optional' })}
                                    </Text>
                                </FormLabel>
                                <FieldInput
                                    id="endAt"
                                    name="endAt"
                                    control={control}
                                    type="dateHour" dateInputProps={{ isOutsideRange: true }} 
                                />
                            </FormControl>
                        </Flex>
                    </Box>
                )}
                <Box>
                    <Accordion
                        color={CapUIAccordionColor.Transparent}
                        allowMultiple
                    >
                        <Accordion.Item id={intl.formatMessage({ id: 'vote-capitalize' })}>
                            <Accordion.Button>
                                {intl.formatMessage({ id: 'vote-capitalize' })}
                            </Accordion.Button>
                            <Accordion.Panel>
                                <VoteTabsForm
                                    step={step}
                                    defaultLocale={defaultLocale}
                                    formMethods={formMethods}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item
                            id={intl.formatMessage({ id: 'required-infos-to-participate' })}>
                            <Accordion.Button>
                                {intl.formatMessage({ id: 'required-infos-to-participate' })}
                            </Accordion.Button>
                            <Accordion.Panel>
                                <React.Suspense fallback={<RequirementsTabsSkeleton />}>
                                    <ProposalStepRequirementsTabs
                                        proposalStep={
                                            step as ProposalStepRequirementsTabs_proposalStep$key
                                        }
                                        formMethods={formMethods}
                                    />
                                </React.Suspense>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item id={intl.formatMessage({ id: 'status.plural' })}>
                            <Accordion.Button>
                                {intl.formatMessage({ id: 'status.plural' })}
                            </Accordion.Button>
                            <Accordion.Panel>
                                <SelectStepStatusesList
                                    formMethods={formMethods}
                                    step={step as SelectStepStatusesList_step$key}
                                    query={query}
                                    // @ts-ignore
                                    setValue={setValue}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item
                            id={intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}>
                            <Accordion.Button>
                                {intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}
                            </Accordion.Button>
                            <Accordion.Panel>
                                <FormControl name="allowAuthorsToAddNews" control={control} mb={6}>
                                    <FormLabel
                                        htmlFor="allowAuthorsToAddNews"
                                        label={intl.formatMessage({ id: 'proposal-news-label' })}
                                    />
                                    <FieldInput
                                        id="allowAuthorsToAddNews"
                                        name="allowAuthorsToAddNews"
                                        control={control}
                                        type="checkbox">
                                        {intl.formatMessage({ id: 'admin.allow.proposal.news' })}
                                    </FieldInput>
                                </FormControl>
                                <FormControl name="allowingProgressSteps" control={control} mb={6}>
                                    <FormLabel
                                        htmlFor="allowingProgressSteps"
                                        label={intl.formatMessage({
                                            id: 'admin.field.step.label.allowingProgressSteps',
                                        })}
                                    />
                                    <FieldInput
                                        id="allowingProgressSteps"
                                        name="allowingProgressSteps"
                                        control={control}
                                        type="checkbox">
                                        {intl.formatMessage({
                                            id: 'admin.fields.step.allowingProgressSteps',
                                        })}
                                    </FieldInput>
                                </FormControl>
                                <FormControl name="defaultSort" control={control}>
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
                                <FormControl name="defaultStatus" control={control}>
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
                      <Accordion.Item id={intl.formatMessage({ id: 'optional-settings' })}>
                        <Accordion.Button>
                          {intl.formatMessage({ id: 'optional-settings' })}
                        </Accordion.Button>
                        <Accordion.Panel gap={6}>
                          <Flex mt={2} direction="row" gap={4}>
                            {
                              isListViewEnabled && (
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
                                  justifyItems="center">
                                  <SpotIcon
                                    name={CapUISpotIcon.TABLEAU}
                                    size={CapUISpotIconSize.Md}
                                  />
                                  <Text
                                    color="neutral-gray.900"
                                    fontSize={3}
                                    fontWeight={400}>
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
                                      if (isListViewEnabled) {
                                        setValue('form.isListViewEnabled', false);
                                      } else {
                                        setValue('form.isListViewEnabled', true);
                                      }
                                    }}
                                  />
                                </Flex>
                              )
                            }
                            {
                              isGridViewEnabled && (
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
                                  justifyItems="center">
                                  <SpotIcon
                                    name={CapUISpotIcon.VIGNETTE}
                                    size={CapUISpotIconSize.Md}
                                  />
                                  <Text
                                    color="neutral-gray.900"
                                    fontSize={3}
                                    fontWeight={400}>
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
                                      if (isGridViewEnabled) {
                                        setValue('form.isGridViewEnabled', false);
                                      } else {
                                        setValue('form.isGridViewEnabled', true);
                                      }
                                    }}
                                  />
                                </Flex>
                              )
                            }
                            {
                              isMapViewEnabled && (
                                <Flex

                                  direction="row"
                                  borderRadius={CapUIBorder.Normal}
                                  sx={{ cursor: 'pointer' }}
                                  _hover={{
                                    borderColor: 'blue.500',
                                    bg: 'blue.100',
                                  }}
                                  alignItems="flex-start"
                                  width={isMapViewEnabled ? 'auto' : '120px'}
                                  height={isMapViewEnabled ? 'auto' : '140px'}
                                  borderWidth={1}
                                  borderColor={'gray.200'}
                                  justifyItems="center"
                                  gap={4}>
                                  <Flex
                                    direction="column"
                                    width={isMapViewEnabled ? '64px' : '100%'}
                                    alignItems="center"
                                    gap={1}>
                                    <SpotIcon
                                      name={CapUISpotIcon.CARTE}
                                      size={CapUISpotIconSize.Md}
                                    />
                                    <Text
                                      color="neutral-gray.900"
                                      fontSize={3}
                                      fontWeight={400}>
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
                                        if (isMapViewEnabled) {
                                          setValue('form.isMapViewEnabled', false);
                                        } else {
                                          setValue('form.isMapViewEnabled', true);
                                        }
                                      }}
                                    />
                                  </Flex>
                                  {isMapViewEnabled && (
                                    <Flex
                                      direction={'column'}
                                      width="230px"
                                      p={2}
                                      gap={0}
                                      height="100%"
                                      sx={{ cursor: 'default' }}>
                                      <FormControl
                                        name="form.mapCenter.formatted"
                                        control={control}
                                        sx={{
                                          position: 'relative',
                                          "ul": {
                                            position: 'absolute',
                                            top: '54px',
                                            zIndex: 1,
                                          }
                                        }}
                                        mb={1}>
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
                                              'form.mapCenter.formatted',
                                              // @ts-ignore
                                              add,
                                            );
                                          }}
                                          getPosition={(lat: number, lng: number)=>{
                                            setValue('form.mapCenter.lat',lat)
                                            setValue('form.mapCenter.lng',lng)
                                          }}
                                        />
                                      </FormControl>
                                      <Flex direction="row" gap={2}>
                                        <FormControl
                                          name="form.mapCenter.lat"
                                          control={control}
                                          mb={1}>
                                          <FormLabel
                                            label={intl.formatMessage({
                                              id: 'proposal_form.lat_map',
                                            })}
                                          />
                                          <FieldInput
                                            name="form.mapCenter.lat"
                                            type="number"
                                            control={control}
                                          />
                                        </FormControl>
                                        <FormControl
                                          name="form.mapCenter.lng"
                                          control={control}
                                          mb={1}>
                                          <FormLabel
                                            label={intl.formatMessage({
                                              id: 'proposal_form.lng_map',
                                            })}
                                          />
                                          <FieldInput
                                            name="form.mapCenter.lng"
                                            type="number"
                                            control={control}
                                          />
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
                                            };
                                          })}
                                        />
                                      </FormControl>
                                    </Flex>
                                  )}
                                </Flex>
                              )
                            }
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
                              choices={getMainViewChoices()}
                            />
                          </FormControl>
                          <FormControl name="metaDescription" control={control}>
                            <FormLabel
                              htmlFor="metaDescription"
                              label={intl.formatMessage({
                                id: 'global.meta.description',
                              })}>
                              <Text fontSize={2} color="gray.500">
                                {intl.formatMessage({ id: 'global.optional' })}
                              </Text>
                            </FormLabel>
                            <FieldInput
                              id="metaDescription"
                              type="textarea"
                              control={control}
                              name="metaDescription"
                            />
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

export default SelectStepForm

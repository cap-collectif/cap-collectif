import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import {
  MainView,
  ProposalArchivedUnitTime,
  ProposalStepStatusColor,
  ProposalStepVoteType,
  SelectionStepSubTypes,
  SelectStepFormQuery,
} from '@relay/SelectStepFormQuery.graphql'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Box,
  Accordion,
  CapUIAccordionColor,
  FormLabel,
  Text,
  Flex,
  Button,
  toast,
  CapUIFontSize,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import ProposalStepVoteTabsForm from '@components/BackOffice/Steps/ProposalStep/ProposalStepVoteTabsForm'
import ProposalStepRequirementsTabs from '@components/BackOffice/Requirements/ProposalStepRequirementsTabs'
import RequirementsTabsSkeleton from '@components/BackOffice/Requirements/RequirementsTabsSkeleton'
import { getRequirementsInput, RequirementsFormValues } from '@components/BackOffice/Requirements/Requirements'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import UpdateProposalFormMutation from '@mutations/UpdateProposalFormMutation'
import UpdateSelectionStepMutation from '@mutations/UpdateSelectionStep'
import { getDefaultValues, TabsVoteType } from '@components/BackOffice/Steps/SelectStep/SelectStepForm.utils'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ProposalStepRequirementsTabs_proposalStep$key } from '@relay/ProposalStepRequirementsTabs_proposalStep.graphql'
import ProposalStepOptionnalAccordion from '../ProposalStep/ProposalStepOptionnalAccordion'
import { onBack } from '@components/BackOffice/Steps/utils'
import { useSelectionStep } from './SelectionStepContext'
import ProposalStepStatuses, {
  getStatusesInputList,
} from '@components/BackOffice/Steps/ProposalStep/ProposalStepStatuses'
import PublicationInput, { EnabledEnum } from '@components/BackOffice/Steps/Shared/PublicationInput'
import StepDurationInput from '../Shared/StepDurationInput'
import { getVoteParameterInput } from '../utils'

export interface SelectStepFormProps {
  stepId: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}
type StepTypeDurationTypeUnion = 'CUSTOM' | 'TIMELESS'
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
    canContact?: boolean | null | undefined
    usingWebPage: boolean
    usingFacebook: boolean
    usingTwitter: boolean
    usingInstagram: boolean
    usingYoutube: boolean
    usingLinkedIn: boolean
  }
  stepDurationType?: {
    labels: Array<string>
  }
  voteType: ProposalStepVoteType | undefined
  _voteTypeForTabs: TabsVoteType | undefined
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
        subType
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
          usingAddress
          canContact
          usingWebPage
          usingFacebook
          usingTwitter
          usingInstagram
          usingYoutube
          usingLinkedIn
        }
        project {
          id
          title
          canEdit
          adminAlphaUrl
          steps {
            __typename
            id
            ... on SelectionStep {
              allowingProgressSteps
            }
          }
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
          reason
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
      }
      ...ProposalStepOptionnalAccordion_step
    }
    ...ProposalStepStatuses_query
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
export const StepDurationTypeEnum: Record<StepTypeDurationTypeUnion, StepTypeDurationTypeUnion> = {
  CUSTOM: 'CUSTOM',
  TIMELESS: 'TIMELESS',
} as const

export const MainViewEnum: Record<MainView, MainView> = {
  GRID: 'GRID',
  LIST: 'LIST',
  MAP: 'MAP',
  '%future added value': '%future added value',
} as const

const SelectStepForm: React.FC<SelectStepFormProps> = ({ stepId, setHelpMessage }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<SelectStepFormQuery>(SELECTION_QUERY, {
    stepId,
  })
  const { setBreadCrumbItems } = useNavBarContext()
  const { step, availableLocales, siteColors } = query
  const bgColor = siteColors.find(elem => elem.keyname === 'color.btn.primary.bg').value
  const project = step?.project

  const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr'

  const { operationType, setOperationType } = useSelectionStep()
  const isEditing = operationType === 'EDIT'

  const createStepLink = `/admin-next/project/${project?.id}/create-step`

  const hasSelectionStepsWithAllowingProgressSteps = project?.steps?.some(step => {
    return step.__typename === 'SelectionStep' && step.allowingProgressSteps === true && step.id !== stepId
  })

  const defaultOpenAccordion = (stepSubType: SelectionStepSubTypes) => {
    switch (stepSubType) {
      case 'VOTE':
        return [intl.formatMessage({ id: 'vote-capitalize' })]

      case 'ANALYSIS':
      case 'RESULT':
        return [intl.formatMessage({ id: 'status.plural' })]

      default:
        return []
    }
  }

  const getBreadCrumbItems = () => {
    const breadCrumbItems = [
      {
        title: project?.title ?? '',
        href: project?.adminAlphaUrl ?? '',
      },
      {
        title: intl.formatMessage({ id: 'add-step' }),
        href: createStepLink,
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
        usingWebPage: values.form.usingWebPage,
        usingFacebook: values.form.usingFacebook,
        usingTwitter: values.form.usingTwitter,
        usingInstagram: values.form.usingInstagram,
        usingYoutube: values.form.usingYoutube,
        usingLinkedIn: values.form.usingLinkedIn,
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
          isProposalSmsVoteEnabled: values.isProposalSmsVoteEnabled,
          allowAuthorsToAddNews: Boolean(values.allowAuthorsToAddNews),
          allowingProgressSteps: values.allowingProgressSteps,
          ...getVoteParameterInput(values),
          ...getRequirementsInput(values),
        }

        const response = await UpdateSelectionStepMutation.commit({
          // @ts-ignore
          input: StepInput,
        })

        if (!response.updateSelectionStep) {
          return mutationErrorToast(intl)
        }

        if (response.updateSelectionStep.proposalStepSplitViewWasDisabled) {
          toast({
            variant: 'warning',
            content:
              intl.formatMessage({ id: 'admin.update.successful' }) +
              '<br/>' +
              intl.formatMessage({ id: 'admin.proposalStepSplitViewWasDisabled' }),
          })
        } else {
          toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'admin.update.successful' }),
          })
        }

        if (!isEditing) {
          return (window.location.href = `/admin-next/project/${project?.id}`)
        }

        setOperationType('EDIT')
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
  const { handleSubmit, formState, control } = formMethods
  const { isSubmitting, isValid } = formState

  const sortOptions = [
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
  ]

  return (
    <Box bg="white" width="70%" p={6} borderRadius="8px" flex="none">
      <Text fontWeight={600} color="blue.800" fontSize={CapUIFontSize.Headline}>
        {intl.formatMessage({ id: 'customize-your-select-step' })}
      </Text>
      <FormProvider {...formMethods}>
        <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)} gap={6}>
          <FormControl
            name="label"
            control={control}
            isRequired
            mb={6}
            onFocus={() => {
              setHelpMessage('step.create.label.helpText')
            }}
            onBlur={() => {
              setHelpMessage(null)
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
          <TextEditor
            name="body"
            label={intl.formatMessage({ id: 'step-description' })}
            platformLanguage={defaultLocale}
            selectedLanguage={defaultLocale}
            advancedEditor
          />
          <StepDurationInput />
          <Box>
            <Accordion
              color={CapUIAccordionColor.Transparent}
              defaultAccordion={defaultOpenAccordion(step.subType as SelectionStepSubTypes)}
              allowMultiple
            >
              {step.subType === 'VOTE' && (
                <Accordion.Item id={intl.formatMessage({ id: 'vote-capitalize' })}>
                  <Accordion.Button>{intl.formatMessage({ id: 'vote-capitalize' })}</Accordion.Button>
                  <Accordion.Panel>
                    <ProposalStepVoteTabsForm defaultLocale={defaultLocale} formMethods={formMethods} />
                  </Accordion.Panel>
                </Accordion.Item>
              )}
              {step.subType === 'VOTE' && (
                <Accordion.Item
                  id={intl.formatMessage({ id: 'required-infos-to-participate' })}
                  onMouseEnter={() => {
                    setHelpMessage('step.create.requirements.helpText')
                  }}
                  onMouseLeave={() => setHelpMessage(null)}
                >
                  <Accordion.Button>{intl.formatMessage({ id: 'required-infos-to-participate' })}</Accordion.Button>
                  <Accordion.Panel>
                    <React.Suspense fallback={<RequirementsTabsSkeleton />}>
                      <ProposalStepRequirementsTabs
                        proposalStep={step as ProposalStepRequirementsTabs_proposalStep$key}
                        formMethods={formMethods}
                      />
                    </React.Suspense>
                  </Accordion.Panel>
                </Accordion.Item>
              )}
              <Accordion.Item id={intl.formatMessage({ id: 'status.plural' })}>
                <Accordion.Button>{intl.formatMessage({ id: 'status.plural' })}</Accordion.Button>
                <Accordion.Panel>
                  <ProposalStepStatuses formMethods={formMethods} query={query} />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item id={intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}>
                <Accordion.Button>{intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}</Accordion.Button>
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
                      type="checkbox"
                    >
                      {intl.formatMessage({ id: 'admin.allow.proposal.news' })}
                    </FieldInput>
                  </FormControl>

                  {!hasSelectionStepsWithAllowingProgressSteps && (
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
                        type="checkbox"
                      >
                        {intl.formatMessage({
                          id: 'admin.fields.step.allowingProgressSteps',
                        })}
                      </FieldInput>
                    </FormControl>
                  )}

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
                      options={sortOptions}
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
                <Accordion.Button>{intl.formatMessage({ id: 'optional-settings' })}</Accordion.Button>
                <Accordion.Panel gap={6}>
                  <ProposalStepOptionnalAccordion step={step} formMethods={formMethods} />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <PublicationInput />
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
              <Button
                variantSize="big"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => onBack(project?.adminAlphaUrl, isEditing, stepId, intl)}
              >
                {intl.formatMessage({ id: 'global.back' })}
              </Button>
            </Flex>
          </Box>
        </Box>
      </FormProvider>
    </Box>
  )
}

export default SelectStepForm

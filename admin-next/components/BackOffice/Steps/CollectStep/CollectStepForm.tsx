import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { FormProvider, useForm } from 'react-hook-form'
import { Accordion, Box, Button, CapUIAccordionColor, CapUIFontSize, Flex, Text, toast } from '@cap-collectif/ui'
import ProposalFormForm from '@components/BackOffice/Steps/CollectStep/ProposalFormForm'
import ProposalStepRequirementsTabs from '@components/BackOffice/Requirements/ProposalStepRequirementsTabs'
import ProposalStepVoteTabsForm from '@components/BackOffice/Steps/ProposalStep/ProposalStepVoteTabsForm'
import { RequirementsFormValues } from '@components/BackOffice/Requirements/Requirements'
import {
  CollectStepFormQuery,
  MainView,
  ProposalArchivedUnitTime,
  ProposalStepStatusColor,
  ProposalStepVoteType,
} from '@relay/CollectStepFormQuery.graphql'
import { ProposalFormForm_step$key } from '@relay/ProposalFormForm_step.graphql'
import RequirementsTabsSkeleton from '@components/BackOffice/Requirements/RequirementsTabsSkeleton'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import {
  getCollectStepInput,
  getInitialValues,
  getProposalFormUpdateVariablesInput,
} from '@components/BackOffice/Steps/CollectStep/CollectStepForm.utils'
import UpdateCollectStepMutation from '@mutations/UpdateCollectStepMutation'
import UpdateProposalFormMutation from '@mutations/UpdateProposalFormMutation'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormTabsEnum, useCollectStep } from './CollectStepContext'
import ProposalStepOptionnalAccordion from '../ProposalStep/ProposalStepOptionnalAccordion'
import { onBack } from '@components/BackOffice/Steps/utils'
import LabelInput from '../Shared/LabelInput'
import BodyInput from '../Shared/BodyInput'
import StepDurationInput from '../Shared/StepDurationInput'
import ProposalSettings from '../ProposalStep/ProposalSettings'
import { formatQuestions } from '../QuestionnaireStep/utils'
import { QuestionInput, UpdateProposalFormMutation$data } from '@relay/UpdateProposalFormMutation.graphql'
import ProposalStepStatuses from '@components/BackOffice/Steps/ProposalStep/ProposalStepStatuses'
import PublicationInput from '@components/BackOffice/Steps/Shared/PublicationInput'
import { TabsVoteType } from '../SelectStep/SelectStepForm.utils'

export interface CollectStepFormProps {
  stepId: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}
type StepVisibiltyTypeUnion = 'PUBLIC' | 'RESTRICTED'

type Questionnaire = { questions: Array<QuestionInput>; questionsWithJumps: Array<any> }

type ProposalFormType = {
  id: string | null
  title: string | null
  titleHelpText: string | null
  usingSummary: boolean
  allowAknowledge: boolean
  usingFacebook: boolean
  usingWebPage: boolean
  usingTwitter: boolean
  usingInstagram: boolean
  usingYoutube: boolean
  usingLinkedIn: boolean
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
  questionnaire: Questionnaire
}

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
  form: ProposalFormType
  form_model?: ProposalFormType
  selectedModel: null | { value: string; label: string }
  stepDurationType?: {
    labels: Array<string>
  }
  stepVisibilityType?: {
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
  isCollectByEmailEnabled
} & RequirementsFormValues

const COLLECT_FRAGMENT = graphql`
  query CollectStepFormQuery($stepId: ID!) {
    step: node(id: $stepId) {
      id
      ... on CollectStep {
        ...ProposalSettings_step
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
          allowAknowledge
          usingFacebook
          usingWebPage
          usingTwitter
          usingInstagram
          usingYoutube
          usingLinkedIn
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

          description
          questions {
            id
            ...responsesHelper_adminQuestion @relay(mask: false)
          }
          questionsWithJumps: questions(filter: JUMPS_ONLY) {
            id
            title
            jumps(orderBy: { field: POSITION, direction: ASC }) {
              id
              origin {
                id
                title
              }
              destination {
                id
                title
                number
              }
              conditions {
                id
                operator
                question {
                  id
                  title
                  type
                }
                ... on MultipleChoiceQuestionLogicJumpCondition {
                  value {
                    id
                    title
                  }
                }
              }
            }
            # unused for now, will be usefull when we'll add error and warning messages
            destinationJumps {
              id
              origin {
                id
                title
              }
            }

            alwaysJumpDestinationQuestion {
              id
              title
              number
            }
          }
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
        ...ProposalStepOptionnalAccordion_step
        isCollectByEmailEnabled
      }
    }
    ...ProposalFormForm_query
    ...ProposalStepStatuses_query
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

export const StepVisibilityTypeEnum: Record<StepVisibiltyTypeUnion, StepVisibiltyTypeUnion> = {
  PUBLIC: 'PUBLIC',
  RESTRICTED: 'RESTRICTED',
} as const

export const MainViewEnum: Omit<Record<MainView, MainView>, '%future added value'> = {
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
  const { step, availableLocales, siteColors } = query
  const bgColor = siteColors.find(elem => elem.keyname === 'color.btn.primary.bg').value
  const project = step?.project
  const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr'

  const { operationType, setOperationType, selectedTab, proposalFormKey } = useCollectStep()
  const isEditing = operationType === 'EDIT'

  const createStepLink = `/admin-next/project/${project?.id}/create-step`
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
    const _proposalFormValues = selectedTab === FormTabsEnum.NEW ? values['form'] : values['form_model']

    const proposalFormValues = {
      ..._proposalFormValues,
      title:
        selectedTab === FormTabsEnum.MODEL
          ? intl.formatMessage({ id: 'copy-of' }) + ' ' + values['form_model'].title
          : values['form'].title,
    }
    const proposalFormUpdateInput = getProposalFormUpdateVariablesInput(proposalFormValues, selectedTab)

    try {
      const proposalFormUpdateResponse: UpdateProposalFormMutation$data = await UpdateProposalFormMutation.commit({
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

          const questionnaire = {
            questions: proposalFormUpdateResponse.updateProposalForm?.proposalForm?.questions
              ? formatQuestions({
                  questions: proposalFormUpdateResponse.updateProposalForm?.proposalForm?.questions,
                })
              : [],
            questionsWithJumps: proposalFormUpdateResponse.updateProposalForm?.proposalForm?.questionsWithJumps ?? [],
          }
          setValue('form.questionnaire', questionnaire as Questionnaire)
          setValue('form_model.questionnaire', questionnaire as Questionnaire)

          if (response.updateCollectStep.proposalStepSplitViewWasDisabled) {
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
        } catch (e) {
          console.log(e)
          return mutationErrorToast(intl)
        }
      }
    } catch (e) {
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

  const { handleSubmit, formState, setValue } = formMethods
  const { isSubmitting, isValid } = formState

  return (
    <FormProvider {...formMethods}>
      <Box bg="white" width="70%" p={6} borderRadius="8px" flex="none">
        <Text fontWeight={600} color="blue.800" fontSize={CapUIFontSize.Headline}>
          {intl.formatMessage({ id: 'customize-your-collect-step' })}
        </Text>
        <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)} gap={6}>
          <LabelInput setHelpMessage={setHelpMessage} />
          <BodyInput isEditing={isEditing} />
          <StepDurationInput />
          <Box>
            <Box mb={4}>
              <Accordion
                color={CapUIAccordionColor.Transparent}
                defaultAccordion={[intl.formatMessage({ id: 'proposal-form' })]}
              >
                <Accordion.Item
                  id={intl.formatMessage({ id: 'proposal-form' })}
                  onMouseEnter={() => {
                    setHelpMessage('step.create.proposalForm.helpText')
                  }}
                  onMouseLeave={() => setHelpMessage(null)}
                >
                  <Accordion.Button>{intl.formatMessage({ id: 'proposal-form' })}</Accordion.Button>
                  <Accordion.Panel>
                    <ProposalFormForm
                      query={query}
                      step={step as ProposalFormForm_step$key}
                      defaultLocale={defaultLocale}
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
              <Accordion color={CapUIAccordionColor.Transparent}>
                <Accordion.Item id={intl.formatMessage({ id: 'vote-capitalize' })}>
                  <Accordion.Button>{intl.formatMessage({ id: 'vote-capitalize' })}</Accordion.Button>
                  <Accordion.Panel>
                    <ProposalStepVoteTabsForm defaultLocale={defaultLocale} formMethods={formMethods} />
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
                    <ProposalStepStatuses formMethods={formMethods} query={query} />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
              <Accordion color={CapUIAccordionColor.Transparent}>
                <Accordion.Item id={intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}>
                  <Accordion.Button>
                    {intl.formatMessage({ id: 'admin.fields.proposal.group_content' })}
                  </Accordion.Button>
                  <Accordion.Panel>
                    <ProposalSettings step={step} />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
              <Accordion color={CapUIAccordionColor.Transparent}>
                <Accordion.Item id={intl.formatMessage({ id: 'optional-settings' })}>
                  <Accordion.Button>{intl.formatMessage({ id: 'optional-settings' })}</Accordion.Button>
                  <Accordion.Panel>
                    <ProposalStepOptionnalAccordion
                      step={step}
                      formMethods={formMethods}
                      proposalFormKey={proposalFormKey}
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Box>
            <PublicationInput />
            <Flex>
              <Button
                id="save-collect-step"
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
      </Box>
    </FormProvider>
  )
}

export default CollectStepForm

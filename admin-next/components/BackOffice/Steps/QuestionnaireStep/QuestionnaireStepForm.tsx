import { FieldInput, FormControl } from '@cap-collectif/form'
import { Accordion, Box, Button, CapUIAccordionColor, CapUIFontSize, Flex, FormLabel, Text } from '@cap-collectif/ui'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import QuestionnaireStepRequirementsTabs from '@components/BackOffice/Requirements/QuestionnaireStepRequirementsTabs'
import { getRequirementsInput, RequirementsFormValues } from '@components/BackOffice/Requirements/Requirements'
import { LogActionTypeEnum } from '@components/BackOffice/Steps/Shared/Enum/LogActionTypeEnum'
import PublicationInput, { EnabledEnum } from '@components/BackOffice/Steps/Shared/PublicationInput'
import { onBack } from '@components/BackOffice/Steps/utils'
import useUrlState from '@hooks/useUrlState'
import UpdateQuestionnaireMutation from '@mutations/UpdateQuestionnaireMutation'
import UpdateQuestionnaireStepMutation from '@mutations/UpdateQuestionnaireStepMutation'
import { QuestionnaireStepFormQuery } from '@relay/QuestionnaireStepFormQuery.graphql'
import { QuestionInput } from '@relay/UpdateQuestionnaireMutation.graphql'
import { UpdateQuestionnaireStepInput } from '@relay/UpdateQuestionnaireStepMutation.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import TextEditor from '../../Form/TextEditor/TextEditor'
import { StepDurationTypeEnum } from '../DebateStep/DebateStepForm'
import StepDurationInput from '../Shared/StepDurationInput'
import QuestionnaireStepOptionalParameters from './QuestionnaireStepFormOptionalParameters'
import QuestionnaireStepFormQuestionnaireTab from './QuestionnaireStepFormQuestionnaireTab'
import { formatQuestionsInput, getDefaultValues, mergeQuestionsAndJumpsBeforeSubmit, Questionnaire } from './utils'

type Props = {
  stepId: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}

export type FormValues = {
  stepId: string
  label: string
  body: string | null
  startAt: string | null
  endAt: string | null
  timeless: boolean
  isEnabled: {
    labels: Array<string>
  }
  metaDescription: string | null
  footer: string | null
  customCode: string | null
  stepDurationType?: {
    labels: Array<string>
  }
  questionnaire: Questionnaire
  MODELquestionnaire?: Questionnaire
  temporaryQuestion?: QuestionInput | null
  temporaryJump?: any
  isUsingModel?: boolean
  questionnaireModel?: { label: string; value: string }
  __typename?: string
} & RequirementsFormValues

const QUESTIONNAIRE_STEP_QUERY = graphql`
  query QuestionnaireStepFormQuery($stepId: ID!) {
    step: node(id: $stepId) {
      id
      ... on QuestionnaireStep {
        requirements {
          reason
        }
        ...Requirements_requirementStep @relay(mask: false)
        title
        label
        body
        timeRange {
          startAt
          endAt
        }
        enabled
        timeless
        metaDescription
        customCode
        footer
        project {
          id
          title
          canEdit
          adminAlphaUrl
        }
        questionnaire {
          id
          title
          description
          questions {
            id
            responses(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
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
        ...QuestionnaireStepRequirementsTabs_questionnaireStep
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
    }
  }
`

const QuestionnaireStepForm: React.FC<Props> = ({ stepId, setHelpMessage }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<QuestionnaireStepFormQuery>(QUESTIONNAIRE_STEP_QUERY, {
    stepId,
  })

  const { setBreadCrumbItems } = useNavBarContext()

  const [operationType, setOperationType] = useUrlState('operationType', 'EDIT')
  const isEditing = operationType === 'EDIT'

  const { step, availableLocales } = query
  const project = step?.project

  if (!step) return null

  const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr'

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
        title: intl.formatMessage({ id: 'questionnaire-step' }),
        href: '',
      },
    ]
    if (isEditing) {
      return breadCrumbItems.filter(item => item.title !== intl.formatMessage({ id: 'add-step' }))
    }
    return breadCrumbItems
  }

  useEffect(() => {
    setBreadCrumbItems(getBreadCrumbItems())
    return () => setBreadCrumbItems([])
  }, [])

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getDefaultValues(stepId, step),
    shouldUnregister: false,
  })

  const { handleSubmit, formState, control, reset } = formMethods
  const { isSubmitting, isValid } = formState

  const onSubmit = async ({
    questionnaire: CURRENTquestionnaire,
    MODELquestionnaire,
    isUsingModel,
    questionnaireModel,
    ...values
  }: FormValues) => {
    const timeless = !!(values?.stepDurationType?.labels?.[0] === StepDurationTypeEnum.TIMELESS)
    delete values.stepDurationType
    delete values.temporaryQuestion
    delete values.temporaryJump

    const questionnaire = isUsingModel && !isEditing ? MODELquestionnaire : CURRENTquestionnaire

    const stepInput: UpdateQuestionnaireStepInput = {
      ...values,
      timeless,
      endAt: timeless ? null : values.endAt,
      startAt: timeless ? null : values.startAt,
      isEnabled: !!(values.isEnabled.labels?.[0] === EnabledEnum.PUBLISHED),
      questionnaire: CURRENTquestionnaire.questionnaireId,
      operationType: operationType === LogActionTypeEnum.CREATE ? LogActionTypeEnum.CREATE : LogActionTypeEnum.EDIT,
      ...getRequirementsInput(values),
    }

    const modelQuestionnaireTitle = `${intl.formatMessage({ id: 'copy-of' })} ${MODELquestionnaire?.title}` || null
    const currentQuestionnaireTitle =
      stepInput.label ??
      intl.formatMessage({
        id: 'global.questionnaire',
      }) ??
      null

    const mergedArr = mergeQuestionsAndJumpsBeforeSubmit(questionnaire)

    delete questionnaire.questionsWithJumps

    if (!stepInput.questionnaire) return mutationErrorToast(intl)

    return UpdateQuestionnaireStepMutation.commit({ input: stepInput })
      .then(async response => {
        try {
          return UpdateQuestionnaireMutation.commit({
            input: {
              ...questionnaire,
              questionnaireId: questionnaire?.questionnaireId || stepInput.questionnaire,
              title: isUsingModel && !isEditing ? modelQuestionnaireTitle : currentQuestionnaireTitle,
              questions: formatQuestionsInput(mergedArr),
            },
          })
            .then(q => {
              successToast(intl.formatMessage({ id: 'global.changes.saved' }))
              if (!isEditing) {
                return (window.location.href = `/admin-next/project/${project?.id}`)
              }
              setOperationType('EDIT')
              const newFormValues = {
                ...response.updateQuestionnaireStep.questionnaireStep,
                requirements: values.requirements,
                requirementsReason: values.requirementsReason,
                questionnaire: {
                  ...q.updateQuestionnaireConfiguration.questionnaire,
                },
              }
              reset(getDefaultValues(stepId, newFormValues, true))
              return
            })
            .catch(questionnaireError => {
              console.log(questionnaireError)
              return mutationErrorToast(intl)
            })
        } catch (error) {
          console.log(error)
          return mutationErrorToast(intl)
        }
      })
      .catch(e => {
        console.log(e)
        return mutationErrorToast(intl)
      })
  }

  if (!project.canEdit) {
    window.location.href = '/admin-next/projects'
    return null
  }

  return (
    <Box bg="white" p={6} borderRadius="8px" width="70%" flex="none">
      <Text fontWeight={600} color="blue.800" fontSize={CapUIFontSize.Headline}>
        {intl.formatMessage({ id: 'customize-your-questionnaire-step' })}
      </Text>
      <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...formMethods}>
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
          />
          <StepDurationInput />
          <Accordion
            color={CapUIAccordionColor.white}
            defaultAccordion={[intl.formatMessage({ id: 'global.questionnaire' })]}
            allowMultiple
            spacing="md"
            sx={{ summary: { pl: 0 } }}
          >
            <Accordion.Item
              id={intl.formatMessage({ id: 'global.questionnaire' })}
              onMouseEnter={() => {
                setHelpMessage('step.create.questionnaire.helpText')
              }}
              onMouseLeave={() => setHelpMessage(null)}
            >
              <Accordion.Button>{intl.formatMessage({ id: 'global.questionnaire' })}</Accordion.Button>
              <Accordion.Panel>
                <QuestionnaireStepFormQuestionnaireTab
                  isEditing={isEditing}
                  defaultLocale={defaultLocale}
                  setHelpMessage={setHelpMessage}
                />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item
              id={intl.formatMessage({ id: 'required-infos-to-participate' })}
              onMouseEnter={() => {
                setHelpMessage('step.create.requirements.helpText')
              }}
              onMouseLeave={() => setHelpMessage(null)}
            >
              <Accordion.Button>{intl.formatMessage({ id: 'required-infos-to-participate' })}</Accordion.Button>
              <Accordion.Panel>
                <QuestionnaireStepRequirementsTabs formMethods={formMethods} questionnaireStep={step} />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item id={intl.formatMessage({ id: 'optional-settings' })}>
              <Accordion.Button>{intl.formatMessage({ id: 'optional-settings' })}</Accordion.Button>
              <Accordion.Panel>
                <QuestionnaireStepOptionalParameters
                  isEditing={isEditing}
                  defaultLocale={defaultLocale}
                  selectedLocale={defaultLocale}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <PublicationInput fieldName="isEnabled" />
          <Flex mt={6}>
            <Button
              id="save-questionnaire-step"
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
        </FormProvider>
      </Box>
    </Box>
  )
}

export default QuestionnaireStepForm

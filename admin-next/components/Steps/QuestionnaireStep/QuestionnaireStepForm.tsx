import React, { useEffect, useState } from 'react'
import { Accordion, Box, Button, CapUIAccordionColor, Flex, FormLabel, Text, toast } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import UpdateQuestionnaireStepMutation from '@mutations/UpdateQuestionnaireStepMutation'
import TextEditor from '../../Form/TextEditor/TextEditor'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { QuestionnaireStepFormQuery } from '@relay/QuestionnaireStepFormQuery.graphql'
import { UpdateQuestionnaireStepInput } from '@relay/UpdateQuestionnaireStepMutation.graphql'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import DeleteStepMutation from '@mutations/DeleteStepMutation'
import { StepDurationTypeEnum, EnabledEnum } from '../DebateStep/DebateStepForm'
import QuestionnaireStepRequirementsTabs from '@components/Requirements/QuestionnaireStepRequirementsTabs'
import { getRequirementsInput, RequirementsFormValues } from '@components/Requirements/Requirements'
import QuestionnaireStepOptionalParameters from './QuestionnaireStepFormOptionalParameters'
import QuestionnaireStepFormQuestionnaireTab from './QuestionnaireStepFormQuestionnaireTab'
import { formatQuestions, formatQuestionsInput, getDefaultValues } from './utils'
import UpdateQuestionnaireMutation from '@mutations/UpdateQuestionnaireMutation'
import { QuestionInput } from '@relay/UpdateQuestionnaireMutation.graphql'
import CreateQuestionnaireMutation from '@mutations/CreateQuestionnaireMutation'
import { QuestionnaireType } from '@relay/CreateQuestionnaireMutation.graphql'
import { onBack } from '@components/Steps/utils'

type Props = {
  stepId: string
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
  isAnonymousParticipationAllowed: boolean
  metaDescription: string | null
  customCode: string | null
  stepDurationType?: {
    labels: Array<string>
  }
  questionnaire: {
    questionnaireId: string
    title: string
    description: string
    questions: Array<QuestionInput>
    questionsWithJumps: Array<any>
  }
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
        title
        label
        body
        timeRange {
          startAt
          endAt
        }
        enabled
        timeless
        isAnonymousParticipationAllowed
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

const QuestionnaireStepForm: React.FC<Props> = ({ stepId }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<QuestionnaireStepFormQuery>(QUESTIONNAIRE_STEP_QUERY, {
    stepId,
  })

  const { setBreadCrumbItems } = useNavBarContext()

  const { step, availableLocales } = query
  const project = step?.project

  if (!step) return null

  const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr'

  const [isEditing, setIsEditing] = useState(() => {
    return !!step.label
  })

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

  const { handleSubmit, formState, control, watch, reset } = formMethods
  const { isSubmitting, isValid } = formState

  const onSubmit = async ({ questionnaire, isUsingModel, questionnaireModel, ...values }: FormValues) => {
    const timeless = values?.stepDurationType?.labels?.[0] === StepDurationTypeEnum.TIMELESS ?? false
    delete values.stepDurationType
    delete values.temporaryQuestion
    delete values.temporaryJump

    const isNewStep = !questionnaire.questionnaireId

    const stepInput: UpdateQuestionnaireStepInput = {
      ...values,
      timeless,
      isEnabled: values.isEnabled.labels?.[0] === EnabledEnum.PUBLISHED ?? false,
      questionnaire: questionnaire.questionnaireId,
      ...getRequirementsInput(values),
    }

    const mergedArr = questionnaire.questions.map(q => {
      const j = questionnaire.questionsWithJumps.find(jump => q.id && jump.id && q.id === jump.id)
      return { ...q, ...j }
    })

    // @ts-ignore I'll fix that next PR, need to start recette
    delete questionnaire.questionsWithJumps

    if (isUsingModel) stepInput.questionnaire = questionnaireModel?.value || ''

    if (isNewStep && !isUsingModel) {
      const qInput = {
        title: `${stepInput.label} - ${intl.formatMessage({
          id: 'global.questionnaire',
        })}`,
        type: 'QUESTIONNAIRE' as QuestionnaireType,
      }
      const response = await CreateQuestionnaireMutation.commit(
        {
          input: qInput,
          connections: [],
        },
        false,
        null,
        null,
        false,
      )
      stepInput.questionnaire = response.createQuestionnaire?.questionnaire?.id || ''
    }

    if (!stepInput.questionnaire) return mutationErrorToast(intl)

    return UpdateQuestionnaireStepMutation.commit({ input: stepInput })
      .then(async response => {
        try {
          if (isUsingModel) {
            toast({
              variant: 'success',
              content: intl.formatMessage({ id: 'global.changes.saved' }),
            })
            const newFormValues = {
              ...response.updateQuestionnaireStep.questionnaireStep,
              requirements: values.requirements,
              requirementsReason: values.requirementsReason,
            }
            reset(getDefaultValues(stepId, newFormValues, true))
            return
          }
          return UpdateQuestionnaireMutation.commit({
            input: {
              ...questionnaire,
              questionnaireId: questionnaire?.questionnaireId || stepInput.questionnaire,
              title: `${stepInput.label} - ${intl.formatMessage({
                id: 'global.questionnaire',
              })}`,
              questions: formatQuestionsInput(mergedArr),
            },
          })
            .then(q => {
              toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'global.changes.saved' }),
              })
              setIsEditing(false)
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

  const stepDurationType = watch('stepDurationType')
  const isCustomStepDuration = stepDurationType?.labels?.[0] === StepDurationTypeEnum.CUSTOM

  return (
    <Box bg="white" width="100%" p={6} borderRadius="8px">
      <Text fontWeight={600} color="blue.800" fontSize={4}>
        {intl.formatMessage({ id: 'customize-your-questionnaire-step' })}
      </Text>
      <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...formMethods}>
          <FormControl name="label" control={control} isRequired mb={6}>
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
            />
          </FormProvider>
          <FormControl name="stepDurationType" control={control} isRequired mb={6}>
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
          {isCustomStepDuration ? (
            <Flex mb={4}>
              <FormControl name="startAt" control={control} width="max-content" mr={6} mb={0}>
                <FormLabel htmlFor="startAt" label={intl.formatMessage({ id: 'start-date' })}>
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FieldInput id="startAt" name="startAt" control={control} type="dateHour" />
              </FormControl>
              <FormControl name="endAt" control={control} width="max-content">
                <FormLabel htmlFor="endAt" label={intl.formatMessage({ id: 'ending-date' })}>
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FieldInput id="endAt" name="endAt" control={control} type="dateHour" />
              </FormControl>
            </Flex>
          ) : null}
          <QuestionnaireStepFormQuestionnaireTab />
          <Accordion
            color={CapUIAccordionColor.Transparent}
            defaultAccordion={intl.formatMessage({
              id: 'required-infos-to-participate',
            })}
          >
            <Accordion.Item id={intl.formatMessage({ id: 'required-infos-to-participate' })}>
              <Accordion.Button>{intl.formatMessage({ id: 'required-infos-to-participate' })}</Accordion.Button>
              <Accordion.Panel>
                <QuestionnaireStepRequirementsTabs formMethods={formMethods} questionnaireStep={step} />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <QuestionnaireStepOptionalParameters
            isEditing={isEditing}
            defaultLocale={defaultLocale}
            selectedLocale={defaultLocale}
          />
          <FormControl name="isEnabled" control={control} my={6}>
            <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'admin.fields.project.published_at' })} />
            <FieldInput
              id="isEnabled"
              name="isEnabled"
              control={control}
              type="radio"
              choices={[
                {
                  id: EnabledEnum.PUBLISHED,
                  label: intl.formatMessage({ id: 'global.published' }),
                  useIdAsValue: true,
                },
                {
                  id: EnabledEnum.DRAFT,
                  label: intl.formatMessage({ id: 'global-draft' }),
                  useIdAsValue: true,
                },
              ]}
            />
          </FormControl>
          <Flex mt={6}>
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
        </FormProvider>
      </Box>
    </Box>
  )
}

export default QuestionnaireStepForm

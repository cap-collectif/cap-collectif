import React, { useEffect } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { SectionOrderBy, ConsultationStepFormQuery } from '@relay/ConsultationStepFormQuery.graphql'
import { IntlShape, useIntl } from 'react-intl'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import { EnabledEnum, StepDurationTypeEnum } from '@components/Steps/DebateStep/DebateStepForm'
import {
  getDefaultRequirements,
  getRequirementsInput,
  RequirementsFormValues,
} from '@components/Requirements/Requirements'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Accordion,
  Box,
  Button,
  CapUIAccordionColor,
  CapUIIconSize,
  Flex,
  FormLabel,
  Spinner,
  Text,
  toast,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import TextEditor from '@components/Form/TextEditor/TextEditor'
import ConsultationStepConsultations from '@components/Steps/ConsultationStep/ConsultationStepConsultations'
import UpdateConsultationStep from '@mutations/UpdateConsultationStep'
import CreateOrUpdateConsultationMutation from '@mutations/CreateOrUpdateConsultationMutation'
import { UpdateConsultationStepInput } from '@relay/UpdateConsultationStepMutation.graphql'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import { OpinionTypeInput } from '@relay/CreateOrUpdateConsultationMutation.graphql'
import ConsultationStepRequirementsTabs from '@components/Requirements/ConsultationStepRequirementsTabs'
import { onBack } from '@components/Steps/utils'
import { useConsultationStep } from './ConsultationStepContext'

type Props = {
  stepId: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}

export type Section = {
  id?: string
  title: string
  description: string | null
  contribuable: boolean
  versionable: boolean
  sourceable: boolean
  subtitle: string | null
  defaultOrderBy: SectionOrderBy | null
  votesHelpText: string | null
  sections: ReadonlyArray<OpinionTypeInput>
  color: string
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
  customCode: string | null
  stepDurationType?: {
    labels: Array<string>
  }
  consultations: ReadonlyArray<{
    illustration: {
      id: string
      name: string
      size: string
      type: string
      url: string
    } | null
    model?: string | null
    id?: string
    title: string | null
    description: string | null
    sections: ReadonlyArray<OpinionTypeInput>
  }>
} & RequirementsFormValues

graphql`
  fragment ConsultationStepFormSectionFragment on Section {
    color
    position
    title
    description
    contribuable
    versionable
    sourceable
    subtitle
    defaultOrderBy
    votesHelpText
  }
`

const CONSULTATION_STEP_QUERY = graphql`
  query ConsultationStepFormQuery($stepId: ID!) {
    ...ConsultationStepConsultations_query
    step: node(id: $stepId) {
      ...ConsultationStepRequirementsTabs_consultationStep
      ...Requirements_requirementStep @relay(mask: false)
      id
      __typename
      ... on ConsultationStep {
        project {
          id
          title
          adminAlphaUrl
          canEdit
        }
        enabled
        label
        body
        timeless
        timeRange {
          startAt
          endAt
        }
        metaDescription
        customCode
        consultations {
          edges {
            node {
              id
              title
              description
              illustration {
                id
                name
                size
                type: contentType
                url(format: "reference")
              }
              sections {
                id
                ...ConsultationStepFormSectionFragment @relay(mask: false)
                sections {
                  id
                  ...ConsultationStepFormSectionFragment @relay(mask: false)
                  sections {
                    id
                    ...ConsultationStepFormSectionFragment @relay(mask: false)
                    sections {
                      id
                      ...ConsultationStepFormSectionFragment @relay(mask: false)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
    }
  }
`

export const getDefaultSection = (intl: IntlShape) => {
  return {
    id: `temp-${crypto.randomUUID()}`, // we use temporary id for newly created items to handle drag and drop, the temp id is removed when sent to the mutation
    position: 0,
    title: intl.formatMessage({ id: 'project.preview.action.participe' }),
    description: '',
    contribuable: false,
    versionable: false,
    sourceable: false,
    subtitle: '',
    votesHelpText: '',
    defaultOrderBy: 'positions',
    color: 'white',
    sections: [] as Array<OpinionTypeInput>,
  } as const
}

const ConsultationStepForm: React.FC<Props> = ({ stepId, setHelpMessage }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<ConsultationStepFormQuery>(CONSULTATION_STEP_QUERY, {
    stepId,
  })

  const { operationType, setOperationType } = useConsultationStep()
  const isEditing = operationType === 'EDIT'

  const { setBreadCrumbItems } = useNavBarContext()

  const { step, availableLocales } = query
  const project = step?.project

  const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr'

  const getBreadCrumbItems = () => {
    const breadCrumbItems = [
      {
        title: project?.title ?? '',
        href: (project?.adminAlphaUrl as string) ?? '',
      },
      {
        title: intl.formatMessage({ id: 'add-step' }),
        href: `/admin-next/project/${project?.id}/create-step`,
      },
      {
        title: intl.formatMessage({ id: 'consultation-step' }),
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
  }, [setBreadCrumbItems])

  const getDefaultValues = (): FormValues => {
    const stepDurationType = step
      ? step?.timeless
        ? [StepDurationTypeEnum.TIMELESS]
        : [StepDurationTypeEnum.CUSTOM]
      : [StepDurationTypeEnum.TIMELESS]

    const isEnabled = step?.enabled ? [EnabledEnum.PUBLISHED] : [EnabledEnum.DRAFT]

    const consultations = step?.consultations?.edges
      ?.map(edge => edge?.node)
      .map(consultation => {
        return {
          ...consultation,
          model: null,
        }
      })

    return {
      stepId,
      label: step?.label ?? 'abcdef',
      body: step?.body ?? '',
      startAt: step?.timeRange?.startAt ?? null,
      endAt: step?.timeRange?.endAt ?? null,
      timeless: step ? step?.timeless ?? false : true,
      stepDurationType: {
        labels: stepDurationType,
      },
      isEnabled: {
        labels: isEnabled,
      },
      metaDescription: step?.metaDescription ?? '',
      customCode: step?.customCode ?? '',
      // @ts-ignore relay stuff
      requirements: getDefaultRequirements(step),
      requirementsReason: '',
      consultations:
        consultations?.length > 0
          ? consultations
          : [
              {
                title: '',
                description: '',
                illustration: null,
                sections: [getDefaultSection(intl)],
              },
            ],
    }
  }

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getDefaultValues(),
    shouldUnregister: false,
  })

  const { handleSubmit, formState, control, watch } = formMethods
  const { isSubmitting, isValid } = formState

  const stepDurationType = watch('stepDurationType')
  const isCustomStepDuration = stepDurationType?.labels?.[0] === StepDurationTypeEnum.CUSTOM

  const onSubmit = async (values: FormValues) => {
    const timeless = values?.stepDurationType?.labels?.[0] === StepDurationTypeEnum.TIMELESS ?? false
    delete values.stepDurationType

    const consultations = values.consultations.map((consultation, consultationIndex) => {
      const sections = consultation.sections.map((section, sectionIndex) => {
        return {
          ...section,
          id: section?.id?.startsWith('temp-') ? undefined : section?.id,
          color: 'white',
          position: sectionIndex,
        }
      })

      if (consultation.hasOwnProperty('model')) {
        delete consultation.model
      }

      return {
        ...consultation,
        id: consultation?.id?.startsWith('temp-') ? undefined : consultation?.id,
        title: consultation.title || intl.formatMessage({ id: 'consultation-form' }),
        position: consultationIndex,
        illustration: consultation?.illustration?.id ?? null,
        sections,
      }
    })

    try {
      const { createOrUpdateConsultation } = await CreateOrUpdateConsultationMutation.commit({
        input: {
          consultations,
          stepId: values.stepId,
        },
      })

      const consultationsIds =
        createOrUpdateConsultation?.consultations.map(consultation => consultation?.id ?? null) ?? []

      const updateStepInput: UpdateConsultationStepInput = {
        ...values,
        isEnabled: values.isEnabled.labels?.[0] === EnabledEnum.PUBLISHED ?? false,
        timeless,
        consultations: consultationsIds,
        ...getRequirementsInput(values),
      }

      await UpdateConsultationStep.commit({
        input: updateStepInput,
      })

      setOperationType('EDIT')

      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'consultation-saved' }),
      })
    } catch (error) {
      return mutationErrorToast(intl)
    }
  }

  if (!project?.canEdit) {
    window.location.href = '/admin-next/projects'
    return null
  }

  return (
    <Box bg="white" width="70%" p={6} borderRadius="8px" flex="none">
      <Text fontWeight={600} color="blue.800" fontSize={4}>
        {intl.formatMessage({ id: 'customize-your-consultation-step' })}
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
                <FieldInput
                  id="startAt"
                  name="startAt"
                  control={control}
                  type="dateHour"
                  // @ts-expect-error MAJ DS Props
                  dateInputProps={{ isOutsideRange: true }}
                />
              </FormControl>
              <FormControl name="endAt" control={control} width="max-content">
                <FormLabel htmlFor="endAt" label={intl.formatMessage({ id: 'ending-date' })}>
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FieldInput
                  id="endAt"
                  name="endAt"
                  control={control}
                  type="dateHour"
                  // @ts-expect-error MAJ DS Props
                  dateInputProps={{ isOutsideRange: true }}
                />
              </FormControl>
            </Flex>
          ) : null}

          <ConsultationStepConsultations query={query} />

          <Accordion color={CapUIAccordionColor.Transparent}>
            <Accordion.Item
              id={intl.formatMessage({ id: 'required-infos-to-participate' })}
              onMouseEnter={() => {
                setHelpMessage('step.create.requirements.helpText')
              }}
              onMouseLeave={() => setHelpMessage(null)}
            >
              <Accordion.Button>{intl.formatMessage({ id: 'required-infos-to-participate' })}</Accordion.Button>
              <Accordion.Panel>
                <React.Suspense
                  fallback={
                    <Flex justifyContent="center" alignItems="center" width="100%">
                      <Spinner size={CapUIIconSize.Lg} />
                    </Flex>
                  }
                >
                  <ConsultationStepRequirementsTabs consultationStep={step} formMethods={formMethods} />
                </React.Suspense>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
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
              id="save-consultation"
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

export default ConsultationStepForm

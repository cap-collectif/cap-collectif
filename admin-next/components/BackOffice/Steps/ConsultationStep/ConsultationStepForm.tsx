import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Accordion,
  Box,
  Button,
  CapUIAccordionColor,
  CapUIFontSize,
  CapUIIconSize,
  Flex,
  FormLabel,
  Spinner,
  Text,
} from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import ConsultationStepRequirementsTabs from '@components/BackOffice/Requirements/ConsultationStepRequirementsTabs'
import {
  getDefaultRequirements,
  getRequirementsInput,
  RequirementsFormValues,
} from '@components/BackOffice/Requirements/Requirements'
import ConsultationStepConsultations from '@components/BackOffice/Steps/ConsultationStep/ConsultationStepConsultations'
import { StepDurationTypeEnum } from '@components/BackOffice/Steps/DebateStep/DebateStepForm'
import { LogActionTypeEnum } from '@components/BackOffice/Steps/Shared/Enum/LogActionTypeEnum'
import PublicationInput, { EnabledEnum } from '@components/BackOffice/Steps/Shared/PublicationInput'
import { onBack } from '@components/BackOffice/Steps/utils'
import CreateOrUpdateConsultationMutation from '@mutations/CreateOrUpdateConsultationMutation'
import UpdateConsultationStep from '@mutations/UpdateConsultationStep'
import { ConsultationStepFormQuery, SectionOrderBy } from '@relay/ConsultationStepFormQuery.graphql'
import { OpinionTypeInput } from '@relay/CreateOrUpdateConsultationMutation.graphql'
import { UpdateConsultationStepInput } from '@relay/UpdateConsultationStepMutation.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { IntlShape, useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import StepDurationInput from '../Shared/StepDurationInput'
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
        requirements {
          reason
        }
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

  const createStepLink = `/admin-next/project/${project?.id}/create-step`
  const getBreadCrumbItems = () => {
    const breadCrumbItems = [
      {
        title: project?.title ?? '',
        href: (project?.adminAlphaUrl as string) ?? '',
      },
      {
        title: intl.formatMessage({ id: 'add-step' }),
        href: createStepLink,
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
      requirementsReason: step?.requirements?.reason ?? '',
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

  const { handleSubmit, formState, control } = formMethods
  const { isSubmitting, isValid } = formState

  const onSubmit = async (values: FormValues) => {
    const timeless = !!(values?.stepDurationType?.labels?.[0] === StepDurationTypeEnum.TIMELESS)
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
          operationType: operationType === LogActionTypeEnum.CREATE ? LogActionTypeEnum.CREATE : LogActionTypeEnum.EDIT,
        },
      })

      const consultationsIds =
        createOrUpdateConsultation?.consultations.map(consultation => consultation?.id ?? null) ?? []

      const updateStepInput: UpdateConsultationStepInput = {
        ...values,
        isEnabled: !!(values.isEnabled.labels?.[0] === EnabledEnum.PUBLISHED),
        timeless,
        endAt: timeless ? null : values.endAt,
        startAt: timeless ? null : values.startAt,
        consultations: consultationsIds,
        ...getRequirementsInput(values),
      }

      await UpdateConsultationStep.commit({
        input: updateStepInput,
      })

      successToast(intl.formatMessage({ id: 'consultation-saved' }))

      if (!isEditing) {
        return (window.location.href = `/admin-next/project/${project?.id}`)
      }

      setOperationType('EDIT')
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
      <Text fontWeight={600} color="blue.800" fontSize={CapUIFontSize.Headline}>
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
          <TextEditor
            name="body"
            label={intl.formatMessage({ id: 'step-description' })}
            platformLanguage={defaultLocale}
            selectedLanguage={defaultLocale}
          />
          <StepDurationInput />

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
          <PublicationInput fieldName="isEnabled" />
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

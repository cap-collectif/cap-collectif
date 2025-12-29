import { FieldInput, FormControl } from '@cap-collectif/form'
import { Accordion, Box, Button, CapUIAccordionColor, CapUIFontSize, Flex, FormLabel, Text } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { StepDurationTypeEnum } from '@components/BackOffice/Steps/DebateStep/DebateStepForm'
import { LogActionTypeEnum } from '@components/BackOffice/Steps/Shared/Enum/LogActionTypeEnum'
import PublicationInput, { EnabledEnum } from '@components/BackOffice/Steps/Shared/PublicationInput'
import { onBack } from '@components/BackOffice/Steps/utils'
import UpdateOtherStepMutation from '@mutations/UpdateOtherStepMutation'
import { OtherStepFormQuery } from '@relay/OtherStepFormQuery.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import StepDurationInput from '../Shared/StepDurationInput'
import { useOtherStep } from './OtherStepContext'

type Props = {
  stepId: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}

type FormValues = {
  label: string
  body: string
  startAt: string | null
  endAt: string | null
  isEnabled: {
    labels: Array<string>
  }
  timeless: boolean
  stepDurationType?: {
    labels: Array<string>
  }
  metaDescription: string
  customCode: string | null
}

export const QUERY = graphql`
  query OtherStepFormQuery($stepId: ID!) {
    step: node(id: $stepId) {
      id
      ... on OtherStep {
        label
        body
        timeless
        timeRange {
          startAt
          endAt
        }
        enabled
        metaDescription
        customCode
        project {
          id
          title
          canEdit
          adminAlphaUrl
        }
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
    }
  }
`

const OtherStepForm: React.FC<Props> = ({ stepId, setHelpMessage }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<OtherStepFormQuery>(QUERY, { stepId })
  const { availableLocales, step } = query
  const project = step?.project
  const defaultLocale = availableLocales.find(locale => locale.isDefault)
  const { setBreadCrumbItems } = useNavBarContext()

  if (!project || !step) {
    throw new Error('Please provide a valid project and step')
  }

  const { operationType, setOperationType } = useOtherStep()
  const isEditing = operationType === 'EDIT'

  const createStepLink = `/admin-next/project/${project.id}/create-step`
  const getBreadCrumbItems = () => {
    const breadCrumbItems = [
      {
        title: project.title ?? '',
        href: project.adminAlphaUrl ?? '',
      },
      {
        title: intl.formatMessage({ id: 'add-step' }),
        href: createStepLink,
      },
      {
        title: intl.formatMessage({ id: 'custom-step' }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getInitialValues = (): FormValues => {
    const isEnabledLabels = step.enabled ? [EnabledEnum.PUBLISHED] : [EnabledEnum.DRAFT]
    const stepDurationType = step?.timeless ? [StepDurationTypeEnum.TIMELESS] : [StepDurationTypeEnum.CUSTOM]
    return {
      label: step.label ?? '',
      body: step.body ?? '',
      startAt: step.timeRange?.startAt ?? null,
      endAt: step.timeRange?.endAt ?? null,
      isEnabled: {
        labels: isEnabledLabels,
      },
      timeless: step.timeless ?? false,
      stepDurationType: {
        labels: stepDurationType,
      },
      metaDescription: step.metaDescription ?? '',
      customCode: step.customCode ?? '',
    }
  }

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(),
  })

  const { handleSubmit, formState, control } = formMethods
  const { isSubmitting } = formState
  const onSubmit = async (values: FormValues) => {
    const timeless = !!(values?.stepDurationType?.labels?.[0] === StepDurationTypeEnum.TIMELESS)
    delete values.stepDurationType

    const input = {
      ...values,
      stepId,
      operationType: operationType === LogActionTypeEnum.CREATE ? LogActionTypeEnum.CREATE : LogActionTypeEnum.EDIT,
      isEnabled: !!(values.isEnabled.labels?.[0] === EnabledEnum.PUBLISHED),
      timeless,
      endAt: timeless ? null : values?.endAt,
      startAt: timeless ? null : values?.startAt,
    }

    try {
      const response = await UpdateOtherStepMutation.commit({ input })
      if (!response.updateOtherStep) {
        return mutationErrorToast(intl)
      }
      successToast(intl.formatMessage({ id: 'global.saved' }))
      if (!isEditing) {
        return (window.location.href = `/admin-next/project/${project?.id}`)
      }
      setOperationType('EDIT')
    } catch (error) {
      return mutationErrorToast(intl)
    }
  }

  if (!project.canEdit) {
    window.location.href = '/admin-next/projects'
    return null
  }

  return (
    <Box bg="white" width="70%" p={6} borderRadius="8px" flex="none">
      <Text fontWeight={600} color="blue.800" fontSize={CapUIFontSize.Headline} mb={8}>
        {intl.formatMessage({ id: 'customize-your-custom-step' })}
      </Text>
      <FormProvider {...formMethods}>
        <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            mb={6}
            name="label"
            control={control}
            isRequired
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
            platformLanguage={defaultLocale?.code}
            selectedLanguage="fr"
            buttonLabels={{
              submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
            }}
          />
          <StepDurationInput
            canChooseDurationType
            startAt={{
              required: false,
            }}
          />
          <Accordion color={CapUIAccordionColor.white}>
            <Accordion.Item id={intl.formatMessage({ id: 'optional-settings' })}>
              <Accordion.Button>{intl.formatMessage({ id: 'optional-settings' })}</Accordion.Button>
              <Accordion.Panel>
                <FormControl name="metaDescription" control={control}>
                  <FormLabel htmlFor="metaDescription" label={intl.formatMessage({ id: 'global.meta.description' })} />
                  <FieldInput id="metaDescription" name="metaDescription" control={control} type="textarea" />
                </FormControl>
                <FormControl name="customCode" control={control}>
                  <FormLabel
                    htmlFor="customCode"
                    label={intl.formatMessage({
                      id: 'admin.customcode',
                    })}
                  />
                  <FieldInput
                    id="customCode"
                    name="customCode"
                    control={control}
                    type="textarea"
                    placeholder="<style></style>"
                    resize="vertical"
                  />
                </FormControl>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <PublicationInput fieldName="isEnabled" />
          <Flex>
            <Button variantSize="big" variant="primary" type="submit" mr={4} isLoading={isSubmitting}>
              {isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'add-the-step' })}
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
      </FormProvider>
    </Box>
  )
}
export const getServerSideProps = withPageAuthRequired
export default OtherStepForm

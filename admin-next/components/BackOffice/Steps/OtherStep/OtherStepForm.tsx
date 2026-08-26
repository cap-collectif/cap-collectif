import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Accordion,
  Box,
  Button,
  CapUIAccordionColor,
  CapUIFontSize,
  Flex,
  FormLabel,
  Switch,
  Text,
} from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { StepDurationTypeEnum } from '@components/BackOffice/Steps/DebateStep/DebateStepForm'
import { LogActionTypeEnum } from '@components/BackOffice/Steps/Shared/Enum/LogActionTypeEnum'
import CoverImageInput from '@components/BackOffice/Steps/Shared/CoverImageInput'
import PublicationInput, { EnabledEnum } from '@components/BackOffice/Steps/Shared/PublicationInput'
import { onBack } from '@components/BackOffice/Steps/utils'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
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
  cover: { id: string; name: string; size: string; type: string; url: string } | null
  hubMetadata?: {
    enabled: boolean
    aiotCode: string
    folderNumber: string
    contactEmail: string
  }
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
        cover {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
        project {
          id
          title
          canEdit
          adminAlphaUrl
        }
        hubMetadata {
          enabled
          aiotCode
          folderNumber
          contactEmail
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
  const newProjectPage = useFeatureFlag('new_project_page')
  const hubApiGreen = useFeatureFlag('hub_api_green')

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
      cover: step.cover
        ? {
            id: step.cover.id,
            name: step.cover.name,
            size: step.cover.size,
            type: step.cover.type,
            url: step.cover.url,
          }
        : null,
      hubMetadata: hubApiGreen
        ? {
            enabled: step.hubMetadata?.enabled ?? false,
            aiotCode: step.hubMetadata?.aiotCode ?? '',
            folderNumber: step.hubMetadata?.folderNumber ?? '',
            contactEmail: step.hubMetadata?.contactEmail ?? '',
          }
        : undefined,
    }
  }

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(),
  })

  const { handleSubmit, formState, control, watch, setValue } = formMethods
  const hubAssociationEnabled = watch('hubMetadata.enabled')
  const { isSubmitting } = formState
  const onSubmit = async (values: FormValues) => {
    const timeless = !!(values?.stepDurationType?.labels?.[0] === StepDurationTypeEnum.TIMELESS)
    delete values.stepDurationType

    if (!hubApiGreen) {
      delete values.hubMetadata
    }

    const input = {
      ...values,
      stepId,
      cover: (values.cover as any)?.id ?? null,
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
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
          ? error.message
          : undefined

      return mutationErrorToast(intl, errorMessage)
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
        <Box as="form" mt={4} noValidate onSubmit={handleSubmit(onSubmit)}>
          <Flex spacing={6} alignItems="flex-start">
            <Box flex="1">
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
                  submit: isEditing
                    ? intl.formatMessage({ id: 'global.edit' })
                    : intl.formatMessage({ id: 'global.add' }),
                }}
              />
            </Box>
            {newProjectPage && <CoverImageInput />}
          </Flex>
          <StepDurationInput
            canChooseDurationType
            startAt={{
              required: false,
            }}
          />
          {hubApiGreen && (
            <Box mt={6} mb={6}>
              <Flex justify="space-between" alignItems="center" mb={hubAssociationEnabled ? 4 : 0}>
                <Text fontWeight={600} color="blue.800">
                  {intl.formatMessage({ id: 'hub-folder-association' })}
                </Text>
                <Switch
                  id="hubMetadata.enabled"
                  checked={!!hubAssociationEnabled}
                  onChange={() => setValue('hubMetadata.enabled', !hubAssociationEnabled)}
                />
              </Flex>
              {hubAssociationEnabled && (
                <>
                  <FormControl name="hubMetadata.aiotCode" control={control} isRequired mb={4}>
                    <FormLabel htmlFor="hubMetadata.aiotCode" label={intl.formatMessage({ id: 'hub-aiot-code' })} />
                    <FieldInput id="hubMetadata.aiotCode" name="hubMetadata.aiotCode" control={control} type="text" />
                  </FormControl>
                  <FormControl name="hubMetadata.folderNumber" control={control} isRequired mb={4}>
                    <FormLabel
                      htmlFor="hubMetadata.folderNumber"
                      label={intl.formatMessage({ id: 'hub-folder-number' })}
                    />
                    <FieldInput
                      id="hubMetadata.folderNumber"
                      name="hubMetadata.folderNumber"
                      control={control}
                      type="text"
                    />
                  </FormControl>
                  <FormControl name="hubMetadata.contactEmail" control={control} isRequired>
                    <FormLabel
                      htmlFor="hubMetadata.contactEmail"
                      label={intl.formatMessage({ id: 'hub-contact-email' })}
                    />
                    <FieldInput
                      id="hubMetadata.contactEmail"
                      name="hubMetadata.contactEmail"
                      control={control}
                      type="email"
                    />
                  </FormControl>
                </>
              )}
            </Box>
          )}
          <Accordion color={CapUIAccordionColor.white} sx={{ summary: { pl: 0 } }}>
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

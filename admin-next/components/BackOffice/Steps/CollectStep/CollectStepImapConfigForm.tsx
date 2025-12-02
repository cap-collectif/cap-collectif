import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, Flex, FormLabel, Tag } from '@cap-collectif/ui'
import { useSaveImapConfigMutation } from '@mutations/SaveImapConfigMutation'
import { CollectStepImapConfigForm_collectStep$key } from '@relay/CollectStepImapConfigForm_collectStep.graphql'
import { SaveImapConfigErrorCode, SaveImapConfigInput } from '@relay/SaveImapConfigMutation.graphql'
import { mutationErrorToast } from '@shared/utils/toasts'
import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'

type Props = {
  step: CollectStepImapConfigForm_collectStep$key
}

type FormValues = {
  id: string
  serverUrl: string
  folder: string
  email: string
  password: string
}

type ResponseOutput = { type: 'error' | 'success'; message: string } | null

type Status = 'IDLE' | 'SAVED' | 'EDIT'

type ErrorCode = Exclude<SaveImapConfigErrorCode, '%future added value'>

const errorsMap: Record<ErrorCode, string> = {
  CONNECTION_TO_SERVER_FAILED: 'imap-server-unavailable',
  FOLDER_NOT_FOUND: 'folder-not-found',
  AUTHENTICATION_FAILED: 'login-failure',
  EMAIL_ALREADY_USED: 'email-address-already-used',
}

const FRAGMENT = graphql`
  fragment CollectStepImapConfigForm_collectStep on CollectStep {
    id
    imapConfig {
      id
      serverUrl
      folder
      email
    }
  }
`

const CollectStepImapConfigForm: React.FC<Props> = ({ step: stepRef }) => {
  const step = useFragment(FRAGMENT, stepRef)

  const defaultValues = {
    id: step?.imapConfig?.id,
    serverUrl: step?.imapConfig?.serverUrl,
    folder: step?.imapConfig?.folder,
    email: step?.imapConfig?.email,
    password: step?.imapConfig ? '****' : null,
  }

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
  })

  const { control, setValue, handleSubmit, reset, formState } = formMethods

  const { isValid } = formState

  const intl = useIntl()
  const { commit, isLoading } = useSaveImapConfigMutation()

  const [responseOutput, setResponseOutput] = useState<ResponseOutput>(() => {
    if (step?.imapConfig?.id) {
      return {
        type: 'success',
        message: intl.formatMessage({ id: 'global.active' }),
      }
    }
    return null
  })

  const [status, setStatus] = useState<Status>(() => {
    if (step?.imapConfig?.id) {
      return 'SAVED'
    }
    return 'IDLE'
  })

  const [validConfig, setValidConfig] = useState<FormValues | null>(null)

  const emptyFields = () => {
    setValue('serverUrl', '')
    setValue('folder', '')
    setValue('email', '')
    setValue('password', '')
  }

  const onEdit = () => {
    setResponseOutput(null)
    setStatus('EDIT')
    emptyFields()
  }

  const saveConfig = (values: FormValues) => {
    const { id, serverUrl, folder, email, password } = values
    setResponseOutput(null)
    const input: SaveImapConfigInput = {
      stepId: step.id,
      id: id ?? null,
      serverUrl,
      folder,
      email,
      password,
    }

    commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        const { errorCode, imapConfig } = response.saveImapConfig

        if (errorCode === null) {
          setResponseOutput({
            type: 'success',
            message: intl.formatMessage({ id: 'global.active' }),
          })
          setStatus('SAVED')
          setValidConfig({
            ...values,
            id: imapConfig.id,
          })
          return
        }

        setResponseOutput({
          type: 'error',
          message: intl.formatMessage({ id: errorsMap[errorCode] }),
        })
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Box mt={2}>
        <Flex gap={2}>
          <FormControl name="serverUrl" control={control} mb={6} isRequired>
            <FormLabel htmlFor="serverUrl" label={intl.formatMessage({ id: 'imap-server-label' })} />
            <FieldInput id="serverUrl" name="serverUrl" control={control} type="text" disabled={status === 'SAVED'} />
          </FormControl>
          <FormControl name="folder" control={control} mb={6} isRequired>
            <FormLabel htmlFor="folder" label={intl.formatMessage({ id: 'folder-label' })} />
            <FieldInput id="folder" name="folder" control={control} type="text" disabled={status === 'SAVED'} />
          </FormControl>
        </Flex>
        <Flex gap={2}>
          <FormControl name="email" control={control} mb={6} isRequired>
            <FormLabel htmlFor="email" label={`${intl.formatMessage({ id: 'recipient-email' })}*`} />
            <FieldInput id="email" name="email" control={control} type="email" disabled={status === 'SAVED'} />
          </FormControl>
          <FormControl name="password" control={control} mb={6} isRequired>
            <FormLabel htmlFor="password" label={intl.formatMessage({ id: 'password-label' })} />
            <FieldInput id="password" name="password" control={control} type="password" disabled={status === 'SAVED'} />
          </FormControl>
        </Flex>
        <Flex justifyContent={responseOutput !== null ? 'space-between' : 'right'} alignItems="center">
          {responseOutput !== null ? (
            <Tag variantColor={responseOutput.type === 'success' ? 'success' : 'danger'}>
              <Tag.Label>{responseOutput.message}</Tag.Label>
            </Tag>
          ) : null}
          {responseOutput?.type === 'success' ? (
            <Flex gap={4}>
              <Button isLoading={isLoading} onClick={onEdit} disabled={!isValid} variant="tertiary">
                {intl.formatMessage({ id: 'edit-the-configuration' })}
              </Button>
            </Flex>
          ) : (
            <Flex gap={4}>
              {status === 'EDIT' && !isLoading ? (
                <Button
                  onClick={() => {
                    reset(validConfig ?? defaultValues)
                  }}
                  variant="secondary"
                >
                  {intl.formatMessage({ id: 'global.cancel' })}
                </Button>
              ) : null}
              <Button
                isLoading={isLoading}
                onClick={e => {
                  handleSubmit(data => saveConfig(data as FormValues))(e)
                }}
              >
                {intl.formatMessage({ id: 'save-the-configuration' })}
              </Button>
            </Flex>
          )}
        </Flex>
      </Box>
    </FormProvider>
  )
}

export default CollectStepImapConfigForm

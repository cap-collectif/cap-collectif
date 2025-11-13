import { FieldInput, FormControl } from '@cap-collectif/form'
import { Box, Button, toast, useMultiStepModal } from '@cap-collectif/ui'
import CookieMonster from '@shared/utils/CookieMonster'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { useSendParticipantPhoneValidationCodeMutation } from '~/mutations/SendParticipantPhoneValidationCodeMutation'
import { useSendSmsPhoneValidationCodeMutation } from '~/mutations/SendSmsPhoneValidationCodeMutation'
import { useValidatePhoneReusabilityMutation } from '~/mutations/ValidatePhoneReusabilityMutation'
import { useVerifyParticipantPhoneNumberMutation } from '~/mutations/VerifyParticipantPhoneNumberMutation'
import { useVerifyUserPhoneNumberMutation } from '~/mutations/VerifyUserPhoneNumberMutation'
import type { GlobalState } from '~/types'
import { fakeTimer } from '~/utils/timer'
import ModalLayout from './ModalLayout'
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal'

type FormValues = Pick<WorkflowFormValues, 'code'>

const PhoneConfirmationModal: React.FC = () => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user)

  const verifyUserPhoneNumberMutation = useVerifyUserPhoneNumberMutation()
  const verifyParticipantPhoneNumberMutation = useVerifyParticipantPhoneNumberMutation()
  const sendParticipantPhoneValidationCodeMutation = useSendParticipantPhoneValidationCodeMutation()
  const sendSmsPhoneValidationCodeMutation = useSendSmsPhoneValidationCodeMutation()
  const validatePhoneReusabilityMutation = useValidatePhoneReusabilityMutation()

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { isValid },
    setFocus,
  } = useFormContext()

  const verifyCodeIsLoading =
    verifyUserPhoneNumberMutation.isLoading ||
    verifyParticipantPhoneNumberMutation.isLoading ||
    validatePhoneReusabilityMutation.isLoading
  const sendCodeIsLoading =
    sendParticipantPhoneValidationCodeMutation.isLoading || sendSmsPhoneValidationCodeMutation.isLoading

  const phone = watch('phone')
  const participantToken = CookieMonster.getParticipantCookie()
  const { contributionId, contributionUrl } = useParticipationWorkflow()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus('code')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  const sendCodeToParticipant = (phone: string) => {
    const input = {
      phone: phone,
      token: CookieMonster.getParticipantCookie(),
    }

    sendParticipantPhoneValidationCodeMutation.commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        const errorCode = response?.sendParticipantPhoneValidationCode?.errorCode

        if (errorCode === 'RETRY_LIMIT_REACHED') {
          toast({
            variant: 'warning',
            content: intl.formatMessage({
              id: 'participant-email-verification-retry-limit-error',
            }),
          })
          return
        }

        if (errorCode) {
          return mutationErrorToast(intl)
        }
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }
  const sendCodeToUser = () => {
    const input = {}
    sendSmsPhoneValidationCodeMutation.commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        const errorCode = response?.sendSmsPhoneValidationCode?.errorCode
        if (errorCode === 'RETRY_LIMIT_REACHED') {
          toast({
            variant: 'warning',
            content: intl.formatMessage({
              id: 'participant-email-verification-retry-limit-error',
            }),
          })
          return
        }
        if (errorCode) {
          return mutationErrorToast(intl)
        }
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const sendCode = () => {
    if (isAuthenticated) {
      sendCodeToUser()
      return
    }
    sendCodeToParticipant(phone)
  }

  const verifyCode = (code: string) => {
    if (isAuthenticated) {
      verifyUserPhoneNumberMutation.commit({
        variables: {
          input: {
            code,
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            return mutationErrorToast(intl)
          }
          const errorCode = response.verifyUserPhoneNumber?.errorCode

          if (errorCode === 'CODE_EXPIRED' || errorCode === 'CODE_NOT_VALID' || errorCode === 'RETRY_LIMIT_REACHED') {
            setError('code', {
              type: 'custom',
              message: intl.formatMessage({ id: errorCode }),
            })
            return
          }

          if (errorCode) {
            return mutationErrorToast(intl)
          }

          validatePhoneReusabilityMutation.commit({
            variables: {
              input: {
                participantToken: !isAuthenticated ? participantToken : null,
                contributionId,
              },
            },
            onCompleted: async (response, errors) => {
              if (errors && errors.length > 0) {
                return mutationErrorToast(intl)
              }
              const errorCode = response.validatePhoneReusability?.errorCode
              if (errorCode === 'PHONE_ALREADY_USED') {
                toast({
                  variant: 'danger',
                  content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
                })
                await fakeTimer(10000)
                window.location.href = contributionUrl
                return
              }
              goToNextStep()
            },
          })
        },
        onError: () => {
          return mutationErrorToast(intl)
        },
      })
    } else {
      verifyParticipantPhoneNumberMutation.commit({
        variables: {
          input: {
            code,
            token: CookieMonster.getParticipantCookie(),
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            return mutationErrorToast(intl)
          }
          const errorCode = response.verifyParticipantPhoneNumber?.errorCode

          if (errorCode === 'CODE_EXPIRED' || errorCode === 'CODE_NOT_VALID' || errorCode === 'RETRY_LIMIT_REACHED') {
            setError('code', {
              type: 'custom',
              message: intl.formatMessage({ id: errorCode }),
            })
            return
          }

          if (errorCode) {
            return mutationErrorToast(intl)
          }

          validatePhoneReusabilityMutation.commit({
            variables: {
              input: {
                participantToken: !isAuthenticated ? participantToken : null,
                contributionId,
              },
            },
            onCompleted: async (response, errors) => {
              if (errors && errors.length > 0) {
                return mutationErrorToast(intl)
              }
              const errorCode = response.validatePhoneReusability?.errorCode
              if (errorCode === 'PHONE_ALREADY_USED') {
                toast({
                  variant: 'danger',
                  content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
                })
                await fakeTimer(10000)
                window.location.href = contributionUrl
                return
              }
              goToNextStep()
            },
          })
        },
        onError: () => {
          return mutationErrorToast(intl)
        },
      })
    }
  }

  const onSubmit = async ({ code }: FormValues) => {
    verifyCode(code)
  }

  return (
    <>
      <ModalLayout
        onClose={() => {}}
        title={intl.formatMessage({ id: 'participation-workflow.confirm_phone' })}
        info={intl.formatMessage({ id: 'participation-workflow.code_label' })}
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            name="code"
            control={control}
            isRequired
            sx={{ '> div': { marginLeft: 'auto !important', marginRight: 'auto' } }}
          >
            <FieldInput
              title={intl.formatMessage({ id: 'fill-n-numbers-code' }, { n: 6 })}
              id="code"
              name="code"
              control={control}
              type="codeInput"
              onChange={e => {
                const code = e.target.value
                if (code) {
                  verifyCode(code)
                }
              }}
              variantColor="hierarchy"
            />
          </FormControl>
          <Button
            variantSize="big"
            justifyContent="center"
            width="100%"
            type="submit"
            disabled={!isValid}
            isLoading={verifyCodeIsLoading}
          >
            {intl.formatMessage({ id: 'global.continue' })}
          </Button>
        </Box>
        <Button variant="link" mt={4} type="button" onClick={() => sendCode()} isLoading={sendCodeIsLoading}>
          {intl.formatMessage({ id: 'participation-workflow.resend_code' })}
        </Button>
      </ModalLayout>
    </>
  )
}

export default PhoneConfirmationModal

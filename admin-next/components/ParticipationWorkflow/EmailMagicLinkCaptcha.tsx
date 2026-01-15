import React from 'react'
import { toast, useMultiStepModal } from '@cap-collectif/ui'
import CaptchaModal from './CaptchaModal'
import CookieMonster from '@shared/utils/CookieMonster'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useIntl } from 'react-intl'
import { useSendParticipantEmailWorkflowMutation } from './mutations/SendParticipantEmailWorkflowMutation'
import { useFormContext } from 'react-hook-form'
import { MAGIC_LINK_CHECK_EMAIL_INDEX } from './EmailMagicLinkCheckEmail'
import { useParticipationWorkflow } from './ParticipationWorkflowContext'

export const MAGIC_LINK_CAPTCHA_INDEX = 7

const EmailMagicLinkCaptcha: React.FC = () => {
  const { setCurrentStep } = useMultiStepModal()
  const intl = useIntl()
  const { requirementsUrl } = useParticipationWorkflow()
  const sendParticipantEmailWorkflowMutation = useSendParticipantEmailWorkflowMutation()
  const goToMagicLinkCheckEmail = () => setCurrentStep(MAGIC_LINK_CHECK_EMAIL_INDEX)

  const { watch } = useFormContext()

  const email = watch('email')

  const onSuccess = () => {
    const input = {
      email,
      participantToken: CookieMonster.getParticipantCookie(),
      redirectUrl: requirementsUrl,
      emailType: 'MAGIC_LINK',
    } as const

    sendParticipantEmailWorkflowMutation.commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }

        const errorCode = response.sendParticipantEmailWorkflow?.errorCode
        const magicLinkUrl = response.sendParticipantEmailWorkflow?.redirectUrl

        if (errorCode === 'EMAIL_RECENTLY_SENT') {
          toast({
            variant: 'warning',
            content: intl.formatMessage({
              id: 'participant-email-verification-retry-limit-error',
            }),
          })
          return
        }

        // this is only for testing purpose, so we bypass email checking and redirect to the email link
        if (magicLinkUrl) {
          window.location.href = magicLinkUrl
          return
        }

        goToMagicLinkCheckEmail()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  return <CaptchaModal onCaptchaSuccess={onSuccess} />
}

export default EmailMagicLinkCaptcha

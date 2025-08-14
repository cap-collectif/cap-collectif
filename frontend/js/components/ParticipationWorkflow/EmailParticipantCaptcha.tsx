import React from 'react'
import { CapUIIconSize, Flex, Spinner, toast, useMultiStepModal } from '@cap-collectif/ui'
import { PARTICIPANT_CHECK_EMAIL_INDEX } from '~/components/ParticipationWorkflow/EmailParticipantCheckEmail'
import CaptchaModal from '~/components/ParticipationWorkflow/CaptchaModal'
import CookieMonster from '@shared/utils/CookieMonster'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { useIntl } from 'react-intl'
import { useSendParticipantEmailWorkflowMutation } from '~/mutations/SendParticipantEmailWorkflowMutation'
import { useFormContext } from 'react-hook-form'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'


export const PARTICIPANT_CAPTCHA_INDEX = 1;

const EmailParticipantCaptcha: React.FC = () => {
  const {setCurrentStep} = useMultiStepModal();
  const intl = useIntl();
  const { requirementsUrl } = useParticipationWorkflow()
  const sendParticipantEmailWorkflowMutation = useSendParticipantEmailWorkflowMutation();
  const goToParticipantCheckEmail = () => setCurrentStep(PARTICIPANT_CHECK_EMAIL_INDEX);

  const {watch} = useFormContext();

  const email = watch('email')

  const onSuccess = () => {
    const input = {
      email,
      participantToken: CookieMonster.getParticipantCookie(),
      redirectUrl: requirementsUrl,
      emailType: 'PARTICIPANT_CONFIRMATION_EMAIL'
    } as const;

    sendParticipantEmailWorkflowMutation.commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl);
        }

        const errorCode = response.sendParticipantEmailWorkflow?.errorCode;
        const redirectUrl = response.sendParticipantEmailWorkflow?.redirectUrl;

        if (errorCode === 'EMAIL_RECENTLY_SENT') {
          toast({
            variant: 'warning',
            content: intl.formatMessage({
              id: 'participant-email-verification-retry-limit-error',
            }),
          });
          return;
        }

        // this is only for testing purpose, so we bypass email checking and redirect to the email link
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }

        goToParticipantCheckEmail();
      },
      onError: () => {
        return mutationErrorToast(intl);
      },
    });
  };

  return (
    <>
      <CaptchaModal
        onCaptchaSuccess={onSuccess}
      >
        {sendParticipantEmailWorkflowMutation.isLoading && (
          <Flex width="100%" justifyContent="center">
            <Spinner size={CapUIIconSize.Lg} />
          </Flex>
        )}
      </CaptchaModal>
    </>

  )
}

export default EmailParticipantCaptcha
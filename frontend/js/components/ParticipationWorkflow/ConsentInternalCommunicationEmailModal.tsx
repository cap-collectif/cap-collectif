import React, { useEffect } from 'react'
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout'
import { Box, Button, CapInputSize, FormLabel, useMultiStepModal, toast, Text, Flex, Link } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import { useSendParticipantConsentInternalCommunicationEmailMutation } from '~/mutations/SendParticipantConsentInternalCommunicationEmailMutation'
import CookieMonster from '@shared/utils/CookieMonster'
import { CenteredLogoLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'
import { useSelector } from 'react-redux'
import { GlobalState } from '~/types'

type FormValues = {
  email: string
}

const ConsentInternalCommunicationEmailModal = () => {
  const { totalSteps, currentStep, goToNextStep } = useMultiStepModal()
  const hasNextStep = totalSteps > currentStep + 1

  const { contributionUrl } = useParticipationWorkflow()
  const intl = useIntl()
  const sendParticipantConsentInternalCommunicationEmailMutation =
    useSendParticipantConsentInternalCommunicationEmailMutation()
  const [hasRetryError, setHasRetryError] = React.useState(false)
  const [remainingSecondsUntilRetry, setRemainingSecondsUntilRetry] = React.useState(60)

  const { isLoading, commit } = sendParticipantConsentInternalCommunicationEmailMutation

  const { control, handleSubmit, setFocus } = useFormContext<FormValues>()

  const linkColor = useSelector((state: GlobalState) => state.default.parameters['color.link.default'])

  const buttonRef = React.useRef(null)

  React.useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus('email')
    }, 100)
    return () => clearTimeout(timeout)
  }, [setFocus])

  useEffect(() => {
    if (!hasRetryError) {
      return
    }

    const intervalId = setInterval(() => {
      if (remainingSecondsUntilRetry > 0) {
        setRemainingSecondsUntilRetry(prevSeconds => prevSeconds - 1)
      } else {
        clearInterval(intervalId)
        setHasRetryError(false)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [remainingSecondsUntilRetry, hasRetryError])

  const getRedirectUrl = () => {
    const toastConfig = JSON.stringify({ variant: 'success', message: 'your-participation-is-confirmed' })
    return `${contributionUrl}?toast=${toastConfig}`
  }

  const redirectUrl = getRedirectUrl()

  const onSubmit = (values: FormValues) => {
    const input = {
      email: values.email.toString(),
      participantToken: CookieMonster.getParticipantCookie(),
    }
    commit({
      variables: {
        input,
      },
      onCompleted: async (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }

        const { errorCode } = response.sendParticipantConsentInternalCommunicationEmail

        if (errorCode === 'EMAIL_RECENTLY_SENT') {
          setRemainingSecondsUntilRetry(60)
          setHasRetryError(true)
          return
        }

        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'consent-internal-comm-email-send' }),
        })

        if (hasNextStep) {
          goToNextStep()
          return
        }
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  return (
    <>
      <ModalLayout
        onClose={() => {}}
        title={intl.formatMessage({ id: 'vote_step.participation_validated' })}
        info={intl.formatMessage({ id: 'participation-workflow.consent_internal_communication.helpText' })}
        header={({ logo }) => <CenteredLogoLayout logo={logo} />}
        showConfetti
      >
        <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="email" control={control} isRequired>
            <FormLabel htmlFor="email" label={intl.formatMessage({ id: 'user_email' })} />
            <FieldInput id="email" name="email" control={control} type="email" variantSize={CapInputSize.Md} />
          </FormControl>
          <Flex direction="column" width="100%" alignItems="center" mb={2}>
            {hasRetryError ? (
              <Text fontSize="16px">
                {intl.formatMessage({ id: 'resend-email-in-x-seconds' }, { x: remainingSecondsUntilRetry })}
              </Text>
            ) : (
              <Button
                ref={buttonRef}
                variantSize="big"
                justifyContent="center"
                width="100%"
                type="submit"
                isLoading={isLoading}
              >
                {intl.formatMessage({ id: 'participation-workflow.yes' })}
              </Button>
            )}
          </Flex>
          <Flex justifyContent="center" alignItems="center" mt={4}>
            <Link href={redirectUrl} color={linkColor}>
              {intl.formatMessage({ id: 'back-to-platform' })}
            </Link>
          </Flex>
        </Box>
      </ModalLayout>
    </>
  )
}

export default ConsentInternalCommunicationEmailModal

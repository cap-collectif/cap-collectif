import * as React from 'react'
import { useIntl } from 'react-intl'
import { Button, toast, Text, Flex, useMultiStepModal } from '@cap-collectif/ui'
import ModalLayout from './ModalLayout'
import CookieMonster from '@shared/utils/CookieMonster'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { getSniperLink } from '~/components/ParticipationWorkflow/utils'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { useSendParticipantEmailWorkflowMutation } from '~/mutations/SendParticipantEmailWorkflowMutation'
import { useFragment, graphql } from 'react-relay'
import { PARTICIPANT_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailParticipantForm'
import { EmailParticipantCheckEmail_query$key } from '~relay/EmailParticipantCheckEmail_query.graphql'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import EmailInboxSVG from '~/components/ParticipationWorkflow/assets/EmailInboxSVG'

type Props = {
  query: EmailParticipantCheckEmail_query$key
}

const QUERY_FRAGMENT = graphql`
  fragment EmailParticipantCheckEmail_query on Query {
    senderEmails {
      address
      isDefault
    }
  }
`

export const PARTICIPANT_CHECK_EMAIL_INDEX = 2

const EmailParticipantCheckEmail: React.FC<Props> = ({ query: queryRef }) => {
  const intl = useIntl()
  const query = useFragment(QUERY_FRAGMENT, queryRef)
  const isMobile = useIsMobile()
  const { setCurrentStep } = useMultiStepModal()
  const { requirementsUrl } = useParticipationWorkflow()
  const sendParticipantEmailWorkflowMutation = useSendParticipantEmailWorkflowMutation()

  const [hasRetryError, setHasRetryError] = React.useState(false)
  const [remainingSecondsUntilRetry, setRemainingSecondsUntilRetry] = React.useState(60)

  const { watch } = useFormContext()

  const fromEmail = query.senderEmails.find(email => email.isDefault === true)?.address

  const email = watch('email') as string
  const sniperLink = getSniperLink({
    userEmail: email,
    fromEmail,
  })

  const goToParticipantForm = () => setCurrentStep(PARTICIPANT_FORM_INDEX)

  const receiveNewMail = () => {
    const input = {
      email,
      participantToken: CookieMonster.getParticipantCookie(),
      redirectUrl: requirementsUrl,
      emailType: 'PARTICIPANT_CONFIRMATION_EMAIL',
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

        if (errorCode === 'EMAIL_RECENTLY_SENT') {
          setRemainingSecondsUntilRetry(60)
          setHasRetryError(true)
          return
        }

        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'user.confirm.sent' }),
        })
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

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

  const showSniperLink = sniperLink !== null && !isMobile
  return (
    <>
      <ModalLayout
        onClose={() => {}}
        title={intl.formatMessage({ id: 'confirm-email-address' })}
        info={
          <Flex direction="column">
            <Text>{intl.formatMessage({ id: 'participation-workflow.confirm_email_helptext' })}</Text>
            <Text fontWeight={600}>{email}</Text>
            <Text mt="20px">{intl.formatMessage({ id: 'dont-forget-to-check-spams' })}</Text>
          </Flex>
        }
        onBack={goToParticipantForm}
        textBlockOrder={[1, 0]}
      >
        <Flex direction="column" mt={showSniperLink ? 4 : 0} width="100%" alignItems="center">
          <Flex order={[0, 1]} justifyContent="center">
            <EmailInboxSVG isMobile={isMobile} />
          </Flex>
        </Flex>
        <Flex direction="column" width="100%" alignItems="center" mb={2} order={[3, 2]}>
          {showSniperLink && (
            <Button
              as="a"
              target="_blank"
              href={sniperLink}
              variantSize="big"
              justifyContent="center"
              width="100%"
              type="submit"
              sx={{
                '&:before': {
                  content: 'none',
                },
              }}
            >
              {intl.formatMessage({ id: 'open-my-inbox' })}
            </Button>
          )}
          {hasRetryError ? (
            <Text mt={showSniperLink ? 2 : 0}>
              {intl.formatMessage({ id: 'resend-email-in-x-seconds' }, { x: remainingSecondsUntilRetry })}
            </Text>
          ) : (
            <Button
              mt={showSniperLink ? 2 : 0}
              variant="link"
              variantSize="big"
              justifyContent="center"
              width="100%"
              type="button"
              onClick={receiveNewMail}
              isLoading={sendParticipantEmailWorkflowMutation.isLoading}
            >
              {intl.formatMessage({ id: 'not-received-receive-a-new-mail' })}
            </Button>
          )}
        </Flex>
      </ModalLayout>
    </>
  )
}

export default EmailParticipantCheckEmail

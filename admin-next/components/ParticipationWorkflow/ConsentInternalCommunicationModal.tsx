import React from 'react'
import ModalLayout from './ModalLayout'
import { Box, Button, CapUIFontSize, Flex, Link, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useParticipationWorkflow } from './ParticipationWorkflowContext'
import CookieMonster from '@shared/utils/CookieMonster'
import BirdNotificationSVG from './assets/BirdNotificationSVG'
import { useUpdateParticipantMutation } from './mutations/UpdateParticipantMutation'
import { useUpdateProfilePersonalDataMutation } from './mutations/UpdateProfilePersonalDataMutation'
import { useSelector } from 'react-redux'
import type { GlobalState } from './types'
import { CenteredLogoLayout } from './ModalLayoutHeader'
import useIsMobile from '@shared/hooks/useIsMobile'

type FormValues = {
  email: string
}

const ConsentInternalCommunicationModal = () => {
  const { contributionUrl } = useParticipationWorkflow()
  const intl = useIntl()

  const [isAuthenticated, linkColor] = useSelector((state: GlobalState) => {
    return [!!state.user.user, state.default.parameters['color.link.default']] as const
  })

  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()

  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading

  const { handleSubmit } = useFormContext<FormValues>()

  const isMobile = useIsMobile()

  const getRedirectUrl = () => {
    const toastConfig = JSON.stringify({ variant: 'success', message: 'your-participation-is-confirmed' })
    return `${contributionUrl}?toast=${toastConfig}`
  }
  const redirectUrl = getRedirectUrl()

  const redirectOnSubscribtion = () => {
    const toastConfig = JSON.stringify({ variant: 'success', message: 'thank-you-you-are-subscribed-to-newsletter' })
    window.location.href = `${contributionUrl}?toast=${toastConfig}`
  }

  const updateUser = () => {
    const input = {
      consentInternalCommunication: true,
    }
    updateProfilePersonalDataMutation.commit({
      variables: {
        input,
      },
      onCompleted: async (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        redirectOnSubscribtion()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const updateParticipant = () => {
    const input = {
      consentInternalCommunication: true,
      token: CookieMonster.getParticipantCookie(),
    }
    updateParticipantMutation.commit({
      variables: {
        input,
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        redirectOnSubscribtion()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const onSubmit = () => {
    if (isAuthenticated) {
      updateUser()
      return
    }
    updateParticipant()
  }

  return (
    <>
      <ModalLayout
        onClose={() => {}}
        title=""
        info=""
        header={({ logo }) => <CenteredLogoLayout logo={logo} />}
        showConfetti
      >
        <BirdNotificationSVG />
        <Box mt="38px">
          <Text
            color="neutral-gray.900"
            fontWeight={600}
            textAlign={isMobile ? 'left' : 'center'}
            fontSize={CapUIFontSize.Headline}
          >
            {intl.formatMessage({ id: 'vote_step.participation_validated' })}
          </Text>
          <Text color="neutral-gray.700" fontSize={CapUIFontSize.BodySmall} mt={1} lineHeight="s">
            {intl.formatMessage({ id: 'participation-workflow.consent_internal_communication.helpText' })}
          </Text>
          <Box as="form" width="100%" mt={4} onSubmit={handleSubmit(onSubmit)}>
            <Button variantSize="big" justifyContent="center" width="100%" type="submit" isLoading={isLoading}>
              {intl.formatMessage({ id: 'participation-workflow.yes' })}
            </Button>
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Link href={redirectUrl} color={linkColor}>
                {intl.formatMessage({ id: 'back-to-platform' })}
              </Link>
            </Flex>
          </Box>
        </Box>
      </ModalLayout>
    </>
  )
}

export default ConsentInternalCommunicationModal

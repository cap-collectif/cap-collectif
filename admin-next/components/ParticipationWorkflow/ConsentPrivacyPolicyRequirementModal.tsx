import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, useMultiStepModal, Button, Flex } from '@cap-collectif/ui'
import ModalLayout from './ModalLayout'
import { useUpdateParticipantMutation } from './mutations/UpdateParticipantMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import CookieMonster from '@shared/utils/CookieMonster'
import { useUpdateProfilePersonalDataMutation } from './mutations/UpdateProfilePersonalDataMutation'
import { HideBackArrowLayout } from './ModalLayoutHeader'
import RGPDSVG from './assets/RGPDSVG'
import { openPrivacyModal } from '@shared/register/PrivacyModal'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

type Props = {
  hideGoBackArrow: boolean
}

const ConsentPrivacyPolicyRequirementModal: React.FC<Props> = ({ hideGoBackArrow }) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const isAuthenticated = !!viewerSession?.id

  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()
  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading

  const buttonRef = React.useRef(null)

  React.useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [])

  const updateUser = () => {
    const input = {
      consentPrivacyPolicy: true,
    }
    updateProfilePersonalDataMutation.commit({
      variables: {
        input,
      },
      onCompleted: async (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const updateParticipant = () => {
    const input = {
      consentPrivacyPolicy: true,
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
        goToNextStep()
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }

  const onClick = () => {
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
        title={intl.formatMessage({ id: 'participation-workflow.consentPrivacyPolicy' })}
        info={intl.formatMessage(
          { id: 'participation-workflow.consentPrivacyPolicy_helptext' },
          {
            policyLink: (
              <Box
                as="button"
                type="button"
                id="privacy-policy"
                onClick={() => dispatchEvent(new Event(openPrivacyModal))}
                name="privacy"
                sx={{
                  textDecoration: 'underline',
                }}
              >
                {intl.formatMessage({ id: 'capco.module.privacy_policy' })}
              </Box>
            ),
          },
        )}
        header={
          hideGoBackArrow
            ? ({ intl, onClose, goBackCallback, logo, isMobile }) => (
                <HideBackArrowLayout
                  intl={intl}
                  onClose={onClose}
                  goBackCallback={goBackCallback}
                  logo={logo}
                  isMobile={isMobile}
                />
              )
            : null
        }
      >
        <Flex direction="column" width="100%">
          <Flex justifyContent="center" order={[0, 1]} mt={[0, 4]}>
            <RGPDSVG />
          </Flex>
          <Flex width="100%" justifyContent="center">
            <Button
              ref={buttonRef}
              variantSize="big"
              justifyContent="center"
              width={['100%', 'auto']}
              type="submit"
              order={[1, 0]}
              minWidth="18rem"
              onClick={onClick}
              isLoading={isLoading}
            >
              {intl.formatMessage({ id: 'i-accept' })}
            </Button>
          </Flex>
        </Flex>
      </ModalLayout>
    </>
  )
}

export default ConsentPrivacyPolicyRequirementModal

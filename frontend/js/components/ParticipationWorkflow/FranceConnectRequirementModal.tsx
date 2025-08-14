import React from 'react'
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout'
import { useIntl } from 'react-intl'
import { LoginSocialButton } from '@shared/login/LoginSocialButton'
import { Box, Flex, Text, useMultiStepModal } from '@cap-collectif/ui'
import { PARTICIPANT_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailParticipantForm'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import { HideBackArrowLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'

type Props = {
  children?: React.ReactNode
  hideGoBackArrow?: boolean
};

export const ACCOUNT_FRANCE_CONNECT_INDEX = 4

const FranceConnectRequirementModal: React.FC<Props> = ({ children, hideGoBackArrow = false }) => {
  const intl = useIntl()
  const { requirementsUrl } = useParticipationWorkflow()
  const { setCurrentStep } = useMultiStepModal()

  const goToParticipantForm = () => setCurrentStep(PARTICIPANT_FORM_INDEX)

  return (
    <>
      <ModalLayout
        header={hideGoBackArrow ? ({ intl, onClose, goBackCallback, logo, isMobile }) => (
          <HideBackArrowLayout intl={intl} onClose={onClose} goBackCallback={goBackCallback} logo={logo}
                               isMobile={isMobile} />
        ) : null}
        title={intl.formatMessage({ id: 'please-authenticate-with-france-connect' })}
        onClose={() => {
        }}
        onBack={goToParticipantForm}
      >
        <LoginSocialButton type="franceConnect" customRedirectUri={requirementsUrl} noHR={true} />
        {
          children && (
            <>
              <Flex alignItems="center" width="100%" mt={4}>
                <Box borderTop="1px solid black" mr={4} width="50%" borderTopColor="neutral-gray.500" />
                <Text>{intl.formatMessage({ id: 'global.or' })}</Text>
                <Box borderTop="1px solid black" ml={4} width="50%" borderTopColor="neutral-gray.500" />
              </Flex>
              {children}
            </>
          )
        }
      </ModalLayout>
    </>
  )
}

export default FranceConnectRequirementModal
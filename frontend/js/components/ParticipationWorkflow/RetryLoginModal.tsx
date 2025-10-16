import React from 'react'
import { Button, CapUIModalSize, Flex, Heading, Modal, toast, useMultiStepModal } from '@cap-collectif/ui'
import ResetCss from '~/utils/ResetCss'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { useSendMagicLinkEmailMutation } from '~/mutations/SendMagicLinkEmailMutation'
import ForgotPassword from '~/components/ParticipationWorkflow/ForgotPassword'
import { MAGIC_LINK_FORM_INDEX } from '~/components/ParticipationWorkflow/EmailMagicLinkForm'

type Props = {
  show: boolean
  email: string
  clearPassword: () => void
  onClose: () => void
}

const RetryLoginModal: React.FC<Props> = ({ show, email, clearPassword, onClose }) => {
  const intl = useIntl()
  const sendMagicLinkEmailMutation = useSendMagicLinkEmailMutation()
  const { setCurrentStep } = useMultiStepModal()
  const goToMagicLinkForm = () => setCurrentStep(MAGIC_LINK_FORM_INDEX)

  const tryAgain = () => {
    clearPassword()
    onClose()
  }

  return (
    <>
      <Modal size={CapUIModalSize.Xl} ariaLabel="close modal" show={show} onClose={onClose} maxHeight="initial">
        <>
          <ResetCss>
            <Modal.Header>
              <Heading fontWeight={600}>{intl.formatMessage({ id: 'impossible-to-login' })}</Heading>
            </Modal.Header>
          </ResetCss>
          <Modal.Body>
            <FormattedHTMLMessage id="modal-login-failure-body" />
          </Modal.Body>
          <Modal.Footer>
            <Flex direction="column" width="100%">
              <ForgotPassword
                email={email}
                onSuccess={() => {
                  toast({
                    variant: 'success',
                    content: intl.formatMessage({ id: 'reinit-password-email-sent' }),
                  })
                  onClose()
                }}
              >
                {({ sendForgotPasswordEmail, isLoading }) => (
                  <Button mb={4} variantSize="big" onClick={sendForgotPasswordEmail} isLoading={isLoading}>
                    {intl.formatMessage({ id: 'global.forgot_password' })}
                  </Button>
                )}
              </ForgotPassword>
              <Button
                mb={4}
                variantSize="big"
                variant="secondary"
                isLoading={sendMagicLinkEmailMutation.isLoading}
                onClick={goToMagicLinkForm}
              >
                {intl.formatMessage({ id: 'get-connection-link' })}
              </Button>
              <Button mb={4} variantSize="big" variant="tertiary" onClick={tryAgain}>
                {intl.formatMessage({ id: 'button.try.again' })}
              </Button>
            </Flex>
          </Modal.Footer>
        </>
      </Modal>
    </>
  )
}

export default RetryLoginModal

import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import RegistrationForm from './RegistrationForm'
import LoginSocialButtons from '@shared/login/LoginSocialButtons'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import type { RegistrationModal_query$key } from '@relay/RegistrationModal_query.graphql'
import { Box, Button, CapUIFontSize, CapUIModalSize, Heading, InfoMessage, Modal } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'

type Props = {
  query: RegistrationModal_query$key
  show: boolean
  onClose: () => void,
  showPendingEmailConfirmation: boolean
}

const FRAGMENT = graphql`
  fragment RegistrationModal_query on Query {
    registrationForm {
      topTextDisplayed
      topText
      bottomText
      bottomTextDisplayed
    }
    ...RegistrationForm_query
    ...LoginSocialButtons_query
  }
`

export const RegistrationModal = ({ onClose, show, query: queryFragment, showPendingEmailConfirmation }: Props) => {
  const query = useFragment(FRAGMENT, queryFragment)

  const textTop = query.registrationForm.topTextDisplayed && query.registrationForm.topText
  const bottomText = query.registrationForm.bottomTextDisplayed && query.registrationForm.bottomText

  const intl = useIntl()


  const {
    getValues,
  } = useFormContext()
  const email = getValues('email')

  const {
    formState: { isSubmitting },
  } = useFormContext()

  if (!show) return null

  return (
    <Modal
      show={show}
      style={{
        zIndex: 9000,
      }}
      onClose={() => {
        onClose()
      }}
      size={CapUIModalSize.Xl}
      maxWidth="540px"
      ariaLabel={intl.formatMessage({ id: 'global.register' })}
      fullSizeOnMobile
      forceModalDialogToFalse
      hideOnClickOutside={false}
    >
      <Modal.Header>
        <Heading as="h4">{intl.formatMessage({ id: 'global.register' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        {textTop && (
          <Box
            textAlign="center"
            p={4}
            borderRadius="normal"
            border="normal"
            backgroundColor="primary.background"
            borderColor="primary.light"
            color="primary.base"
            mb={4}
          >
            <WYSIWYGRender value={textTop} />
          </Box>
        )}
        <LoginSocialButtons query={query} />
        <RegistrationForm query={query} />

        {bottomText && (
          <Box textAlign="center" mt={4} fontSize={CapUIFontSize.BodySmall} color="neutral-gray.600">
            <WYSIWYGRender value={bottomText} />
          </Box>
        )}
        {
          showPendingEmailConfirmation && (
            <InfoMessage variant="warning" mt={2} id="email-confirmation-help-message">
              <InfoMessage.Title>
                {intl.formatMessage({ id: 'confirm-your-email' })}
              </InfoMessage.Title>
              <InfoMessage.Content>
                {intl.formatMessage({ id: 'email-confirmation-help-message'}, { email })}
              </InfoMessage.Content>
            </InfoMessage>
          )
        }
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="tertiary"
          onClick={() => {
            onClose()
          }}
          type="button"
          variantSize="big"
        >
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>

        <Button variant="primary" id="confirm-login" type="submit" isLoading={isSubmitting}
                variantSize="big">
          {intl.formatMessage({ id: isSubmitting ? 'global.loading' : 'global.register' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default RegistrationModal

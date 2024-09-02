import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { useAnalytics } from 'use-analytics'
import RegistrationForm from './RegistrationForm'
import LoginSocialButtons from '@shared/login/LoginSocialButtons'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import type { RegistrationModal_query$key } from '@relay/RegistrationModal_query.graphql'
import { Box, Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'

type Props = {
  query: RegistrationModal_query$key
  show: boolean
  onClose: () => void
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

export const RegistrationModal = ({ onClose, show, query: queryFragment }: Props) => {
  const query = useFragment(FRAGMENT, queryFragment)

  const textTop = query.registrationForm.topTextDisplayed && query.registrationForm.topText
  const bottomText = query.registrationForm.bottomTextDisplayed && query.registrationForm.bottomText

  const { track } = useAnalytics()
  const intl = useIntl()

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
        track('registration_close_click')
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
            backgroundColor="primary.200"
            borderColor="primary.400"
            color="primary.600"
            mb={4}
          >
            <WYSIWYGRender value={textTop} />
          </Box>
        )}
        <LoginSocialButtons query={query} />
        <RegistrationForm query={query} />

        {bottomText && <WYSIWYGRender className="text-center small excerpt mt-15" value={bottomText} />}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="tertiary"
          onClick={() => {
            track('registration_close_click')
            onClose()
          }}
          type="button"
          variantSize="big"
        >
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>

        <Button
          variant="primary"
          id="confirm-login"
          type="submit"
          isLoading={isSubmitting}
          onClick={() => {
            track('registration_submit_click')
          }}
          variantSize="big"
        >
          {intl.formatMessage({ id: isSubmitting ? 'global.loading' : 'global.register' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default RegistrationModal

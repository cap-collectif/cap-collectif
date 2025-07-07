import React from 'react'
import { useIntl } from 'react-intl'
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { LoginModal_query$key } from '@relay/LoginModal_query.graphql'
import { graphql, useFragment } from 'react-relay'
import LoginBox from './LoginBox'
import { useFormContext } from 'react-hook-form'

type Props = {
  show: boolean
  onClose: () => void
  query: LoginModal_query$key
}

const FRAGMENT = graphql`
  fragment LoginModal_query on Query {
    ...LoginBox_query
  }
`

export const LoginModal = ({ query: queryFragment, show, onClose }: Props) => {
  const intl = useIntl()
  const byPassAuth = useFeatureFlag('sso_by_pass_auth')
  const query = useFragment(FRAGMENT, queryFragment)

  const {
    formState: { isSubmitting },
  } = useFormContext()

  if (!show) return null

  return (
    <Modal
      style={{
        zIndex: 9000,
      }}
      show={show}
      onClose={onClose}
      autoFocus
      size={CapUIModalSize.Xl}
      maxWidth="540px"
      ariaLabel={intl.formatMessage({ id: 'login.with' })}
      fullSizeOnMobile
      forceModalDialogToFalse
      hideOnClickOutside={false}
    >
      <Modal.Header id="contained-modal-title-lg">
        <Heading as="h2">{intl.formatMessage({ id: 'login.with' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <LoginBox query={query} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onClick={onClose} type="button" variantSize="big">
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
        {!byPassAuth && (
          <Button variant="primary" id="confirm-login" type="submit" isLoading={isSubmitting} variantSize="big">
            {intl.formatMessage({ id: isSubmitting ? 'global.loading' : 'global.login_me' })}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default LoginModal

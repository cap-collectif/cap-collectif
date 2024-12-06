import * as React from 'react'
import { useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import getBaseUrl from '@shared/utils/getBaseUrl'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import LoginModal from '@shared/login/LoginModal'
import { Button, ButtonProps } from '@cap-collectif/ui'
import { LoginButtonQuery } from '@relay/LoginButtonQuery.graphql'
import { LoginButton_query$key } from '@relay/LoginButton_query.graphql'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import LoginFormWrapper from '@shared/login/LoginFormWrapper'
import { useEventListener } from '@shared/hooks/useEventListener'

export const openLoginModal = 'openLoginModal'

export const QUERY = graphql`
  query LoginButtonQuery {
    ...LoginButton_query
  }
`

export const FRAGMENT = graphql`
  fragment LoginButton_query on Query {
    ...LoginModal_query
    oauth2sso: ssoConfigurations(ssoType: OAUTH2) {
      edges {
        node {
          enabled
        }
      }
    }
    siteColors {
      keyname
      value
    }
  }
`

export const LoginButton: React.FC<ButtonProps & { query: LoginButton_query$key }> = ({
  query: queryKey,
  ...props
}) => {
  const intl = useIntl()
  const query = useFragment(FRAGMENT, queryKey)
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const byPassLoginModal = useFeatureFlag('sso_by_pass_auth')
  const oauth2SwitchUser = useFeatureFlag('oauth2_switch_user')
  const loginWithOpenID = query.oauth2sso.edges.some(({ node }) => node.enabled)
  const baseUrl = getBaseUrl()
  let redirectUrl: string = baseUrl

  if (loginWithOpenID && byPassLoginModal) {
    const redirectUri = oauth2SwitchUser
      ? `${baseUrl}/sso/switch-user?_destination=${window && window.location.href}`
      : `${window && window.location.href}`
    redirectUrl = `/login/openid?_destination=${redirectUri}`
  }

  useEventListener(openLoginModal, () => onOpen())

  return (
    <>
      <LoginFormWrapper>
        <LoginModal show={isOpen} onClose={onClose} query={query} />
      </LoginFormWrapper>
      <Button
        id="login-button"
        my={2}
        destination={redirectUrl}
        variant="primary"
        variantColor="primary"
        aria-label={intl.formatMessage({
          id: 'open.connection_modal',
        })}
        onClick={() => {
          if (loginWithOpenID && byPassLoginModal) {
            window.location.href = redirectUrl
          } else {
            onOpen()
          }
        }}
        {...props}
      >
        {intl.formatMessage({ id: 'global.login' })}
      </Button>
    </>
  )
}

export const LoginButtonQueryWrapper: React.FC<ButtonProps> = props => {
  const query = useLazyLoadQuery<LoginButtonQuery>(QUERY, {})

  return <LoginButton {...props} query={query} />
}

export default LoginButton

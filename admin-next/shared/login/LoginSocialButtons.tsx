import React, { FC } from 'react'
import { LoginSocialButtons_query$key } from '@relay/LoginSocialButtons_query.graphql'
import LoginSocialButton from './LoginSocialButton'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { graphql, useFragment } from 'react-relay'
import { Box } from '@cap-collectif/ui'

const FRAGMENT = graphql`
  fragment LoginSocialButtons_query on Query {
    ssoConfigurations {
      edges {
        node {
          enabled
          name
          __typename
        }
      }
    }
  }
`

export const LoginSocialButtons: FC<{ query: LoginSocialButtons_query$key }> = ({ query: queryRef }) => {
  const query = useFragment(FRAGMENT, queryRef)
  const ssoList = query.ssoConfigurations.edges.filter(e => e.node.enabled).map(({ node }) => node)
  const loginFranceConnect = useFeatureFlag('login_franceconnect')
  const hasLoginSaml = useFeatureFlag('login_saml')
  const cas =
    useFeatureFlag('login_cas') && ssoList.length > 0
      ? ssoList.find(sso => sso.__typename === 'CASSSOConfiguration')
      : undefined
  const hasOauth2SwitchUser = useFeatureFlag('oauth2_switch_user')
  const hasSsoByPassAuth = useFeatureFlag('sso_by_pass_auth')
  const hasOAuth = ssoList.length > 0 && ssoList.filter(sso => sso.__typename === 'Oauth2SSOConfiguration').length > 0
  const hasFB = ssoList.length > 0 && ssoList.filter(sso => sso.__typename === 'FacebookSSOConfiguration').length > 0

  if (!hasFB && !hasLoginSaml && !cas && !hasOAuth && !loginFranceConnect) {
    return null
  }

  return (
    <>
      {loginFranceConnect &&
        ssoList.length > 0 &&
        ssoList.find(sso => sso.__typename === 'FranceConnectSSOConfiguration') && (
          <LoginSocialButton type="franceConnect" justifyContent="start" />
        )}
      {ssoList.length > 0 &&
        ssoList
          .filter(sso => sso.__typename !== 'FranceConnectSSOConfiguration')
          .map(({ __typename, name }, index: number) => {
            switch (__typename) {
              case 'Oauth2SSOConfiguration':
                return (
                  <LoginSocialButton
                    text={name}
                    key={index}
                    switchUserMode={hasOauth2SwitchUser || false}
                    type="openId"
                  />
                )

              case 'FacebookSSOConfiguration':
                return <LoginSocialButton type="facebook" justifyContent="start" />

              case 'CASSSOConfiguration':
                return cas ? <LoginSocialButton type="cas" text={cas.name} justifyContent="start" /> : null

              default:
                break
            }
          })}
      {hasLoginSaml && <LoginSocialButton type="saml" justifyContent="start" />}
      {!hasSsoByPassAuth && <Box as="hr" my={5} borderColor="neutral-gray.200" color="neutral-gray.200" />}
    </>
  )
}

export default LoginSocialButtons

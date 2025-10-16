import * as React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { graphql, useFragment } from 'react-relay'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import { UserInvitationPage } from '~/components/User/Invitation/UserInvitationPage'
import UserInvitationSSOPage from '~/components/User/Invitation/UserInvitationSSOPage'
import type { UserInvitationRootPage_colors$key } from '~relay/UserInvitationRootPage_colors.graphql'
import type { UserInvitationRootPage_query$key } from '~relay/UserInvitationRootPage_query.graphql'
import type { UserInvitationRootPage_logo$key } from '~relay/UserInvitationRootPage_logo.graphql'
import RegistrationFormWrapper from '@shared/register/RegistrationFormWrapper'
import { useIntl } from 'react-intl'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { toast } from '@cap-collectif/ui'
type Props = {
  readonly queryFragmentRef: UserInvitationRootPage_query$key
  readonly colorsFragmentRef: UserInvitationRootPage_colors$key
  readonly logoFragmentRef: UserInvitationRootPage_logo$key
  readonly email: string
  readonly token: string
  readonly baseUrl: string
  readonly loginFacebook: boolean
  readonly loginFranceConnect: boolean
  readonly ssoList: {
    readonly type: string
    readonly name: string
  }
  readonly hasEnabledSSO: boolean
  readonly isRegistrationAllowed: boolean
}
const COLORS_FRAGMENT = graphql`
  fragment UserInvitationRootPage_colors on SiteColor @relay(plural: true) {
    keyname
    value
  }
`
const LOGO_FRAGMENT = graphql`
  fragment UserInvitationRootPage_logo on SiteImage {
    ...UserInvitationPage_logo
    ...UserInvitationSSOPage_logo
  }
`
const QUERY_FRAGMENT = graphql`
  fragment UserInvitationRootPage_query on Query {
    ...UserInvitationPage_query
    ...RegistrationFormWrapper_query
  }
`

const UserInvitationRootPage = ({
  queryFragmentRef,
  colorsFragmentRef,
  logoFragmentRef,
  email,
  token,
  loginFacebook,
  loginFranceConnect,
  ssoList,
  hasEnabledSSO,
  isRegistrationAllowed,
}: Props) => {
  const intl = useIntl()
  const colors = useFragment(COLORS_FRAGMENT, colorsFragmentRef)
  const logo = useFragment(LOGO_FRAGMENT, logoFragmentRef)
  const query = useFragment(QUERY_FRAGMENT, queryFragmentRef)
  const [firstVisited, setFirstVisited] = React.useState(false)
  const { defaultPrimaryColor, defaultColorText } = useSelector((state: GlobalState) => ({
    defaultPrimaryColor: state.default.parameters['color.btn.primary.bg'],
    defaultColorText: state.default.parameters['color.btn.primary.text'],
  }))
  const primaryColor = colors.find(color => color.keyname === 'color.btn.primary.bg')?.value || defaultPrimaryColor
  const btnTextColor = colors.find(color => color.keyname === 'color.btn.primary.text')?.value || defaultColorText
  const backgroundColor = colors.find(color => color.keyname === 'color.main_menu.bg')?.value || defaultPrimaryColor

  const login = async (email: string, password: string) => {
    return fetch(`${window.location.origin}/login_check`, {
      method: 'POST',
      body: JSON.stringify({ username: email, password: password }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then(response => {
        if (response.status >= 500) mutationErrorToast(intl)
        return response.json()
      })
      .then((response: { success?: boolean }) => {
        if (response.success) {
          toast({ content: intl.formatMessage({ id: 'alert.success.add.user' }), variant: 'success' })
          window.location.reload()
          return true
        }
      })
  }

  return (
    <Switch>
      <Route path="/sso">
        {hasEnabledSSO ? (
          <UserInvitationSSOPage
            loginFacebook={loginFacebook}
            loginFranceConnect={loginFranceConnect}
            ssoList={ssoList}
            isRegistrationAllowed={isRegistrationAllowed}
            logoFragmentRef={logo}
            primaryColor={primaryColor}
            btnTextColor={btnTextColor}
            backgroundColor={backgroundColor}
            setFirstVisited={setFirstVisited}
            token={token}
          />
        ) : (
          <Redirect from="/sso" to="/" />
        )}
      </Route>

      <Route path="/">
        {hasEnabledSSO && !firstVisited ? (
          <Redirect to="/sso" />
        ) : (
          <RegistrationFormWrapper query={query} invitationToken={token} email={email} onSuccess={login}>
            <UserInvitationPage
              queryFragmentRef={query}
              primaryColor={primaryColor}
              btnTextColor={btnTextColor}
              backgroundColor={backgroundColor}
              logoFragmentRef={logo}
              hasEnabledSSO={hasEnabledSSO}
              email={email}
              token={token}
            />
          </RegistrationFormWrapper>
        )}
      </Route>
    </Switch>
  )
}

export default UserInvitationRootPage

// @ts-nocheck
import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import { BrowserRouter as Router } from 'react-router-dom'
import Providers from './Providers'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { UserInvitationPageAppQueryResponse } from '~relay/UserInvitationPageAppQuery.graphql'
import Loader from '~ui/FeedbacksIndicators/Loader'
import UserInvitationRoot from '~/components/User/Invitation/UserInvitationRoot'

export type UserInvitationPageAppProps = {
  readonly email: string
  readonly token: string
  readonly baseUrl: string
  readonly loginFacebook: boolean
  readonly loginFranceConnect: boolean
  readonly loginSaml: boolean
  readonly ssoList: any
  readonly hasEnabledSSO: boolean
  readonly isRegistrationAllowed: boolean
}

type Props = UserInvitationPageAppProps

export default (propsComponent: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Providers designSystem>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query UserInvitationPageAppQuery {
            ...UserInvitationRootPage_query
            siteColors {
              ...UserInvitationRootPage_colors
            }
            siteImage(keyname: "image.logo") {
              ...UserInvitationRootPage_logo
            }
          }
        `}
        variables={{}}
        render={({
          error,
          props,
        }: ReactRelayReadyState & {
          props: UserInvitationPageAppQueryResponse | null | undefined
        }) => {
          if (error) return graphqlError
          const baseRoute = propsComponent.baseUrl.split('?')[0]

          if (props && props.siteImage && props.siteColors) {
            return (
              <Router basename={baseRoute}>
                <UserInvitationRoot
                  queryFragmentRef={props}
                  logoFragmentRef={props.siteImage}
                  colorsFragmentRef={props.siteColors}
                  email={propsComponent.email}
                  token={propsComponent.token}
                  baseUrl={propsComponent.baseUrl}
                  loginFacebook={propsComponent.loginFacebook}
                  loginFranceConnect={propsComponent.loginFranceConnect}
                  ssoList={propsComponent.ssoList}
                  hasEnabledSSO={propsComponent.hasEnabledSSO}
                  isRegistrationAllowed={propsComponent.isRegistrationAllowed}
                />
              </Router>
            )
          }

          return <Loader />
        }}
      />
    </Providers>
  )
}

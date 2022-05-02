// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertBoxApp from '~/startup/AlertBoxApp';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { UserInvitationPageAppQueryResponse } from '~relay/UserInvitationPageAppQuery.graphql';
import Loader from '~ui/FeedbacksIndicators/Loader';
import UserInvitationRoot from '~/components/User/Invitation/UserInvitationRoot';

export type UserInvitationPageAppProps = {|
  +email: string,
  +token: string,
  +baseUrl: string,
  +loginFacebook: boolean,
  +loginFranceConnect: boolean,
  +loginParis: boolean,
  +loginSaml: boolean,
  +ssoList: any,
  +hasEnabledSSO: boolean,
|};

type Props = UserInvitationPageAppProps;

export default (propsComponent: Props) => (
  <AlertBoxApp>
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
      }: {
        ...ReactRelayReadyState,
        props: ?UserInvitationPageAppQueryResponse,
      }) => {
        if (error) return graphqlError;

        const baseRoute = propsComponent.baseUrl.split('?')[0];

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
                loginParis={propsComponent.loginParis}
                loginFranceConnect={propsComponent.loginFranceConnect}
                ssoList={propsComponent.ssoList}
                hasEnabledSSO={propsComponent.hasEnabledSSO}
              />
            </Router>
          );
        }

        return <Loader />;
      }}
    />
  </AlertBoxApp>
);

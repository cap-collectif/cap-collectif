// @flow
import React from 'react';
import { graphql, loadQuery, RelayEnvironmentProvider } from 'relay-hooks';
import AlertBoxApp from '~/startup/AlertBoxApp';
import UserInvitationPage from '~/components/User/Invitation/UserInvitationPage';
import environment from '~/createRelayEnvironment';

export type UserInvitationPageAppProps = {|
  +email: string,
  +logo: string,
  +token: string,
|};

type Props = UserInvitationPageAppProps;

const query = graphql`
  query UserInvitationPageAppQuery {
    ...RegistrationForm_query
  }
`;

const prefetch = loadQuery();
prefetch.next(environment, query, {}, { fetchPolicy: 'store-or-network' });

export default (props: Props) => (
  <AlertBoxApp>
    <RelayEnvironmentProvider environment={environment}>
      <UserInvitationPage prefetch={prefetch} {...props} />
    </RelayEnvironmentProvider>
  </AlertBoxApp>
);

// @flow
import React from 'react';
import { graphql, loadQuery, RelayEnvironmentProvider } from 'relay-hooks';
import UserInviteAdminPage from '~/components/Admin/UserInvite/UserInviteAdminPage';
import AlertBoxApp from '~/startup/AlertBoxApp';
import environment from '~/createRelayEnvironment';
import { CONNECTION_NODES_PER_PAGE } from '~/components/Admin/UserInvite/UserInviteList.relay';

const query = graphql`
  query UserInviteAdminPageAppQuery($first: Int!, $cursor: String) {
    ...UserInviteList_query @arguments(first: $first, cursor: $cursor)
    ...UserInviteModalStepChooseRole_query
  }
`;

const prefetch = loadQuery();
prefetch.next(
  environment,
  query,
  {
    first: CONNECTION_NODES_PER_PAGE,
  },
  { fetchPolicy: 'store-or-network' },
);

export default () => (
  <AlertBoxApp>
    <RelayEnvironmentProvider environment={environment}>
      <UserInviteAdminPage prefetch={prefetch} />
    </RelayEnvironmentProvider>
  </AlertBoxApp>
);

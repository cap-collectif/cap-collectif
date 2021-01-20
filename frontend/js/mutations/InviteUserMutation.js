// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import commitMutation from './commitMutation';
import environnement from '~/createRelayEnvironment';
import type {
  InviteUserMutationResponse as Response,
  InviteUserMutationVariables,
} from '~relay/InviteUserMutation.graphql';
import { CONNECTION_NODES_PER_PAGE } from '~/components/Admin/UserInvite/UserInviteList.relay';

export const INVITE_USERS_MAX_RESULTS = 100;

const mutation = graphql`
  mutation InviteUserMutation($input: InviteUsersInput!) {
    inviteUsers(input: $input) {
      newInvitations {
        cursor
        node {
          ...UserInviteListRow_invitation
        }
      }
      updatedInvitations {
        cursor
        node {
          ...UserInviteListRow_invitation
        }
      }
    }
  }
`;

const commit = (variables: InviteUserMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
    updater: store => {
      const root = store.get('client:root');
      const invitations = ConnectionHandler.getConnection(root, 'UserInviteList_userInvitations');
      if (!invitations) return;
      const newInvitations = store.getRootField('inviteUsers').getLinkedRecords('newInvitations');
      newInvitations.forEach(invitation => {
        ConnectionHandler.insertEdgeAfter(invitations, invitation);
      });
      if (newInvitations.length > CONNECTION_NODES_PER_PAGE) {
        const endCursor = window.btoa(`arrayconnection:${INVITE_USERS_MAX_RESULTS - 1}`);
        const pageInfo = invitations.getLinkedRecord('pageInfo');
        if (!pageInfo) return;
        pageInfo.setValue(true, 'hasNextPage');
        pageInfo.setValue(endCursor, 'endCursor');
      }
    },
  });

export default { commit };

// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UpdateFollowProposalMutationVariables,
  UpdateFollowProposalMutationResponse as Response,
} from './__generated__/FollowProposalMutation.graphql';

const mutation = graphql`
  mutation UpdateFollowProposalMutation($input: UpdateFollowProposalInput!) {
    UpdateFollowProposal(input: $input) {
      follower {
        id
      }
      proposal {
        id
        ...ProposalFollowButton_proposal
        followerConnection {
          totalCount
        }
      }
      followerEdge {
        node {
          id
          show_url
          displayName
          username
          media {
            url
          }
        }
        cursor
      }
    }
  }
`;

// we can add totalCount+1 https://facebook.github.io/relay/docs/en/mutations.html#using-updater-and-optimisticupdater
const commit = (variables: UpdateFollowProposalMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_ADD',
        parentID: variables.input.proposalId,
        connectionInfo: [
          {
            key: 'ProposalPageFollowers_followerConnection',
            rangeBehavior: 'append',
          },
        ],
        edgeName: 'followerEdge',
      },
    ],
    // updater: (store) => {
    //     // Get the payload returned from the server
    //     const payload = store.getRootField('followProposal');
    //     const proposal = payload.getLinkedRecord('proposal');
    //     console.log(proposal);
    //
    //     const proposalProxy = store.get(variables.input.proposalId);
    //     console.info(proposalProxy);
    //
    //     const conn = ConnectionHandler.getConnection(
    //         proposalProxy,
    //         'ProposalPageFollowers_followerConnection', // This is the connection identifier, defined here: https://github.com/relayjs/relay-examples/blob/master/todo/js/components/TodoList.js#L68
    //     );
    //     console.log(variables);
    //     const follower = payload.getLinkedRecord('follower');
    //     // const followerProxy = store.get(follower.id);
    //     // Insert the new todo into the Todo List connection
    //     const newEdge = ConnectionHandler.createEdge(store, conn, follower, 'User');
    //
    //     // Add it to the user's todo list
    //     ConnectionHandler.insertEdgeAfter(conn, newEdge);
    // },
  });

export default { commit };

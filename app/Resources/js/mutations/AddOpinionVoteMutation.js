// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddOpinionVoteMutationVariables,
  AddOpinionVoteMutationResponse,
} from './__generated__/AddOpinionVoteMutation.graphql';

const mutation = graphql`
  mutation AddOpinionVoteMutation($input: AddOpinionVoteInput!) {
    addOpinionVote(input: $input) {
      previousVoteId
      voteEdge {
        cursor
        node {
          id
          ...OpinionUserVote_vote
          related {
            id
            ... on Opinion {
              viewerVote {
                id
                value
              }
              votes(first: 0) {
                totalCount
              }
              votesOk: votes(first: 0, value: YES) {
                totalCount
              }
              votesNok: votes(first: 0, value: NO) {
                totalCount
              }
              votesMitige: votes(first: 0, value: MITIGE) {
                totalCount
              }
            }
            ... on Version {
              viewerVote {
                id
                value
              }
              votes(first: 0) {
                totalCount
              }
              votesOk: votes(first: 0, value: YES) {
                totalCount
              }
              votesNok: votes(first: 0, value: NO) {
                totalCount
              }
              votesMitige: votes(first: 0, value: MITIGE) {
                totalCount
              }
            }
          }
        }
      }
      viewer {
        id
      }
    }
  }
`;

const commit = (
  variables: AddOpinionVoteMutationVariables,
): Promise<AddOpinionVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      // If previous vote in preview, we remove it
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'previousVoteId',
      },
      // Add the new vote
      {
        type: 'RANGE_ADD',
        parentID: variables.input.opinionId,
        connectionInfo: [
          {
            key: 'OpinionVotesBar_previewVotes',
            rangeBehavior: 'prepend',
            filters: {},
          },
        ],
        edgeName: 'voteEdge',
      },
    ],
    // updater: store => {
    //   const payload = store.getRootField('addArgument');
    //   if (!payload.getLinkedRecord('argumentEdge')) {
    //     // Mutation failed
    //     return;
    //   }

    //   // We update the "FOR" or "AGAINST" row arguments totalCount
    //   const argumentableProxy = store.get(variables.input.argumentableId);
    //   if (!argumentableProxy) return;
    //   const connection = ConnectionHandler.getConnection(
    //     argumentableProxy,
    //     'ArgumentList_allArguments',
    //     {
    //       type: variables.input.type,
    //     },
    //   );
    //   connection.setValue(connection.getValue('totalCount') + 1, 'totalCount');

    //   const allArgumentsProxy = argumentableProxy.getLinkedRecord('arguments', { first: 0 });
    //   if (!allArgumentsProxy) return;
    //   const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10);
    //   allArgumentsProxy.setValue(previousValue + 1, 'totalCount');
    // },
  });

export default { commit };

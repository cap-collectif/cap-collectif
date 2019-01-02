// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveOpinionVoteMutationVariables,
  RemoveOpinionVoteMutationResponse,
} from './__generated__/RemoveOpinionVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveOpinionVoteMutation($input: RemoveOpinionVoteInput!) {
    removeOpinionVote(input: $input) {
      deletedVoteId
      contribution {
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
      viewer {
        id
      }
    }
  }
`;

const commit = (
  variables: RemoveOpinionVoteMutationVariables,
): Promise<RemoveOpinionVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_DELETE',
        parentID: variables.input.opinionId,
        connectionKeys: [
          {
            key: 'OpinionVotesBar_previewVotes',
          },
        ],
        pathToConnection: ['opinion', 'previewVotes'],
        deletedIDFieldName: 'previousVoteId',
      },
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'deletedVoteId',
      },
    ],
  });

export default { commit };

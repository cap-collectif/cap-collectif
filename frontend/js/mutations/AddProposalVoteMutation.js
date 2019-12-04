// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddProposalVoteMutationVariables,
  AddProposalVoteMutationResponse,
} from '~relay/AddProposalVoteMutation.graphql';

const mutation = graphql`
  mutation AddProposalVoteMutation($input: AddProposalVoteInput!, $stepId: ID!) {
    addProposalVote(input: $input) {
      voteEdge {
        cursor
        node {
          id
          __typename
          author {
            id
            ...UserBox_user
          }
          step {
            id
            viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
              ...ProposalsUserVotesTable_votes
              totalCount
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
      viewer {
        id
        proposalVotes(stepId: $stepId) {
          totalCount
          creditsLeft
          creditsSpent
        }
      }
    }
  }
`;

const commit = (
  variables: AddProposalVoteMutationVariables,
): Promise<AddProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      // Add the new vote
      {
        type: 'RANGE_ADD',
        parentID: variables.input.proposalId,
        connectionInfo: [
          {
            key: 'ProposalVotes_votes',
            rangeBehavior: 'prepend',
            filters: {
              stepId: variables.input.stepId,
            },
          },
        ],
        edgeName: 'voteEdge',
      },
    ],
    updater: (store: ReactRelayRecordSourceSelectorProxy) => {
      const payload = store.getRootField('addProposalVote');

      if (!payload || !payload.getLinkedRecord('voteEdge')) {
        return;
      }

      const proposalProxy = store.get(variables.input.proposalId);

      if (!proposalProxy) return;

      proposalProxy.setValue(true, 'viewerHasVote', { step: variables.input.stepId });

      const proposalVotesProxy =
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
          stepId: variables.input.stepId,
        }) || proposalProxy.getLinkedRecord('votes', { first: 0 });

      if (!proposalVotesProxy) return;
      const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10);

      proposalVotesProxy.setValue(previousValue + 1, 'totalCount');

      const connectionConfig = {
        stepId: variables.input.stepId,
      };

      const connection = ConnectionHandler.getConnection(
        proposalProxy,
        'ProposalVotes_votes',
        connectionConfig,
      );

      if (!connection) return;
      const previousValueConnection = parseInt(connection.getValue('totalCount'), 10);
      connection.setValue(previousValueConnection + 1, 'totalCount');
    },
  });

export default { commit };

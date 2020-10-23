// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalVotesMutationResponse,
  UpdateProposalVotesMutationVariables,
} from '~relay/UpdateProposalVotesMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalVotesMutation(
    $input: UpdateProposalVotesInput!
    $stepId: ID!
    $isAuthenticated: Boolean!
  ) {
    updateProposalVotes(input: $input) {
      step {
        id
        votesMin
        votesLimit
        ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated)
        ...ProposalsUserVotesStep_step @arguments(isAuthenticated: $isAuthenticated)
        ...ProposalVoteButtonWrapperFragment_step @arguments(isAuthenticated: $isAuthenticated)
        viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
          ...ProposalsUserVotesTable_votes
          totalCount
          edges {
            node {
              id
              ranking
              anonymous
              proposal {
                id
                ...ProposalVoteButton_proposal @arguments(stepId: $stepId)
                votes(stepId: $stepId, first: 0) @include(if: $isAuthenticated) {
                  totalPointsCount
                }
              }
            }
          }
        }
      }
    }
  }
`;

const commit = (
  variables: UpdateProposalVotesMutationVariables,
  proposalJustVoted: ?{ id: ?string, position: number, isVoteRanking: boolean },
): Promise<UpdateProposalVotesMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('updateProposalVotes');
      if (!payload || !payload.getLinkedRecord('step')) return;
      if (proposalJustVoted && proposalJustVoted.isVoteRanking) {
        const stepProxy = store.get(variables.input.step);
        if (!stepProxy) return;
        const viewerVotes = stepProxy.getLinkedRecord('viewerVotes', {
          orderBy: { field: 'POSITION', direction: 'ASC' },
        });

        if (!viewerVotes) {
          // eslint-disable-next-line no-console
          console.info('no viewer votes found');
          return;
        }
        const totalCount = parseInt(viewerVotes.getValue('totalCount'), 10);
        let votesMin = parseInt(stepProxy.getValue('votesMin'), 10);
        if (!votesMin || Number.isNaN(votesMin)) votesMin = 1;
        // if votes min is nto targeted we dont account point
        if (votesMin && votesMin > 1 && totalCount < votesMin && !proposalJustVoted.id) {
          // eslint-disable-next-line no-console
          console.info('votesMin not targeted, we dont count points');
          return;
        }
        const wereVoteAccounted = totalCount + 1 >= votesMin;
        if (!wereVoteAccounted) {
          // eslint-disable-next-line no-console
          console.info('Votes were not accounted');
          return;
        }

        // we decrease point counter
        if (proposalJustVoted.id && typeof proposalJustVoted.id === 'string') {
          const votesArgs = {
            first: 0,
            stepId: variables.input.step,
          };
          const votesLimit = parseInt(stepProxy.getValue('votesLimit'), 10);
          const availablePoints = Array.from({ length: votesLimit }, (v, l) => votesLimit - l);
          // $FlowFixMe value is tested at line 88
          const removedProposalVote = store.get(proposalJustVoted.id);
          const proposalStore = removedProposalVote?.getLinkedRecord('votes', votesArgs);
          if (!proposalStore) return;
          const previousUserPointValue = availablePoints[proposalJustVoted.position];
          const previousValue = parseInt(proposalStore.getValue('totalPointsCount'), 10);
          proposalStore.setValue(previousValue - previousUserPointValue, 'totalPointsCount');
        }
      }
    },
  });

export default { commit };

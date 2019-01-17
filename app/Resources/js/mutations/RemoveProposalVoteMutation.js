// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveProposalVoteMutationVariables,
  RemoveProposalVoteMutationResponse,
} from './__generated__/RemoveProposalVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveProposalVoteMutation(
    $input: RemoveProposalVoteInput!
    $stepId: ID!
    $isAuthenticated: Boolean!
  ) {
    removeProposalVote(input: $input) {
      proposal {
        id
        ...ProposalVotes_proposal @arguments(stepId: $stepId)
        ...ProposalVoteButtonWrapperFragment_proposal @arguments(stepId: $stepId)
        ...ProposalPreviewFooter_proposal @arguments(stepId: $stepId)
        allVotes: votes(first: 0) {
          totalCount
        }
      }
      step {
        id
        ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated)
        viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
          totalCount
          ...ProposalsUserVotesTable_votes
        }
      }
      viewer {
        ...ProposalVoteButtonWrapperFragment_viewer @arguments(stepId: $stepId)
        ...ProposalVoteBasketWidget_viewer @arguments(stepId: $stepId)
      }
    }
  }
`;

const commit = (
  variables: RemoveProposalVoteMutationVariables,
): Promise<RemoveProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

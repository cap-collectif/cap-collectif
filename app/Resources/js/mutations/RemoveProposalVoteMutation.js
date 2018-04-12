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
    $step: ID!
    $withVotes: Boolean!
  ) {
    removeProposalVote(input: $input) {
      proposal {
        id
        ...ProposalVotes_proposal @arguments(step: $step)
        ...ProposalVoteButtonWrapperFragment_proposal @arguments(step: $step)
      }
      viewer {
        ...ProposalVoteButtonWrapperFragment_viewer @arguments(step: $step)
        ...ProposalVoteBasketWidget_viewer @arguments(step: $step, withVotes: $withVotes)
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

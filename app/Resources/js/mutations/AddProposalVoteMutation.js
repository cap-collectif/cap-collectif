// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddProposalVoteMutationVariables,
  AddProposalVoteMutationResponse,
} from './__generated__/AddProposalVoteMutation.graphql';

const mutation = graphql`
  mutation AddProposalVoteMutation(
    $input: AddProposalVoteInput!
    $step: ID!
    $withVotes: Boolean!
  ) {
    addProposalVote(input: $input) {
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
  variables: AddProposalVoteMutationVariables,
): Promise<AddProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

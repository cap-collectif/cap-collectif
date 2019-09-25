// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalVotesMutationResponse,
  UpdateProposalVotesMutationVariables,
} from '~relay/UpdateProposalVotesMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalVotesMutation(
    $input: UpdateProposalVotesInput!
    $isAuthenticated: Boolean!
  ) {
    updateProposalVotes(input: $input) {
      step {
        id
        ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated)
        ...ProposalsUserVotesStep_step @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  }
`;

const commit = (
  variables: UpdateProposalVotesMutationVariables,
): Promise<UpdateProposalVotesMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

// @flow
import { graphql } from 'react-relay';
import type {
  UpdateProposalStepPaperVoteCounterMutationResponse,
  UpdateProposalStepPaperVoteCounterMutationVariables,
} from '~relay/UpdateProposalStepPaperVoteCounterMutation.graphql';
import commitMutation from '~/mutations/commitMutation';
import environment from '~/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateProposalStepPaperVoteCounterMutation(
    $input: UpdateProposalStepPaperVoteCounterInput!
  ) {
    updateProposalStepPaperVoteCounter(input: $input) {
      proposal {
        id
        paperVotes {
          step {
            id
          }
          totalCount
          totalPointsCount
        }
      }
      errorCode
    }
  }
`;

const commit = (
  variables: UpdateProposalStepPaperVoteCounterMutationVariables,
): Promise<UpdateProposalStepPaperVoteCounterMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

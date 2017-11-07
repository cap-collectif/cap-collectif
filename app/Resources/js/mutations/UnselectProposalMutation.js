// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UnselectProposalMutationVariables,
  UnselectProposalMutationResponse,
} from './__generated__/UnselectProposalMutation.graphql';

const mutation = graphql`
  mutation UnselectProposalMutation($input: UnselectProposalInput!) {
    unselectProposal(input: $input) {
      proposal {
        id
        selections {
          step {
            id
          }
        }
      }
    }
  }
`;

const commit = (
  variables: UnselectProposalMutationVariables,
): Promise<UnselectProposalMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

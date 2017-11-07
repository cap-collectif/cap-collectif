// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SelectProposalMutationVariables,
  SelectProposalMutationResponse,
} from './__generated__/SelectProposalMutation.graphql';

const mutation = graphql`
  mutation SelectProposalMutation($input: SelectProposalInput!) {
    selectProposal(input: $input) {
      proposal {
        id
      }
    }
  }
`;

const commit = (
  variables: SelectProposalMutationVariables,
): Promise<SelectProposalMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

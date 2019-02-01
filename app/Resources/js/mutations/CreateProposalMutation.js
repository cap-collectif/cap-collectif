// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProposalMutationVariables,
  CreateProposalMutationResponse,
} from './__generated__/CreateProposalMutation.graphql';

const mutation = graphql`
  mutation CreateProposalMutation($input: CreateProposalInput!) {
    createProposal(input: $input) {
      proposal {
        id
        url
        publicationStatus
      }
      userErrors {
        message
      }
    }
  }
`;

const commit = (
  variables: CreateProposalMutationVariables,
): Promise<CreateProposalMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

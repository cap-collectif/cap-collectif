// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProposalMutationVariables,
  CreateProposalMutationResponse as Response,
} from './__generated__/CreateProposalMutation.graphql';

export type CreateProposalMutationResponse = Response;

const mutation = graphql`
  mutation CreateProposalMutation($input: CreateProposalInput!) {
    createProposal(input: $input) {
      proposal {
        id
        show_url
        publicationStatus
      }
    }
  }
`;

const commit = (variables: CreateProposalMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

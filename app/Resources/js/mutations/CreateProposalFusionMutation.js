// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProposalFusionMutationVariables,
  CreateProposalFusionMutationResponse as Response,
} from './__generated__/CreateProposalFusionMutation.graphql';

export type CreateProposalFusionMutationResponse = Response;

const mutation = graphql`
  mutation CreateProposalFusionMutation($input: CreateProposalFusionInput!) {
    createProposalFusion(input: $input) {
      proposal {
        id
        adminUrl
      }
    }
  }
`;

const commit = (variables: CreateProposalFusionMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

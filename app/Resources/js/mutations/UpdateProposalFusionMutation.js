// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalFusionMutationResponse,
  UpdateProposalFusionMutationVariables,
} from './__generated__/UpdateProposalFusionMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalFusionMutation($input: UpdateProposalFusionInput!) {
    updateProposalFusion(input: $input) {
      proposal {
        id
        mergedFrom {
          id
          title
          adminUrl
        }
      }
    }
  }
`;

const commit = (
  variables: UpdateProposalFusionMutationVariables,
): Promise<UpdateProposalFusionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

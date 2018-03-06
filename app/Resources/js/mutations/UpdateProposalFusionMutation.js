// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalFusionMutationResponse,
  UpdateProposalFusionMutationVariables,
} from './__generated__/UpdateProposalFusionMutation.graphql';

// We use this mutation from a child or a fusion, that's why we
// are not using the ...Fragment syntax
// maybe we can find something better.
const mutation = graphql`
  mutation UpdateProposalFusionMutation($input: UpdateProposalFusionInput!) {
    updateProposalFusion(input: $input) {
      removedMergedFrom {
        id
        mergedFrom {
          id
          adminUrl
          title
          mergedIn {
            id
            adminUrl
            title
            mergedFrom {
              id
            }
          }
        }
        mergedIn {
          id
          adminUrl
          title
          mergedFrom {
            id
            adminUrl
            title
          }
        }
      }
      proposal {
        id
        mergedFrom {
          id
          adminUrl
          title
          mergedIn {
            id
            adminUrl
            title
            mergedFrom {
              id
            }
          }
        }
        mergedIn {
          id
          adminUrl
          title
          mergedFrom {
            id
            adminUrl
            title
          }
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

// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeProposalAnalysisMutationVariables,
  ChangeProposalAnalysisMutationResponse,
} from '~relay/ChangeProposalAnalysisMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalAnalysisMutation($input: ChangeProposalAnalysisInput!) {
    changeProposalAnalysis(input: $input) {
      errorCode
      analysis {
        proposal {
          id
          analyses {
            id
            state
            analyst {
              id
            }
          }
        }
        id
        comment
        state
        responses {
          ...responsesHelper_response @relay(mask: false)
        }
        analyst {
          id
        }
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalAnalysisMutationVariables,
): Promise<ChangeProposalAnalysisMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

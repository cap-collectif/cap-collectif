// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AnalyseProposalAnalysisMutationVariables,
  AnalyseProposalAnalysisMutationResponse,
} from '~relay/AnalyseProposalAnalysisMutation.graphql';

const mutation = graphql`
  mutation AnalyseProposalAnalysisMutation($input: AnalyseProposalAnalysisInput!) {
    analyseProposalAnalysis(input: $input) {
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
  variables: AnalyseProposalAnalysisMutationVariables,
): Promise<AnalyseProposalAnalysisMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalFormAnalysisConfigurationMutationVariables,
  UpdateProposalFormAnalysisConfigurationMutationResponse,
} from '~relay/UpdateProposalFormAnalysisConfigurationMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalFormAnalysisConfigurationMutation($input: ConfigureAnalysisInput!) {
    configureAnalysis(input: $input) {
      analysisConfiguration {
        __typename
        id
        body
        bodyUsingJoditWysiwyg
        effectiveDate
        costEstimationEnabled
        evaluationForm {
          __typename
          id
          title
        }
        analysisStep {
          id
        }
        moveToSelectionStep {
          id
        }
        selectionStepStatus {
          id
        }
        favourableStatus {
          id
          name
        }
        unfavourableStatuses {
          id
          name
        }
        createdAt
        updatedAt
      }
    }
  }
`;

const commit = (
  variables: UpdateProposalFormAnalysisConfigurationMutationVariables,
): Promise<UpdateProposalFormAnalysisConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

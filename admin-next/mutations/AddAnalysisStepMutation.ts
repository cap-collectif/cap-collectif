import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddAnalysisStepMutation,
    AddAnalysisStepMutationVariables,
    AddAnalysisStepMutationResponse,
} from '@relay/AddAnalysisStepMutation.graphql';

const mutation = graphql`
    mutation AddAnalysisStepMutation($input: AddStepInput!) {
        addAnalysisStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: AddAnalysisStepMutationVariables,
): Promise<AddAnalysisStepMutationResponse> =>
    commitMutation<AddAnalysisStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

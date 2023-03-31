import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    UpdateSelectionStepMutation,
    UpdateSelectionStepMutationVariables,
    UpdateSelectionStepMutationResponse,
} from '@relay/UpdateSelectionStepMutation.graphql';

const mutation = graphql`
    mutation UpdateSelectionStepMutation($input: UpdateSelectionStepInput!) {
        updateSelectionStep(input: $input) {
            selectionStep {
                id
                label
            }
        }
    }
`;

const commit = (
    variables: UpdateSelectionStepMutationVariables,
): Promise<UpdateSelectionStepMutationResponse> =>
    commitMutation<UpdateSelectionStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

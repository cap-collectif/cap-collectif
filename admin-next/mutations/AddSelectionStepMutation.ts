import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddSelectionStepMutation,
    AddSelectionStepMutationVariables,
    AddSelectionStepMutationResponse,
} from '@relay/AddSelectionStepMutation.graphql';

const mutation = graphql`
    mutation AddSelectionStepMutation($input: AddStepInput!) {
        addSelectionStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: AddSelectionStepMutationVariables,
): Promise<AddSelectionStepMutationResponse> =>
    commitMutation<AddSelectionStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

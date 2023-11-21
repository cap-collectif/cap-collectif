import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddDebateStepMutation,
    AddDebateStepMutationVariables,
    AddDebateStepMutationResponse,
} from '@relay/AddDebateStepMutation.graphql';

const mutation = graphql`
    mutation AddDebateStepMutation($input: AddStepInput!) {
        addDebateStep(input: $input) {
            step {
                adminUrl(operationType: CREATE)
            }
        }
    }
`;

const commit = (
    variables: AddDebateStepMutationVariables,
): Promise<AddDebateStepMutationResponse> =>
    commitMutation<AddDebateStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    UpdateOtherStepMutation,
    UpdateOtherStepMutationVariables,
    UpdateOtherStepMutationResponse,
} from '@relay/UpdateOtherStepMutation.graphql';

const mutation = graphql`
    mutation UpdateOtherStepMutation($input: UpdateOtherStepInput!) {
        updateOtherStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: UpdateOtherStepMutationVariables,
): Promise<UpdateOtherStepMutationResponse> =>
    commitMutation<UpdateOtherStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

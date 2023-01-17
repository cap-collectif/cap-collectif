import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddOtherStepMutation,
    AddOtherStepMutationVariables,
    AddOtherStepMutationResponse,
} from '@relay/AddOtherStepMutation.graphql';

const mutation = graphql`
    mutation AddOtherStepMutation($input: AddStepInput!) {
        addOtherStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: AddOtherStepMutationVariables,
): Promise<AddOtherStepMutationResponse> =>
    commitMutation<AddOtherStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

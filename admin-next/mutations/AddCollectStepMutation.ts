import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddCollectStepMutation,
    AddCollectStepMutationVariables,
    AddCollectStepMutationResponse,
} from '@relay/AddCollectStepMutation.graphql';

const mutation = graphql`
    mutation AddCollectStepMutation($input: AddStepInput!) {
        addCollectStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: AddCollectStepMutationVariables,
): Promise<AddCollectStepMutationResponse> =>
    commitMutation<AddCollectStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

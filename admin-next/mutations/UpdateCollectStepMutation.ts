import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    UpdateCollectStepMutation,
    UpdateCollectStepMutationVariables,
    UpdateCollectStepMutationResponse,
} from '@relay/UpdateCollectStepMutation.graphql';

const mutation = graphql`
    mutation UpdateCollectStepMutation($input: UpdateCollectStepInput!) {
        updateCollectStep(input: $input) {
            collectStep {
                id
                label
            }
        }
    }
`;

const commit = (
    variables: UpdateCollectStepMutationVariables,
): Promise<UpdateCollectStepMutationResponse> =>
    commitMutation<UpdateCollectStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

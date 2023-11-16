import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddResultStepMutation,
    AddResultStepMutationVariables,
    AddResultStepMutationResponse,
} from '@relay/AddResultStepMutation.graphql';

const mutation = graphql`
    mutation AddResultStepMutation($input: AddStepInput!) {
        addResultStep(input: $input) {
            step {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: AddResultStepMutationVariables,
): Promise<AddResultStepMutationResponse> =>
    commitMutation<AddResultStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

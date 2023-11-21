import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddConsultationStepMutation,
    AddConsultationStepMutationVariables,
    AddConsultationStepMutationResponse,
} from '@relay/AddConsultationStepMutation.graphql';

const mutation = graphql`
    mutation AddConsultationStepMutation($input: AddStepInput!) {
        addConsultationStep(input: $input) {
            step {
                adminUrl(operationType: CREATE)
            }
        }
    }
`;

const commit = (
    variables: AddConsultationStepMutationVariables,
): Promise<AddConsultationStepMutationResponse> =>
    commitMutation<AddConsultationStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

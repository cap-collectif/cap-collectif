import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    UpdateConsultationStepMutation,
    UpdateConsultationStepMutationVariables,
    UpdateConsultationStepMutationResponse,
} from '@relay/UpdateConsultationStepMutation.graphql';

const mutation = graphql`
    mutation UpdateConsultationStepMutation($input: UpdateConsultationStepInput!) {
        updateConsultationStep(input: $input) {
            consultationStep {
                adminUrl
            }
        }
    }
`;

const commit = (
    variables: UpdateConsultationStepMutationVariables,
): Promise<UpdateConsultationStepMutationResponse> =>
    commitMutation<UpdateConsultationStepMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

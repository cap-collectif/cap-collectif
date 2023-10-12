import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    CreateOrUpdateConsultationMutation,
    CreateOrUpdateConsultationMutationVariables,
    CreateOrUpdateConsultationMutationResponse,
} from '@relay/CreateOrUpdateConsultationMutation.graphql';

const mutation = graphql`
    mutation CreateOrUpdateConsultationMutation($input: CreateOrUpdateConsultationInput!) {
        createOrUpdateConsultation(input: $input) {
            consultations {
                id
                title
                description
                sections {
                    title
                    position
                }
            }
        }
    }
`;

const commit = (
    variables: CreateOrUpdateConsultationMutationVariables,
): Promise<CreateOrUpdateConsultationMutationResponse> =>
    commitMutation<CreateOrUpdateConsultationMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

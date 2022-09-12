import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddOrganizationMutation,
    AddOrganizationMutationVariables,
    AddOrganizationMutationResponse,
} from '@relay/AddOrganizationMutation.graphql';

const mutation = graphql`
    mutation AddOrganizationMutation($input: AddOrganizationInput!) {
        addOrganization(input: $input) {
            organization {
                id
            }
        }
    }
`;

const commit = (
    variables: AddOrganizationMutationVariables,
): Promise<AddOrganizationMutationResponse> =>
    commitMutation<AddOrganizationMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

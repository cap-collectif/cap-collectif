import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import { environment } from 'utils/relay-environement';
import {
    KickFromOrganizationMutation,
    KickFromOrganizationMutationResponse,
    KickFromOrganizationMutationVariables,
} from '@relay/KickFromOrganizationMutation.graphql';

const mutation = graphql`
    mutation KickFromOrganizationMutation($input: KickFromOrganizationInput!, $connections: [ID!]!)
    @raw_response_type {
        kickFromOrganization(input: $input) {
            deletedMemberShipId @deleteEdge(connections: $connections)
            errorCode
        }
    }
`;

const commit = (
    variables: KickFromOrganizationMutationVariables,
): Promise<KickFromOrganizationMutationResponse> =>
    commitMutation<KickFromOrganizationMutation>(environment, {
        mutation,
        variables,
        optimisticUpdater: store => {
            store.delete(variables.input.organizationId);
        },
    });

export default { commit };

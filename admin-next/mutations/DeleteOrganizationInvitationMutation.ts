import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import {
    DeleteOrganizationInvitationMutation,
    DeleteOrganizationInvitationMutationResponse,
    DeleteOrganizationInvitationMutationVariables,
} from '@relay/DeleteOrganizationInvitationMutation.graphql';

const mutation = graphql`
    mutation DeleteOrganizationInvitationMutation(
        $input: DeleteOrganizationInvitationInput!
        $connections: [ID!]!
    ) @raw_response_type {
        deleteOrganizationInvitation(input: $input) {
            invitationId @deleteEdge(connections: $connections)
            errorCode
        }
    }
`;

const commit = (
    variables: DeleteOrganizationInvitationMutationVariables,
): Promise<DeleteOrganizationInvitationMutationResponse> =>
    commitMutation<DeleteOrganizationInvitationMutation>(environment, {
        mutation,
        variables,
        updater: (store: any) => {},
    });

export default { commit };

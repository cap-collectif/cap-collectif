import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    InviteOrganizationMemberMutation,
    InviteOrganizationMemberMutationResponse,
    InviteOrganizationMemberMutationVariables,
} from '@relay/InviteOrganizationMemberMutation.graphql';

const mutation = graphql`
    mutation InviteOrganizationMemberMutation(
        $input: InviteOrganizationMemberInput!
        $connections: [ID!]!
    ) {
        inviteOrganizationMember(input: $input) {
            invitation
                @appendNode(
                    connections: $connections
                    edgeTypeName: "PendingOrganizationInvitationEdge"
                ) {
                email
                user {
                    email
                    username
                }
                role
            }
            errorCode
        }
    }
`;

const commit = (
    variables: InviteOrganizationMemberMutationVariables,
): Promise<InviteOrganizationMemberMutationResponse> =>
    commitMutation<InviteOrganizationMemberMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };

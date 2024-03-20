import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  InviteOrganizationMemberMutation,
  InviteOrganizationMemberMutation$data,
  InviteOrganizationMemberMutation$variables,
} from '@relay/InviteOrganizationMemberMutation.graphql'

const mutation = graphql`
  mutation InviteOrganizationMemberMutation($input: InviteOrganizationMemberInput!, $connections: [ID!]!) {
    inviteOrganizationMember(input: $input) {
      invitation @appendNode(connections: $connections, edgeTypeName: "PendingOrganizationInvitationEdge") {
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
` as GraphQLTaggedNode

const commit = (
  variables: InviteOrganizationMemberMutation$variables,
): Promise<InviteOrganizationMemberMutation$data> =>
  commitMutation<InviteOrganizationMemberMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

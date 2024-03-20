import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import {
  DeleteOrganizationInvitationMutation,
  DeleteOrganizationInvitationMutation$data,
  DeleteOrganizationInvitationMutation$variables,
} from '@relay/DeleteOrganizationInvitationMutation.graphql'

const mutation = graphql`
  mutation DeleteOrganizationInvitationMutation($input: DeleteOrganizationInvitationInput!, $connections: [ID!]!)
  @raw_response_type {
    deleteOrganizationInvitation(input: $input) {
      invitationId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: DeleteOrganizationInvitationMutation$variables,
): Promise<DeleteOrganizationInvitationMutation$data> =>
  commitMutation<DeleteOrganizationInvitationMutation>(environment, {
    mutation,
    variables,
    updater: () => {},
  })

export default { commit }

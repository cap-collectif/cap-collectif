// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
import commitMutation from './commitMutation'
import environnement from '~/createRelayEnvironment'
import type {
  CancelUserInvitationsMutationResponse as Response,
  CancelUserInvitationsMutationVariables,
} from '~relay/CancelUserInvitationsMutation.graphql'

const mutation = graphql`
  mutation CancelUserInvitationsMutation($input: CancelUserInvitationsInput!) {
    cancelUserInvitations(input: $input) {
      cancelledInvitationsIds
    }
  }
`

const commit = (variables: CancelUserInvitationsMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
    updater: store => {
      const root = store.get('client:root')
      const invitations = ConnectionHandler.getConnection(root, 'UserInviteList_userInvitations')
      if (!invitations) return
      const cancelledInvitationsIds = store.getRootField('cancelUserInvitations').getValue('cancelledInvitationsIds')
      cancelledInvitationsIds.forEach(cancelledInvitationId => {
        ConnectionHandler.deleteNode(invitations, cancelledInvitationId)
      })
    },
  })

export default {
  commit,
}

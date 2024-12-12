import { graphql } from 'react-relay'
import { ConnectionHandler, ReaderFragment } from 'relay-runtime'
import { environment } from '@utils/relay-environement'
import commitMutation from './commitMutation'
import {
  CancelUserInvitationsMutation,
  CancelUserInvitationsMutation$data,
} from '@relay/CancelUserInvitationsMutation.graphql'
import { CancelUserInvitationsMutation$variables } from '@relay/CancelUserInvitationsMutation.graphql'

const mutation = graphql`
  mutation CancelUserInvitationsMutation($input: CancelUserInvitationsInput!) {
    cancelUserInvitations(input: $input) {
      cancelledInvitationsIds
    }
  }
` as ReaderFragment

const commit = (variables: CancelUserInvitationsMutation$variables): Promise<CancelUserInvitationsMutation$data> =>
  commitMutation<CancelUserInvitationsMutation>(environment, {
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

export default { commit }

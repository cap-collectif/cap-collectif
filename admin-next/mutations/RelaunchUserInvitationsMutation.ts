import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  RelaunchUserInvitationsMutation,
  RelaunchUserInvitationsMutation$data,
  RelaunchUserInvitationsMutation$variables,
} from '@relay/RelaunchUserInvitationsMutation.graphql'
import { ReaderFragment } from 'relay-runtime'

const mutation = graphql`
  mutation RelaunchUserInvitationsMutation($input: RelaunchUserInvitationsInput!) {
    relaunchUserInvitations(input: $input) {
      relaunchedInvitations {
        cursor
        node {
          id
          email
          status
        }
      }
    }
  }
` as ReaderFragment

const commit = (variables: RelaunchUserInvitationsMutation$variables): Promise<RelaunchUserInvitationsMutation$data> =>
  commitMutation<RelaunchUserInvitationsMutation>(environment, { mutation, variables })

export default {
  commit,
}

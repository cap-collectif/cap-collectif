// @ts-nocheck
import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import environnement from '~/createRelayEnvironment'
import type {
  RelaunchUserInvitationsMutationResponse as Response,
  RelaunchUserInvitationsMutationVariables,
} from '~relay/RelaunchUserInvitationsMutation.graphql'

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
`

const commit = (variables: RelaunchUserInvitationsMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
  })

export default {
  commit,
}

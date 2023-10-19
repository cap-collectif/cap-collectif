// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  ResetPasswordMutationVariables,
  ResetPasswordMutationResponse as Response,
} from '~relay/ResetPasswordMutation.graphql'

export type ResetPasswordMutationResponse = Response
const mutation = graphql`
  mutation ResetPasswordMutation($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      user {
        id
        username
        ...UserAdminPassword_user
      }
      error
    }
  }
`

const commit = (variables: ResetPasswordMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

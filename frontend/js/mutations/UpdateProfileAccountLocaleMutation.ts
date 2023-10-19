// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateProfileAccountLocaleMutationVariables,
  UpdateProfileAccountLocaleMutationResponse as Response,
} from '~relay/UpdateProfileAccountLocaleMutation.graphql'

export type UpdateProfileAccountLocaleMutationResponse = Response
const mutation = graphql`
  mutation UpdateProfileAccountLocaleMutation($input: UpdateProfileAccountLocaleInput!) {
    updateProfileAccountLocale(input: $input) {
      viewer {
        locale
        ...AccountForm_viewer
      }
      error
    }
  }
`

const commit = (variables: UpdateProfileAccountLocaleMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

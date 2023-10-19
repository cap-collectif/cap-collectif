// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateUsernameMutationVariables,
  UpdateUsernameMutationResponse,
} from '~relay/UpdateUsernameMutation.graphql'

const mutation = graphql`
  mutation UpdateUsernameMutation($input: UpdateUsernameInput!) {
    updateUsername(input: $input) {
      viewer {
        id
        username
      }
    }
  }
`

const commit = (variables: UpdateUsernameMutationVariables): Promise<UpdateUsernameMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

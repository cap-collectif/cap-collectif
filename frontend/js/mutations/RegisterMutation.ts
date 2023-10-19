// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type { RegisterMutationVariables, RegisterMutationResponse } from '~relay/RegisterMutation.graphql'

const mutation = graphql`
  mutation RegisterMutation($input: RegisterInput!) {
    register(input: $input) {
      user {
        displayName
      }
      errorsCode
    }
  }
`

const commit = (variables: RegisterMutationVariables): Promise<RegisterMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

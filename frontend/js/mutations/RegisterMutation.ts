// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type { RegisterMutationVariables, RegisterMutationResponse } from '~relay/RegisterMutation.graphql'
import type { RegisterMutation } from 'admin-next/__generated__/RegisterMutation.graphql'

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

export const useRegisterMutation = () => {
  const [commit, isLoading] = useMutation<RegisterMutation>(mutation);
  return {
    commit,
    isLoading
  }
}


export default {
  commit,
}

// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '~/createRelayEnvironment'
import commitMutation from './commitMutation'
import type { UpdateLocaleMutationResponse, UpdateLocaleMutationVariables } from '~relay/UpdateLocaleMutation.graphql'

const mutation = graphql`
  mutation UpdateLocaleMutation($input: UpdateLocaleInput!) {
    updateLocale(input: $input) {
      locale
    }
  }
`

const commit = (variables: UpdateLocaleMutationVariables): Promise<UpdateLocaleMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

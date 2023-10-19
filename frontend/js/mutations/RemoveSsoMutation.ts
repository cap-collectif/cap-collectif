// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type { RemoveSsoMutationVariables, RemoveSsoMutationResponse } from '~relay/RemoveSsoMutation.graphql'

const mutation = graphql`
  mutation RemoveSsoMutation($input: RemoveSsoInput!) {
    removeSso(input: $input) {
      viewer {
        id
        ...AccountForm_viewer
        ...PersonalData_viewer
      }
      redirectUrl
    }
  }
`

const commit = (variables: RemoveSsoMutationVariables): Promise<RemoveSsoMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

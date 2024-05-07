// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateVotesVisibilityMutationVariables,
  UpdateVotesVisibilityMutationResponse,
} from '~relay/UpdateVotesVisibilityMutation.graphql'

const mutation = graphql`
  mutation UpdateVotesVisibilityMutation($input: UpdateVotesVisibilityInput!) {
    updateVotesVisibility(input: $input) {
      votes {
        anonymous
      }
    }
  }
`

const commit = (variables: UpdateVotesVisibilityMutationVariables): Promise<UpdateVotesVisibilityMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

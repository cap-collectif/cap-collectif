// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UnsubscribeToEventAsRegisteredMutationVariables,
  UnsubscribeToEventAsRegisteredMutationResponse,
} from '~relay/UnsubscribeToEventAsRegisteredMutation.graphql'

const mutation = graphql`
  mutation UnsubscribeToEventAsRegisteredMutation(
    $input: UnsubscribeToEventAsRegisteredInput!
    $isAuthenticated: Boolean!
  ) {
    unsubscribeToEventAsRegistered(input: $input) {
      event {
        participants {
          totalCount
        }
        isViewerParticipatingAtEvent @include(if: $isAuthenticated)
      }
    }
  }
`

const commit = (
  variables: UnsubscribeToEventAsRegisteredMutationVariables,
): Promise<UnsubscribeToEventAsRegisteredMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

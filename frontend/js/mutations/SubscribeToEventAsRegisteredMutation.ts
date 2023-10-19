// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  SubscribeToEventAsRegisteredMutationVariables,
  SubscribeToEventAsRegisteredMutationResponse,
} from '~relay/SubscribeToEventAsRegisteredMutation.graphql'

const mutation = graphql`
  mutation SubscribeToEventAsRegisteredMutation(
    $input: SubscribeToEventAsRegisteredInput!
    $isAuthenticated: Boolean!
  ) {
    subscribeToEventAsRegistered(input: $input) {
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
  variables: SubscribeToEventAsRegisteredMutationVariables,
): Promise<SubscribeToEventAsRegisteredMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

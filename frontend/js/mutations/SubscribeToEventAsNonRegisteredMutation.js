// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SubscribeToEventAsNonRegisteredMutationVariables,
  SubscribeToEventAsNonRegisteredMutationResponse,
} from '~relay/SubscribeToEventAsNonRegisteredMutation.graphql';

const mutation = graphql`
  mutation SubscribeToEventAsNonRegisteredMutation(
    $input: SubscribeToEventAsNonRegisteredInput!
    $isAuthenticated: Boolean!
  ) {
    subscribeToEventAsNonRegistered(input: $input) {
      event {
        participants {
          totalCount
        }
        ...ModalParticipantList_event
        ...ParticipantList_event @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  }
`;

const commit = (
  variables: SubscribeToEventAsNonRegisteredMutationVariables,
): Promise<SubscribeToEventAsNonRegisteredMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

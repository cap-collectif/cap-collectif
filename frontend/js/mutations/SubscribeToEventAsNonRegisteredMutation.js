// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SubscribeToEventAsNonRegisteredMutationVariables,
  SubscribeToEventAsNonRegisteredMutationResponse,
} from '~relay/SubscribeToEventAsNonRegisteredMutation.graphql';

const mutation = graphql`
  mutation SubscribeToEventAsNonRegisteredMutation($input: SubscribeToEventAsNonRegisteredInput!) {
    subscribeToEventAsNonRegistered(input: $input) {
      event {
        participants {
          totalCount
        }
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

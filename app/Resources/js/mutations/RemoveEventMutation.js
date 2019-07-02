// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveEventMutationVariables,
  RemoveEventMutationResponse,
} from '~relay/RemoveEventMutation.graphql';

const mutation = graphql`
  mutation RemoveEventMutation($input: RemoveEventInput!) {
    removeEvent(input: $input) {
      deletedEventId
    }
  }
`;

const commit = (variables: RemoveEventMutationVariables): Promise<RemoveEventMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

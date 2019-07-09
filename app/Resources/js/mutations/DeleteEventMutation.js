// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteEventMutationVariables,
  DeleteEventMutationResponse,
} from '~relay/DeleteEventMutation.graphql';

const mutation = graphql`
  mutation DeleteEventMutation($input: DeleteEventInput!) {
    deleteEvent(input: $input) {
      deletedEventId
    }
  }
`;

const commit = (variables: DeleteEventMutationVariables): Promise<DeleteEventMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

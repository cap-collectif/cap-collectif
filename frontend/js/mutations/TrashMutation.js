// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type { TrashMutationVariables, TrashMutationResponse } from '~relay/TrashMutation.graphql';

const mutation = graphql`
  mutation TrashMutation($input: TrashInput!) {
    trash(input: $input) {
      errorCode
      trashable {
        trashed
        trashedStatus
        trashedAt
        trashedReason
      }
    }
  }
`;

const commit = (variables: TrashMutationVariables): Promise<TrashMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

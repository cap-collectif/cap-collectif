// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  TrashDebateArgumentMutationVariables,
  TrashDebateArgumentMutationResponse,
} from '~relay/TrashDebateArgumentMutation.graphql';

type Variables = {
  ...TrashDebateArgumentMutationVariables,
  connections: string[],
  debateId: string,
  state?: 'PUBLISHED' | 'WAITING' | 'TRASHED',
  isAdmin?: boolean,
};

const mutation = graphql`
  mutation TrashDebateArgumentMutation($input: TrashInput!, $connections: [ID!]!) {
    trash(input: $input) {
      errorCode
      trashable {
        trashed
        trashedStatus
        trashedAt
        trashedReason
        ... on DebateArgument {
          id @deleteEdge(connections: $connections)
        }
      }
    }
  }
`;

const commit = (variables: Variables): Promise<TrashDebateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const debateProxy = store.get(variables.debateId);
      if (!debateProxy) throw new Error('Expected debate to be in the store');

      if (variables.isAdmin) {
        const debateArgumentsToUpdate = debateProxy.getLinkedRecord('arguments', {
          first: 0,
          isPublished: variables.state === 'PUBLISHED',
          isTrashed: false,
        });
        const debateArgumentsTrashed = debateProxy.getLinkedRecord('arguments', {
          first: 0,
          isPublished: true,
          isTrashed: true,
        });
        if (!debateArgumentsToUpdate || !debateArgumentsTrashed) return;

        const previousValue = parseInt(debateArgumentsToUpdate.getValue('totalCount'), 10);
        const previousValueTrashed = parseInt(debateArgumentsTrashed.getValue('totalCount'), 10);
        debateArgumentsToUpdate.setValue(previousValue - 1, 'totalCount');
        debateArgumentsTrashed.setValue(previousValueTrashed + 1, 'totalCount');
      } else {
        const allArguments = debateProxy.getLinkedRecord('arguments', {
          first: 0,
          isTrashed: false,
        });
        if (!allArguments) return;

        const countAllArguments = parseInt(allArguments.getValue('totalCount'), 10);
        allArguments.setValue(countAllArguments - 1, 'totalCount');
      }
    },
  });

export default { commit };

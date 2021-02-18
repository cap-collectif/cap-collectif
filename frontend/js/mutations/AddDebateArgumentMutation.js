// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateArgumentMutationVariables,
  AddDebateArgumentMutationResponse,
} from '~relay/AddDebateArgumentMutation.graphql';

const mutation = graphql`
  mutation AddDebateArgumentMutation(
    $input: CreateDebateArgumentInput!
    $connections: [ID!]!
    $edgeTypeName: String!
  ) {
    createDebateArgument(input: $input) {
      errorCode
      debateArgument @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        votes(first: 0) {
          totalCount
        }
        author {
          id
          username
        }
        id
        published
        body
        type
        viewerDidAuthor
      }
    }
  }
`;

const commit = (
  variables: AddDebateArgumentMutationVariables,
): Promise<AddDebateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createDebateArgument');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;
      const debateProxy = store.get(variables.input.debate);
      if (!debateProxy) {
        throw new Error('Expected debate to be in the store');
      }

      const allArgumentsProxy = debateProxy.getLinkedRecord('arguments', { first: 0 });
      if (!allArgumentsProxy) return;
      const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10);
      allArgumentsProxy.setValue(previousValue + 1, 'totalCount');
    },
  });

export default { commit };

// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateArgumentMutationVariables,
  AddDebateArgumentMutationResponse,
} from '~relay/AddDebateArgumentMutation.graphql';

type Viewer = {|
  +id: string,
  +username: string,
  +isEmailConfirmed: boolean,
|};

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
        debate {
          url
          id
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
  viewer?: Viewer,
): Promise<AddDebateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: viewer
      ? {
          createDebateArgument: {
            errorCode: null,
            debateArgument: {
              votes: {
                totalCount: 0,
              },
              author: {
                id: viewer.id,
                username: viewer.username,
              },
              id: new Date().toISOString(),
              published: viewer.isEmailConfirmed,
              body: variables.input.body,
              type: variables.input.type,
              viewerDidAuthor: true,
            },
          },
        }
      : null,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createDebateArgument');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;
      const debateProxy = store.get(variables.input.debate);
      if (!debateProxy) throw new Error('Expected debate to be in the store');

      debateProxy.setValue(true, 'viewerHasArgument');
      const allArgumentsProxy = debateProxy.getLinkedRecord('arguments', {
        isPublished: true,
        first: 0,
        isTrashed: false,
      });
      if (!allArgumentsProxy) return;
      const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10);
      allArgumentsProxy.setValue(previousValue + 1, 'totalCount');

      /* CASE ALTERNATE ARGUMENT */
      const debateAlternateArgumentsConnection = ConnectionHandler.getConnection(
        debateProxy,
        'DebateStepPageAlternateArgumentsPagination_alternateArguments',
      );

      if (debateAlternateArgumentsConnection) {
        const alternateArgumentProxy = payload.getLinkedRecord('debateArgument');
        if (!alternateArgumentProxy) throw new Error('Expected debate argument to be in the store');

        const nodeForAndAgainst = store.create(
          `client:newNode:${new Date().toISOString()}`,
          'DebateArgumentAlternate',
        );

        if (variables.input.type === 'FOR') {
          nodeForAndAgainst.setLinkedRecord(alternateArgumentProxy, 'for');
        } else {
          nodeForAndAgainst.setLinkedRecord(alternateArgumentProxy, 'against');
        }

        const edgeAlternateArgument = store.create(
          `client:newEdge:${new Date().toISOString()}`,
          'DebateArgumentAlternateEdge',
        );
        edgeAlternateArgument.setLinkedRecord(nodeForAndAgainst, 'node');
        edgeAlternateArgument.setValue('', 'cursor');

        ConnectionHandler.insertEdgeBefore(
          debateAlternateArgumentsConnection,
          edgeAlternateArgument,
        );
      }
    },
  });

export default { commit };

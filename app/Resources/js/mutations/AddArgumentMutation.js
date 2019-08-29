// @flow
import { graphql, type RecordSourceSelectorProxy } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddArgumentMutationVariables,
  AddArgumentMutationResponse,
} from '~relay/AddArgumentMutation.graphql';

const mutation = graphql`
  mutation AddArgumentMutation($input: AddArgumentInput!) {
    addArgument(input: $input) {
      argumentEdge {
        cursor
        node {
          id
          ...ArgumentItem_argument
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const getConfigs = (variables: AddArgumentMutationVariables, viewerIsConfirmed: boolean) => {
  if (!viewerIsConfirmed) {
    return [
      {
        type: 'RANGE_ADD',
        parentID: variables.input.argumentableId,
        edgeName: 'argumentEdge',
        connectionInfo: [
          {
            key: 'UnpublishedArgumentList_viewerArgumentsUnpublished',
            rangeBehavior: 'prepend',
            filters: {
              type: variables.input.type,
            },
          },
        ],
      },
    ];
  }
  return [
    {
      type: 'RANGE_ADD',
      parentID: variables.input.argumentableId,
      connectionInfo: [
        // We add the new argument in the last arguments corresponding row
        {
          key: 'ArgumentListViewPaginated_arguments',
          rangeBehavior: 'prepend',
          filters: {
            type: variables.input.type,
            orderBy: { direction: 'DESC', field: 'PUBLISHED_AT' },
          },
        },
        // We add the new argument in the old arguments corresponding row
        {
          key: 'ArgumentListViewPaginated_arguments',
          rangeBehavior: 'append',
          filters: {
            type: variables.input.type,
            orderBy: { direction: 'ASC', field: 'PUBLISHED_AT' },
          },
        },
        // We add the new argument in the popular arguments corresponding row
        {
          key: 'ArgumentListViewPaginated_arguments',
          rangeBehavior: 'append',
          filters: {
            type: variables.input.type,
            orderBy: { direction: 'DESC', field: 'VOTES' },
          },
        },
      ],
      edgeName: 'argumentEdge',
    },
  ];
};

const commit = (
  variables: AddArgumentMutationVariables,
  viewerIsConfirmed: boolean,
): Promise<AddArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: getConfigs(variables, viewerIsConfirmed),
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('addArgument');
      if (!payload || !payload.getLinkedRecord('argumentEdge')) {
        // Mutation failed
        return;
      }

      // We update the "FOR" or "AGAINST" row arguments totalCount
      const argumentableProxy = store.get(variables.input.argumentableId);
      if (!argumentableProxy) return;

      const connectionKey = viewerIsConfirmed
        ? 'ArgumentList_allArguments'
        : 'UnpublishedArgumentList_viewerArgumentsUnpublished';
      const connection = ConnectionHandler.getConnection(argumentableProxy, connectionKey, {
        type: variables.input.type,
      });
      if (connection) {
        connection.setValue(connection.getValue('totalCount') + 1, 'totalCount');
      }

      if (viewerIsConfirmed) {
        const allArgumentsProxy = argumentableProxy.getLinkedRecord('arguments', { first: 0 });
        if (!allArgumentsProxy) return;
        const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10);
        allArgumentsProxy.setValue(previousValue + 1, 'totalCount');
      }
    },
  });

export default { commit };

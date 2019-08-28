// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddSourceMutationVariables,
  AddSourceMutationResponse,
} from '~relay/AddSourceMutation.graphql';

const mutation = graphql`
  mutation AddSourceMutation($input: AddSourceInput!) {
    addSource(input: $input) {
      sourceEdge {
        cursor
        node {
          id
          ...OpinionSource_source
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const getConfigs = (variables: AddSourceMutationVariables, viewerIsConfirmed: boolean) => {
  if (!viewerIsConfirmed) {
    return [
      {
        type: 'RANGE_ADD',
        edgeName: 'sourceEdge',
        parentID: variables.input.sourceableId,
        connectionInfo: [
          {
            key: 'OpinionSourceBox_viewerSourcesUnpublished',
            rangeBehavior: 'prepend',
          },
        ],
      },
    ];
  }

  return [
    {
      type: 'RANGE_ADD',
      parentID: variables.input.sourceableId,
      edgeName: 'sourceEdge',
      connectionInfo: [
        {
          key: 'OpinionSourceListViewPaginated_sources',
          rangeBehavior: 'prepend',
          filters: {
            orderBy: { direction: 'DESC', field: 'PUBLISHED_AT' },
          },
        },
        {
          key: 'OpinionSourceListViewPaginated_sources',
          rangeBehavior: 'append',
          filters: {
            orderBy: { direction: 'ASC', field: 'PUBLISHED_AT' },
          },
        },
        {
          key: 'OpinionSourceListViewPaginated_sources',
          rangeBehavior: 'append',
          filters: {
            orderBy: { direction: 'DESC', field: 'VOTES' },
          },
        },
      ],
    },
  ];
};

const commit = (
  variables: AddSourceMutationVariables,
  viewerIsConfirmed: boolean,
): Promise<AddSourceMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: getConfigs(variables, viewerIsConfirmed),
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('addSource');
      if (!payload || !payload.getLinkedRecord('sourceEdge')) {
        // Mutation failed
        return;
      }

      const sourceableProxy = store.get(variables.input.sourceableId);
      if (!sourceableProxy) return;

      if (viewerIsConfirmed) {
        const allSourcesProxy = sourceableProxy.getLinkedRecord('sources', { first: 0 });
        if (!allSourcesProxy) return;
        const previousValue = parseInt(allSourcesProxy.getValue('totalCount'), 10);
        allSourcesProxy.setValue(previousValue + 1, 'totalCount');
      } else {
        const connection = ConnectionHandler.getConnection(
          sourceableProxy,
          'OpinionSourceBox_viewerSourcesUnpublished',
        );
        if (connection) {
          connection.setValue(connection.getValue('totalCount') + 1, 'totalCount');
        }
      }
    },
  });

export default { commit };

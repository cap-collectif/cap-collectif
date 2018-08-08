// @flow
import { graphql, type RecordSourceSelectorProxy } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddSourceMutationVariables,
  AddSourceMutationResponse,
} from './__generated__/AddSourceMutation.graphql';

const mutation = graphql`
  mutation AddSourceMutation($input: AddSourceInput!) {
    addSource(input: $input) {
      sourceEdge {
        cursor
        node {
          id
          ...OpinionSource_source
          ...UnpublishedLabel_publishable
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const commit = (variables: AddSourceMutationVariables): Promise<AddSourceMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_ADD',
        parentID: variables.input.sourceableId,
        connectionInfo: [
          {
            key: 'OpinionSourceListViewPaginated_sources',
            rangeBehavior: 'prepend',
            filters: {
              orderBy: { direction: 'DESC', field: 'CREATED_AT' },
            },
          },
          {
            key: 'OpinionSourceListViewPaginated_sources',
            rangeBehavior: 'append',
            filters: {
              orderBy: { direction: 'ASC', field: 'CREATED_AT' },
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
        edgeName: 'sourceEdge',
      },
    ],
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('addSource');
      if (!payload || !payload.getLinkedRecord('sourceEdge')) {
        // Mutation failed
      }
      const sourceableProxy = store.get(variables.input.sourceableId);
      if (!sourceableProxy) return;
      const allSourcesProxy = sourceableProxy.getLinkedRecord('sources', { first: 0 });
      if (!allSourcesProxy) return;
      const previousValue = parseInt(allSourcesProxy.getValue('totalCount'), 10);
      allSourcesProxy.setValue(previousValue + 1, 'totalCount');
    },
  });

export default { commit };

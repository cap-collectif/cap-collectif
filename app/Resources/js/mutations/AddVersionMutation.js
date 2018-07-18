// @flow
import { graphql } from 'react-relay';
// import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddVersionMutationVariables,
  AddVersionMutationResponse,
} from './__generated__/AddVersionMutation.graphql';

const mutation = graphql`
  mutation AddVersionMutation($input: AddVersionInput!) {
    addVersion(input: $input) {
      versionEdge {
        cursor
        node {
          id
          url
          ...OpinionVersion_version
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const commit = (variables: AddVersionMutationVariables): Promise<AddVersionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_ADD',
        parentID: variables.input.opinionId,
        connectionInfo: [
          // We add the new version in the last versions corresponding row
          {
            key: 'VersionListViewPaginated_versions',
            rangeBehavior: 'prepend',
            filters: {
              orderBy: { direction: 'DESC', field: 'CREATED_AT' },
            },
          },
          // We add the new version in the old versions corresponding row
          {
            key: 'VersionListViewPaginated_versions',
            rangeBehavior: 'append',
            filters: {
              orderBy: { direction: 'ASC', field: 'CREATED_AT' },
            },
          },
          // We add the new version in the popular versions corresponding row
          {
            key: 'VersionListViewPaginated_versions',
            rangeBehavior: 'append',
            filters: {
              orderBy: { direction: 'DESC', field: 'VOTES' },
            },
          },
        ],
        edgeName: 'versionEdge',
      },
    ],
    updater: store => {
      const payload = store.getRootField('addVersion');
      if (!payload.getLinkedRecord('versionEdge')) {
        // Mutation failed
      }

      // const allVersionsProxy = versionableProxy.getLinkedRecord('versions', { first: 0 });
      // if (!allVersionsProxy) return;
      // const previousValue = parseInt(allVersionsProxy.getValue('totalCount'), 10);
      // allVersionsProxy.setValue(previousValue + 1, 'totalCount');
    },
  });

export default { commit };

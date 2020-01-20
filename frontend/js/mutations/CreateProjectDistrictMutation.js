// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProjectDistrictMutationVariables,
  CreateProjectDistrictMutationResponse,
  InternalDistrictTranslationInput,
} from '~relay/CreateProjectDistrictMutation.graphql';
import { getTranslation } from '~/services/Translation';

const mutation = graphql`
  mutation CreateProjectDistrictMutation($input: CreateProjectDistrictInput!) {
    createProjectDistrict(input: $input) {
      districtEdge {
        cursor
        node {
          id
          geojson
          displayedOnMap
          border {
            enabled
            color
            opacity
            size
          }
          background {
            enabled
            color
            opacity
          }
          translations {
            locale
            name
          }
        }
      }
    }
  }
`;

const updater = (store: ReactRelayRecordSourceSelectorProxy) => {
  const payload = store.getRootField('createProjectDistrict');
  const districtEdge = payload.getLinkedRecord('districtEdge');
  const root = store.getRoot();

  const connection = ConnectionHandler.getConnection(root, 'ProjectDistrictAdminPage_districts');

  if (connection) {
    ConnectionHandler.insertEdgeAfter(connection, districtEdge);
  }
};

const commit = (
  variables: CreateProjectDistrictMutationVariables,
  locale: ?string = null,
): Promise<CreateProjectDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater,
    optimisticUpdater: store => {
      const root = store.getRoot();
      const id = `to-be-defined-${Math.floor(Math.random() * Math.floor(1000))}`;
      const translation = getTranslation<InternalDistrictTranslationInput>(
        variables.input.translations,
        locale,
      );

      const node = store.create(id, 'districtEdge');
      node.setValue(id, 'id');
      node.setValue(translation ? translation.name : 'translation-not-available');

      const newEdge = store.create(`client:newEdge:${id}`, 'districtEdge');
      newEdge.setLinkedRecord(node, 'node');

      const connection = ConnectionHandler.getConnection(
        root,
        'ProjectDistrictAdminPage_districts',
      );

      if (connection) {
        ConnectionHandler.insertEdgeAfter(connection, newEdge);
      }
    },
  });

export default { commit };

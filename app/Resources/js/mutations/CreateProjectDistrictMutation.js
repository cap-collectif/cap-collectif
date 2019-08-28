// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProjectDistrictMutationVariables,
  CreateProjectDistrictMutationResponse,
} from '~relay/CreateProjectDistrictMutation.graphql';

const mutation = graphql`
  mutation CreateProjectDistrictMutation($input: CreateProjectDistrictInput!) {
    createProjectDistrict(input: $input) {
      districtEdge {
        cursor
        node {
          id
          name
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
        }
      }
    }
  }
`;

const updater = (store: RecordSourceSelectorProxy) => {
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
): Promise<CreateProjectDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater,
    optimisticUpdater: store => {
      const root = store.getRoot();
      const id = `to-be-defined-${Math.floor(Math.random() * Math.floor(1000))}`;

      const node = store.create(id, 'districtEdge');
      node.setValue(id, 'id');
      node.setValue(variables.input.name, 'name');

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

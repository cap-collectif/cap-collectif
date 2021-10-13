// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteEventMutationVariables,
  DeleteEventMutationResponse,
} from '~relay/DeleteEventMutation.graphql';

const mutation = graphql`
  mutation DeleteEventMutation($input: DeleteEventInput!) {
    deleteEvent(input: $input) {
      deletedEventId
    }
  }
`;

const commit = (variables: DeleteEventMutationVariables): Promise<DeleteEventMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteEvent: {
        deletedEventId: variables.input.eventId,
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      // Create new node
      const newNode = store.get(variables.input.eventId);
      if (!newNode) return;
      newNode.setValue('DELETED', 'reviewStatus');
      // Create a new edge
      const edgeID = `client:newTmpEdge:${variables.input.eventId}`;
      const newEdge = store.create(edgeID, 'EventEdge');
      newEdge.setLinkedRecord(newNode, 'node');
      const rootFields = store.getRoot();
      const viewer = rootFields.getLinkedRecord('viewer');
      if (!viewer) return;

      const deletedConnection = viewer.getLinkedRecord('events', {
        status: 'DELETED',
      });
      if (!deletedConnection) return;

      ConnectionHandler.insertEdgeAfter(deletedConnection, newEdge);
      const totalCount = parseInt(deletedConnection.getValue('totalCount'), 10);
      deletedConnection.setValue(totalCount + 1, 'totalCount');
    },
  });

export default { commit };

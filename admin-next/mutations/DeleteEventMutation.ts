import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { ConnectionHandler } from 'relay-runtime';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    DeleteEventMutationVariables,
    DeleteEventMutationResponse,
    DeleteEventMutation,
} from '@relay/DeleteEventMutation.graphql';
import {EventAffiliation} from "@relay/EventListQuery.graphql";

type Variables = DeleteEventMutationVariables & {
    affiliations: Array<EventAffiliation> | null | undefined;
};

type ConnectionArgs = {
    status: string;
    affiliations: Array<EventAffiliation> | null | undefined;
};

const mutation = graphql`
    mutation DeleteEventMutation($input: DeleteEventInput!) @raw_response_type {
        deleteEvent(input: $input) {
            deletedEventId
        }
    }
`;

const commit = (variables: Variables): Promise<DeleteEventMutationResponse> =>
    commitMutation<DeleteEventMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            deleteEvent: {
                deletedEventId: variables.input.eventId,
            },
        },
        updater: (store: RecordSourceSelectorProxy) => {
            const affiliations = variables?.affiliations;
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

            const connectionArgs: ConnectionArgs = { status: 'DELETED', affiliations };
            if (affiliations) {
                connectionArgs.affiliations = affiliations;
            }

            const deletedConnection = viewer.getLinkedRecord('events', connectionArgs);
            if (!deletedConnection) return;

            ConnectionHandler.insertEdgeAfter(deletedConnection, newEdge);
            const totalCount = parseInt(deletedConnection.getValue('totalCount') as string, 10);
            deletedConnection.setValue(totalCount + 1, 'totalCount');
        },
    });

export default { commit };

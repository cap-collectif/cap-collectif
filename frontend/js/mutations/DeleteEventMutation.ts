// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import { ConnectionHandler } from 'relay-runtime'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type { DeleteEventMutationVariables, DeleteEventMutationResponse } from '~relay/DeleteEventMutation.graphql'
type Variables = DeleteEventMutationVariables & {
  readonly affiliations?: string[] | null | undefined
}
type ConnectionArgs = {
  readonly status: string
  affiliations?: string[] | null | undefined
}
const mutation = graphql`
  mutation DeleteEventMutation($input: DeleteEventInput!) {
    deleteEvent(input: $input) {
      deletedEventId
    }
  }
`

const commit = (variables: Variables): Promise<DeleteEventMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteEvent: {
        deletedEventId: variables.input.eventId,
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const affiliations = variables?.affiliations
      // Create new node
      const newNode = store.get(variables.input.eventId)
      if (!newNode) return
      newNode.setValue('DELETED', 'reviewStatus')
      // Create a new edge
      const edgeID = `client:newTmpEdge:${variables.input.eventId}`
      const newEdge = store.create(edgeID, 'EventEdge')
      newEdge.setLinkedRecord(newNode, 'node')
      const rootFields = store.getRoot()
      const viewer = rootFields.getLinkedRecord('viewer')
      if (!viewer) return
      const connectionArgs: ConnectionArgs = {
        status: 'DELETED',
      }

      if (affiliations) {
        connectionArgs.affiliations = affiliations
      }

      const deletedConnection = viewer.getLinkedRecord('events', connectionArgs)
      if (!deletedConnection) return
      ConnectionHandler.insertEdgeAfter(deletedConnection, newEdge)
      const totalCount = parseInt(deletedConnection.getValue('totalCount'), 10)
      deletedConnection.setValue(totalCount + 1, 'totalCount')
    },
  })

export default {
  commit,
}

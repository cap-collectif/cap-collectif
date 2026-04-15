import { ConnectionHandler, graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'
import type {
  CreateHttpRedirectMutation,
  CreateHttpRedirectMutation$data,
  CreateHttpRedirectMutation$variables,
} from '@relay/CreateHttpRedirectMutation.graphql'

const mutation = graphql`
  mutation CreateHttpRedirectMutation($input: CreateHttpRedirectInput!) {
    createHttpRedirect(input: $input) {
      redirect {
        id
        sourceUrl
        destinationUrl
        duration
        redirectType
        createdAt
        updatedAt
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const updateTotalCount = (connection: any, delta: number) => {
  if (!connection) return
  const totalCount = connection.getValue('totalCount')
  if (typeof totalCount === 'number') {
    connection.setValue(totalCount + delta, 'totalCount')
    return
  }
  if (typeof totalCount === 'string') {
    const parsed = parseInt(totalCount, 10)
    if (!Number.isNaN(parsed)) {
      connection.setValue(parsed + delta, 'totalCount')
    }
  }
}

const commit = (
  variables: CreateHttpRedirectMutation$variables,
  connectionId?: string | null,
): Promise<CreateHttpRedirectMutation$data> =>
  commitMutation<CreateHttpRedirectMutation>(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      if (!connectionId) return
      const payload = store.getRootField('createHttpRedirect')
      if (!payload || payload.getValue('errorCode')) return

      const redirect = payload.getLinkedRecord('redirect')
      if (!redirect) return

      const connection = store.get(connectionId)
      if (!connection) return

      const edge = ConnectionHandler.createEdge(store, connection, redirect, 'HttpRedirectEdge')
      ConnectionHandler.insertEdgeBefore(connection, edge)
      updateTotalCount(connection, 1)
    },
  })

export default { commit }

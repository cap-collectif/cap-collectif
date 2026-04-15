import { ConnectionHandler, graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'
import type {
  DeleteHttpRedirectMutation,
  DeleteHttpRedirectMutation$data,
  DeleteHttpRedirectMutation$variables,
} from '@relay/DeleteHttpRedirectMutation.graphql'

const mutation = graphql`
  mutation DeleteHttpRedirectMutation($input: DeleteHttpRedirectInput!) {
    deleteHttpRedirect(input: $input) {
      deletedRedirectId
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
  variables: DeleteHttpRedirectMutation$variables,
  connectionId?: string | null,
): Promise<DeleteHttpRedirectMutation$data> =>
  commitMutation<DeleteHttpRedirectMutation>(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      if (!connectionId) return
      const payload = store.getRootField('deleteHttpRedirect')
      if (!payload || payload.getValue('errorCode')) return

      const connection = store.get(connectionId)
      if (!connection) return

      ConnectionHandler.deleteNode(connection, variables.input.id)
      updateTotalCount(connection, -1)
    },
  })

export default { commit }

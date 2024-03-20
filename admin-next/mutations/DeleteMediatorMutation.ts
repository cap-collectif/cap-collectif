import { ConnectionHandler, graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteMediatorMutation,
  DeleteMediatorMutation$data,
  DeleteMediatorMutation$variables,
} from '@relay/DeleteMediatorMutation.graphql'

const mutation = graphql`
  mutation DeleteMediatorMutation($input: DeleteMediatorInput!) {
    deleteMediator(input: $input) {
      deletedMediatorId
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteMediatorMutation$variables, connectionId): Promise<DeleteMediatorMutation$data> =>
  commitMutation<DeleteMediatorMutation>(environment, {
    mutation,
    variables,
    updater: (store: any) => {
      const connection = store.get(connectionId)
      ConnectionHandler.deleteNode(connection, variables.input.mediatorId)
    },
  })

export default { commit }

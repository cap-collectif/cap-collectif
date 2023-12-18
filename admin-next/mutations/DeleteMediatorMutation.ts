import { ConnectionHandler, graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type {
  DeleteMediatorMutation,
  DeleteMediatorMutationResponse,
  DeleteMediatorMutationVariables,
} from '@relay/DeleteMediatorMutation.graphql'

const mutation = graphql`
  mutation DeleteMediatorMutation($input: DeleteMediatorInput!) {
    deleteMediator(input: $input) {
      deletedMediatorId
    }
  }
`

const commit = (variables: DeleteMediatorMutationVariables, connectionId): Promise<DeleteMediatorMutationResponse> =>
  commitMutation<DeleteMediatorMutation>(environment, {
    mutation,
    variables,
    updater: (store: any) => {
      const connection = store.get(connectionId)
      ConnectionHandler.deleteNode(connection, variables.input.mediatorId)
    },
  })

export default { commit }

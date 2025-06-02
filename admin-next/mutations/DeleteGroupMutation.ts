import { ConnectionHandler, graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  DeleteGroupMutation,
  DeleteGroupMutation$data,
  DeleteGroupMutation$variables,
} from '@relay/DeleteGroupMutation.graphql'
import { GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'

const mutation = graphql`
  mutation DeleteGroupMutation($input: DeleteGroupInput!) {
    deleteGroup(input: $input) {
      deletedGroupId
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteGroupMutation$variables): Promise<DeleteGroupMutation$data> =>
  commitMutation<DeleteGroupMutation>(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const root = store.get('client:root')
      const connectionRecord = ConnectionHandler.getConnection(root, 'UserGroupsList_groups')

      if (!connectionRecord || !root) {
        return
      }

      ConnectionHandler.deleteNode(connectionRecord, variables.input.groupId)
    },
  })

export default { commit }

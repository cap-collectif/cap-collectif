import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  UpdateGroupMutation,
  UpdateGroupMutation$data,
  UpdateGroupMutation$variables,
} from '@relay/UpdateGroupMutation.graphql'
import { GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateGroupMutation($input: UpdateGroupInput!) {
    updateGroup(input: $input) {
      group {
        id
        description
        title
        # update modal members list
        ...MembersList_UsersFragment @arguments(countUsers: 50, term: "")
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateGroupMutation$variables): Promise<UpdateGroupMutation$data> =>
  commitMutation<UpdateGroupMutation>(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      // update group list members totalCount
      const payload = store.getRootField('updateGroup')
      const group = payload.getLinkedRecord('group')
      const members = group.getLinkedRecord('members', { first: 50, term: '' })
      const totalCount = members.getValue('totalCount')

      const groupId = group.getValue('id') as string

      const connectionID = `client:${groupId}:members`

      const connectionRecord = store.get(connectionID)
      connectionRecord.setValue(totalCount, 'totalCount')
    },
  })

export default { commit }

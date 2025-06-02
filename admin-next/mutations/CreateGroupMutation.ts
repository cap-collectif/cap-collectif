import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  CreateGroupMutation,
  CreateGroupMutation$data,
  CreateGroupMutation$variables,
} from '@relay/CreateGroupMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation CreateGroupMutation($input: CreateGroupInput!, $connections: [ID!]!) {
    createGroup(input: $input) {
      group @prependNode(connections: $connections, edgeTypeName: "GroupEdge") {
        id
        title
        description
        members {
          totalCount
        }
      }
      importedUsers {
        email
      }
      notFoundEmails
      alreadyImportedUsers {
        email
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateGroupMutation$variables): Promise<CreateGroupMutation$data> =>
  commitMutation<CreateGroupMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

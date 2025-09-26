import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  CreateUserTypeMutation,
  CreateUserTypeMutation$data,
  CreateUserTypeMutation$variables,
} from '@relay/CreateUserTypeMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation CreateUserTypeMutation($input: CreateUserTypeInput!, $connections: [ID!]!) {
    createUserType(input: $input) {
      userType @prependNode(connections: $connections, edgeTypeName: "UserTypeEdge") {
        id
        name
        media {
          url
        }
        translations {
          name
          locale
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateUserTypeMutation$variables): Promise<CreateUserTypeMutation$data> =>
  commitMutation<CreateUserTypeMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

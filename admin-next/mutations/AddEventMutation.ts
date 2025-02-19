import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import type {
  AddEventMutation$data,
  AddEventMutation$variables,
  AddEventMutation,
} from '@relay/AddEventMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation AddEventMutation($input: AddEventInput!) {
    addEvent(input: $input) {
      eventEdge {
        node {
          id
          _id
          url
        }
      }
      userErrors {
        message
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddEventMutation$variables): Promise<AddEventMutation$data> =>
  commitMutation<AddEventMutation>(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

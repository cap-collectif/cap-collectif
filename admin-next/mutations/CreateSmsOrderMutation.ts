import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateSmsOrderMutation,
  CreateSmsOrderMutation$data,
  CreateSmsOrderMutation$variables,
} from '@relay/CreateSmsOrderMutation.graphql'

const mutation = graphql`
  mutation CreateSmsOrderMutation($input: CreateSmsOrderInput!) @raw_response_type {
    createSmsOrder(input: $input) {
      smsOrder {
        id
        amount
        createdAt
        updatedAt
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateSmsOrderMutation$variables): Promise<CreateSmsOrderMutation$data> =>
  commitMutation<CreateSmsOrderMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

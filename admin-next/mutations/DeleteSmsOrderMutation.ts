import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteSmsOrderMutation,
  DeleteSmsOrderMutation$data,
  DeleteSmsOrderMutation$variables,
} from '@relay/DeleteSmsOrderMutation.graphql'

const mutation = graphql`
  mutation DeleteSmsOrderMutation($input: DeleteSmsOrderInput!, $connections: [ID!]!) @raw_response_type {
    deleteSmsOrder(input: $input) {
      deletedSmsOrderId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteSmsOrderMutation$variables): Promise<DeleteSmsOrderMutation$data> =>
  commitMutation<DeleteSmsOrderMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteSmsOrder: {
        deletedSmsOrderId: variables.input.id,
        errorCode: null,
      },
    },
  })

export default { commit }

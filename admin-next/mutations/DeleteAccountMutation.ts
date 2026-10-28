import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  DeleteAccountMutation,
  DeleteAccountMutation$data,
  DeleteAccountMutation$variables,
} from '@relay/DeleteAccountMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation DeleteAccountMutation($input: DeleteAccountInput!) {
    deleteAccount(input: $input) {
      userId
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteAccountMutation$variables): Promise<DeleteAccountMutation$data> =>
  commitMutation<DeleteAccountMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

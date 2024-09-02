import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import commitMutation from './commitMutation'
import type {
  RegisterMutation$variables,
  RegisterMutation$data,
  RegisterMutation,
} from '@relay/RegisterMutation.graphql'

const mutation = graphql`
  mutation RegisterMutation($input: RegisterInput!) {
    register(input: $input) {
      user {
        displayName
      }
      errorsCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: RegisterMutation$variables): Promise<RegisterMutation$data> =>
  commitMutation<RegisterMutation>(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

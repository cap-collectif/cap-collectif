import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreatePageMutation,
  CreatePageMutation$data,
  CreatePageMutation$variables,
} from '@relay/CreatePageMutation.graphql'

const mutation = graphql`
  mutation CreatePageMutation($input: CreatePageInput!) {
    createPage(input: $input) {
      page {
        id
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreatePageMutation$variables): Promise<CreatePageMutation$data> =>
  commitMutation<CreatePageMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

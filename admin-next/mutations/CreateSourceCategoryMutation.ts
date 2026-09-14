import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  CreateSourceCategoryMutation,
  CreateSourceCategoryMutation$data,
  CreateSourceCategoryMutation$variables,
} from '@relay/CreateSourceCategoryMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation CreateSourceCategoryMutation($input: CreateSourceCategoryInput!, $connections: [ID!]!) {
    createSourceCategory(input: $input) {
      sourceCategory @prependNode(connections: $connections, edgeTypeName: "SourceCategoryEdge") {
        id
        title
        isEnabled
        updatedAt
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateSourceCategoryMutation$variables,
): Promise<CreateSourceCategoryMutation$data> =>
  commitMutation<CreateSourceCategoryMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

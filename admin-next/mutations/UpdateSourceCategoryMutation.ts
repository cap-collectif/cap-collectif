import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateSourceCategoryMutation,
  UpdateSourceCategoryMutation$data,
  UpdateSourceCategoryMutation$variables,
} from '@relay/UpdateSourceCategoryMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateSourceCategoryMutation($input: UpdateSourceCategoryInput!) {
    updateSourceCategory(input: $input) {
      sourceCategory {
        id
        title
        isEnabled
        updatedAt
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateSourceCategoryMutation$variables,
): Promise<UpdateSourceCategoryMutation$data> =>
  commitMutation<UpdateSourceCategoryMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

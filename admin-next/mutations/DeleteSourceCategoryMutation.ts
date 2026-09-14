import { graphql, useMutation } from 'react-relay'
import { DeleteSourceCategoryMutation } from '@relay/DeleteSourceCategoryMutation.graphql'

const mutation = graphql`
  mutation DeleteSourceCategoryMutation($input: DeleteSourceCategoryInput!, $connections: [ID!]!) {
    deleteSourceCategory(input: $input) {
      deletedSourceCategoryId @deleteEdge(connections: $connections)
    }
  }
`

export const useDeleteSourceCategoryMutation = () => {
  const [commit, isLoading] = useMutation<DeleteSourceCategoryMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

import { graphql, useMutation } from 'react-relay'
import { DeleteSocialNetworkMutation } from '@relay/DeleteSocialNetworkMutation.graphql'

const mutation = graphql`
  mutation DeleteSocialNetworkMutation($input: DeleteSocialNetworkInput!, $connections: [ID!]!) {
    deleteSocialNetwork(input: $input) {
      deletedSocialNetworkId @deleteEdge(connections: $connections)
    }
  }
`

export const useDeleteSocialNetworkMutation = () => {
  const [commit, isLoading] = useMutation<DeleteSocialNetworkMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

import { graphql, useMutation } from 'react-relay'
import type { UpdateParticipantMutation } from '@relay/UpdateParticipantMutation.graphql'

const mutation = graphql`
  mutation UpdateParticipantMutation($input: UpdateParticipantInput!) {
    updateParticipant(input: $input) {
      participant {
        id
      }
      validationErrors
    }
  }
`

export const useUpdateParticipantMutation = () => {
  const [commit, isLoading] = useMutation<UpdateParticipantMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

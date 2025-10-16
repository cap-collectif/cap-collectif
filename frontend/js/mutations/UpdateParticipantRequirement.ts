import { graphql, useMutation } from 'react-relay'

import type { UpdateParticipantRequirementMutation } from '~relay/UpdateParticipantRequirementMutation.graphql'

const mutation = graphql`
  mutation UpdateParticipantRequirementMutation($input: UpdateParticipantRequirementInput!) {
    updateParticipantRequirement(input: $input) {
      requirements {
        id
      }
    }
  }
`

export const useUpdateParticipantRequirementMutation = () => {
  const [commit, isLoading] = useMutation<UpdateParticipantRequirementMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

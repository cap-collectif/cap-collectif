// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import type { SendParticipantEmailWorkflowMutation } from '~relay/SendParticipantEmailWorkflowMutation.graphql'

const mutation = graphql`
  mutation SendParticipantEmailWorkflowMutation($input: SendParticipantEmailWorkflowInput!) {
    sendParticipantEmailWorkflow(input: $input) {
      errorCode
      redirectUrl
    }
  }
`
export const useSendParticipantEmailWorkflowMutation = () => {
  const [commit, isLoading] = useMutation<SendParticipantEmailWorkflowMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

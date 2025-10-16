// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import type { SendParticipantConsentInternalCommunicationEmailMutation } from '~relay/SendParticipantConsentInternalCommunicationEmailMutation.graphql'

const mutation = graphql`
  mutation SendParticipantConsentInternalCommunicationEmailMutation(
    $input: SendParticipantConsentInternalCommunicationEmailInput!
  ) {
    sendParticipantConsentInternalCommunicationEmail(input: $input) {
      participant {
        id
      }
      errorCode
    }
  }
`

export const useSendParticipantConsentInternalCommunicationEmailMutation = () => {
  const [commit, isLoading] = useMutation<SendParticipantConsentInternalCommunicationEmailMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

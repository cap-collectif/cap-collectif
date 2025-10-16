// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import type { SendParticipantPhoneValidationCodeMutation } from '~relay/SendParticipantPhoneValidationCodeMutation.graphql'

const mutation = graphql`
  mutation SendParticipantPhoneValidationCodeMutation($input: SendParticipantPhoneValidationCodeInput!) {
    sendParticipantPhoneValidationCode(input: $input) {
      errorCode
    }
  }
`

export const useSendParticipantPhoneValidationCodeMutation = () => {
  const [commit, isLoading] = useMutation<SendParticipantPhoneValidationCodeMutation>(mutation)

  return {
    commit,
    isLoading,
  }
}

// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import type { VerifyParticipantPhoneNumberMutation } from '~relay/VerifyParticipantPhoneNumberMutation.graphql'

const mutation = graphql`
  mutation VerifyParticipantPhoneNumberMutation($input: VerifyParticipantPhoneNumberInput!) {
    verifyParticipantPhoneNumber(input: $input) {
      errorCode
      participant {
        id
      }
    }
  }
`

export const useVerifyParticipantPhoneNumberMutation = () => {
  const [commit, isLoading] = useMutation<VerifyParticipantPhoneNumberMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

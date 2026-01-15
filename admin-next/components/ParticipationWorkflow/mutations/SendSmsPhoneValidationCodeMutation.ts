// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import { environment } from '@utils/relay-environement'
import commitMutation from './commitMutation'
import type {
  SendSmsPhoneValidationCodeMutation,
  SendSmsPhoneValidationCodeMutationResponse,
  SendSmsPhoneValidationCodeMutationVariables,
} from '@relay/SendSmsPhoneValidationCodeMutation.graphql'

const mutation = graphql`
  mutation SendSmsPhoneValidationCodeMutation($input: SendSmsPhoneValidationCodeInput!) {
    sendSmsPhoneValidationCode(input: $input) {
      errorCode
    }
  }
`

const commit = (
  variables: SendSmsPhoneValidationCodeMutationVariables,
): Promise<SendSmsPhoneValidationCodeMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

export const useSendSmsPhoneValidationCodeMutation = () => {
  const [commit, isLoading] = useMutation<SendSmsPhoneValidationCodeMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

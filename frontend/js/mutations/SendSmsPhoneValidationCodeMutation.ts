// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  SendSmsPhoneValidationCodeMutationResponse,
  SendSmsPhoneValidationCodeMutationVariables,
} from '~relay/SendSmsPhoneValidationCodeMutation.graphql'

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

// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  VerifyUserPhoneNumberMutationResponse,
  VerifyUserPhoneNumberMutationVariables,
} from '~relay/VerifyUserPhoneNumberMutation.graphql'

const mutation = graphql`
  mutation VerifyUserPhoneNumberMutation($input: VerifyUserPhoneNumberInput!) {
    verifyUserPhoneNumber(input: $input) {
      user {
        id
      }
      errorCode
    }
  }
`

const commit = (variables: VerifyUserPhoneNumberMutationVariables): Promise<VerifyUserPhoneNumberMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

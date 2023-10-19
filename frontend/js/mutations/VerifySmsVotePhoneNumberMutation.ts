// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  VerifySmsVotePhoneNumberMutationVariables,
  VerifySmsVotePhoneNumberMutationResponse,
} from '~relay/VerifySmsVotePhoneNumberMutation.graphql'

const mutation = graphql`
  mutation VerifySmsVotePhoneNumberMutation($input: VerifySmsVotePhoneNumberInput!) {
    verifySmsVotePhoneNumber(input: $input) {
      errorCode
      token
    }
  }
`

const commit = (
  variables: VerifySmsVotePhoneNumberMutationVariables,
): Promise<VerifySmsVotePhoneNumberMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  VerifyUserPhoneNumberMutation,
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

export const useVerifyUserPhoneNumberMutation = () => {
  const [commit, isLoading] = useMutation<VerifyUserPhoneNumberMutation>(mutation);
  return {
    commit,
    isLoading,
  };
};



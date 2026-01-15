// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import { environment } from '@utils/relay-environement'
import {
  ValidatePhoneReusabilityMutation,
  ValidatePhoneReusabilityMutation$data,
  ValidatePhoneReusabilityMutation$variables,
} from '@relay/ValidatePhoneReusabilityMutation.graphql'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation ValidatePhoneReusabilityMutation($input: ValidatePhoneReusabilityInput!) {
    validatePhoneReusability(input: $input) {
      errorCode
    }
  }
`

const commit = (
  variables: ValidatePhoneReusabilityMutation$variables,
): Promise<ValidatePhoneReusabilityMutation$data> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

export const useValidatePhoneReusabilityMutation = () => {
  const [commit, isLoading] = useMutation<ValidatePhoneReusabilityMutation>(mutation)
  return {
    commit,
    isLoading,
  }
}

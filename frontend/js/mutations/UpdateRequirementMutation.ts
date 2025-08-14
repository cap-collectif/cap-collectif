// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateRequirementMutationVariables,
  UpdateRequirementMutationResponse, UpdateRequirementMutation,
} from '~relay/UpdateRequirementMutation.graphql'

const mutation = graphql`
  mutation UpdateRequirementMutation($input: UpdateRequirementInput!) {
    updateRequirement(input: $input) {
      requirements {
          id
      }
    }
  }
`

const commit = (variables: UpdateRequirementMutationVariables): Promise<UpdateRequirementMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

export const useUpdateRequirementMutation = () => {
  const [commit, isLoading] = useMutation<UpdateRequirementMutation>(mutation);
  return {
    commit,
    isLoading
  }
}

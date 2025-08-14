// @ts-nocheck
import { graphql, useMutation } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateProfilePersonalDataMutationVariables,
  UpdateProfilePersonalDataMutationResponse as Response, UpdateProfilePersonalDataMutation,
} from '~relay/UpdateProfilePersonalDataMutation.graphql'

export type UpdateProfilePersonalDataMutationResponse = Response
const mutation = graphql`
  mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
    updateProfilePersonalData(input: $input) {
      user {
        id
        ...PersonalData_viewer
        ...UserAdminPersonalData_user
      }
      errorCode
    }
  }
`

const commit = (variables: UpdateProfilePersonalDataMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

// we keep the old commit function for now, need to refactor it later to use the hook version
export const useUpdateProfilePersonalDataMutation = () => {
  const [commit, isLoading] = useMutation<UpdateProfilePersonalDataMutation>(mutation)

  return {
    commit,
    isLoading
  }
}

export default {
  commit,
}

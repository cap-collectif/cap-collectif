import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateUserAdminPersonalDataMutation,
  UpdateUserAdminPersonalDataMutation$data,
  UpdateUserAdminPersonalDataMutation$variables,
} from '@relay/UpdateUserAdminPersonalDataMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

// Distinct operation name: `UpdateProfilePersonalDataMutation` is already used by the participation workflow
const mutation = graphql`
  mutation UpdateUserAdminPersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
    updateProfilePersonalData(input: $input) {
      user {
        id
        ...UserAdminPersonalData_user
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateUserAdminPersonalDataMutation$variables,
): Promise<UpdateUserAdminPersonalDataMutation$data> =>
  commitMutation<UpdateUserAdminPersonalDataMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

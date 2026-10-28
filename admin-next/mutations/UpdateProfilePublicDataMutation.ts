import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateProfilePublicDataMutation,
  UpdateProfilePublicDataMutation$data,
  UpdateProfilePublicDataMutation$variables,
} from '@relay/UpdateProfilePublicDataMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
    updateProfilePublicData(input: $input) {
      user {
        id
        # Unmasked so that the form can be reset with the values normalized by the server
        ...UserAdminProfile_user @relay(mask: false)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateProfilePublicDataMutation$variables): Promise<UpdateProfilePublicDataMutation$data> =>
  commitMutation<UpdateProfilePublicDataMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

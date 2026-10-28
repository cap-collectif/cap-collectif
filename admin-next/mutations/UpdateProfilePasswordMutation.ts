import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateProfilePasswordMutation,
  UpdateProfilePasswordMutation$data,
  UpdateProfilePasswordMutation$variables,
} from '@relay/UpdateProfilePasswordMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateProfilePasswordMutation($input: UpdateProfilePasswordInput!) {
    updateProfilePassword(input: $input) {
      user {
        id
      }
      error
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateProfilePasswordMutation$variables): Promise<UpdateProfilePasswordMutation$data> =>
  commitMutation<UpdateProfilePasswordMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

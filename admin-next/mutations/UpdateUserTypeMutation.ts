import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateUserTypeMutation,
  UpdateUserTypeMutation$data,
  UpdateUserTypeMutation$variables,
} from '@relay/UpdateUserTypeMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateUserTypeMutation($input: UpdateUserTypeInput!) {
    updateUserType(input: $input) {
      userType {
        id
        name
        translations {
          locale
          name
        }
        media {
          url
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateUserTypeMutation$variables): Promise<UpdateUserTypeMutation$data> =>
  commitMutation<UpdateUserTypeMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

import {
  UpdateUserAccountMutation,
  UpdateUserAccountMutation$data,
  UpdateUserAccountMutation$variables,
} from '@relay/UpdateUserAccountMutation.graphql'
import { environment } from '@utils/relay-environement'
import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateUserAccountMutation($input: UpdateUserAccountInput!) {
    updateUserAccount(input: $input) {
      user {
        id
        ...UserAdminAccount_user
        isAdmin
        isSubscribedToProposalNews
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateUserAccountMutation$variables): Promise<UpdateUserAccountMutation$data> =>
  commitMutation<UpdateUserAccountMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateOpinionAdminMutation,
  CreateOpinionAdminMutation$data,
  CreateOpinionAdminMutation$variables,
} from '@relay/CreateOpinionAdminMutation.graphql'

const mutation = graphql`
  mutation CreateOpinionAdminMutation($input: CreateOpinionAdminInput!) {
    createOpinionAdmin(input: $input) {
      opinion {
        id
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateOpinionAdminMutation$variables): Promise<CreateOpinionAdminMutation$data> =>
  commitMutation<CreateOpinionAdminMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

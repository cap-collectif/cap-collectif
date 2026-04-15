import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateHttpRedirectMutation,
  UpdateHttpRedirectMutation$data,
  UpdateHttpRedirectMutation$variables,
} from '@relay/UpdateHttpRedirectMutation.graphql'

const mutation = graphql`
  mutation UpdateHttpRedirectMutation($input: UpdateHttpRedirectInput!) {
    updateHttpRedirect(input: $input) {
      redirect {
        id
        sourceUrl
        destinationUrl
        duration
        redirectType
        createdAt
        updatedAt
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateHttpRedirectMutation$variables): Promise<UpdateHttpRedirectMutation$data> =>
  commitMutation<UpdateHttpRedirectMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

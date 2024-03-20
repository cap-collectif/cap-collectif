import { graphql } from 'react-relay'
import { environment } from '@utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateRedirectIOProjectKeyMutation$variables,
  UpdateRedirectIOProjectKeyMutation$data,
  UpdateRedirectIOProjectKeyMutation,
} from '@relay/UpdateRedirectIOProjectKeyMutation.graphql'

const mutation = graphql`
  mutation UpdateRedirectIOProjectKeyMutation($input: UpdateRedirectIOProjectIdInput!) {
    updateRedirectIOKey(input: $input) {
      projectId
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateRedirectIOProjectKeyMutation$variables,
): Promise<UpdateRedirectIOProjectKeyMutation$data> =>
  commitMutation<UpdateRedirectIOProjectKeyMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

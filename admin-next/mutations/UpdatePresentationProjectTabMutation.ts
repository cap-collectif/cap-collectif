import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdatePresentationProjectTabMutation,
  UpdatePresentationProjectTabMutation$variables,
  UpdatePresentationProjectTabMutation$data,
} from '@relay/UpdatePresentationProjectTabMutation.graphql'

const mutation = graphql`
  mutation UpdatePresentationProjectTabMutation($input: UpdatePresentationProjectTabInput!) {
    updatePresentationProjectTab(input: $input) {
      projectTab {
        id
        title
        slug
        enabled
        type
        position
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdatePresentationProjectTabMutation$variables,
): Promise<UpdatePresentationProjectTabMutation$data> =>
  commitMutation<UpdatePresentationProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

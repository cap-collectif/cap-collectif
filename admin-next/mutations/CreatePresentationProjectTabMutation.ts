import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreatePresentationProjectTabMutation,
  CreatePresentationProjectTabMutation$variables,
  CreatePresentationProjectTabMutation$data,
} from '@relay/CreatePresentationProjectTabMutation.graphql'

const mutation = graphql`
  mutation CreatePresentationProjectTabMutation($input: CreatePresentationProjectTabInput!) {
    createPresentationProjectTab(input: $input) {
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
  variables: CreatePresentationProjectTabMutation$variables,
): Promise<CreatePresentationProjectTabMutation$data> =>
  commitMutation<CreatePresentationProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

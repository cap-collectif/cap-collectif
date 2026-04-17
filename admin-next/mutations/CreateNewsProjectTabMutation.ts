import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateNewsProjectTabMutation,
  CreateNewsProjectTabMutation$variables,
  CreateNewsProjectTabMutation$data,
} from '@relay/CreateNewsProjectTabMutation.graphql'

const mutation = graphql`
  mutation CreateNewsProjectTabMutation($input: CreateNewsProjectTabInput!) {
    createNewsProjectTab(input: $input) {
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

const commit = (variables: CreateNewsProjectTabMutation$variables): Promise<CreateNewsProjectTabMutation$data> =>
  commitMutation<CreateNewsProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

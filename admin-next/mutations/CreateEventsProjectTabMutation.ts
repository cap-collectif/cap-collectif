import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateEventsProjectTabMutation,
  CreateEventsProjectTabMutation$variables,
  CreateEventsProjectTabMutation$data,
} from '@relay/CreateEventsProjectTabMutation.graphql'

const mutation = graphql`
  mutation CreateEventsProjectTabMutation($input: CreateEventsProjectTabInput!) {
    createEventsProjectTab(input: $input) {
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

const commit = (variables: CreateEventsProjectTabMutation$variables): Promise<CreateEventsProjectTabMutation$data> =>
  commitMutation<CreateEventsProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

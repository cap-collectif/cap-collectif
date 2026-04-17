import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateEventsProjectTabMutation,
  UpdateEventsProjectTabMutation$variables,
  UpdateEventsProjectTabMutation$data,
} from '@relay/UpdateEventsProjectTabMutation.graphql'

const mutation = graphql`
  mutation UpdateEventsProjectTabMutation($input: UpdateEventsProjectTabInput!) {
    updateEventsProjectTab(input: $input) {
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

const commit = (variables: UpdateEventsProjectTabMutation$variables): Promise<UpdateEventsProjectTabMutation$data> =>
  commitMutation<UpdateEventsProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

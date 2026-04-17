import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateNewsProjectTabMutation,
  UpdateNewsProjectTabMutation$variables,
  UpdateNewsProjectTabMutation$data,
} from '@relay/UpdateNewsProjectTabMutation.graphql'

const mutation = graphql`
  mutation UpdateNewsProjectTabMutation($input: UpdateNewsProjectTabInput!) {
    updateNewsProjectTab(input: $input) {
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

const commit = (variables: UpdateNewsProjectTabMutation$variables): Promise<UpdateNewsProjectTabMutation$data> =>
  commitMutation<UpdateNewsProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

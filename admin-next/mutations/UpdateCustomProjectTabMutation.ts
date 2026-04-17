import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateCustomProjectTabMutation,
  UpdateCustomProjectTabMutation$variables,
  UpdateCustomProjectTabMutation$data,
} from '@relay/UpdateCustomProjectTabMutation.graphql'

const mutation = graphql`
  mutation UpdateCustomProjectTabMutation($input: UpdateCustomProjectTabInput!) {
    updateCustomProjectTab(input: $input) {
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

const commit = (variables: UpdateCustomProjectTabMutation$variables): Promise<UpdateCustomProjectTabMutation$data> =>
  commitMutation<UpdateCustomProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

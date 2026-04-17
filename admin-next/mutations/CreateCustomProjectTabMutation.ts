import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateCustomProjectTabMutation,
  CreateCustomProjectTabMutation$variables,
  CreateCustomProjectTabMutation$data,
} from '@relay/CreateCustomProjectTabMutation.graphql'

const mutation = graphql`
  mutation CreateCustomProjectTabMutation($input: CreateCustomProjectTabInput!) {
    createCustomProjectTab(input: $input) {
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

const commit = (variables: CreateCustomProjectTabMutation$variables): Promise<CreateCustomProjectTabMutation$data> =>
  commitMutation<CreateCustomProjectTabMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

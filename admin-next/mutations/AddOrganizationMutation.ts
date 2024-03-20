import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddOrganizationMutation,
  AddOrganizationMutation$variables,
  AddOrganizationMutation$data,
} from '@relay/AddOrganizationMutation.graphql'

const mutation = graphql`
  mutation AddOrganizationMutation($input: AddOrganizationInput!) {
    addOrganization(input: $input) {
      organization {
        id
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddOrganizationMutation$variables): Promise<AddOrganizationMutation$data> =>
  commitMutation<AddOrganizationMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

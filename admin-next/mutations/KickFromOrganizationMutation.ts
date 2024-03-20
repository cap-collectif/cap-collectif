import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import {
  KickFromOrganizationMutation,
  KickFromOrganizationMutation$data,
  KickFromOrganizationMutation$variables,
} from '@relay/KickFromOrganizationMutation.graphql'

const mutation = graphql`
  mutation KickFromOrganizationMutation($input: KickFromOrganizationInput!, $connections: [ID!]!) @raw_response_type {
    kickFromOrganization(input: $input) {
      deletedMemberShipId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: KickFromOrganizationMutation$variables): Promise<KickFromOrganizationMutation$data> =>
  commitMutation<KickFromOrganizationMutation>(environment, {
    mutation,
    variables,
    optimisticUpdater: store => {
      store.delete(variables.input.organizationId)
    },
  })

export default { commit }

import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateGlobalDistrictMutation,
  CreateGlobalDistrictMutation$variables,
  CreateGlobalDistrictMutation$data,
} from '@relay/CreateGlobalDistrictMutation.graphql'

const mutation = graphql`
  mutation CreateGlobalDistrictMutation($input: CreateGlobalDistrictInput!) {
    createGlobalDistrict(input: $input) {
      districtEdge {
        cursor
        node {
          id
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateGlobalDistrictMutation$variables): Promise<CreateGlobalDistrictMutation$data> =>
  commitMutation<CreateGlobalDistrictMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

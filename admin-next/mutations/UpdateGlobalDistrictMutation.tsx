import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateGlobalDistrictMutation,
  UpdateGlobalDistrictMutation$variables,
  UpdateGlobalDistrictMutation$data,
} from '@relay/UpdateGlobalDistrictMutation.graphql'

const mutation = graphql`
  mutation UpdateGlobalDistrictMutation($input: UpdateGlobalDistrictInput!) {
    updateGlobalDistrict(input: $input) {
      districtEdge {
        cursor
        node {
          id
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateGlobalDistrictMutation$variables): Promise<UpdateGlobalDistrictMutation$data> =>
  commitMutation<UpdateGlobalDistrictMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

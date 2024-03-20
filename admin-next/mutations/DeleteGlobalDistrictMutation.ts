import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteGlobalDistrictMutation,
  DeleteGlobalDistrictMutation$variables,
  DeleteGlobalDistrictMutation$data,
} from '@relay/DeleteGlobalDistrictMutation.graphql'

const mutation = graphql`
  mutation DeleteGlobalDistrictMutation($input: DeleteGlobalDistrictInput!) {
    deleteGlobalDistrict(input: $input) {
      deletedDistrictId @deleteRecord
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteGlobalDistrictMutation$variables): Promise<DeleteGlobalDistrictMutation$data> =>
  commitMutation<DeleteGlobalDistrictMutation>(environment, {
    mutation,
    variables,
    optimisticUpdater: store => {
      store.delete(variables.input.id)
    },
  })

export default { commit }

// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  DeleteGlobalDistrictMutationVariables,
  DeleteGlobalDistrictMutationResponse,
} from '~relay/DeleteGlobalDistrictMutation.graphql'

const mutation = graphql`
  mutation DeleteGlobalDistrictMutation($input: DeleteGlobalDistrictInput!) {
    deleteGlobalDistrict(input: $input) {
      deletedDistrictId @deleteRecord
    }
  }
`

const commit = (variables: DeleteGlobalDistrictMutationVariables): Promise<DeleteGlobalDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: store => {
      store.delete(variables.input.id)
    },
  })

export default {
  commit,
}

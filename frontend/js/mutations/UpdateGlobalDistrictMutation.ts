// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateGlobalDistrictMutationVariables,
  UpdateGlobalDistrictMutationResponse,
} from '~relay/UpdateGlobalDistrictMutation.graphql'

const mutation = graphql`
  mutation UpdateGlobalDistrictMutation($input: UpdateGlobalDistrictInput!) {
    updateGlobalDistrict(input: $input) {
      district {
        id
        geojson
        displayedOnMap
        border {
          enabled
          color
          opacity
          size
        }
        background {
          enabled
          color
          opacity
        }
        translations {
          locale
          name
        }
      }
    }
  }
`

const commit = (variables: UpdateGlobalDistrictMutationVariables): Promise<UpdateGlobalDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}

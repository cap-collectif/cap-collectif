// @ts-nocheck
import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import environnement from '../createRelayEnvironment'
import type {
  UnfollowGlobalDistrictMutationVariables,
  UnfollowGlobalDistrictMutationResponse,
} from '~relay/UnfollowGlobalDistrictMutation.graphql'

const mutation = graphql`
  mutation UnfollowGlobalDistrictMutation($input: UnfollowGlobalDistrictInput!) {
    unfollowGlobalDistrict(input: $input) {
      globalDistrict {
        id
        followers {
          totalCount
          edges {
            node {
              username
            }
          }
        }
      }
    }
  }
`

const commit = (
  variables: UnfollowGlobalDistrictMutationVariables,
): Promise<UnfollowGlobalDistrictMutationResponse> =>
  commitMutation(environnement, {
    mutation,
    variables,
  })

export default {
  commit,
}

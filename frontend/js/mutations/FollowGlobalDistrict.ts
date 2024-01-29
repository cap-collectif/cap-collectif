// @ts-nocheck
import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import environnement from '../createRelayEnvironment'
import type {
  FollowGlobalDistrictMutationVariables,
  FollowGlobalDistrictMutationResponse as Response,
} from '~relay/FollowGlobalDistrictMutation.graphql'

const mutation = graphql`
  mutation FollowGlobalDistrictMutation($input: FollowGlobalDistrictInput!) {
    followGlobalDistrict(input: $input) {
      globalDistrict {
        id
      }
      followerEdge {
        node {
          id
        }
      }
    }
  }
`

const commit = (variables: FollowGlobalDistrictMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
    configs: [],
  })

export default {
  commit,
}

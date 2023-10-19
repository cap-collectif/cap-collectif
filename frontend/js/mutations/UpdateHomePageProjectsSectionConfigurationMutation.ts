// @ts-nocheck
import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import environnement from '~/createRelayEnvironment'
import type {
  UpdateHomePageProjectsSectionConfigurationMutationResponse as Response,
  UpdateHomePageProjectsSectionConfigurationMutationVariables,
} from '~relay/UpdateHomePageProjectsSectionConfigurationMutation.graphql'

const mutation = graphql`
  mutation UpdateHomePageProjectsSectionConfigurationMutation(
    $input: UpdateHomePageProjectsSectionConfigurationInput!
  ) {
    updateHomePageProjectsSectionConfiguration(input: $input) {
      errorCode
      homePageProjectsSectionConfiguration {
        title
        teaser
        position
        displayMode
        nbObjects
        enabled
        projects {
          edges {
            node {
              title
            }
          }
        }
      }
    }
  }
`

const commit = (variables: UpdateHomePageProjectsSectionConfigurationMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
  })

export default {
  commit,
}

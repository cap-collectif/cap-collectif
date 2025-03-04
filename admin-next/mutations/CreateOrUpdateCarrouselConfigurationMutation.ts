import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateOrUpdateCarrouselConfigurationMutation,
  CreateOrUpdateCarrouselConfigurationMutation$variables,
  CreateOrUpdateCarrouselConfigurationMutation$data,
} from '@relay/CreateOrUpdateCarrouselConfigurationMutation.graphql'

const mutation = graphql`
  mutation CreateOrUpdateCarrouselConfigurationMutation($input: CreateOrUpdateCarrouselConfigurationInput!) {
    createOrUpdateCarrouselConfiguration(input: $input) {
      errorCode
      carrouselConfiguration {
        title
        position
        enabled
        isLegendEnabledOnImage
        carrouselElements {
          edges {
            node {
              id
              title
              position
              description
              isDisplayed
              buttonLabel
              type
              redirectLink
              image {
                id
                url(format: "reference")
                type: contentType
              }
              extraData {
                startAt
                endAt
              }
            }
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateOrUpdateCarrouselConfigurationMutation$variables,
): Promise<CreateOrUpdateCarrouselConfigurationMutation$data> =>
  commitMutation<CreateOrUpdateCarrouselConfigurationMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }

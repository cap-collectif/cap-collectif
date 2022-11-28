// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '~/createRelayEnvironment';
import type {
  UpdateHomePageProjectsMapSectionConfigurationMutationResponse,
  UpdateHomePageProjectsMapSectionConfigurationMutationVariables,
} from '~relay/UpdateHomePageProjectsMapSectionConfigurationMutation.graphql';

const mutation = graphql`
  mutation UpdateHomePageProjectsMapSectionConfigurationMutation(
    $input: UpdateHomePageProjectsMapSectionConfigurationInput!
  ) {
    updateHomePageProjectsMapSectionConfiguration(input: $input) {
      errorCode
      homePageProjectsMapSectionConfiguration {
        title
        teaser
        position
        enabled
        centerLatitude
        centerLongitude
        zoomMap
      }
    }
  }
`;

const commit = (
  variables: UpdateHomePageProjectsMapSectionConfigurationMutationVariables,
): Promise<UpdateHomePageProjectsMapSectionConfigurationMutationResponse> =>
  commitMutation(environnement, {
    mutation,
    variables,
  });

export default { commit };

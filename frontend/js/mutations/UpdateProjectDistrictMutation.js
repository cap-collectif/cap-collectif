// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProjectDistrictMutationVariables,
  UpdateProjectDistrictMutationResponse,
} from '~relay/UpdateProjectDistrictMutation.graphql';

const mutation = graphql`
  mutation UpdateProjectDistrictMutation($input: UpdateProjectDistrictInput!) {
    updateProjectDistrict(input: $input) {
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
`;

const commit = (
  variables: UpdateProjectDistrictMutationVariables,
): Promise<UpdateProjectDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

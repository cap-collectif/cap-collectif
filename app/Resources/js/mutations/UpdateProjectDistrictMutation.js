// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProjectDistrictMutationVariables,
  UpdateProjectDistrictMutationResponse,
} from './__generated__/UpdateProjectDistrictMutation.graphql';

const mutation = graphql`
  mutation UpdateProjectDistrictMutation($input: UpdateProjectDistrictInput!) {
    updateProjectDistrict(input: $input) {
      district {
        id
        name
        geojson
        displayedOnMap
        border {
          color
          opacity
          size
        }
        background {
          color
          opacity
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

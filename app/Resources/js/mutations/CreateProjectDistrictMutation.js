// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProjectDistrictMutationVariables,
  CreateProjectDistrictMutationResponse,
} from './__generated__/CreateProjectDistrictMutation.graphql';

const mutation = graphql`
  mutation CreateProjectDistrictMutation($input: CreateProjectDistrictInput!) {
    createProjectDistrict(input: $input) {
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
  variables: CreateProjectDistrictMutationVariables,
): Promise<CreateProjectDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

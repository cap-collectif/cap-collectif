// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  FollowProjectDistrictMutationVariables,
  FollowProjectDistrictMutationResponse as Response,
} from '~relay/FollowProjectDistrictMutation.graphql';

const mutation = graphql`
  mutation FollowProjectDistrictMutation($input: FollowProjectDistrictInput!) {
    followProjectDistrict(input: $input) {
      projectDistrict {
        id
      }
      followerEdge {
        node {
          id
        }
      }
    }
  }
`;

const commit = (variables: FollowProjectDistrictMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
    configs: [],
  });

export default { commit };

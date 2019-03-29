// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProfilePublicDataMutationVariables,
  UpdateProfilePublicDataMutationResponse as Response,
} from '~relay/UpdateProfilePublicDataMutation.graphql';

export type UpdateProfilePublicDataMutationResponse = Response;

const mutation = graphql`
  mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
    updateProfilePublicData(input: $input) {
      user {
        id
        ...Profile_viewer
      }
    }
  }
`;

const commit = (variables: UpdateProfilePublicDataMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

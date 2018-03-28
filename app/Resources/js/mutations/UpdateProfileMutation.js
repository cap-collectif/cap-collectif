// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProfileMutationVariables,
  UpdateProfileMutationResponse,
} from './__generated__/UpdateProfileMutation.graphql';

const mutation = graphql`
  mutation UpdateProfileMutation($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      viewer {
        id
        username
      }
    }
  }
`;

const commit = (
  variables: UpdateProfileMutationVariables,
): Promise<UpdateProfileMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProfilePasswordMutationVariables,
  UpdateProfilePasswordMutationResponse,
} from './__generated__/UpdateProfilePasswordMutation.graphql';

const mutation = graphql`
  mutation UpdateProfilePasswordMutation($input: UpdateProfilePasswordInput!) {
    updateProfilePassword(input: $input) {
      viewer {
        id
        username
      }
    }
  }
`;

const commit = (
  variables: UpdateProfilePasswordMutationVariables,
): Promise<UpdateProfilePasswordMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

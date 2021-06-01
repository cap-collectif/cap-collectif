// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ToggleFeatureMutationVariables,
  ToggleFeatureMutationResponse,
} from '~relay/ToggleFeatureMutation.graphql';

const mutation = graphql`
  mutation ToggleFeatureMutation($input: ToggleFeatureInput!) {
    toggleFeature(input: $input) {
      featureFlag {
        type
        enabled
      }
    }
  }
`;

const commit = (
  variables: ToggleFeatureMutationVariables,
): Promise<ToggleFeatureMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

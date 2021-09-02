// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SetUserDefaultLocaleMutationVariables,
  SetUserDefaultLocaleMutationResponse,
} from '~relay/SetUserDefaultLocaleMutation.graphql';

const mutation = graphql`
  mutation SetUserDefaultLocaleMutation($input: SetUserDefaultLocaleInput!) {
    setUserDefaultLocale(input: $input) {
      code
    }
  }
`;

const commit = (
  variables: SetUserDefaultLocaleMutationVariables,
): Promise<SetUserDefaultLocaleMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

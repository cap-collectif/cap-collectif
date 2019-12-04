// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SetDefaultLocaleMutationResponse,
  SetDefaultLocaleMutationVariables,
} from '~relay/SetDefaultLocaleMutation.graphql';

const mutation = graphql`
  mutation SetDefaultLocaleMutation($input: SetDefaultLocaleInput!) {
    setDefaultLocale(input: $input) {
      locale {
        id
        code
        isEnabled
        isPublished
        isDefault
      }
    }
  }
`;

const commit = (
  variables: SetDefaultLocaleMutationVariables,
): Promise<SetDefaultLocaleMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeVersionMutationVariables,
  ChangeVersionMutationResponse,
} from './__generated__/ChangeVersionMutation.graphql';

const mutation = graphql`
  mutation ChangeVersionMutation($input: ChangeVersionInput!) {
    changeVersion(input: $input) {
      version {
        id
        ...OpinionVersion_version
      }
    }
  }
`;

const commit = (
  variables: ChangeVersionMutationVariables,
): Promise<ChangeVersionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

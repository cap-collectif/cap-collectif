// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeArgumentMutationVariables,
  ChangeArgumentMutationResponse,
} from './__generated__/ChangeArgumentMutation.graphql';

const mutation = graphql`
  mutation ChangeArgumentMutation($input: ChangeArgumentInput!) {
    changeArgument(input: $input) {
      argument {
        id
        ...ArgumentItem_argument
      }
    }
  }
`;

const commit = (
  variables: ChangeArgumentMutationVariables,
): Promise<ChangeArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

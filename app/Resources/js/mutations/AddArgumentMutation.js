// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddArgumentMutationVariables,
  AddArgumentMutationResponse,
} from './__generated__/AddArgumentMutation.graphql';

const mutation = graphql`
  mutation AddArgumentMutation($input: AddArgumentInput!) {
    addArgument(input: $input) {
      argument {
        id
      }
    }
  }
`;

const commit = (variables: AddArgumentMutationVariables): Promise<AddArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

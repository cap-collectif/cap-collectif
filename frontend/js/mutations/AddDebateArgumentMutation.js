// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateArgumentMutationVariables,
  AddDebateArgumentMutationResponse,
} from '~relay/AddDebateArgumentMutation.graphql';

const mutation = graphql`
  mutation AddDebateArgumentMutation($input: CreateDebateArgumentInput!) {
    createDebateArgument(input: $input) {
      errorCode
      debateArgument {
        debate {
          id
        }
        author {
          id
        }
        body
        type
      }
    }
  }
`;

const commit = (
  variables: AddDebateArgumentMutationVariables,
): Promise<AddDebateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

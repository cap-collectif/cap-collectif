// @flow
import { graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateAnonymousArgumentMutationVariables,
  AddDebateAnonymousArgumentMutationResponse,
} from '~relay/AddDebateAnonymousArgumentMutation.graphql';

const mutation = graphql`
  mutation AddDebateAnonymousArgumentMutation($input: CreateDebateAnonymousArgumentInput!) {
    createDebateAnonymousArgument(input: $input) {
      errorCode
      token
      debateArgument {
        id
        type
        createdAt
      }
    }
  }
`;

const commit = (
  variables: AddDebateAnonymousArgumentMutationVariables,
): Promise<AddDebateAnonymousArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

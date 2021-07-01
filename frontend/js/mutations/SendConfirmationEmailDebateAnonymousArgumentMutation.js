// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SendConfirmationEmailDebateAnonymousArgumentMutationResponse,
  SendConfirmationEmailDebateAnonymousArgumentMutationVariables,
} from '~relay/SendConfirmationEmailDebateAnonymousArgumentMutation.graphql';

const mutation = graphql`
  mutation SendConfirmationEmailDebateAnonymousArgumentMutation(
    $input: SendConfirmationEmailDebateAnonymousArgumentInput!
  ) {
    sendConfirmationEmailDebateAnonymousArgument(input: $input) {
      errorCode
      debateArgument {
        id
      }
    }
  }
`;

const commit = (
  variables: SendConfirmationEmailDebateAnonymousArgumentMutationVariables,
): Promise<SendConfirmationEmailDebateAnonymousArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

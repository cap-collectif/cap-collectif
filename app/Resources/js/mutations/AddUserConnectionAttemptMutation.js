// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddUserConnectionAttemptMutationVariables,
  AddUserConnectionAttemptMutationResponse,
} from '~relay/AddUserConnectionAttemptMutation.graphql';

const mutation = graphql`
  mutation AddUserConnectionAttemptMutation ($input: AddUserConnectionAttemptInput!) {
    addUserConnectionAttempt(input: $input) {
      userConnectionAttempt{
        id
        email
        datetime
        ipAddress
      }
    }
  }
`;

const commit = (variables:  AddUserConnectionAttemptMutationVariables): Promise<AddUserConnectionAttemptMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

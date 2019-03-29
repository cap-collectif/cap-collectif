// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddUsersToGroupFromEmailMutationVariables,
  AddUsersToGroupFromEmailMutationResponse,
} from './__generated__/AddUsersToGroupFromEmailMutation.graphql';

const mutation = graphql`
  mutation AddUsersToGroupFromEmailMutation($input: AddUsersToGroupFromEmailInput!) {
    addUsersToGroupFromEmail(input: $input) {
      importedUsers {
        id
        email
      }
      notFoundEmails
      alreadyImportedUsers {
        id
      }
    }
  }
`;

const commit = (
  variables: AddUsersToGroupFromEmailMutationVariables,
): Promise<AddUsersToGroupFromEmailMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

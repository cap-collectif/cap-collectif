// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteAccountVariables,
  DeleteAccountResponse,
} from './__generated__/DeleteAccountMutation.graphql';

const mutation = graphql`
  mutation DeleteAccountMutation($input: DeleteUserContributionsInput!) {
    deleteUserContributions(input: $input) {
      userId
    }
  }
`;

const commit = (variables: DeleteAccountVariables): Promise<DeleteAccountResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

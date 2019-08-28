// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteAccountMutationVariables,
  DeleteAccountMutationResponse,
} from '~relay/DeleteAccountMutation.graphql';

const mutation = graphql`
  mutation DeleteAccountMutation($input: DeleteAccountInput!) {
    deleteAccount(input: $input) {
      userId
    }
  }
`;

const commit = (
  variables: DeleteAccountMutationVariables,
): Promise<DeleteAccountMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

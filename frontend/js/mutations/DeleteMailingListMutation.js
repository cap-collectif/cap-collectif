// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteMailingListMutationVariables,
  DeleteMailingListMutationResponse,
} from '~relay/DeleteMailingListMutation.graphql';

/**
 * The @deleteRecord will accept multiple ids soon (I hope, cc https://github.com/facebook/relay/pull/3135)
 */

const mutation = graphql`
  mutation DeleteMailingListMutation($input: DeleteMailingListInput!) {
    deleteMailingList(input: $input) {
      deletedIds
      error
    }
  }
`;

const commit = (
  variables: DeleteMailingListMutationVariables,
): Promise<DeleteMailingListMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };

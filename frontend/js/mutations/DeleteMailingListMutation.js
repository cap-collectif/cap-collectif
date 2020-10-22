// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteMailingListMutationVariables,
  DeleteMailingListMutationResponse,
} from '~relay/DeleteMailingListMutation.graphql';
import { createQueryVariables } from '~/components/Admin/Emailing/EmailingList/EmailingListPage';
import type { DashboardParameters } from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList.reducer';

type Variables = {|
  ...DeleteMailingListMutationVariables,
  parametersConnection: DashboardParameters,
|};

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

const updater = (store, variables: Variables) => {
  const { parametersConnection } = variables;
  const { term } = createQueryVariables(parametersConnection);
  const root = store.get('client:root');

  const mailingLists = ConnectionHandler.getConnection(root, 'DashboardMailingList_mailingLists', {
    term,
  });

  if (!mailingLists) return;

  const deletedMailingListsIds = store.getRootField('deleteMailingList').getValue('deletedIds');

  deletedMailingListsIds.forEach(mailingList => {
    ConnectionHandler.deleteNode(mailingLists, mailingList);
  });

  // Update count
  const countMailingList = ((mailingLists.getValue('totalCount'): any): number);
  mailingLists.setValue(countMailingList - deletedMailingListsIds.length, 'totalCount');
};

const commit = (variables: Variables): Promise<DeleteMailingListMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: store => updater(store, variables),
  });

export default { commit };

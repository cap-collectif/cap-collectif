// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import AdminEventListPage, {
  AdminEventListPageQuery,
} from '~/components/Admin/Event/EventList/AdminEventListPage';
import { EVENT_LIST_PAGINATION } from '~/components/Admin/Event/EventList/AdminEventList';

type Props = {|
  +isAdmin: boolean,
|};

const AdminEventListQuery = ({ isAdmin }: Props): React.Node => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader(AdminEventListPageQuery);
  React.useEffect(() => {
    loadQuery({
      count: EVENT_LIST_PAGINATION,
      cursor: null,
      term: null,
      status: null,
      affiliations: isAdmin ? null : ['OWNER'],
      orderBy: { field: 'START_AT', direction: 'DESC' },
    });
    return () => {
      disposeQuery();
    };
  }, [disposeQuery, loadQuery, isAdmin]);
  return queryReference ? (
    <AdminEventListPage isAdmin={isAdmin} queryReference={queryReference} />
  ) : null;
};

export default AdminEventListQuery;

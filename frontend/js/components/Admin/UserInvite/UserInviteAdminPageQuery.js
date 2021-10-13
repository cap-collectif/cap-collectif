// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import UserInviteAdminPage, {UserInviteAdminPageQuery} from "~/components/Admin/UserInvite/UserInviteAdminPage";
import {CONNECTION_NODES_PER_PAGE} from "~/components/Admin/UserInvite/UserInviteList.relay";

const UserInviteAdminPageQueryRender = (): React.Node => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader(UserInviteAdminPageQuery);

  React.useEffect(() => {
    loadQuery({
      first: CONNECTION_NODES_PER_PAGE,
      cursor: null,
      term: null,
      status: null
    });
    return () => {
      disposeQuery();
    };
  }, [loadQuery, disposeQuery]);

  return queryReference ? (
      <UserInviteAdminPage queryReference={queryReference} />
  ) : null;
};

export default UserInviteAdminPageQueryRender;

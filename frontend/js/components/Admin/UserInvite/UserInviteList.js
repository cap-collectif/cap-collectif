// @flow
import * as React from 'react';
import { usePagination } from 'relay-hooks';
import ReactPlaceholder from 'react-placeholder';
import { FormattedMessage } from 'react-intl';
import * as S from '~/components/Admin/UserInvite/UserInviteAdminPage.style';
import PickableList from '~ui/List/PickableList';
import {
  CONNECTION_CONFIG,
  CONNECTION_NODES_PER_PAGE,
  FRAGMENT,
  type RelayProps,
} from '~/components/Admin/UserInvite/UserInviteList.relay';
import AnalysisProposalListLoader from '~/components/Analysis/AnalysisProposalListLoader/AnalysisProposalListLoader';
import PickableListPlaceholder from '~ui/List/PickableList/placeholder';
import UserInviteListRow from '~/components/Admin/UserInvite/UserInviteListRow';
import UserInviteListHeader from '~/components/Admin/UserInvite/UserInviteListHeader';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';

type Props = {|
  ...RelayProps,
|};

export const UserInviteList = ({ query: queryFragment }: Props) => {
  const [query, { hasMore, loadMore }] = usePagination(FRAGMENT, queryFragment);
  const { startLoading, stopLoading, isLoading } = useLoadingMachine();
  const invitations = query?.userInvitations.edges.map(edge => edge.node) ?? [];
  const hasInvitations = invitations.length > 0;
  return (
    <ReactPlaceholder ready={!!query} customPlaceholder={<PickableListPlaceholder />}>
      <PickableList.Provider>
        <S.UserInviteList
          isLoading={isLoading}
          useInfiniteScroll
          onScrollToBottom={() => {
            loadMore(CONNECTION_CONFIG, CONNECTION_NODES_PER_PAGE, error => {
              console.error(error);
            });
          }}
          hasMore={hasMore()}
          loader={<AnalysisProposalListLoader key="loader" />}>
          <PickableList.Header isSelectable={hasInvitations}>
            <UserInviteListHeader onStartLoading={startLoading} onStopLoading={stopLoading} />
          </PickableList.Header>
          <PickableList.Body>
            {hasInvitations ? (
              invitations.map(invitation => (
                <UserInviteListRow
                  key={invitation.id}
                  rowId={invitation.id}
                  invitation={invitation}
                />
              ))
            ) : (
              <PickableList.Row isSelectable={false}>
                <FormattedMessage tagName="p" id="no_result" />
              </PickableList.Row>
            )}
          </PickableList.Body>
        </S.UserInviteList>
      </PickableList.Provider>
    </ReactPlaceholder>
  );
};

export default UserInviteList;

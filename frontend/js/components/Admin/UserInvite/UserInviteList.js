// @flow
import * as React from 'react';
import { usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import {
  CONNECTION_NODES_PER_PAGE,
  FRAGMENT,
} from '~/components/Admin/UserInvite/UserInviteList.relay';
import Skeleton from '~ds/Skeleton';
import Table from '~ds/Table';
import Button from '~ds/Button/Button';
import CancelUserInvitationsMutation from '~/mutations/CancelUserInvitationsMutation';
import { toast } from '~ds/Toast';
import TablePlaceholder from '~ds/Table/placeholder';
import type {
  UserInviteList_query$key,
  UserInviteStatus,
} from '~relay/UserInviteList_query.graphql';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import Tag from '~ds/Tag/Tag';
import Menu from "~ds/Menu/Menu";
import Text from "~ui/Primitives/Text";
import {ICON_NAME} from "~ds/Icon/Icon";

export type Status = "PENDING" | "FAILED" | "ALL" | "EXPIRED";

type Props = {|
  +query: UserInviteList_query$key,
  +status: Status,
  +setStatus: (status: any) => void,
  +term: string
|};

const StatusTag = ({ status }: { status: ?UserInviteStatus }) => {
  const intl = useIntl();
  if (status === 'PENDING')
    return <Tag variant="orange">{intl.formatMessage({ id: 'waiting' })}</Tag>;
  if (status === 'EXPIRED')
    return <Tag variant="gray">{intl.formatMessage({ id: 'global.expired.feminine' })}</Tag>;
  if (status === 'FAILED')
    return <Tag variant="red">{intl.formatMessage({ id: 'sending.failure' })}</Tag>;
  return null;
};

export const UserInviteList = ({ query: queryFragment, status, setStatus, term }: Props): React.Node => {
  const intl = useIntl();
  const { data, hasNext, loadNext, refetch } = usePaginationFragment(FRAGMENT, queryFragment);
  const invitations = data?.userInvitations?.edges?.map(edge => edge?.node).filter(Boolean) ?? [];
  const hasInvitations = invitations.length > 0;
  const firstRendered = React.useRef(null)
  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({status: status === "ALL" ? null : status, term: term || null})
    }
    firstRendered.current = true
  }, [term, status, refetch])

  const groupsText = (userInvite): string => {
    return userInvite?.groups?.edges && userInvite?.groups?.edges?.length > 0
      ? userInvite?.groups?.edges
          ?.map(edge => edge?.node?.title)
          ?.filter(Boolean)
          ?.reduce((acc, title) => `${acc} / ${title}`)
      : '-';
  };

  const cancelInvite = async invitationsIds => {
    try {
      await CancelUserInvitationsMutation.commit({
        input: {
          invitationsIds,
        },
      });
    } catch (e) {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
      });
    }
  };

  return (
    <Skeleton isLoaded={!!data} placeholder={<TablePlaceholder columnsCount={5} rowsCount={5} />}>
      <Table
        selectable
        isLoading={!hasInvitations}
        actionBar={({ selectedRows }) => (
          <Button
            variantSize="small"
            variant="secondary"
            variantColor="danger"
            onClick={() => cancelInvite(selectedRows)}>
            {intl.formatMessage({ id: 'global.remove' })}
          </Button>
        )}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.invitations' })}</Table.Th>
            <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.role' })}</Table.Th>
            <Table.Th noPlaceholder>{intl.formatMessage({ id: 'admin.label.group' })}</Table.Th>
            <Table.Th noPlaceholder>
              {({ styles }) => (
                <Menu>
                  <Menu.Button as={React.Fragment}>
                    <Button rightIcon={ICON_NAME.ARROW_DOWN_O} {...styles}>
                      {intl.formatMessage({ id: 'admin.fields.step.group_statuses' })}
                    </Button>
                  </Menu.Button>
                  <Menu.List>
                    <Menu.OptionGroup
                      value={status}
                      onChange={value => setStatus(((value: any): string))}
                      type="radio"
                      title={intl.formatMessage({ id: 'action_show' })}>
                      <Menu.OptionItem value="ALL">
                        <Text>{intl.formatMessage({ id: 'global.select_statuses' })}</Text>
                      </Menu.OptionItem>
                      <Menu.OptionItem value="EXPIRED">
                        <Text>{intl.formatMessage({ id: 'global.expired.feminine' })}</Text>
                      </Menu.OptionItem>
                      <Menu.OptionItem value="FAILED">
                        <Text>{intl.formatMessage({ id: 'sending.failure' })}</Text>
                      </Menu.OptionItem>
                      <Menu.OptionItem value="PENDING">
                        <Text>{intl.formatMessage({ id: 'waiting' })}</Text>
                      </Menu.OptionItem>
                    </Menu.OptionGroup>
                  </Menu.List>
                </Menu>
              )}
            </Table.Th>
            <Table.Th noPlaceholder> </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody
          useInfiniteScroll
          onScrollToBottom={() => {
            loadNext(CONNECTION_NODES_PER_PAGE);
          }}
          hasMore={hasNext}>
          {invitations.map(userInvite => (
            <Table.Tr key={userInvite?.id} rowId={userInvite?.id} checkboxLabel={userInvite?.email}>
              <Table.Td>{userInvite?.email}</Table.Td>
              <Table.Td>
                {(() => {
                  if (userInvite?.isProjectAdmin) {
                    return intl.formatMessage({ id: 'roles.project_admin' });
                  }
                  if (userInvite?.isAdmin) {
                    return intl.formatMessage({ id: 'roles.admin' });
                  }
                  return intl.formatMessage({ id: 'roles.user' });
                })()}
              </Table.Td>
              <Table.Td>{groupsText(userInvite)}</Table.Td>
              <Table.Td>
                <StatusTag status={userInvite?.status} />
              </Table.Td>
              <Table.Td>
                <ButtonGroup>
                  <ButtonQuickAction
                    icon="TRASH"
                    label={intl.formatMessage({id: 'global.delete'})}
                    variantColor="danger"
                    onClick={() => cancelInvite([userInvite?.id])}
                  />
                </ButtonGroup>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Skeleton>
  );
};

export default UserInviteList;

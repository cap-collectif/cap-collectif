import * as React from 'react'
import { usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Flex, Table, Text } from '@cap-collectif/ui'
import { FRAGMENT } from '@components/BackOffice/UserInvitation/UserInviteList.relay'
import CancelUserInvitationsMutation from '@mutations/CancelUserInvitationsMutation'
import { UserInviteList_query$key } from '@relay/UserInviteList_query.graphql'
import UserInviteRelaunchInvitations from '@components/BackOffice/UserInvitation/relaunch-modal/UserInviteRelaunchInvitations'
import UserInviteCancelInvitations from '@components/BackOffice/UserInvitation/delete-modal/UserInviteCancelInvitations'
import StatusTag from '@components/BackOffice/UserInvitation/StatusTag'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/UserInvitation/utils'
import { Invitation, Status } from './UserInvite.type'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import EmptyMessage from '@ui/Table/EmptyMessage'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'

type Props = {
  readonly query: UserInviteList_query$key
  readonly status: Status
  readonly setStatus: (status: Status) => void
  readonly term: string
  readonly setTerm: (term: string) => void
}

export const UserInviteList = ({ query: queryFragment, status, setStatus, term, setTerm }: Props): JSX.Element => {
  const intl = useIntl()
  const { data, hasNext, loadNext, refetch } = usePaginationFragment(FRAGMENT, queryFragment)
  const invitations = data?.userInvitations?.edges?.map(edge => edge?.node).filter(Boolean) ?? []
  const firstRendered = React.useRef(null)
  const { contentRef } = useLayoutContext()

  const [isSearching, setIsSearching] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (firstRendered.current) {
      setIsSearching(true)
    } else {
      firstRendered.current = true
    }
  }, [term, status])

  React.useEffect(() => {
    if (isSearching) {
      refetch(
        { status: status === 'ALL' ? null : status, term: term || null },
        {
          onComplete: () => {
            setIsSearching(false)
          },
        },
      )
    }
  }, [isSearching, refetch, status, term])

  const groupsText = (userInvite: Invitation): string => {
    const groups = userInvite?.groups?.edges || []
    if (groups.length === 0) return '-'

    return groups
      .map(group => group?.node?.title)
      .filter(Boolean)
      .join(' / ')
  }

  const cancelInvite = async (invitationsEmails: string[]) => {
    try {
      await CancelUserInvitationsMutation.commit({
        input: {
          invitationsEmails,
        },
      })
    } catch (e) {
      mutationErrorToast(intl)
    }
  }

  const statusesOptions = [
    { label: intl.formatMessage({ id: 'global.select_statuses' }), value: 'ALL' },
    { label: intl.formatMessage({ id: 'global.expired.feminine' }), value: 'EXPIRED' },
    { label: intl.formatMessage({ id: 'sending.failure' }), value: 'FAILED' },
    { label: intl.formatMessage({ id: 'waiting' }), value: 'PENDING' },
    { label: intl.formatMessage({ id: 'global.accepted.feminine' }), value: 'ACCEPTED' },
  ]

  return (
    <Table
      selectable
      emptyMessage={
        <EmptyMessage
          onReset={() => {
            setTerm('')
          }}
        />
      }
      isLoading={isSearching}
      actionBar={({ selectedRows }) => {
        const invitationsToRelaunch = invitations.filter(
          invitation => selectedRows.includes(invitation?.email) && invitation.status === 'EXPIRED',
        )
        return (
          <Flex direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
            <Text>{intl.formatMessage({ id: 'global.selected-rows' }, { count: selectedRows.length })}</Text>
            <Flex>
              <UserInviteCancelInvitations invitations={selectedRows} />
              <UserInviteRelaunchInvitations invitations={invitationsToRelaunch} />
            </Flex>
          </Flex>
        )
      }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th noPlaceholder>
            {intl.formatMessage({
              id: 'global.invitations',
            })}
          </Table.Th>
          <Table.Th noPlaceholder>
            {intl.formatMessage({
              id: 'global.role',
            })}
          </Table.Th>
          <Table.Th noPlaceholder>
            {intl.formatMessage({
              id: 'admin.label.group',
            })}
          </Table.Th>
          <Table.Th noPlaceholder>
            <Table.Menu
              label={intl.formatMessage({
                id: 'admin.fields.step.group_statuses',
              })}
            >
              <Table.Menu.OptionGroup
                value={status}
                onChange={setStatus}
                type="radio"
                title={intl.formatMessage({ id: 'action_show' })}
              >
                {statusesOptions.map(option => (
                  <Table.Menu.OptionItem key={option.value} value={option.value}>
                    {option.label}
                  </Table.Menu.OptionItem>
                ))}
              </Table.Menu.OptionGroup>
            </Table.Menu>
          </Table.Th>
          <Table.Th noPlaceholder> </Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody
        useInfiniteScroll
        onScrollToBottom={() => {
          loadNext(CONNECTION_NODES_PER_PAGE)
        }}
        scrollParentRef={contentRef}
        hasMore={hasNext}
      >
        {invitations.map(userInvite => (
          <Table.Tr key={userInvite?.id} rowId={userInvite?.email} checkboxLabel={userInvite?.email}>
            <Table.Td>{userInvite?.email}</Table.Td>
            <Table.Td>
              {userInvite?.isProjectAdmin
                ? intl.formatMessage({
                    id: 'roles.project_admin',
                  })
                : userInvite?.isAdmin
                ? intl.formatMessage({
                    id: 'roles.admin',
                  })
                : intl.formatMessage({
                    id: 'roles.user',
                  })}
            </Table.Td>
            <Table.Td>{groupsText(userInvite as Invitation)}</Table.Td>
            <Table.Td>
              <StatusTag status={userInvite?.status} />
            </Table.Td>
            <Table.Td>
              <ButtonGroup>
                <ButtonQuickAction
                  icon={CapUIIcon.Trash}
                  label={intl.formatMessage({
                    id: 'global.delete',
                  })}
                  variantColor="danger"
                  onClick={() => cancelInvite([userInvite?.email])}
                />
              </ButtonGroup>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default UserInviteList

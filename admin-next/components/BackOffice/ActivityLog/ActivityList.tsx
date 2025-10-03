import * as React from 'react'
import { CapUIBorder, CapUIIcon, Flex, Icon, Table, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import EmptyMessage from './EmptyMessage'
import { graphql, usePaginationFragment } from 'react-relay'
import type { ActivityList_query$key } from '@relay/ActivityList_query.graphql'
import { actionMenuFilterItems, CONNECTION_NODES_PER_PAGE, getLogActionType, userRoleFilterItems } from './utils'
import { LogActionType, AppLogOrder, AppLogUserRole } from '@relay/ActivityLogPageQuery.graphql'

const FRAGMENT = graphql`
  fragment ActivityList_query on Query
  @refetchable(queryName: "ActivityListPaginationQuery")
  @argumentDefinitions(
    term: { type: "String" }
    orderBy: { type: "AppLogOrder" }
    userRole: { type: "AppLogUserRole" }
    actionType: { type: "LogActionType" }
    first: { type: "Int" }
    after: { type: "String" }
    dateRange: { type: "DateRange" }
  ) {
    appLog(
      term: $term
      orderBy: $orderBy
      userRole: $userRole
      actionType: $actionType
      first: $first
      after: $after
      dateRange: $dateRange
    ) @connection(key: "ActivityList_appLog", filters: ["term", "orderBy", "userRole", "actionType", "dateRange"]) {
      edges {
        node {
          __id
          createdAt
          description
          ip
          actionType
          user {
            username
            email
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

type Props = {
  queryReference: ActivityList_query$key
  userRole: string
  setUserRole: (role: AppLogUserRole) => void
  actionType: LogActionType | 'ALL'
  setActionType: (actionType: LogActionType | 'ALL') => void
  orderBy: AppLogOrder['direction']
  setOrderBy: (direction: AppLogOrder['direction']) => void
  onReset: () => void
}

export const ActivityList: React.FC<Props> = ({
  queryReference,
  userRole,
  setUserRole,
  actionType,
  setActionType,
  orderBy,
  setOrderBy,
  onReset,
}) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()

  const {
    data: { appLog },
    loadNext,
    hasNext,
    isLoadingNext,
  } = usePaginationFragment(FRAGMENT, queryReference)

  const logs = appLog?.edges ?? []

  const getFormattedUser = (user: { username?: string; email?: string }) => {
    return (
      <>
        <Text>{user.username ?? ''}</Text>
        <Text color="text.tertiary">{user.email || ''}</Text>
      </>
    )
  }

  const handleScrollToBottom = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(CONNECTION_NODES_PER_PAGE)
    }
  }

  return (
    <Table
      emptyMessage={!isLoadingNext && logs.length === 0 ? <EmptyMessage onReset={onReset} /> : null}
      width={'100%'}
      borderRadius={CapUIBorder.Normal}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th
            noPlaceholder
            onClick={() => {
              setOrderBy(orderBy === 'ASC' ? 'DESC' : 'ASC')
            }}
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          >
            <Flex alignItems={'center'} gap={2}>
              {intl.formatMessage({
                id: 'global.date.text',
              })}
              <Icon name={CapUIIcon.InvertArrow} />
            </Flex>
          </Table.Th>
          <Table.Th noPlaceholder>
            <Table.Menu
              label={intl.formatMessage({
                id: 'roles.user',
              })}
            >
              <Table.Menu.OptionGroup
                value={userRole}
                onChange={setUserRole}
                type="radio"
                title={intl.formatMessage({ id: 'action_show' })}
              >
                {userRoleFilterItems.map(option => (
                  <Table.Menu.OptionItem key={option.value} value={option.value}>
                    {intl.formatMessage({ id: option.label })}
                  </Table.Menu.OptionItem>
                ))}
              </Table.Menu.OptionGroup>
            </Table.Menu>
          </Table.Th>
          <Table.Th noPlaceholder>
            <Table.Menu
              label={intl.formatMessage({
                id: 'activity-log.action',
              })}
            >
              <Table.Menu.OptionGroup
                value={actionType}
                onChange={setActionType}
                type="radio"
                title={intl.formatMessage({ id: 'action_show' })}
              >
                {actionMenuFilterItems.map(option => (
                  <Table.Menu.OptionItem key={option.value} value={option.value}>
                    {intl.formatMessage({ id: option.label })}
                  </Table.Menu.OptionItem>
                ))}
              </Table.Menu.OptionGroup>
            </Table.Menu>
          </Table.Th>
          <Table.Th noPlaceholder>{intl.formatMessage({ id: 'activity-log.element' })}</Table.Th>

          <Table.Th noPlaceholder>{intl.formatMessage({ id: 'activity-log.ip-address' })}</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody
        useInfiniteScroll
        onScrollToBottom={handleScrollToBottom}
        scrollParentRef={contentRef || undefined}
        hasMore={hasNext}
      >
        {logs.map(({ node: log }) => (
          <Table.Tr key={log.__id}>
            <Table.Td>
              <Text>
                {intl.formatDate(new Date(log.createdAt) ?? undefined, {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text color="text.tertiary">
                {intl.formatTime(new Date(log.createdAt) ?? undefined, {
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                })}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text>{getFormattedUser(log.user || {})}</Text>
            </Table.Td>
            <Table.Td>
              <Text>{intl.formatMessage({ id: getLogActionType(log.actionType) })}</Text>
            </Table.Td>
            <Table.Td>
              <Text>{log.description}</Text>
            </Table.Td>
            <Table.Td>
              <Text>{log.ip}</Text>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default ActivityList

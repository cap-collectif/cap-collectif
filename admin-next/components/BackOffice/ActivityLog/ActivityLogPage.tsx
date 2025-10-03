import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import type {
  ActivityLogPageQuery as ActivityLogPageQueryType,
  DateRange,
  LogActionType,
  AppLogOrder,
  AppLogUserRole,
} from '@relay/ActivityLogPageQuery.graphql'
import ActivityListHeader from './ActivityListHeader'
import ActivityList from './ActivityList'
import { Flex } from '@cap-collectif/ui'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { CONNECTION_NODES_PER_PAGE } from './utils'
import { debounce } from '@shared/utils/debounce-promise'

const QUERY = graphql`
  query ActivityLogPageQuery(
    $term: String
    $orderBy: AppLogOrder
    $userRole: AppLogUserRole
    $actionType: LogActionType
    $first: Int
    $after: String
    $dateRange: DateRange
  ) {
    ...ActivityList_query
      @arguments(
        term: $term
        orderBy: $orderBy
        userRole: $userRole
        actionType: $actionType
        first: $first
        after: $after
        dateRange: $dateRange
      )
  }
`
export const ActivityLogPage: React.FC = () => {
  const [term, setTerm] = React.useState<string>('')
  const [after, setAfter] = React.useState<string | null>(null)
  const [dateRange, setDateRange] = React.useState<DateRange>({
    startedAt: null,
    endedAt: null,
  })
  const [userRole, setUserRole] = React.useState<AppLogUserRole | 'ALL'>('ALL')
  const [actionType, setActionType] = React.useState<LogActionType | 'ALL'>('ALL')
  const [orderBy, setOrderBy] = React.useState<AppLogOrder['direction']>('DESC')

  const data = useLazyLoadQuery<ActivityLogPageQueryType>(QUERY, {
    term,
    orderBy: { field: 'CREATED_AT', direction: orderBy },
    userRole: userRole === 'ALL' ? null : userRole,
    actionType: actionType === 'ALL' ? null : actionType,
    first: CONNECTION_NODES_PER_PAGE,
    after,
    dateRange,
  })

  const onTermChange = debounce((value: string) => setTerm(value), 700)

  const onReset = () => {
    setTerm('')
    setDateRange({ startedAt: null, endedAt: null })
    setAfter(null)
    setUserRole('ALL')
    setActionType('ALL')
    setOrderBy('DESC')
  }

  return (
    <Flex
      direction="column"
      width="100%"
      spacing={6}
      bg="white"
      borderRadius="accordion"
      p={6}
      justify="flex-start"
      overflow="scroll"
      sx={{ scrollbarWidth: 'none' }}
    >
      <ActivityListHeader
        term={term}
        onTermChange={onTermChange}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onReset={onReset}
      />
      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={6} />}>
        <ActivityList
          queryReference={data}
          userRole={userRole}
          setUserRole={setUserRole}
          actionType={actionType}
          setActionType={setActionType}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          onReset={onReset}
        />
      </React.Suspense>
    </Flex>
  )
}

export default ActivityLogPage

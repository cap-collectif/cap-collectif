/* eslint-disable relay/unused-fields */
import * as React from 'react'
import { CapUIBorder, Table } from '@cap-collectif/ui'
import { CONNECTION_NODES_PER_PAGE } from './utils'
import EmptyMessage from '@ui/Table/EmptyMessage'
import { useIntl } from 'react-intl'
import DeleteGroupModal from './delete-group-modal/DeleteGroupModal'
import EditGroupModal from './edit-group-modal/EditGroupModal'
import { graphql, usePaginationFragment } from 'react-relay'
import { useLayoutContext } from '@components/Layout/Layout.context'
import { UserGroupsList_Fragment$key } from '@relay/UserGroupsList_Fragment.graphql'

const FRAGMENT = graphql`
  fragment UserGroupsList_Fragment on Query
  @argumentDefinitions(term: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "UserGroupsList_PaginationQuery") {
    groups(term: $term, first: $first, after: $cursor) @connection(key: "UserGroupsList_groups") {
      __id
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          members {
            totalCount
          }
          ...EditGroupModal_group
        }
      }
    }
  }
`

export type UserGroupsListHandle = {
  refetchForTerm: (term: string) => void
}

type Props = {
  queryReference: UserGroupsList_Fragment$key
  setConnectionId: React.Dispatch<React.SetStateAction<string>>
}

export const UserGroupsList = React.forwardRef<UserGroupsListHandle, Props>(
  ({ queryReference, setConnectionId }, ref) => {
    const intl = useIntl()
    const { contentRef } = useLayoutContext()
    const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, queryReference)

    const [isRefetching, setIsRefetching] = React.useState(false)

    React.useEffect(() => {
      setConnectionId(data.groups.__id)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.groups.__id])

    React.useImperativeHandle(
      ref,
      () => ({
        refetchForTerm(term: string) {
          setIsRefetching(true)
          refetch({ term }, { onComplete: () => setIsRefetching(false) })
        },
      }),
      [refetch],
    )

    const groups = data.groups.edges

    return (
      <Table
        emptyMessage={<EmptyMessage onReset={null} />}
        width="100%"
        isLoading={isRefetching}
        borderRadius={CapUIBorder.Normal}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.name' })}</Table.Th>
            <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.description' })}</Table.Th>
            <Table.Th noPlaceholder>{intl.formatMessage({ id: 'group.admin.users' })}</Table.Th>
            <Table.Th noPlaceholder />
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody
          useInfiniteScroll
          onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
          scrollParentRef={contentRef}
          hasMore={hasNext}
        >
          {groups.map(({ node: group }) => (
            <Table.Tr key={group.id} rowId={group.id}>
              <EditGroupModal group={group} refetch={refetch} term={''} />
              <Table.Td>{group.description}</Table.Td>
              <Table.Td isNumeric textAlign="left">
                {group.members.totalCount}
              </Table.Td>
              <Table.Td>
                <DeleteGroupModal button="quick-action" groupId={group.id} refetch={refetch} term={''} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    )
  },
)

UserGroupsList.displayName = 'UserGroupsList'

export default UserGroupsList

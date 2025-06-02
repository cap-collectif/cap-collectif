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
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "UserGroupsList_PaginationQuery") {
    groups(term: $search, first: $first, after: $cursor) @connection(key: "UserGroupsList_groups") {
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

type Props = {
  queryReference: UserGroupsList_Fragment$key
  term: string
  setTerm: React.Dispatch<React.SetStateAction<string>>
  setConnectionId: React.Dispatch<React.SetStateAction<string>>
}

export const UserGroupsList = ({ queryReference, term, setTerm, setConnectionId }: Props): JSX.Element => {
  const intl = useIntl()
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const { contentRef } = useLayoutContext()

  const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, queryReference)

  React.useEffect(() => {
    setConnectionId(data.groups.__id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.groups.__id])

  const groups = data.groups.edges
  const firstRendered = React.useRef<boolean | null>(null)

  React.useEffect(() => {
    if (firstRendered.current) {
      setIsLoading(true)
      refetch({ term: term })
    }
    firstRendered.current = true
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  return (
    <Table
      emptyMessage={
        <EmptyMessage
          onReset={() => {
            setTerm('')
          }}
        />
      }
      width={'100%'}
      isLoading={isLoading}
      borderRadius={CapUIBorder.Normal}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th noPlaceholder>
            {intl.formatMessage({
              id: 'global.name',
            })}
          </Table.Th>
          <Table.Th noPlaceholder>
            {intl.formatMessage({
              id: 'global.description',
            })}
          </Table.Th>
          <Table.Th noPlaceholder>
            {intl.formatMessage({
              id: 'group.admin.users',
            })}
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
        {groups.map(group => {
          const currentGroup = group.node
          const membersCount = currentGroup.members.totalCount
          return (
            <Table.Tr key={currentGroup.id} rowId={currentGroup.id}>
              <EditGroupModal group={currentGroup} refetch={refetch} term={term} />
              <Table.Td>{currentGroup.description}</Table.Td>
              <Table.Td isNumeric textAlign={'left'}>
                {membersCount}
              </Table.Td>

              <Table.Td>
                <DeleteGroupModal button="quick-action" groupId={currentGroup.id} refetch={refetch} term={term} />
              </Table.Td>
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

export default UserGroupsList

import * as React from 'react'
import { Button, CapUIBorder, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { pxToRem } from '@shared/utils/pxToRem'
import CreateGroupModal from '@components/BackOffice/UserGroups/create-group-modal/CreateGroupModal'
import { graphql, GraphQLTaggedNode, PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay'
import type { groups_Query as groupsQueryType } from '__generated__/groups_Query.graphql'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/UserInvitation/utils'
import Layout from '@components/BackOffice/Layout/Layout'
import UserGroupsList, { UserGroupsListHandle } from '@components/BackOffice/UserGroups/UserGroupsList'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'

const groupsQuery: GraphQLTaggedNode = graphql`
  query groups_Query($term: String, $first: Int) {
    ...UserGroupsList_Fragment @arguments(term: $term, first: $first)
  }
`

const UserGroupsTab = ({ queryReference }: { queryReference: PreloadedQuery<groupsQueryType> }): React.JSX.Element => {
  const intl = useIntl()

  const query = usePreloadedQuery<groupsQueryType>(groupsQuery, queryReference)
  const listRef = React.useRef<UserGroupsListHandle>(null)

  const [term, setTerm] = React.useState<string>('')
  const [connectionId, setConnectionId] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const onTermChange = React.useRef(
    debounce((value: string) => {
      setTerm(value)
      setIsLoading(false)
      listRef.current?.refetchForTerm(value)
    }, 400),
  ).current

  const handleTermChange = (value: string) => {
    setIsLoading(Boolean(value))
    onTermChange(value)
  }

  return (
    <Flex direction="column" spacing={6} height="100%" justify="flex-start">
      <Flex
        direction="column"
        width="100%"
        spacing={6}
        bg="white"
        borderRadius={CapUIBorder.Card}
        p={8}
        justify="flex-start"
        height="100%"
        overflow="scroll"
        sx={{ scrollbarWidth: 'none' }}
      >
        <Flex alignItems="center" spacing={6}>
          <CreateGroupModal connectionId={connectionId} />
          <Button
            variant="secondary"
            variantColor="primary"
            leftIcon={CapUIIcon.Download}
            onClick={() => window?.open('/export-user-groups', '_blank')}
            sx={{ cursor: 'pointer' }}
          >
            {intl.formatMessage({ id: 'global.export' })}
          </Button>
          <Search
            width={pxToRem(270)}
            onChange={handleTermChange}
            value={term}
            placeholder={intl.formatMessage({ id: 'global.search' })}
            isLoading={isLoading}
          />
        </Flex>

        <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={4} />}>
          <UserGroupsList ref={listRef} queryReference={query} setConnectionId={setConnectionId} />
        </React.Suspense>
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = withPageAuthRequired

const UserGroupsAdminPageQueryRender = (): JSX.Element => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<groupsQueryType>(groupsQuery)
  const intl = useIntl()

  React.useEffect(() => {
    loadQuery({
      term: null,
      first: CONNECTION_NODES_PER_PAGE,
    })
    return () => {
      if (disposeQuery) {
        disposeQuery()
      }
    }
  }, [loadQuery, disposeQuery])

  return (
    <Layout
      navTitle={intl.formatMessage({
        id: 'group_list',
      })}
    >
      {queryReference ? (
        <React.Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <UserGroupsTab queryReference={queryReference} />
        </React.Suspense>
      ) : null}
    </Layout>
  )
}

export default UserGroupsAdminPageQueryRender

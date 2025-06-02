import * as React from 'react'
import { Button, CapUIIcon, Flex, Search } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { pxToRem } from '@shared/utils/pxToRem'
import CreateGroupModal from '@components/UserGroups/create-group-modal/CreateGroupModal'
import { graphql, GraphQLTaggedNode, PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay'
import type { groups_Query as groupsQueryType } from '__generated__/groups_Query.graphql'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { CONNECTION_NODES_PER_PAGE } from '@components/UserInvitation/utils'
import Layout from '@components/Layout/Layout'
import UserGroupsList from '@components/UserGroups/UserGroupsList'
import debounce from '@shared/utils/debounce-promise'

type Props = {
  queryReference: PreloadedQuery<groupsQueryType>
}

const groupsQuery: GraphQLTaggedNode = graphql`
  query groups_Query($search: String, $first: Int) {
    ...UserGroupsList_Fragment @arguments(search: $search, first: $first)
  }
`

const UsersGroupsTab = ({ queryReference }: Props): React.JSX.Element => {
  const intl = useIntl()

  const query = usePreloadedQuery<groupsQueryType>(groupsQuery, queryReference)
  const [term, setTerm] = React.useState<string>('')
  const [connectionId, setConnectionId] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const onTermChange = React.useCallback(
    debounce((value: string) => {
      setTerm(value)
      setIsLoading(false)
    }, 1000),
    [],
  )

  const handleTermChange = (value: string) => {
    setIsLoading(true)
    if (value === '') {
      setIsLoading(false)
    }
    onTermChange(value)
  }

  return (
    <Layout
      navTitle={intl.formatMessage({
        id: 'group_list',
      })}
    >
      <Flex
        direction="column"
        width="100%"
        spacing={6}
        bg="white"
        borderRadius="accordion"
        p={6}
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

        <UserGroupsList queryReference={query} term={term} setTerm={setTerm} setConnectionId={setConnectionId} />
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

const UsersGroupsAdminPageQueryRender = (): JSX.Element => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<groupsQueryType>(groupsQuery)

  React.useEffect(() => {
    loadQuery({
      search: null,
      first: CONNECTION_NODES_PER_PAGE,
    })
    return () => {
      if (disposeQuery) {
        disposeQuery()
      }
    }
  }, [loadQuery, disposeQuery])

  return queryReference ? <UsersGroupsTab queryReference={queryReference} /> : null
}

export default UsersGroupsAdminPageQueryRender

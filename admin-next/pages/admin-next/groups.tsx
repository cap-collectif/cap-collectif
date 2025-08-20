import * as React from 'react'
import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { pxToRem } from '@shared/utils/pxToRem'
import CreateGroupModal from '@components/BackOffice/UserGroups/create-group-modal/CreateGroupModal'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import Layout from '@components/BackOffice/Layout/Layout'
import UserGroupsList from '@components/BackOffice/UserGroups/UserGroupsList'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import debounce from '@shared/utils/debounce-promise'
import { groups_Query } from '@relay/groups_Query.graphql'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/UserGroups/utils'
import TablePlaceholder from '@components/BackOffice/UI/Table/TablePlaceholder'

const QUERY: GraphQLTaggedNode = graphql`
  query groups_Query($term: String, $first: Int) {
    ...UserGroupsList_query @arguments(term: $term, first: $first)
  }
`

const UserGroupsTab: React.FC = () => {
  const intl = useIntl()

  const [term, setTerm] = React.useState<string>('')
  const [connectionId, setConnectionId] = React.useState<string>('')

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const queryReference = useLazyLoadQuery<groups_Query>(QUERY, { term, first: CONNECTION_NODES_PER_PAGE })

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p={8} justify="flex-start">
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
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'global.search' })}
        />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={4} />}>
        <UserGroupsList
          queryReference={queryReference}
          setConnectionId={setConnectionId}
          term={term}
          setTerm={setTerm}
        />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withPageAuthRequired

const UserGroupsAdminPageQueryRender: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout
      navTitle={intl.formatMessage({
        id: 'group_list',
      })}
    >
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <UserGroupsTab />
      </React.Suspense>
    </Layout>
  )
}

export default UserGroupsAdminPageQueryRender

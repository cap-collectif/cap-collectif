import * as React from 'react'
import Layout from '@components/BackOffice/Layout/Layout'
import { Flex, Spinner, CapUIIconSize, CapUIBorder } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { NextPage } from 'next'
import { useIntl } from 'react-intl'
import { PageProps } from 'types'
import UserTypesList from '@components/BackOffice/UserTypes/UserTypesList'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { userTypes_Query } from '@relay/userTypes_Query.graphql'
import UserTypeModal from '@components/BackOffice/UserTypes/UserTypeModal'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/UserTypes/utils'
import { formatConnectionPath } from '@utils/relay'

const QUERY: GraphQLTaggedNode = graphql`
  query userTypes_Query($first: Int, $cursor: String) {
    __id
    ...UserTypesList_query @arguments(first: $first, cursor: $cursor)
  }
`

const UserTypes: React.FC = () => {
  const queryReference = useLazyLoadQuery<userTypes_Query>(QUERY, { first: CONNECTION_NODES_PER_PAGE, cursor: null })

  const connectionId = formatConnectionPath([queryReference.__id], 'UserTypesList_userTypes')

  return (
    <Flex direction="column" spacing={6} height="100%" justify="flex-start">
      <Flex
        direction="column"
        spacing={6}
        bg="white"
        borderRadius={CapUIBorder.Card}
        p={6}
        justify="flex-start"
        height="100%"
        overflow="scroll"
        sx={{ scrollbarWidth: 'none' }}
      >
        <UserTypeModal connectionId={connectionId} />

        <React.Suspense
          fallback={<Spinner size={CapUIIconSize.Xxl} color="gray.150" mx="auto" width="100%" alignItems="center" />}
        >
          <Flex direction="row" wrap="wrap" gap={4}>
            <UserTypesList queryReference={queryReference} connectionId={connectionId} />
          </Flex>
        </React.Suspense>
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = withPageAuthRequired

const UserTypesAdminPageQueryRender: NextPage<PageProps> = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'global.users' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <UserTypes />
      </React.Suspense>
    </Layout>
  )
}

export default UserTypesAdminPageQueryRender

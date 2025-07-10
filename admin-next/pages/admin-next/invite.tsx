import * as React from 'react'
import Layout from '@components/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { graphql, GraphQLTaggedNode, PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay'
import type { inviteQuery as inviteQueryType } from '@relay/inviteQuery.graphql'
import { CONNECTION_NODES_PER_PAGE } from '@components/UserInvitation/utils'
import UserInviteAdminPageHeader from '@components/UserInvitation/UserInviteAdminPageHeader'
import UserInviteList from '@components/UserInvitation/UserInviteList'
import { Status } from '@components/UserInvitation/UserInvite.type'

type Props = {
  queryReference: PreloadedQuery<inviteQueryType>
}

export const inviteQuery: GraphQLTaggedNode = graphql`
  query inviteQuery($first: Int, $cursor: String, $term: String, $status: UserInviteStatus) {
    allInvitations: userInvitations(first: 0) {
      totalCount
    }
    pendingInvitations: userInvitations(status: PENDING, first: 0) {
      totalCount
    }
    acceptedInvitations: userInvitations(status: ACCEPTED, first: 0) {
      totalCount
    }
    ...UserInviteList_query @arguments(first: $first, cursor: $cursor, term: $term, status: $status)
    ...UserInviteAdminPageHeader_query
  }
`

const InvitePage = ({ queryReference }: Props): React.JSX.Element => {
  const methods = useForm()
  const [term, setTerm] = React.useState<string>('')
  const [status, setStatus] = React.useState<Status>('ALL')

  const query = usePreloadedQuery<inviteQueryType>(inviteQuery, queryReference)

  const { allInvitations, pendingInvitations, acceptedInvitations } = query

  return (
    <Flex direction="column" spacing={6} height="100%" justify="flex-start">
      <Flex
        direction="column"
        spacing={6}
        bg="white"
        borderRadius="accordion"
        p={6}
        justify="flex-start"
        width={'100%'}
        height={'100%'}
      >
        <FormProvider {...methods}>
          <UserInviteAdminPageHeader
            query={query}
            term={term}
            setTerm={setTerm}
            values={{
              total: allInvitations.totalCount,
              pending: pendingInvitations.totalCount,
              accepted: acceptedInvitations.totalCount,
            }}
          />
          <UserInviteList query={query} status={status as Status} setStatus={setStatus} term={term} setTerm={setTerm} />
        </FormProvider>
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = withPageAuthRequired

const UserInviteAdminPageQueryRender = (): JSX.Element => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<inviteQueryType>(inviteQuery)
  const intl = useIntl()

  React.useEffect(() => {
    loadQuery({
      first: CONNECTION_NODES_PER_PAGE,
      cursor: null,
      term: null,
      status: null,
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
        id: 'user-invite-admin-page-title',
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
          <InvitePage queryReference={queryReference} />
        </React.Suspense>
      ) : null}
    </Layout>
  )
}

export default UserInviteAdminPageQueryRender

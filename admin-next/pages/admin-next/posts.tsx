import * as React from 'react'
import type { PreloadedQuery } from 'react-relay'
import { graphql, usePreloadedQuery, useQueryLoader } from 'react-relay'
import { useIntl } from 'react-intl'
import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import { NextPage } from 'next'
import { PageProps } from 'types'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import type { postsQuery as postsQueryType } from '@relay/postsQuery.graphql'
import PostList, { POST_LIST_PAGINATION } from '@components/Posts/PostList'
import PostListNoResult from '@components/Posts/PostListNoResult'
import Layout from '@components/Layout/Layout'

export interface PostListPageProps {
  queryReference: PreloadedQuery<postsQueryType>
  isAdmin: boolean
}

export const PostListPageQuery = graphql`
  query postsQuery(
    $count: Int!
    $cursor: String
    $term: String
    $affiliations: [PostAffiliation!]
    $orderBy: PostOrder
  ) {
    viewer {
      id
      allPosts: posts(affiliations: $affiliations) {
        totalCount
      }
      organizations {
        allPosts: posts(affiliations: $affiliations) {
          totalCount
        }
        ...PostList_postOwner
          @arguments(count: $count, cursor: $cursor, term: $term, affiliations: $affiliations, orderBy: $orderBy)
      }
      ...PostList_viewer
      ...PostList_postOwner
        @arguments(count: $count, cursor: $cursor, term: $term, affiliations: $affiliations, orderBy: $orderBy)
    }
  }
`

const PostListPage: React.FC<PostListPageProps> = ({ queryReference }) => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')
  const query = usePreloadedQuery<postsQueryType>(PostListPageQuery, queryReference)
  const { viewer } = query
  const organization = viewer.organizations?.[0]
  const hasPosts = viewer.allPosts.totalCount > 0 || (organization?.allPosts?.totalCount ?? 0) > 0
  const onTermChange = debounce((value: string) => setTerm(value), 400)

  return (
    <Flex direction="column" spacing={6}>
      {hasPosts ? (
        <Flex direction="column" p={8} spacing={4} m={6} bg="white" borderRadius="normal" overflow="hidden">
          <Flex direction="row">
            <Button
              data-cy="create-post-button"
              variant="primary"
              variantColor="primary"
              variantSize="small"
              leftIcon={CapUIIcon.Add}
              onClick={() => window.open('/admin-next/post', '_self')}
              mr={8}
            >
              {intl.formatMessage({ id: 'admin-create-post' })}
            </Button>

            <Search
              id="search-post"
              onChange={onTermChange}
              value={term}
              placeholder={intl.formatMessage({ id: 'search-article' })}
            />
          </Flex>
          <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={6} />}>
            <PostList
              viewer={query.viewer}
              postOwner={organization ?? viewer}
              term={term}
              resetTerm={() => setTerm('')}
            />
          </React.Suspense>
        </Flex>
      ) : (
        <PostListNoResult />
      )}
    </Flex>
  )
}

const Posts: NextPage<PageProps> = ({ viewerSession }) => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<postsQueryType>(PostListPageQuery)
  const intl = useIntl()
  React.useEffect(() => {
    loadQuery({
      count: POST_LIST_PAGINATION,
      cursor: null,
      term: null,
      affiliations: viewerSession.isAdmin ? null : ['OWNER'],
      orderBy: { field: 'CREATED_AT', direction: 'DESC' },
    })

    return () => {
      disposeQuery()
    }
  }, [disposeQuery, loadQuery, viewerSession.isAdmin])
  return (
    <Layout navTitle={intl.formatMessage({ id: 'global.articles' })}>
      {queryReference ? (
        <React.Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <PostListPage queryReference={queryReference} isAdmin={viewerSession.isAdmin} />
        </React.Suspense>
      ) : null}
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Posts

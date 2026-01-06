'use client'

import { Box, BoxProps, Button, CapUIFontSize, Flex, Grid, Spinner, Text } from '@cap-collectif/ui'
import { PostListSection_query$key } from '@relay/PostListSection_query.graphql'
import { PostListSectionList_query$key } from '@relay/PostListSectionList_query.graphql'
import { FC, Suspense } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment, usePaginationFragment } from 'react-relay'
import { PostListSectionFilters, PostListSectionFiltersProps } from './PostListSectionFilters'
import { ProjectsListFiltersPlaceholder } from '@shared/projectCard/ProjectsListSkeleton'
import { pxToRem } from '@shared/utils/pxToRem'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import PostCard from './PostCard'
import useIsMobile from '@shared/hooks/useIsMobile'
import { OVERFLOW_HEIGHT, PostListSkeleton } from './PostListSkeleton'
import { useFocusOnLoadMore } from '@shared/hooks/useFocusOnLoadMore'

// TODO on query with backend ready
export const PostListSectionListQuery = graphql`
  fragment PostListSectionList_query on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 20 }
    cursor: { type: "String", defaultValue: null }
    orderBy: { type: "PostOrder", defaultValue: { direction: DESC, field: CREATED_AT } }
    project: { type: "ID" }
    theme: { type: "ID" }
  )
  @refetchable(queryName: "PostListSectionQuery") {
    posts(first: $count, after: $cursor, orderBy: $orderBy, theme: $theme, project: $project)
      @connection(key: "PostListSection_posts", filters: ["orderBy", "theme", "project"]) {
      totalCount
      edges {
        node {
          id
          ...PostCard_post
        }
      }
    }
  }
`

type PostListSectionListProps = {
  query: PostListSectionList_query$key
  count: number
}

export const PostListSectionList: FC<PostListSectionListProps> = ({ query: queryKey, count }) => {
  const isMobile = useIsMobile()
  const { siteColors } = useAppContext()
  const intl = useIntl()
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(PostListSectionListQuery, queryKey)

  const postTotalCount = data?.posts?.totalCount
  const posts = data?.posts?.edges?.map(({ node }) => node) ?? []
  const postIds = posts.map(post => post.id)

  const { markPendingFocus } = useFocusOnLoadMore({
    itemIds: postIds,
    isLoadingNext,
    idPrefix: 'cap-post-card-',
    focusSelector: 'a',
  })

  return (
    <Box className="post-list-section-posts" mt={[0, pxToRem(-OVERFLOW_HEIGHT)]}>
      {postTotalCount ? (
        <>
          <PostCard post={posts[0]} format={isMobile ? 'vertical' : 'horizontal'} mx={['auto', 'unset']} />
          {postTotalCount > 1 ? (
            <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap="lg" mt={8}>
              {posts.slice(1, 3).map(post => (
                <PostCard key={post.id} post={post} mx={['auto', 'unset']} hideDescription />
              ))}
            </Grid>
          ) : null}
          {postTotalCount > 3 ? (
            <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap="lg" mt={8}>
              {posts.slice(3).map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  mx={['auto', 'unset']}
                  hideDescription
                  format={isMobile ? 'horizontal' : 'vertical'}
                />
              ))}
            </Grid>
          ) : null}
          {isLoadingNext ? <Spinner m="auto" mt={5} /> : null}
          {hasNext ? (
            <Flex justifyContent="center">
              <Button
                variant="primary"
                variantSize="medium"
                onClick={() => {
                  markPendingFocus()
                  loadNext(count)
                }}
                mt="xl"
                disabled={isLoadingNext}
                justifyContent={['center', 'unset']}
                width={['100%', 'unset']}
              >
                {intl.formatMessage({ id: 'see-more-posts' })}
              </Button>
            </Flex>
          ) : null}
        </>
      ) : (
        <Text textAlign="center" my="8rem" fontSize={CapUIFontSize.Headline} color={siteColors.pageSubTitleColor}>
          {intl.formatMessage({ id: 'proposal.no_posts' })}
        </Text>
      )}
    </Box>
  )
}

const FRAGMENT = graphql`
  fragment PostListSection_query on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 20 }
    orderBy: { type: "PostOrder", defaultValue: { direction: DESC, field: CREATED_AT } }
    project: { type: "ID" }
    theme: { type: "ID" }
  ) {
    ...PostListSectionList_query @arguments(count: $count, orderBy: $orderBy, theme: $theme, project: $project)
  }
`

type PostListSectionProps = BoxProps & PostListSectionFiltersProps & { query: PostListSection_query$key; count: number }

export const PostListSection: FC<PostListSectionProps> = ({
  query: queryKey,
  project,
  setProject,
  orderBy,
  setOrderBy,
  theme,
  setTheme,
  count,
  ...rest
}) => {
  const { siteColors } = useAppContext()

  const query = useFragment(FRAGMENT, queryKey)

  return (
    <Box as="section" className="news-list-section" {...rest}>
      <Box mx="auto" bg={siteColors.pageBackgroundHeaderColor}>
        <Box mx="auto" maxWidth={pxToRem(1280)} px={[4, 6]} pb={['xl', pxToRem(OVERFLOW_HEIGHT)]}>
          <Suspense fallback={<ProjectsListFiltersPlaceholder />}>
            <PostListSectionFilters
              orderBy={orderBy || 'PUBLISHED_AT'}
              setOrderBy={setOrderBy}
              project={project}
              setProject={setProject}
              theme={theme}
              setTheme={setTheme}
            />
          </Suspense>
        </Box>
      </Box>
      <Box mx="auto" maxWidth={pxToRem(1280)} px={[4, 6]} mt={['xl', 'xxl']} pb={['xl', 'xxl']}>
        <Suspense fallback={<PostListSkeleton />}>
          <PostListSectionList query={query} count={count} />
        </Suspense>
      </Box>
    </Box>
  )
}

export default PostListSection

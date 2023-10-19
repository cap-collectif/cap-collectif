import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { OrganizationPagePostList_organization$key } from '~relay/OrganizationPagePostList_organization.graphql'
import Flex from '~/components/Ui/Primitives/Layout/Flex'
import Heading from '~/components/Ui/Primitives/Heading'
import Button from '~/components/DesignSystem/Button/Button'
import AppBox from '~/components/Ui/Primitives/AppBox'
import PostCard from '~/components/Ui/News/PostCard'
const FRAGMENT = graphql`
  fragment OrganizationPagePostList_organization on Organization
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, hideUnpublishedPosts: { type: "Boolean" })
  @refetchable(queryName: "OrganizationPagePostListPaginationQuery") {
    posts(first: $count, after: $cursor, hideUnpublishedPosts: $hideUnpublishedPosts)
      @connection(key: "OrganizationPagePostList_posts", filters: ["query", "orderBy"]) {
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
export type Props = {
  readonly organization: OrganizationPagePostList_organization$key
}
export const OrganizationPagePostList = ({ organization }: Props) => {
  const intl = useIntl()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, organization)
  if (!data) return null
  const { posts } = data
  return (
    <Flex direction="column" maxWidth={['100%', '380px']} width="100%" mb={4}>
      <Heading as="h4" mb={4}>
        {intl.formatMessage({
          id: 'menu.news',
        })}
      </Heading>
      {posts.edges?.filter(Boolean).map((edge, index) => (
        <PostCard post={edge?.node} key={index} mb={4} />
      ))}
      {hasNext ? (
        <AppBox width="100%">
          <Button margin="auto" onClick={() => loadNext(3)} color="blue.500">
            {intl.formatMessage({
              id: 'global.more',
            })}
          </Button>
        </AppBox>
      ) : null}
    </Flex>
  )
}
export default OrganizationPagePostList

import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { OrganizationPagePostList_organization$key } from '@relay/OrganizationPagePostList_organization.graphql'
import { Flex, Heading, Button } from '@cap-collectif/ui'
import PostCard from './PostCard'
import { pxToRem } from '@shared/utils/pxToRem'

const FRAGMENT = graphql`
  fragment OrganizationPagePostList_organization on Organization
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "OrganizationPagePostListPaginationQuery") {
    posts(first: $count, after: $cursor, hideUnpublishedPosts: true)
      @connection(key: "OrganizationPagePostList_posts") {
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
    <Flex direction="column" maxWidth={['100%', pxToRem(380)]} width="100%" mb={4}>
      <Heading as="h4" mb={4}>
        {intl.formatMessage({
          id: 'menu.news',
        })}
      </Heading>
      {posts.edges?.filter(Boolean).map((edge, index) => (
        <PostCard post={edge?.node} key={index} mb={4} />
      ))}
      {hasNext ? (
        <Flex width="100%">
          <Button variant="tertiary" margin="auto" onClick={() => loadNext(3)}>
            {intl.formatMessage({
              id: 'global.more',
            })}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  )
}
export default OrganizationPagePostList

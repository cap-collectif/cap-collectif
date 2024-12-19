import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import type { PostCard_post$key } from '@relay/PostCard_post.graphql'
import { Box, BoxProps, CapUIIcon, Card, Flex, Heading } from '@cap-collectif/ui'
import Image from '@shared/ui/Image'
import { formatInfo } from '@shared/projectCard/ProjectCard.utils'
import { useAppContext } from '@components/AppProvider/App.context'
import { PostCoverIcon } from './PostCoverIcon'

type Props = BoxProps & {
  readonly post: PostCard_post$key
}

const FRAGMENT = graphql`
  fragment PostCard_post on Post {
    id
    title
    url
    media {
      url
    }
    themes {
      id
      title
    }
  }
`

const PostCoverPlaceholder = ({ backgroundColor }: { backgroundColor: string }) => (
  <Card
    width="112px"
    borderRadius="accordion"
    overflow="hidden"
    height="78px"
    sx={{ objectFit: 'cover' }}
    mr={4}
    flexShrink={0}
    p={3}
    bg={backgroundColor}
  >
    <PostCoverIcon />
  </Card>
)

export const PostCard = ({ post: postQuery, ...props }: Props) => {
  const post = useFragment(FRAGMENT, postQuery)
  const { siteColors } = useAppContext()
  return (
    <Box
      as="a"
      href={post.url}
      display="grid"
      width="100%"
      css={{
        '&:hover': {
          textDecoration: 'none',
        },
      }}
    >
      <Card
        bg="white"
        p={2}
        flexDirection="row"
        overflow="hidden"
        display="flex"
        border="normal"
        position="relative"
        {...props}
      >
        {post.media?.url ? (
          <Image
            src={post.media?.url}
            alt="banner"
            width="112px"
            borderRadius="accordion"
            overflow="hidden"
            height="78px"
            sx={{ objectFit: 'cover' }}
            mr={4}
            flexShrink={0}
            p={0}
          />
        ) : (
          <PostCoverPlaceholder backgroundColor={siteColors.primaryColor} />
        )}
        <Flex direction="column" overflow="hidden" justify="space-between">
          <Heading as="h4" mb={2} color="gray.900">
            {post.title}
          </Heading>
          <Box color="neutral-gray.700">
            {post.themes.length > 0 &&
              formatInfo(CapUIIcon.FolderO, post.themes?.map(({ title }) => title).join(', ') || '', false)}
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}

export default PostCard

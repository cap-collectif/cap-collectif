import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import type { PostCard_post$key } from '@relay/PostCard_post.graphql'
import {
  BoxProps,
  CapUIIcon,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
} from '@cap-collectif/ui'
import { getSrcSet } from '@ui/Image/Image'

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

export const PostCard = ({ post: postQuery, ...props }: Props) => {
  const post = useFragment(FRAGMENT, postQuery)

  return (
    <Card format="horizontal" {...props}>
      <CardCover>
        {post.media?.url ? (
          <CardCoverImage {...getSrcSet(post.media?.url)} />
        ) : (
          <CardCoverPlaceholder color="primary.base" icon={CapUIIcon.FileO} />
        )}
      </CardCover>
      <CardContent primaryInfo={post.title} href={post.url} />
    </Card>
  )
}

export default PostCard

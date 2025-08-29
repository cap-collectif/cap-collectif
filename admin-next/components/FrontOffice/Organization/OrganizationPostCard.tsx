import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import type { OrganizationPostCard_post$key } from '@relay/OrganizationPostCard_post.graphql'
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
  readonly post: OrganizationPostCard_post$key
}

const FRAGMENT = graphql`
  fragment OrganizationPostCard_post on Post {
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

export const OrganizationPostCard = ({ post: postQuery, ...props }: Props) => {
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

export default OrganizationPostCard

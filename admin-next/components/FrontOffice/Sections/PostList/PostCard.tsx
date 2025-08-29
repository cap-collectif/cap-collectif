import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import type { PostCard_post$key } from '@relay/PostCard_post.graphql'
import {
  BoxProps,
  Card,
  CapUIIcon,
  CardCoverImage,
  CardCoverPlaceholder,
  CardCover,
  CardContent,
  CardTagList,
  CardProps,
  CardTag,
  CardTagLeftIcon,
  CardTagLabel,
} from '@cap-collectif/ui'
import htmlDecode from '@shared/utils/htmlDecode'
import { getSrcSet } from '@shared/ui/Image'
import { useIntl } from 'react-intl'
import stripHTML from '@shared/utils/stripHTML'
import useIsMobile from '@shared/hooks/useIsMobile'

type Props = BoxProps & {
  post: PostCard_post$key
  format?: CardProps['format']
  primaryInfoTag?: React.ElementType
  hideDescription?: boolean
}

const FRAGMENT = graphql`
  fragment PostCard_post on Post {
    id
    title
    themes {
      id
      title
    }
    media {
      url
    }
    url
    publishedAt
    body
    abstract
  }
`

export const PostCard: React.FC<Props> = ({ post: postKey, primaryInfoTag, hideDescription = false, ...props }) => {
  const post = useFragment(FRAGMENT, postKey)
  const intl = useIntl()
  const isMobile = useIsMobile()

  const { id, title, url, media, publishedAt, body, abstract, themes } = post
  const themesLength = themes?.length
  const description = abstract || body

  const date = intl.formatDate(publishedAt, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card id={`cap-post-card-${id}`} className="cap-post-card" {...props}>
      <CardCover>
        {media?.url ? (
          <CardCoverImage {...getSrcSet(media?.url)} />
        ) : (
          <CardCoverPlaceholder icon={CapUIIcon.FileO} color="primary.base" />
        )}
      </CardCover>
      <CardContent
        primaryInfo={htmlDecode(title)}
        href={url}
        primaryInfoTag={primaryInfoTag}
        secondaryInfo={hideDescription ? null : stripHTML(description)}
      >
        {!isMobile || props.format === 'vertical' ? (
          <CardTagList>
            {date ? (
              <CardTag srOnlyText={`(${intl.formatMessage({ id: 'export_proposal_news_published_at' })})`}>
                <CardTagLeftIcon name={CapUIIcon.CalendarO} />
                <CardTagLabel>{date}</CardTagLabel>
              </CardTag>
            ) : null}
            {!isMobile && themesLength ? (
              <CardTag
                srOnlyText={`(${intl.formatMessage({ id: 'export_proposal_news_themes' })})`}
                tooltipLabel={
                  themesLength > 1
                    ? themes.slice(1).map(t => (
                        <>
                          {t.title}
                          <br />
                        </>
                      ))
                    : null
                }
              >
                <CardTagLeftIcon name={CapUIIcon.FolderO} />
                <CardTagLabel>
                  {themes[0]?.title}
                  {themesLength > 1 ? ` (+${themesLength - 1})` : null}
                </CardTagLabel>
              </CardTag>
            ) : null}
          </CardTagList>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default PostCard

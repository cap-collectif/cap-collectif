import React from 'react'
import styled from 'styled-components'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import Truncate from 'react-truncate'
import colors from '~/utils/colors'
import { Card } from '~/components/Proposal/Page/ProposalPage.style'
import type { NewsCard_post } from '~relay/NewsCard_post.graphql'
import DatesInterval from '~/components/Utils/DatesInterval'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import Image from '~ui/Primitives/Image'

type Props = {
  post: NewsCard_post | null | undefined
  withContent?: boolean
}
export const NewsContainer = styled.div<{
  withContent: boolean
}>`
  width: 100%;
  display: flex;
  flex-direction: column;

  > img {
    width: 100%;
    height: 153px;
    object-fit: cover;
    border-radius: 4px 0 0 4px;
  }

  > div {
    padding: 20px;

    h4 {
      font-size: 18px;
      margin: 0;
      margin-bottom: 5px;
      word-break: break-word;
      width: 100%;

      a {
        /* stylelint-disable */
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        width: 100%;
        text-overflow: ellipsis;
        visibility: visible;
      }
    }

    h4 + span,
    span + span {
      color: ${colors.darkGray};
    }

    > p {
      margin-top: 15px;

      @media (min-width: 768px) {
        max-height: 90px;
        margin-bottom: 0;
        overflow: hidden;
      }
    }
  }

  @media (min-width: 768px) {
    > img {
      width: ${({ withContent }) => (withContent ? '100%' : '137px')};
      height: ${({ withContent }) => (withContent ? '177px' : '137px')};
      max-width: ${({ withContent }) => withContent && '270px'};
    }

    flex-direction: row;
  }
`
export const NewsCard = ({ post, withContent }: Props) => {
  if (!post) return null
  return (
    <Card>
      <NewsContainer withContent={withContent || false}>
        <Image src={post?.media?.url || '/svg/preview-proposal-image.svg'} alt="news cover" />
        <div>
          <h4>
            <a href={post.url}>{post.title}</a>
          </h4>
          <DatesInterval startAt={post.publishedAt} />{' '}
          {post?.authors.length ? (
            <FormattedMessage
              id={post?.authors.length < 2 ? 'global.byAuthor' : 'project-authors'}
              values={{
                author: post?.authors[0].username,
                authorName: post?.authors[0].username,
                number: post?.authors.length - 1,
              }}
            />
          ) : null}
          {withContent ? (
            <p>
              <Truncate lines={3}>
                <WYSIWYGRender className="media--news__text" value={post.body} />
              </Truncate>
            </p>
          ) : null}
        </div>
      </NewsContainer>
    </Card>
  )
}
export default createFragmentContainer(NewsCard, {
  post: graphql`
    fragment NewsCard_post on Post {
      id
      title
      url
      media {
        id
        url
      }
      authors {
        id
        username
      }
      publishedAt
      body
    }
  `,
})

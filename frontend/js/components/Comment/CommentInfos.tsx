import React from 'react'
import { graphql, useFragment } from 'react-relay'
import { Tag, Flex, CapUIIcon } from '@cap-collectif/ui'
import { FormattedMessage } from 'react-intl'
import CommentDate from './CommentDate'
import PinnedLabel from '../Utils/PinnedLabel'
import UnpublishedLabel from '../Publishable/UnpublishedLabel'
import UserLink from '../User/UserLink'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import type { CommentInfos_comment$key } from '~relay/CommentInfos_comment.graphql'
import '~relay/CommentInfos_comment.graphql'
type Props = {
  readonly comment: CommentInfos_comment$key
}
const COMMENT_FRAGMENT = graphql`
  fragment CommentInfos_comment on Comment {
    moderationStatus
    pinned
    author {
      ...UserLink_user
      displayName
      url
    }
    ...CommentDate_comment
    ...UnpublishedLabel_publishable
    authorName
  }
`

const CommentInfos = ({ comment: commentRef }: Props) => {
  const comment = useFragment(COMMENT_FRAGMENT, commentRef)
  const moderationEnabled = useFeatureFlag('moderation_comment')

  const renderAuthorName = () => {
    if (comment?.author) {
      return <UserLink user={comment.author} />
    }

    return <span>{comment?.authorName}</span>
  }

  return (
    <Flex align="center" justifyContent="start" wrap="wrap" className="opinion__user">
      {renderAuthorName()}
      <CommentDate comment={comment} />
      <PinnedLabel show={comment?.pinned} type="comment" />
      {!moderationEnabled && <UnpublishedLabel publishable={comment} />}
      {comment?.moderationStatus === 'PENDING' && (
        <Tag variantColor="orange" variant="badge" maxWidth="none !important" ml={2}>
          <Tag.LeftIcon name={CapUIIcon.Clock} mr="4px !important" />
          <Tag.Label
            margin="0 !important"
            fontWeight={600}
            sx={{
              textTransform: 'uppercase',
            }}
          >
            <FormattedMessage id="pending-moderation" />
          </Tag.Label>
        </Tag>
      )}
    </Flex>
  )
}

export default CommentInfos

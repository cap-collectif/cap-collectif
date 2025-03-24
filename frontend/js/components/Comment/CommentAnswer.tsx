import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import UserAvatar from '~/components/User/UserAvatar'
import CommentInfos from './CommentInfos'
import CommentBody from './CommentBody'
import CommentVoteButton from './CommentVoteButton'
import CommentReportButton from './CommentReportButton'
import CommentEdit from './CommentEdit'
import Media from '../Ui/Medias/Media/Media'
import { CommentContainer } from './styles'
import type { CommentAnswer_comment } from '~relay/CommentAnswer_comment.graphql'
import { CommentBottom } from './Comment.style'
type Props = {
  readonly comment: CommentAnswer_comment
  readonly isHighlighted?: boolean | null | undefined
  readonly useBodyColor: boolean
}
export class CommentAnswer extends React.Component<Props> {
  render() {
    const { comment, useBodyColor, isHighlighted } = this.props
    return (
      // @ts-expect-error
      <CommentContainer
        as="li"
        useBodyColor={useBodyColor || (comment.author && comment.author.vip)}
        isHighlighted={isHighlighted}
        isAnswer
      >
        <div className="Commentavatar">
          <UserAvatar user={comment.author} />
        </div>
        <Media className="opinion">
          <Media.Body className="opinion__body">
            <div
              className="opinion__data"
              style={{
                overflow: 'visible',
              }}
            >
              <CommentInfos comment={comment} />
            </div>
            <CommentBody comment={comment} />
          </Media.Body>
          <CommentBottom>
            <CommentVoteButton comment={comment} />
            <CommentReportButton comment={comment} />
            <CommentEdit comment={comment} />
          </CommentBottom>
        </Media>
      </CommentContainer>
    )
  }
}
export default createFragmentContainer(CommentAnswer, {
  comment: graphql`
    fragment CommentAnswer_comment on Comment @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        vip
        displayName
        ...UserAvatar_user
      }
      ...CommentDate_comment
      ...CommentInfos_comment
      ...CommentEdit_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentBody_comment
      ...CommentVoteButton_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentReportButton_comment @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
})

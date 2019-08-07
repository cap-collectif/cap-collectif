// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import UserAvatarDeprecated from '../User/UserAvatarDeprecated';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReportButton from './CommentReportButton';
import CommentEdit from './CommentEdit';
import CommentAnswers from './CommentAnswers';
import CommentForm from './CommentForm';
import Media from '../Ui/Medias/Media/Media';
import { CommentContainer } from './styles';
import type { Comment_comment } from '~relay/Comment_comment.graphql';

type Props = {
  comment: Comment_comment,
  isHighlighted?: ?boolean,
  disabledButton?: ?boolean,
  invertedBackground?: ?boolean,
};

type State = {
  answerFormShown: boolean,
};

export class Comment extends React.Component<Props, State> {
  static defaultProps = {
    invertedBackground: true,
  };

  state = { answerFormShown: false };

  focusAnswer = () => {
    this.setState({
      answerFormShown: true,
    });
  };

  render() {
    const { comment, isHighlighted, invertedBackground, disabledButton } = this.props;
    const { answerFormShown } = this.state;

    return (
      <CommentContainer
        as="li"
        invertedBackground={invertedBackground}
        isHighlighted={isHighlighted}>
        {/* $FlowFixMe Will be a fragment soon */}
        <UserAvatarDeprecated user={comment.author} />
        <Media className="opinion">
          <Media.Body className="opinion__body" id={`comment_${comment.id}`}>
            <div className="opinion__data">
              {/* $FlowFixMe $refType */}
              <CommentInfos comment={comment} />
            </div>
            {/* $FlowFixMe $refType */}
            <CommentBody comment={comment} />
            {!disabledButton && (
              <div className="small">
                {/* $FlowFixMe $refType */}
                <CommentVoteButton comment={comment} />{' '}
                <Button
                  bsSize="xsmall"
                  onClick={this.focusAnswer}
                  className="btn-dark-gray btn--outline">
                  <i className="cap-reply-mail-2" /> <FormattedMessage id="global.answer" />
                </Button>{' '}
                {/* $FlowFixMe $refType */}
                <CommentReportButton comment={comment} /> {/* $FlowFixMe $refType */}
                <CommentEdit comment={comment} />{' '}
              </div>
            )}
          </Media.Body>
          <div className="CommentAnswer">
            {/* $FlowFixMe $refType */}
            <CommentAnswers invertedBackground={invertedBackground} comment={comment} />
            {answerFormShown ? <CommentForm commentable={comment} answerOf={comment.id} /> : null}
          </div>
        </Media>
      </CommentContainer>
    );
  }
}

export default createFragmentContainer(Comment, {
  comment: graphql`
    fragment Comment_comment on Comment
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        vip
        displayName
        media {
          url
        }
      }
      ...CommentAnswers_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentDate_comment
      ...CommentInfos_comment
      ...CommentBody_comment
      ...CommentEdit_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentVoteButton_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentReportButton_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentForm_commentable
    }
  `,
});

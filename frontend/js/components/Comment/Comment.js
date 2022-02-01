// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import UserAvatarLegacy from '../User/UserAvatarLegacy';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentVoteButtonLegacy from './CommentVoteButtonLegacy';
import CommentVoteButton from './CommentVoteButton';
import CommentReportButton from './CommentReportButton';
import CommentEdit from './CommentEdit';
import CommentAnswers from './CommentAnswers';
import CommentForm from './CommentForm';
import Media from '../Ui/Medias/Media/Media';
import { CommentContainer } from './styles';
import type { Comment_comment } from '~relay/Comment_comment.graphql';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import { CommentBottom } from './Comment.style';

type Props = {|
  +comment: Comment_comment,
  +isHighlighted?: ?boolean,
  +disabledButton?: ?boolean,
  +useBodyColor: boolean,
  +unstable__enableCapcoUiDs?: boolean,
|};

const AnswerButton: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  display: flex;
  align-items: center;
  border: none;
  background: none;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.darkGray};

  svg {
    margin-right: 5px;
  }
`;

type State = {|
  +answerFormShown: boolean,
|};

export class Comment extends React.Component<Props, State> {
  static defaultProps = {
    useBodyColor: true,
  };

  state = { answerFormShown: false };

  focusAnswer = () => {
    this.setState({
      answerFormShown: true,
    });
  };

  render() {
    const {
      comment,
      isHighlighted,
      useBodyColor,
      disabledButton,
      unstable__enableCapcoUiDs,
    } = this.props;
    const { answerFormShown } = this.state;

    return (
      <CommentContainer as="li" useBodyColor={useBodyColor} isHighlighted={isHighlighted}>
        {/* $FlowFixMe */}
        <UserAvatarLegacy user={comment.author} size={45} />
        <Media className="opinion">
          <Media.Body className="opinion__body" id={`comment_${comment.id}`}>
            <div className="opinion__data">
              <CommentInfos comment={comment} />
            </div>
            <CommentBody comment={comment} />
          </Media.Body>
          {!disabledButton && (
            <CommentBottom>
              {unstable__enableCapcoUiDs ? (
                <CommentVoteButton comment={comment} />
              ) : (
                <CommentVoteButtonLegacy comment={comment} />
              )}
              <AnswerButton onClick={this.focusAnswer}>
                <Icon name={ICON_NAME.navigationLeft} size={15} color={colors.darkGray} />
                <FormattedMessage id="global.answer" />
              </AnswerButton>
              <CommentReportButton comment={comment} />
              <CommentEdit comment={comment} />{' '}
            </CommentBottom>
          )}
          <div className="CommentAnswer">
            <CommentAnswers useBodyColor={useBodyColor} comment={comment} />
            {/* $FlowFixMe */}
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
        ...UserAvatar_user
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
      ...CommentVoteButtonLegacy_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentReportButton_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentForm_commentable
    }
  `,
});

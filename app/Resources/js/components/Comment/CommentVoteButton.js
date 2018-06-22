// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import CommentActions from '../../actions/CommentActions';
import LoginOverlay from '../Utils/LoginOverlay';
import type { State } from '../../types';

type Props = {
  comment: Object,
  user?: Object,
  onVote: Function,
};

class CommentVoteButton extends React.Component<Props> {
  deleteVote = () => {
    const { comment, onVote } = this.props;
    CommentActions.deleteVote(comment.id).then(() => {
      onVote();
    });
  };

  vote = () => {
    const { comment, onVote } = this.props;
    CommentActions.vote(comment.id).then(() => {
      onVote();
    });
  };

  userIsAuthor = () => {
    const { comment, user } = this.props;
    if (!comment.author || !user) {
      return false;
    }
    return user.uniqueId === comment.author.uniqueId;
  };

  renderFormOrDisabled = () => {
    if (this.userIsAuthor()) {
      return (
        <button disabled="disabled" className="btn btn-dark-gray btn-sm">
          <i className="cap-hand-like-2" /> {<FormattedMessage id="comment.vote.submit" />}
        </button>
      );
    }

    return this.renderVoteButton();
  };

  renderVoteButton = () => {
    const { comment } = this.props;

    if (comment.hasUserVoted) {
      return (
        <button className="btn btn-danger btn-sm" onClick={this.deleteVote}>
          {<FormattedMessage id="comment.vote.remove" />}
        </button>
      );
    }

    return (
      <LoginOverlay>
        <button className="btn btn-success btn--outline btn-sm" onClick={this.vote}>
          <i className="cap-hand-like-2" /> {<FormattedMessage id="comment.vote.submit" />}
        </button>
      </LoginOverlay>
    );
  };

  render() {
    const { comment } = this.props;
    return (
      <span className="comment__agree">
        {this.renderFormOrDisabled()}{' '}
        <span className="opinion__votes-nb">{comment.votesCount}</span>
      </span>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(CommentVoteButton);

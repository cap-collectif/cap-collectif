import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import CommentActions from '../../actions/CommentActions';
import LoginOverlay from '../Utils/LoginOverlay';

const CommentVoteButton = React.createClass({
  propTypes: {
    comment: PropTypes.object,
    user: PropTypes.object,
    onVote: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  deleteVote() {
    const {
      comment,
      onVote,
    } = this.props;
    CommentActions.deleteVote(comment.id)
      .then(() => {
        onVote();
      })
    ;
  },

  vote() {
    const {
      comment,
      onVote,
    } = this.props;
    CommentActions.vote(comment.id)
      .then(() => {
        onVote();
      })
    ;
  },

  userIsAuthor() {
    const { comment, user } = this.props;
    if (!comment.author || !user) {
      return false;
    }
    return user.uniqueId === comment.author.uniqueId;
  },

  renderFormOrDisabled() {
    if (this.userIsAuthor()) {
      return (
        <button disabled="disabled" className="btn btn-dark-gray btn-xs">
          <i className="cap-hand-like-2"></i>
          { ' ' }
          { this.getIntlMessage('comment.vote.submit') }
        </button>
      );
    }

    return this.renderVoteButton();
  },

  renderVoteButton() {
    const { comment } = this.props;

    if (comment.has_user_voted) {
      return (
        <button className="btn btn-danger btn-xs" onClick={this.deleteVote}>
          { this.getIntlMessage('comment.vote.remove') }
        </button>
      );
    }

    return (
      <LoginOverlay>
        <button className="btn btn-success btn--outline btn-xs" onClick={this.vote}>
          <i className="cap-hand-like-2"></i>
          { ' ' }
          { this.getIntlMessage('comment.vote.submit') }
        </button>
      </LoginOverlay>
    );
  },

  render() {
    const { comment } = this.props;
    return (
      <span>
        { this.renderFormOrDisabled() }
        { ' ' }
        <span className="opinion__votes-nb">{ comment.votes_count }</span>
      </span>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(CommentVoteButton);

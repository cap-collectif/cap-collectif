import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import CommentActions from '../../actions/CommentActions';
import { connect } from 'react-redux';

const CommentVoteButton = React.createClass({
  propTypes: {
    comment: PropTypes.object,
    user: PropTypes.object,
    onVote: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  deleteVote() {
    CommentActions.deleteVote(this.props.comment.id)
      .then(() => {
        this.props.onVote();
      })
    ;
  },

  vote() {
    CommentActions.vote(this.props.comment.id)
      .then(() => {
        this.props.onVote();
      })
    ;
  },

  userIsAuthor() {
    const { comment, user } = this.props;
    if (comment.author === null || !user) {
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
    if (this.props.comment.has_user_voted) {
      return (
        <button className="btn btn-danger btn-xs" onClick={this.deleteVote}>
          { this.getIntlMessage('comment.vote.remove') }
        </button>
      );
    }

    return (
      <button className="btn btn-success btn--outline btn-xs" onClick={this.vote}>
        <i className="cap-hand-like-2"></i>
        { ' ' }
        { this.getIntlMessage('comment.vote.submit') }
      </button>
    );
  },

  render() {
    return (
      <span>
        { this.renderFormOrDisabled() }
        { ' ' }
        <span className="opinion__votes-nb">{ this.props.comment.votes_count }</span>
      </span>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(CommentVoteButton);

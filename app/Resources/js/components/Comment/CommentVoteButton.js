import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';

const CommentVoteButton = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  isTheUserTheAuthor() {
    const { comment, user } = this.props;
    if (comment.author === null || !user) {
      return false;
    }
    return user.uniqueId === comment.author.uniqueId;
  },

  renderFormOrDisabled() {
    if (this.isTheUserTheAuthor()) {
      return (
        <button disabled="disabled" className="btn btn-dark-gray btn-xs">
          <i className="cap-hand-like-2"></i>
          { ' ' }
          { this.getIntlMessage('comment.vote.submit') }
        </button>
      );
    }

    return (
      <form method="POST" style={{ display: 'inline-block' }} action={this.props.comment._links.vote}>
        { this.renderVoteButton() }
      </form>
    );
  },

  renderVoteButton() {
    if (this.props.comment.has_user_voted) {
      return (
        <button className="btn btn-danger btn-xs">
          { this.getIntlMessage('comment.vote.remove') }
        </button>
      );
    }

    return (
      <button className="btn btn-success btn--outline btn-xs">
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

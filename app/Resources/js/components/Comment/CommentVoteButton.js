import React from 'react';
import {IntlMixin} from 'react-intl';

const CommentVoteButton = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
    userIsAuthor: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  renderFormOrDisabled() {
    if (this.props.userIsAuthor) {
      return (
        <button disabled="disabled" className="btn btn-dark-gray btn-xs">
          <i className="cap-hand-like-2"></i>
          { ' ' }
          { this.getIntlMessage('comment.vote.submit') }
        </button>
      );
    }

    return (
      <form method="POST" style={{display: 'inline-block'}} action={this.props.comment._links.vote}>
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

export default CommentVoteButton;

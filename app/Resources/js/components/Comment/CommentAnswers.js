import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import CommentList from './CommentList';

const CommentAnswers = React.createClass({
  propTypes: {
    comments: PropTypes.array,
    onVote: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (this.props.comments) {
      return (
        <div>
          <CommentList comments={this.props.comments} onVote={this.props.onVote} root={false} />
        </div>
      );
    }
    return null;
  },

});

export default CommentAnswers;

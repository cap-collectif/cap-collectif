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
    const {
      comments,
      onVote,
    } = this.props;
    if (comments) {
      return (
        <div>
          <CommentList comments={comments} onVote={onVote} root={false} />
        </div>
      );
    }
    return null;
  },

});

export default CommentAnswers;

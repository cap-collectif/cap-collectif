import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import Comment from './Comment';

const CommentList = React.createClass({
  propTypes: {
    root: PropTypes.bool,
    comments: PropTypes.array.isRequired,
    onVote: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (this.props.comments.length === 0) {
      return <ul></ul>;
    }

    const classes = classNames({
      'media-list': true,
      'opinion__list': true,
      'comment-answers': !this.props.root,
    });

    return (
      <ul id="comments" className={classes}>
        {
          this.props.comments.map((comment) => {
            return (
              <Comment
                {...this.props}
                key={comment.id}
                comment={comment}
                root={this.props.root}
                onVote={this.props.onVote}
              />
            );
          })
        }
      </ul>
    );
  },

});

export default CommentList;

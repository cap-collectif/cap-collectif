import React from 'react';
import PinnedLabel from '../Utils/PinnedLabel';
import UserLink from '../User/UserLink';

const CommentInfos = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },

  renderAuthorName() {
    const { comment } = this.props;
    if (comment.author) {
      return <UserLink user={comment.author} />;
    }

    return <span>{comment.authorName}</span>;
  },

  render() {
    const { comment } = this.props;
    return (
      <p className="h5  opinion__user">
        {this.renderAuthorName()}
        {'  '}
        <PinnedLabel show={comment.pinned} type="comment" />
      </p>
    );
  },
});

export default CommentInfos;

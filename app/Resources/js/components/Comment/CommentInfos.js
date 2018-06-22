// @flow
import React from 'react';
import PinnedLabel from '../Utils/PinnedLabel';
import UserLink from '../User/UserLink';

type Props = {
  comment: Object,
};

class CommentInfos extends React.Component<Props> {
  renderAuthorName = () => {
    const { comment } = this.props;
    if (comment.author) {
      return <UserLink user={comment.author} />;
    }

    return <span>{comment.authorName}</span>;
  };

  render() {
    const { comment } = this.props;
    return (
      <p className="h5  opinion__user">
        {this.renderAuthorName()}
        {'  '}
        <PinnedLabel show={comment.pinned} type="comment" />
      </p>
    );
  }
}

export default CommentInfos;

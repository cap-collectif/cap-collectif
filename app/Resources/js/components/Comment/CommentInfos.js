// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import CommentDate from './CommentDate';
import PinnedLabel from '../Utils/PinnedLabel';
import UnpublishedLabel from '../Publishable/UnpublishedLabel';
import UserLink from '../User/UserLink';
import type { CommentInfos_comment } from '~relay/CommentInfos_comment.graphql';

type Props = {|
  +comment: CommentInfos_comment,
|};

export class CommentInfos extends React.Component<Props> {
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
      <div className="opinion__user">
        {this.renderAuthorName()} {/* $FlowFixMe $refType */}
        <CommentDate comment={comment} />
        <PinnedLabel show={comment.pinned} type="comment" />
        <UnpublishedLabel publishable={comment} />
      </div>
    );
  }
}

export default createFragmentContainer(CommentInfos, {
  comment: graphql`
    fragment CommentInfos_comment on Comment {
      pinned
      author {
        displayName
        url
      }
      ...UnpublishedLabel_publishable
      authorName
    }
  `,
});

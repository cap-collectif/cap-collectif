// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  comment: Object,
};

class CommentEdit extends React.Component<Props> {
  render() {
    const { comment } = this.props;
    if (comment.canEdit) {
      return (
        <a href={comment._links.edit} className="btn btn-dark-gray btn--outline btn-sm">
          <i className="cap cap-pencil-1" />
          {<FormattedMessage id="comment.update.button" />}
        </a>
      );
    }

    return <a />;
  }
}

export default CommentEdit;

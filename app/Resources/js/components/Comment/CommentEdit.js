import React from 'react';
import { FormattedMessage } from 'react-intl';

const CommentEdit = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },

  render() {
    const { comment } = this.props;
    if (comment.can_edit) {
      return (
        <a
          href={comment._links.edit}
          className="btn btn-dark-gray btn--outline btn-xs">
          <i className="cap cap-pencil-1" />
          {<FormattedMessage id="comment.update.button" />}
        </a>
      );
    }

    return <a />;
  },
});

export default CommentEdit;

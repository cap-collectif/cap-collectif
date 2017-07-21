import React from 'react';
import { IntlMixin } from 'react-intl';

const CommentEdit = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },
  mixins: [IntlMixin],

  render() {
    const { comment } = this.props;
    if (comment.can_edit) {
      return (
        <a href={comment._links.edit} className="btn btn-dark-gray btn--outline btn-xs">
          <i className="cap cap-pencil-1"></i>
          { this.getIntlMessage('comment.update.button') }
        </a>
      );
    }

    return <a></a>;
  },

});

export default CommentEdit;

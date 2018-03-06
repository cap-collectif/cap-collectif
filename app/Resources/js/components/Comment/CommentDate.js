import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';

const CommentDate = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },

  renderDate() {
    const { comment } = this.props;
    if (!Modernizr.intl) {
      return null;
    }

    return (
      <span className="excerpt">
        <FormattedDate
          value={moment(comment.createdAt)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </span>
    );
  },

  renderEditionDate() {
    const { comment } = this.props;
    if (!Modernizr.intl) {
      return null;
    }

    if (moment(comment.updatedAt).diff(comment.createdAt, 'seconds') <= 1) {
      return null;
    }

    return (
      <span className="excerpt">
        {<FormattedMessage id="comment.edited" />}{' '}
        <FormattedDate
          value={moment(comment.updated_at)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </span>
    );
  },

  render() {
    return (
      <span className="h5 comment__date">
        {this.renderDate()}
        <br />
        {this.renderEditionDate()}
      </span>
    );
  },
});

export default CommentDate;

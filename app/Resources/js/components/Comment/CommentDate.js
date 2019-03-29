// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import type { CommentDate_comment } from './__generated__/CommentDate_comment.graphql';

type Props = {
  comment: CommentDate_comment,
};

export class CommentDate extends React.Component<Props> {
  renderDate = () => {
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
  };

  renderEditionDate = () => {
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
          value={moment(comment.updatedAt)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </span>
    );
  };

  render() {
    return (
      <span className="h5 comment__date">
        {this.renderDate()}
        <br />
        {this.renderEditionDate()}
      </span>
    );
  }
}

export default createFragmentContainer(CommentDate, {
  comment: graphql`
    fragment CommentDate_comment on Comment {
      createdAt
      publishedAt
      updatedAt
    }
  `,
});

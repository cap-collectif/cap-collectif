// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import { Tooltip } from '@cap-collectif/ui';
import type { CommentDate_comment } from '~relay/CommentDate_comment.graphql';

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
      <Tooltip
        key={`comment-createdAt-${comment.id}`}
        placement="top"
        label={
          <FormattedDate
            value={moment(comment.createdAt)}
            day="numeric"
            month="long"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />
        }
        id={`comment-createdAt-tooltip-${comment.id}`}
        className="text-left"
        style={{ wordBreak: 'break-word' }}>
        <span>{moment(comment.createdAt).fromNow()}</span>
      </Tooltip>
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
      <span>
        {' • '}
        {<FormattedMessage id="global.edited" />}
      </span>
    );
  };

  render() {
    return (
      <span className="excerpt small">
        {' • '}
        {this.renderDate()}
        {this.renderEditionDate()}
      </span>
    );
  }
}

export default createFragmentContainer(CommentDate, {
  comment: graphql`
    fragment CommentDate_comment on Comment {
      id
      createdAt
      publishedAt
      updatedAt
    }
  `,
});

// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { submitCommentReport } from '../../redux/modules/report';
import ReportBox from '../Report/ReportBox';
import type { CommentReportButton_comment } from '~relay/CommentReportButton_comment.graphql';
import type { Dispatch } from '../../types';

type Props = {
  dispatch: Dispatch,
  comment: CommentReportButton_comment,
};

export class CommentReportButton extends React.Component<Props> {
  handleReport = (data: any) => {
    const { comment, dispatch } = this.props;
    return submitCommentReport(comment.id, data, dispatch);
  };

  render() {
    const { comment } = this.props;
    return (
      <ReportBox
        id={`comment-${comment.id}`}
        reported={comment.viewerHasReport || false}
        onReport={this.handleReport}
        author={{ uniqueId: comment.author ? comment.author.slug : null }}
        buttonBsSize="xs"
        buttonClassName="btn btn-dark-gray btn--outline"
      />
    );
  }
}

const container = connect()(CommentReportButton);
export default createFragmentContainer(container, {
  comment: graphql`
    fragment CommentReportButton_comment on Comment
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      viewerHasReport @include(if: $isAuthenticated)
      author {
        slug
      }
    }
  `,
});

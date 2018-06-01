// @flow
import React from 'react';
import { connect } from 'react-redux';
import { submitCommentReport } from '../../redux/modules/report';
import ReportBox from '../Report/ReportBox';

type Props = {
  dispatch: Function,
  comment: Object,
};

class CommentReportButton extends React.Component<Props> {
  handleReport = data => {
    const { comment, dispatch } = this.props;
    return submitCommentReport(comment, data, dispatch);
  };

  render() {
    const { comment } = this.props;
    return (
      <ReportBox
        id={`comment-${comment.id}`}
        reported={comment.hasUserReported}
        onReport={this.handleReport}
        author={comment.author}
        buttonBsSize="sm"
        buttonClassName="btn btn-sm btn-dark-gray btn--outline"
      />
    );
  }
}

export default connect()(CommentReportButton);

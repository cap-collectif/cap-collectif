import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { submitCommentReport } from '../../redux/modules/report';
import ReportBox from '../Report/ReportBox';

const CommentReportButton = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    comment: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  handleReport(data) {
    const { comment, dispatch } = this.props;
    return submitCommentReport(comment, data, dispatch);
  },

  render() {
    const { comment } = this.props;
    return (
        <ReportBox
          id={`comment-${comment.id}`}
          reported={comment.has_user_reported}
          onReport={this.handleReport}
          author={comment.author}
          buttonBsSize="xs"
          buttonClassName="btn btn-xs btn-dark-gray btn--outline"
        />
    );
  },

});

export default connect()(CommentReportButton);
